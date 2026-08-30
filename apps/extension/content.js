// LeetCode Clipper — content script
// Hiển thị widget nổi trên leetcode.com/problems/*, clip DOM → JSON → clipboard

(function () {
  "use strict";

  const WIDGET_ID = "lc-clipper-widget";
  const TOAST_ID = "lc-clipper-toast";
  const DRAG_THRESHOLD = 5;

  // ----- Pure clipper logic (đồng bộ với src/clipper.ts) -----

  function parseTitle(raw) {
    const trimmed = raw.trim();
    const m = trimmed.match(/^(\d+)\s*\.\s*(.+)$/);
    if (m) return { id: Number(m[1]), title: m[2].trim() };
    return null;
  }

  function extractSlug(href) {
    const m = href.match(/\/problems\/([^/]+)\/?/);
    return m ? m[1] : "";
  }

  function normalizeDifficulty(raw) {
    const lower = raw.trim().toLowerCase();
    if (lower === "easy") return "easy";
    if (lower === "medium") return "medium";
    if (lower === "hard") return "hard";
    return null;
  }

  function findDescriptionContainer(doc) {
    const selectors = [
      '[data-track-load="description_content"]',
      "[data-qd-rendered-description]",
      '[class*="HTMLContent_html"]',
      ".question-content",
      "[data-track-load]",
    ];
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function findTitleAnchor(doc) {
    const anchors = Array.from(doc.querySelectorAll('a[href^="/problems/"]'));
    for (const a of anchors) {
      if (parseTitle(a.textContent ?? "")) return a;
    }
    const titleContainer = doc.querySelector(".text-title-large");
    if (titleContainer) {
      const inside = titleContainer.querySelector('a[href^="/problems/"]');
      if (inside) return inside;
    }
    return anchors[0] ?? null;
  }

  function extractDifficulty(doc) {
    const diffEl = doc.querySelector('[class*="text-difficulty"]');
    if (diffEl) {
      const normalized = normalizeDifficulty(diffEl.textContent ?? "");
      if (normalized) return normalized;
      const cn = diffEl.className;
      if (cn.includes("text-difficulty-easy")) return "easy";
      if (cn.includes("text-difficulty-medium")) return "medium";
      if (cn.includes("text-difficulty-hard")) return "hard";
    }
    const badges = Array.from(doc.querySelectorAll("div, span"));
    for (const b of badges) {
      const txt = (b.textContent ?? "").trim();
      if (txt === "Easy" || txt === "Medium" || txt === "Hard") {
        if (b.children.length === 0 || b.textContent?.length === txt.length) {
          const n = normalizeDifficulty(txt);
          if (n) return n;
        }
      }
    }
    return null;
  }

  function extractTags(doc) {
    const anchors = Array.from(doc.querySelectorAll('a[href^="/tag/"]'));
    const tags = [];
    const seen = new Set();
    for (const a of anchors) {
      const text = (a.textContent ?? "").trim().replace(/\s+/g, " ");
      if (!text) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(text);
    }
    return tags;
  }

  function extractHints(doc) {
    const hints = [];
    const containers = Array.from(doc.querySelectorAll("div.flex.flex-col"));
    for (const container of containers) {
      const labelEl = container.querySelector("div.text-body");
      if (!labelEl) continue;
      const labelText = (labelEl.textContent ?? "").trim();
      if (!/^Hint\s*\d+/i.test(labelText)) continue;
      let contentEl =
        container.querySelector("div.overflow-hidden > div") ||
        container.querySelector('[class*="HTMLContent_html"]') ||
        container.querySelector("div.mt-2");
      if (!contentEl) continue;
      const clone = contentEl.cloneNode(true);
      clone.querySelectorAll("script, style, iframe, noscript, button, svg").forEach((el) => el.remove());
      let html = clone.innerHTML.trim();
      if (!html) html = (contentEl.textContent ?? "").trim();
      if (html) hints.push(html);
    }
    if (hints.length === 0) {
      const hintHeaders = Array.from(doc.querySelectorAll("div.text-body")).filter((el) => /^Hint\s*\d+/i.test((el.textContent ?? "").trim()));
      for (const header of hintHeaders) {
        const parent = header.closest("div.flex.flex-col") || header.parentElement?.closest("div.flex.flex-col");
        if (!parent) continue;
        const contentEl = parent.querySelector("div.overflow-hidden div");
        if (!contentEl) continue;
        const clone = contentEl.cloneNode(true);
        clone.querySelectorAll("script, style, iframe, noscript, button, svg").forEach((el) => el.remove());
        const html = clone.innerHTML.trim() || (contentEl.textContent ?? "").trim();
        if (html && !hints.includes(html)) hints.push(html);
      }
    }
    return hints;
  }

  function findCodeSnippetInJson(data, preferredLang) {
    preferredLang = preferredLang || "javascript";
    const stack = [data];
    const candidates = [];
    const seen = new WeakSet();
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== "object") continue;
      if (seen.has(cur)) continue;
      seen.add(cur);
      if (Array.isArray(cur)) {
        for (const v of cur) stack.push(v);
        continue;
      }
      const obj = cur;
      if (typeof obj.code === "string" && (typeof obj.lang === "string" || typeof obj.langSlug === "string")) {
        const lang = String(obj.lang || obj.langSlug || "").toLowerCase();
        candidates.push({ lang, code: String(obj.code) });
      }
      if (typeof obj.code === "string" && obj.code.length > 10 && /function|class|var |let |const/.test(String(obj.code))) {
        if (!obj.lang && !obj.langSlug) {
          const codeStr = String(obj.code);
          if (codeStr.length < 50000) candidates.push({ lang: "", code: codeStr });
        }
      }
      for (const v of Object.values(obj)) {
        if (v && typeof v === "object") stack.push(v);
      }
    }
    if (candidates.length === 0) return undefined;
    const js = candidates.find((c) => c.lang.includes("javascript") || c.lang.includes("js"));
    if (js) return js.code.trim();
    return candidates[0] && candidates[0].code ? candidates[0].code.trim() : undefined;
  }

  function parseJsonLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return trimmed;
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  function buildTestCasesFromLines(inputLines, expectedLines, doc) {
    if (expectedLines.length === 0) return undefined;
    const totalCases = expectedLines.length;
    const perCaseInputCount = inputLines.length / totalCases;
    const perCase = Number.isInteger(perCaseInputCount) && perCaseInputCount > 0 ? perCaseInputCount : 1;
    let paramNames = [];
    const labelEls = Array.from(doc.querySelectorAll("div.mx-3.mb-2.text-xs"));
    const labels = labelEls.map((el) => (el.textContent || "").trim().replace(/\s*=\s*$/, "").trim()).filter(Boolean);
    if (labels.length === perCase) {
      paramNames = labels;
    } else {
      const template = extractTemplate(doc);
      if (template) {
        let m = template.match(/function\s+\w*\s*\(([^)]*)\)/) || template.match(/var\s+\w+\s*=\s*function\s*\(([^)]*)\)/) || template.match(/\(([^)]*)\)\s*=>/);
        if (m && m[1]) {
          const params = m[1].split(",").map((p) => p.trim().split(/\s*=\s*/)[0].trim()).filter(Boolean);
          if (params.length === perCase) paramNames = params;
          else if (params.length > 0) paramNames = params.slice(0, perCase);
        }
        if (paramNames.length === 0) {
          const paramMatches = Array.from(template.matchAll(/@param\s+\{[^}]+\}\s+(\w+)/g)).map((mm) => mm[1]);
          if (paramMatches.length === perCase) paramNames = paramMatches;
        }
      }
    }
    const cases = [];
    for (let i = 0; i < totalCases; i++) {
      const inputChunk = inputLines.slice(i * perCase, (i + 1) * perCase);
      const expectedRaw = expectedLines[i];
      const expected = parseJsonLine(expectedRaw);
      let input;
      const parsedInputs = inputChunk.map(parseJsonLine);
      if (paramNames.length === parsedInputs.length && paramNames.length > 0) {
        input = Object.fromEntries(paramNames.map((k, idx) => [k, parsedInputs[idx]]));
      } else if (parsedInputs.length === 1) {
        input = parsedInputs[0];
      } else if (parsedInputs.length > 1) {
        input = parsedInputs;
      } else {
        input = parsedInputs[0];
      }
      cases.push({ input, expected });
    }
    return cases.length > 0 ? cases : undefined;
  }

  function findTestCasesInJson(data) {
    const stack = [data];
    const seen = new WeakSet();
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== "object") continue;
      if (seen.has(cur)) continue;
      seen.add(cur);
      if (Array.isArray(cur)) {
        if (cur.length > 0 && typeof cur[0] === "object" && cur[0] && "input" in cur[0] && "expected" in cur[0]) {
          return cur;
        }
        for (const v of cur) stack.push(v);
        continue;
      }
      const obj = cur;
      if (Array.isArray(obj.testCases) && obj.testCases.length > 0) return obj.testCases;
      for (const v of Object.values(obj)) {
        if (v && typeof v === "object") stack.push(v);
      }
    }
    return undefined;
  }

  function extractTestCases(doc) {
    const hidden = doc.querySelector("div.mt-0.h-0.overflow-hidden.opacity-0") || doc.querySelector("div.opacity-0.h-0") || doc.querySelector("div.h-0.overflow-hidden.opacity-0");
    if (hidden) {
      const cmContents = Array.from(hidden.querySelectorAll(".cm-content"));
      let inputLines = [];
      let expectedLines = [];
      const headers = Array.from(hidden.querySelectorAll("div.text-xs.font-medium"));
      const headerTexts = headers.map((h) => (h.textContent || "").trim().toLowerCase());
      if (headerTexts.includes("input") && headerTexts.includes("expected")) {
        const inputIdx = headerTexts.indexOf("input");
        const expectedIdx = headerTexts.indexOf("expected");
        if (cmContents[inputIdx]) {
          inputLines = Array.from(cmContents[inputIdx].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
        }
        if (cmContents[expectedIdx]) {
          expectedLines = Array.from(cmContents[expectedIdx].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
        }
      } else if (cmContents.length >= 3) {
        inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
        expectedLines = Array.from(cmContents[2].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
      } else if (cmContents.length === 2) {
        inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
        expectedLines = Array.from(cmContents[1].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
      }
      inputLines = inputLines.filter((l) => l.length > 0);
      expectedLines = expectedLines.filter((l) => l.length > 0);
      if (inputLines.length > 0 && expectedLines.length > 0) {
        const parsed = buildTestCasesFromLines(inputLines, expectedLines, doc);
        if (parsed && parsed.length > 0) return parsed;
      }
    }
    const consoleContainer = doc.querySelector("div.flex-1.overflow-y-auto");
    if (consoleContainer) {
      const inputLabels = Array.from(consoleContainer.querySelectorAll("div.mx-3.mb-2.text-xs")).map((el) => (el.textContent || "").trim().replace(/\s*=\s*$/, ""));
      let expectedEl = consoleContainer.querySelector("span.text-green-s") || consoleContainer.querySelector("span[class*='text-green']") || consoleContainer.querySelector("div.group.relative.rounded-lg.bg-fill-4")?.parentElement?.querySelector("span.text-green-s") || null;
      if (!expectedEl) {
        const expectedHeader = Array.from(consoleContainer.querySelectorAll("div.text-xs.font-medium")).find((el) => (el.textContent || "").trim().toLowerCase() === "expected");
        if (expectedHeader) {
          const maybe = expectedHeader.parentElement?.parentElement?.querySelector("div.font-menlo, span.text-green-s");
          if (maybe) expectedEl = maybe;
        }
      }
      if (!expectedEl) {
        const candidates = Array.from(consoleContainer.querySelectorAll("span, div.font-menlo"));
        expectedEl = candidates.find((el) => {
          const t = (el.textContent || "").trim();
          return /^\s*\[.*\]\s*$/.test(t) || t === "[]" || /^\s*\d+\s*$/.test(t);
        }) || null;
        const green = candidates.find((el) => el.className.includes("text-green") || el.className.includes("green"));
        if (green) expectedEl = green;
      }
      if (inputLabels.length > 0) {
        const inputValues = [];
        const labelElements = Array.from(consoleContainer.querySelectorAll("div.mx-3.mb-2.text-xs"));
        for (const labelEl of labelElements) {
          const container = labelEl.parentElement || labelEl.closest("div.group");
          const valueEl = container ? container.querySelector("div.font-menlo") : null;
          const actualValueEl = valueEl || (labelEl.nextElementSibling);
          if (actualValueEl) {
            const raw = (actualValueEl.textContent || "").trim();
            if (raw) inputValues.push(parseJsonLine(raw));
          } else {
            const next = labelEl.nextElementSibling;
            if (next) {
              const raw = (next.textContent || "").trim();
              if (raw) inputValues.push(parseJsonLine(raw));
            }
          }
        }
        const expectedRaw = expectedEl ? (expectedEl.textContent || "").trim() : "";
        const expected = expectedRaw ? parseJsonLine(expectedRaw) : undefined;
        if (inputValues.length > 0 && expected !== undefined) {
          let input;
          if (inputLabels.length === inputValues.length && inputLabels.every(Boolean)) {
            input = Object.fromEntries(inputLabels.map((k, i) => [k, inputValues[i]]));
          } else if (inputValues.length === 1) {
            input = inputValues[0];
          } else {
            input = inputValues;
          }
          return [{ input, expected }];
        }
      }
    }
    try {
      const nextDataEl = doc.getElementById("__NEXT_DATA__") || doc.querySelector('script#__NEXT_DATA__');
      if (nextDataEl && nextDataEl.textContent) {
        const data = JSON.parse(nextDataEl.textContent);
        const tcs = findTestCasesInJson(data);
        if (tcs && tcs.length > 0) return tcs;
      }
    } catch {}
    return undefined;
  }

  function extractTemplate(doc) {
    try {
      const win = typeof window !== "undefined" ? window : null;
      const monaco = win && win.monaco;
      if (monaco && monaco.editor && monaco.editor.getModels) {
        const models = monaco.editor.getModels();
        if (models && models.length > 0) {
          const v = models[0] && models[0].getValue ? models[0].getValue() : null;
          if (typeof v === "string" && v.trim().length > 2 && v.trim().length < 50000) return v.trim();
        }
      }
    } catch {}
    try {
      const nextDataEl = doc.getElementById("__NEXT_DATA__") || doc.querySelector('script#__NEXT_DATA__');
      if (nextDataEl && nextDataEl.textContent) {
        const data = JSON.parse(nextDataEl.textContent);
        const found = findCodeSnippetInJson(data);
        if (found) return found;
      }
      for (const s of Array.from(doc.querySelectorAll('script[type="application/json"]'))) {
        try {
          const d = JSON.parse(s.textContent || "");
          const f = findCodeSnippetInJson(d);
          if (f) return f;
        } catch {}
      }
    } catch {}
    const codeEditorContainer = doc.querySelector('[data-track-load="code_editor"]');
    if (codeEditorContainer) {
      const monacoInEditor = codeEditorContainer.querySelector(".monaco-editor");
      if (monacoInEditor) {
        const lines = codeEditorContainer.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
        if (lines.length > 0) {
          const text = Array.from(lines).map((el) => (el.textContent || "").replace(/\u00a0/g, " ")).join("\n").trim();
          if (text && text.length > 2 && text.length < 50000) return text;
        }
        const t = (monacoInEditor.textContent || "").trim();
        if (t && t.length > 10 && t.length < 50000) return t;
      }
      const t2 = (codeEditorContainer.textContent || "").trim();
      if (t2 && /function|class|var |let |const |return|=>/.test(t2) && t2.length < 50000 && t2.length > 10) {
        const cleaned = t2.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
        if (cleaned) return cleaned;
      }
    }
    const monacoLines = doc.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
    if (monacoLines.length > 0) {
      const text = Array.from(monacoLines).map((el) => (el.textContent || "").replace(/\u00a0/g, " ")).join("\n").trim();
      if (text && text.length > 2 && text.length < 50000) {
        if (/function|class|var |let |const |return|=>/.test(text)) return text;
        if (text.split("\n").length >= 1) return text;
      }
    }
    const monaco = doc.querySelector(".monaco-editor");
    if (monaco) {
      const t = (monaco.textContent || "").trim();
      if (t && t.length > 10 && t.length < 50000 && /function|class|var |let |const |def |public/.test(t)) return t;
    }
    const cm = doc.querySelector(".CodeMirror-code, .cm-content");
    if (cm) {
      const t = (cm.textContent || "").trim();
      if (t && t.length > 2 && t.length < 20000) {
        const inConsole = cm.closest(".flex-1.overflow-y-auto");
        if (!inConsole && /function|class|var |let |const/.test(t)) return t;
      }
    }
    return undefined;
  }

  function cleanDescription(container) {
    const clone = container.cloneNode(true);
    clone.querySelectorAll("script, style, iframe, noscript, svg, button").forEach((el) => el.remove());
    let html = clone.innerHTML;
    html = html.replace(/&nbsp;/g, " ");
    html = html.trim();
    return html;
  }

  function buildProblemClip(doc, url) {
    const container = findDescriptionContainer(doc);
    if (!container) return null;
    const description = cleanDescription(container);
    if (!description) return null;

    const anchor = findTitleAnchor(doc);
    let id = null;
    let title = "";
    let slug = "";

    if (anchor) {
      const parsed = parseTitle(anchor.textContent ?? "");
      if (parsed) {
        id = parsed.id;
        title = parsed.title;
      } else {
        title = (anchor.textContent ?? "").trim();
      }
      slug = extractSlug(anchor.getAttribute("href") ?? "");
    }

    if (!slug) {
      try {
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        const idx = parts.indexOf("problems");
        if (idx >= 0 && parts[idx + 1]) slug = parts[idx + 1];
      } catch {}
    }

    if (!title) {
      const docTitle = doc.title ?? "";
      title = docTitle.replace(/\s*-\s*LeetCode\s*$/i, "").trim();
      const parsed = parseTitle(title);
      if (parsed) {
        id = parsed.id;
        title = parsed.title;
      }
    }

    if (id === null || Number.isNaN(id)) {
      const parsed = parseTitle(title);
      if (parsed) {
        id = parsed.id;
        title = parsed.title;
      } else {
        id = 0;
      }
    }

    const difficulty = extractDifficulty(doc) ?? "medium";
    const tags = extractTags(doc);
    const hints = extractHints(doc);
    const template = extractTemplate(doc);
    const testCases = extractTestCases(doc);

    return {
      id,
      slug,
      title,
      url,
      difficulty,
      tags,
      description,
      template,
      testCases,
      hints: hints.length > 0 ? hints : undefined,
      clippedAt: new Date().toISOString(),
    };
  }

  // ----- UI: toast -----

  let toastEl = null;
  let toastTimer = null;

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement("div");
    toastEl.id = TOAST_ID;
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showToast(message, variant) {
    const el = ensureToast();
    el.textContent = message;
    el.className = variant || "";
    // force reflow
    void el.offsetWidth;
    el.classList.add("show");
    if (variant) el.classList.add(variant);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 3000);
  }

  // ----- Clipboard -----

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback execCommand
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  // ----- Config: host từ .env (đồng bộ toàn monorepo) -----
  // api-config.js được inject trước content.js, định nghĩa var LC_API_BASE
  const API_BASE =
    typeof LC_API_BASE !== "undefined" && LC_API_BASE ? LC_API_BASE : "http://localhost:3000";

  function isValidClipForPost(clip) {
    if (!clip) return "clip rỗng";
    if (typeof clip.id !== "number" || !Number.isInteger(clip.id) || clip.id <= 0) return "id không hợp lệ";
    if (typeof clip.title !== "string" || !clip.title.trim()) return "title rỗng";
    if (clip.difficulty !== "easy" && clip.difficulty !== "medium" && clip.difficulty !== "hard")
      return "difficulty không hợp lệ";
    if (typeof clip.description !== "string" || !clip.description.trim()) return "description rỗng";
    if (!Array.isArray(clip.tags)) return "tags không hợp lệ";
    return null;
  }

  async function postToServer(clip) {
    const err = isValidClipForPost(clip);
    if (err) {
      showToast(`JSON không hợp lệ: ${err}`, "error");
      return { ok: false, error: err };
    }
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/problems/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clip),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && res.status === 201) {
        return { ok: true, data };
      }
      if (res.status === 409) {
        return { ok: false, dup: true, error: data.error || "Đã tồn tại" };
      }
      return { ok: false, error: data.error || `HTTP ${res.status}` };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  // ----- Widget -----

  function handleClip() {
    const clip = buildProblemClip(document, location.href);
    if (!clip) {
      showToast("Không tìm thấy đề bài. Hãy đợi trang tải xong.", "error");
      const w = document.getElementById(WIDGET_ID);
      if (w) {
        w.classList.add("error");
        setTimeout(() => w.classList.remove("error"), 1500);
      }
      return;
    }
    if (!clip.id || clip.id === 0) {
      showToast("Không parse được ID đề bài. Kiểm tra DOM.", "error");
      return;
    }
    const json = JSON.stringify(clip, null, 2);
    // 1) Copy vào clipboard (giữ để paste thủ công nếu cần)
    copyToClipboard(json);
    // 2) Gọi trực tiếp server localhost (host từ root .env) để lưu DB
    const validationErr = isValidClipForPost(clip);
    if (validationErr) {
      showToast(`Không gửi được: ${validationErr}`, "error");
      console.warn("[LeetCode Clipper] validation fail:", validationErr, clip);
      return;
    }
    // Hiển thị trạng thái đang gửi
    showToast(`Đang gửi ${clip.id}. ${clip.title} tới ${API_BASE}...`, "");
    postToServer(clip).then((result) => {
      const w = document.getElementById(WIDGET_ID);
      if (result.ok) {
        showToast(`Đã lưu: ${clip.id}. ${clip.title} vào DB`, "success");
        if (w) {
          w.classList.add("success");
          w.textContent = "✓";
          setTimeout(() => {
            w.classList.remove("success");
            w.textContent = "LC";
          }, 1800);
        }
        console.log("[LeetCode Clipper] POST ok:", result.data);
      } else if (result.dup) {
        showToast(`Đã tồn tại: ${clip.id}. ${clip.title}`, "error");
        if (w) {
          w.classList.add("error");
          setTimeout(() => w.classList.remove("error"), 1500);
        }
      } else {
        showToast(`Lỗi gửi server: ${result.error} (đã copy JSON)`, "error");
        console.log("[LeetCode Clipper] POST fail, JSON:", json, result);
      }
    });
  }

  function makeDraggable(el) {
    let isDragging = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    el.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      hasMoved = false;
      el.classList.add("dragging");
      const rect = el.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      el.style.bottom = "auto";
      el.style.right = "auto";
      el.style.left = `${initialLeft}px`;
      el.style.top = `${initialTop}px`;
      startX = e.clientX;
      startY = e.clientY;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        hasMoved = true;
      }
      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;
      const w = el.offsetWidth || 52;
      const h = el.offsetHeight || 52;
      const maxLeft = window.innerWidth - w;
      const maxTop = window.innerHeight - h;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove("dragging");
      if (!hasMoved) {
        handleClip();
      }
    });

    el.addEventListener("dragstart", (e) => e.preventDefault());
    window.addEventListener("resize", () => keepInBounds(el));
  }

  function keepInBounds(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width || el.offsetWidth || 52;
    const h = rect.height || el.offsetHeight || 52;
    if (el.style.left || el.style.top) {
      const maxLeft = Math.max(0, window.innerWidth - w);
      const maxTop = Math.max(0, window.innerHeight - h);
      let left = Math.max(0, Math.min(rect.left, maxLeft));
      let top = Math.max(0, Math.min(rect.top, maxTop));
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.right = "auto";
      el.style.bottom = "auto";
    }
  }

  function createWidget() {
    if (document.getElementById(WIDGET_ID)) return;
    const widget = document.createElement("div");
    widget.id = WIDGET_ID;
    widget.textContent = "LC";
    widget.title = "Click để copy đề bài thành JSON";
    document.body.appendChild(widget);
    ensureToast();
    makeDraggable(widget);
  }

  // Khởi tạo — đợi body sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWidget);
  } else {
    createWidget();
  }

  // Hỗ trợ SPA: nếu URL đổi mà widget mất thì tạo lại
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (!document.getElementById(WIDGET_ID) && location.pathname.startsWith("/problems/")) {
        createWidget();
      }
    }
  }, 1000);
})();
