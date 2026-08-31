// LeetCode Widget — content script
// Hiển thị widget nổi trên leetcode.com/problems/*, clip DOM → JSON → clipboard

(function () {
  "use strict";

  const WIDGET_ID = "lc-clipper-widget";
  const TOAST_ID = "lc-clipper-toast";
  const DRAG_THRESHOLD = 5;

  // Asset paths - sử dụng chrome.runtime.getURL để truy cập web_accessible_resources
  function getAssetUrl(path) {
    try {
      return chrome.runtime.getURL(path);
    } catch {
      // Fallback nếu không có chrome.runtime (test environment)
      return path;
    }
  }
  
  const IDLE_IMG = getAssetUrl("assets/Idle.png");
  const LOADING_IMG = getAssetUrl("assets/Loading.png");
  const SUCCESS_IMG = getAssetUrl("assets/Success.png");
  const ERROR_IMG = getAssetUrl("assets/Error.png");
  const TOAST_SVG = getAssetUrl("assets/toast-text.svg");

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

  function parseExampleTestcasesString(str, _ctx) {
    const trimmed = str.trim();
    if (!trimmed) return undefined;
    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return undefined;
    const parsed = [];
    for (const line of lines) {
      try {
        parsed.push(JSON.parse(line));
      } catch {
        const m = line.match(/=\s*(.+)$/);
        if (m) {
          try {
            parsed.push(JSON.parse(m[1].trim()));
            continue;
          } catch {}
        }
        parsed.push(line);
      }
    }
    return parsed.length > 0 ? parsed : undefined;
  }

  function extractTestCasesFromDescription(doc) {
    const container = findDescriptionContainer(doc);
    if (!container) return undefined;
    const pres = Array.from(container.querySelectorAll("pre"));
    const cases = [];
    for (const pre of pres) {
      const text = (pre.textContent || "").trim();
      if (!text) continue;
      const inputMatch = text.match(/Input:\s*([\s\S]*?)\s*Output:/i);
      const outputMatch = text.match(/Output:\s*([\s\S]*)/i);
      if (!inputMatch || !outputMatch) continue;
      const inputRaw = inputMatch[1].trim();
      const outputRaw = outputMatch[1].trim().split("\n")[0].trim();
      let inputVal = inputRaw;
      const eqIdx = inputRaw.indexOf("=");
      const jsonPart = eqIdx >= 0 ? inputRaw.slice(eqIdx + 1).trim() : inputRaw;
      try {
        inputVal = JSON.parse(jsonPart);
      } catch {
        inputVal = jsonPart;
      }
      let expectedVal = outputRaw;
      try {
        expectedVal = JSON.parse(outputRaw);
      } catch {
        expectedVal = outputRaw;
      }
      let paramName = "grid";
      if (eqIdx >= 0) {
        const beforeEq = inputRaw.slice(0, eqIdx).trim();
        if (/^[a-zA-Z_]\w*$/.test(beforeEq)) paramName = beforeEq;
      } else {
        const tpl = extractTemplate(doc);
        if (tpl) {
          const m = tpl.match(/function\s+\w*\s*\(([^)]*)\)/) || tpl.match(/var\s+\w+\s*=\s*function\s*\(([^)]*)\)/);
          if (m && m[1]) {
            const firstParam = m[1].split(",")[0] && m[1].split(",")[0].trim().split(/\s*=\s*/)[0].trim();
            if (firstParam) paramName = firstParam;
          }
        }
      }
      const inputObj = {};
      inputObj[paramName] = inputVal;
      cases.push({ input: inputObj, expected: expectedVal });
    }
    return cases.length > 0 ? cases : undefined;
  }

  function findTestCasesInJson(data) {
    const stack = [data];
    const seen = new WeakSet();
    let exampleTestcasesStr = null;
    let exampleInputs = null;
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
      if (typeof obj.exampleTestcases === "string" && obj.exampleTestcases.trim()) exampleTestcasesStr = obj.exampleTestcases;
      if (typeof obj.exampleTestcaseList === "string" && obj.exampleTestcaseList.trim()) exampleTestcasesStr = obj.exampleTestcaseList;
      if (typeof obj.jsonExampleTestcases === "string" && obj.jsonExampleTestcases.trim()) exampleTestcasesStr = obj.jsonExampleTestcases;
      if (exampleTestcasesStr) {
        const parsed = parseExampleTestcasesString(exampleTestcasesStr, obj);
        if (parsed && parsed.length > 0) exampleInputs = parsed;
      }
      for (const v of Object.values(obj)) {
        if (v && typeof v === "object") stack.push(v);
      }
    }
    if (exampleInputs && exampleInputs.length > 0) return exampleInputs.map((inp) => ({ input: inp, expected: null }));
    if (exampleTestcasesStr) {
      const fallback = parseExampleTestcasesString(exampleTestcasesStr, null);
      if (fallback && fallback.length > 0) return fallback.map((inp) => ({ input: inp, expected: null }));
    }
    return undefined;
  }

  function extractTestCases(doc) {
    const hiddenSelectors = [
      "div.mt-0.h-0.overflow-hidden.opacity-0",
      "div.opacity-0.h-0",
      "div.h-0.overflow-hidden.opacity-0",
      'div[class*="opacity-0"][class*="h-0"]',
      "div.overflow-hidden.opacity-0",
    ];
    let hidden = null;
    for (const sel of hiddenSelectors) {
      const el = doc.querySelector(sel);
      if (el && el.querySelector(".cm-content")) { hidden = el; break; }
    }
    if (!hidden) {
      const allHiddenCm = Array.from(doc.querySelectorAll(".cm-content")).filter((el) => {
        const parent = el.closest("div");
        if (!parent) return false;
        const cls = parent.className;
        return cls.includes("opacity-0") || cls.includes("h-0");
      });
      if (allHiddenCm.length > 0) hidden = allHiddenCm[0].closest("div");
    }
    if (hidden) {
      const cmContents = Array.from(hidden.querySelectorAll(".cm-content"));
      let inputLines = [];
      let expectedLines = [];
      const headers = Array.from(hidden.querySelectorAll("div.text-xs.font-medium"));
      const headerTexts = headers.map((h) => (h.textContent || "").trim().toLowerCase());
      if (headerTexts.includes("input") && headerTexts.includes("expected")) {
        const inputIdx = headerTexts.indexOf("input");
        const expectedIdx = headerTexts.indexOf("expected");
        if (cmContents[inputIdx]) inputLines = Array.from(cmContents[inputIdx].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
        if (cmContents[expectedIdx]) expectedLines = Array.from(cmContents[expectedIdx].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
      } else if (cmContents.length >= 3) {
        inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
        expectedLines = Array.from(cmContents[2].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
      } else if (cmContents.length === 2) {
        inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
        expectedLines = Array.from(cmContents[1].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
      } else if (cmContents.length === 1) {
        inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
        expectedLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent || "").trim());
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
        expectedEl = candidates.find((el) => { const t = (el.textContent || "").trim(); return /^\s*\[.*\]\s*$/.test(t) || t === "[]" || /^\s*\d+\s*$/.test(t); }) || null;
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
            if (next) { const raw = (next.textContent || "").trim(); if (raw) inputValues.push(parseJsonLine(raw)); }
          }
        }
        const expectedRaw = expectedEl ? (expectedEl.textContent || "").trim() : "";
        const expected = expectedRaw ? parseJsonLine(expectedRaw) : undefined;
        if (inputValues.length > 0 && expected !== undefined) {
          let input;
          if (inputLabels.length === inputValues.length && inputLabels.every(Boolean)) input = Object.fromEntries(inputLabels.map((k, i) => [k, inputValues[i]]));
          else if (inputValues.length === 1) input = inputValues[0];
          else input = inputValues;
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
      for (const s of Array.from(doc.querySelectorAll('script[type="application/json"]'))) {
        try { const d = JSON.parse(s.textContent || ""); const tcs2 = findTestCasesInJson(d); if (tcs2 && tcs2.length > 0) return tcs2; } catch {}
      }
    } catch {}
    const descCases = extractTestCasesFromDescription(doc);
    if (descCases && descCases.length > 0) return descCases;
    return undefined;
  }

  function extractTemplate(doc) {
    const codeEditorContainer = doc.querySelector('[data-track-load="code_editor"]');
    if (codeEditorContainer) {
      const monacoInEditor = codeEditorContainer.querySelector(".monaco-editor");
      if (monacoInEditor) {
        const lines = codeEditorContainer.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
        if (lines.length > 0) {
          const text = Array.from(lines).map((el) => (el.textContent || "").replace(/\u00a0/g, " ")).join("\n").trim();
          if (text && text.length > 2 && text.length < 50000 && /function|class|var |let |const |return|=>/.test(text)) return text;
        }
        const t = (monacoInEditor.textContent || "").trim();
        if (t && t.length > 10 && t.length < 50000 && /function|class|var |let |const |return|=>/.test(t)) return t;
      }
      const t2 = (codeEditorContainer.textContent || "").trim();
      if (t2 && /function|class|var |let |const |return|=>/.test(t2) && t2.length > 10 && t2.length < 50000) {
        const cleaned = t2.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
        if (cleaned && /function|class|var |let |const |return|=>/.test(cleaned)) return cleaned;
      }
    }
    try {
      const nextDataEl = doc.getElementById("__NEXT_DATA__") || doc.querySelector('script#__NEXT_DATA__');
      if (nextDataEl && nextDataEl.textContent) {
        const data = JSON.parse(nextDataEl.textContent);
        const found = findCodeSnippetInJson(data);
        if (found) return found;
      }
      for (const s of Array.from(doc.querySelectorAll('script[type="application/json"]'))) {
        try { const d = JSON.parse(s.textContent || ""); const f = findCodeSnippetInJson(d); if (f) return f; } catch {}
      }
    } catch {}
    const monacoLines = doc.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
    if (monacoLines.length > 0) {
      const text = Array.from(monacoLines).map((el) => (el.textContent || "").replace(/\u00a0/g, " ")).join("\n").trim();
      if (text && text.length > 2 && text.length < 50000 && /function|class|var |let |const |return|=>/.test(text)) return text;
    }
    const monacoEl = doc.querySelector(".monaco-editor");
    if (monacoEl) {
      const t = (monacoEl.textContent || "").trim();
      if (t && t.length > 10 && t.length < 50000 && /function|class|var |let |const |def |public/.test(t)) return t;
    }
    try {
      const win = typeof window !== "undefined" ? window : null;
      const monaco = win && win.monaco;
      if (monaco && monaco.editor && monaco.editor.getModels) {
        const models = monaco.editor.getModels();
        if (models && models.length > 0) {
          for (let i = models.length - 1; i >= 0; i--) {
            const v = models[i] && models[i].getValue ? models[i].getValue() : null;
            if (typeof v === "string" && v.trim().length > 10 && v.trim().length < 50000 && /function|class|var |let |const |return|=>/.test(v)) {
              const lang = models[i].getLanguageId ? models[i].getLanguageId() : null;
              if (lang && String(lang).toLowerCase().includes("javascript")) return v.trim();
            }
          }
          for (let i = models.length - 1; i >= 0; i--) {
            const v = models[i] && models[i].getValue ? models[i].getValue() : null;
            if (typeof v === "string" && v.trim().length > 10 && v.trim().length < 50000 && /function|class|var |let |const/.test(v)) return v.trim();
          }
        }
      }
    } catch {}
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

  /**
   * Tạo SVG toast với text tùy chỉnh
   * Dựa trên logic từ sua_svg.js - tự động co giãn font-size / xuống dòng
   */
  async function generateToastSvg(text) {
    try {
      const response = await fetch(TOAST_SVG);
      if (!response.ok) throw new Error("Không tải được toast SVG");
      let svg = await response.text();

      // Parse group transform
      const groupMatch = svg.match(/<g[^>]*transform="matrix\(([^)]+)\)"/);
      let tx = 0, ty = 0;
      if (groupMatch) {
        const vals = groupMatch[1].split(",").map(v => parseFloat(v.trim()));
        if (vals.length === 6) { tx = vals[4]; ty = vals[5]; }
      }

      // Find path bbox for text container
      const pathMatch = svg.match(/<path[^>]*\sd="([^"]+)"/);
      if (!pathMatch) throw new Error("Không tìm thấy path trong SVG");
      const nums = (pathMatch[1].match(/-?\d+\.?\d*/g) || []).map(Number);
      const xs = nums.filter((_, i) => i % 2 === 0);
      const ys = nums.filter((_, i) => i % 2 === 1);
      
      // Robust extreme values (bỏ qua các điểm mỏ neo)
      function robustExtreme(values, wantMax, tol = 0.5) {
        const rounded = values.map(v => Math.round(v / tol) * tol);
        const counts = new Map();
        for (const v of rounded) counts.set(v, (counts.get(v) || 0) + 1);
        const distinct = [...new Set(rounded)].sort((a, b) => wantMax ? b - a : a - b);
        for (const v of distinct) {
          if (counts.get(v) >= 2) return v;
        }
        return distinct[0];
      }

      const bbox = {
        x0: robustExtreme(xs, false),
        y0: robustExtreme(ys, false),
        x1: robustExtreme(xs, true),
        y1: robustExtreme(ys, true),
      };

      const padding = 24;
      const minFont = 24;
      const maxFont = 72;
      const safeX0 = bbox.x0 + padding;
      const safeX1 = bbox.x1 - padding;
      const safeY0 = bbox.y0 + padding;
      const safeY1 = bbox.y1 - padding;
      const maxWidth = safeX1 - safeX0;
      const maxHeight = safeY1 - safeY0;

      // Find original text element
      const textMatch = svg.match(/<text([^>]*)>([\s\S]*?)<\/text>/);
      if (!textMatch) throw new Error("Không tìm thấy thẻ <text> trong SVG");
      const attrs = textMatch[1];
      const origFontMatch = attrs.match(/font-size:\s*([\d.]+)px/);
      const origFont = origFontMatch ? parseFloat(origFontMatch[1]) : 60.5;

      // Calculate optimal font size - start from maxFont for larger text
      let fontSize = Math.min(maxFont, origFont);
      const ratio = 0.56;
      function estimateWidth(t, fs) { return t.length * ratio * fs; }
      
      while (fontSize > minFont && estimateWidth(text, fontSize) > maxWidth) {
        fontSize -= 1;
      }

      // Wrap text if needed
      function wrapText(txt, fs, mw) {
        const words = txt.split(/\s+/).filter(Boolean);
        const lines = [];
        let cur = "";
        for (const w of words) {
          const trial = (cur + " " + w).trim();
          if (estimateWidth(trial, fs) <= mw || !cur) {
            cur = trial;
          } else {
            lines.push(cur);
            cur = w;
          }
        }
        if (cur) lines.push(cur);
        return lines;
      }

      let lines;
      if (estimateWidth(text, fontSize) <= maxWidth) {
        lines = [text];
      } else {
        fontSize = Math.max(fontSize, minFont);
        lines = wrapText(text, fontSize, maxWidth);
        let lineHeight = fontSize * 1.15;
        while (lines.length * lineHeight > maxHeight && fontSize > minFont) {
          fontSize -= 1;
          lineHeight = fontSize * 1.15;
          lines = wrapText(text, fontSize, maxWidth);
        }
      }

      const lineHeight = fontSize * 1.15;
      const totalH = (lines.length - 1) * lineHeight;
      const centerY = (safeY0 + safeY1) / 2 - ty;
      const yStart = centerY - totalH / 2 + fontSize * 0.25;
      const xCenter = (safeX0 + safeX1) / 2 - tx - fontSize * 0.15;

      // Update attributes
      let newAttrs = attrs.replace(/font-size:\s*[\d.]+px/, `font-size: ${fontSize.toFixed(2)}px`);
      newAttrs = newAttrs.replace(/\sx="[^"]*"/, "").replace(/\sy="[^"]*"/, "");
      newAttrs += ' text-anchor="middle"';

      // Escape XML
      function escapeXml(s) {
        return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
      }

      const tspans = lines.map((line, i) => {
        const y = yStart + i * lineHeight;
        return `<tspan x="${xCenter.toFixed(2)}" y="${y.toFixed(2)}">${escapeXml(line)}</tspan>`;
      }).join("");

      const newTextEl = `<text${newAttrs}>${tspans}</text>`;
      svg = svg.slice(0, textMatch.index) + newTextEl + svg.slice(textMatch.index + textMatch[0].length);

      return svg;
    } catch (e) {
      console.warn("[LeetCode Widget] Toast SVG generation failed:", e);
      return null;
    }
  }

  function showToast(message, variant) {
    const el = ensureToast();
    const widget = document.getElementById(WIDGET_ID);
    
    // Generate SVG toast with custom text
    generateToastSvg(message).then(svg => {
      if (svg) {
        el.innerHTML = svg;
        el.style.width = "auto";
        el.style.maxWidth = "500px";
        el.style.padding = "0";
      } else {
        // Fallback to text
        el.textContent = message;
        el.style.width = "";
        el.style.maxWidth = "320px";
        el.style.padding = "10px 14px";
      }
      
      // Position toast at top-right of widget
      if (widget) {
        const widgetRect = widget.getBoundingClientRect();
        el.style.position = "fixed";
        el.style.bottom = `${window.innerHeight - widgetRect.top + 8}px`;
        el.style.right = `${window.innerWidth - widgetRect.right}px`;
        el.style.left = "auto";
        el.style.top = "auto";
      } else {
        // Fallback position
        el.style.bottom = "110px";
        el.style.right = "20px";
        el.style.left = "auto";
        el.style.top = "auto";
      }
      
      el.className = variant || "";
      void el.offsetWidth;
      el.classList.add("show");
      if (variant) el.classList.add(variant);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        el.classList.remove("show");
      }, 3000);
    });
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
      // Thử POST trước (tạo mới)
      let res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/problems/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clip),
      });
      let data = await res.json().catch(() => ({}));
      
      if (res.ok && (res.status === 201 || res.status === 200)) {
        return { ok: true, data };
      }
      
      // Nếu 409 (đã tồn tại) → thử PUT để ghi đè
      if (res.status === 409) {
        res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/problems/${clip.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clip),
        });
        data = await res.json().catch(() => ({}));
        if (res.ok) {
          return { ok: true, data, overwritten: true };
        }
        return { ok: false, error: data.error || `HTTP ${res.status} (ghi đè thất bại)` };
      }
      
      return { ok: false, error: data.error || `HTTP ${res.status}` };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  // ----- Widget -----

  function createWidget() {
    if (document.getElementById(WIDGET_ID)) return;
    const widget = document.createElement("div");
    widget.id = WIDGET_ID;
    widget.title = "Click để copy đề bài thành JSON";
    
    // Tạo image element cho trạng thái idle
    const img = document.createElement("img");
    img.src = IDLE_IMG;
    img.alt = "LeetCode Widget";
    img.draggable = false;
    widget.appendChild(img);
    
    document.body.appendChild(widget);
    ensureToast();
    makeDraggable(widget);
  }

  function setWidgetState(widget, state) {
    const img = widget.querySelector("img");
    if (!img) return;
    
    switch (state) {
      case "idle":
        img.src = IDLE_IMG;
        widget.classList.remove("loading", "success", "error");
        break;
      case "loading":
        img.src = LOADING_IMG;
        widget.classList.add("loading");
        widget.classList.remove("success", "error");
        break;
      case "success":
        img.src = SUCCESS_IMG;
        widget.classList.add("success");
        widget.classList.remove("loading", "error");
        break;
      case "error":
        img.src = ERROR_IMG;
        widget.classList.add("error");
        widget.classList.remove("loading", "success");
        break;
    }
  }

  function playSquashStretch(widget) {
    widget.classList.add("squash-stretch");
    // Remove animation class after it completes
    setTimeout(() => {
      widget.classList.remove("squash-stretch");
    }, 1200);
  }

  function handleClip() {
    const widget = document.getElementById(WIDGET_ID);
    const clip = buildProblemClip(document, location.href);
    if (!clip) {
      showToast("Không tìm thấy đề bài. Hãy đợi trang tải xong.", "error");
      if (widget) {
        setWidgetState(widget, "error");
        setTimeout(() => setWidgetState(widget, "idle"), 1500);
      }
      return;
    }
    if (!clip.id || clip.id === 0) {
      showToast("Không parse được ID đề bài. Kiểm tra DOM.", "error");
      if (widget) {
        setWidgetState(widget, "error");
        setTimeout(() => setWidgetState(widget, "idle"), 1500);
      }
      return;
    }
    
    // Play squash and stretch animation on click
    if (widget) {
      playSquashStretch(widget);
    }

    const json = JSON.stringify(clip, null, 2);
    // 1) Copy vào clipboard (giữ để paste thủ công nếu cần)
    copyToClipboard(json);
    // 2) Gọi trực tiếp server localhost (host từ root .env) để lưu DB
    const validationErr = isValidClipForPost(clip);
    if (validationErr) {
      showToast(`Không gửi được: ${validationErr}`, "error");
      console.warn("[LeetCode Widget] validation fail:", validationErr, clip);
      if (widget) {
        setWidgetState(widget, "error");
        setTimeout(() => setWidgetState(widget, "idle"), 1500);
      }
      return;
    }
    // Hiển thị trạng thái đang gửi
    showToast(`Đang gửi ${clip.id}. ${clip.title} tới ${API_BASE}...`, "");
    if (widget) setWidgetState(widget, "loading");
    postToServer(clip).then((result) => {
      const w = document.getElementById(WIDGET_ID);
      if (result.ok) {
        const msg = result.overwritten 
          ? `Đã ghi đè: ${clip.id}. ${clip.title} vào DB`
          : `Đã lưu: ${clip.id}. ${clip.title} vào DB`;
        showToast(msg, "success");
        if (w) {
          setWidgetState(w, "success");
          setTimeout(() => setWidgetState(w, "idle"), 1800);
        }
        console.log("[LeetCode Widget] POST ok:", result.data);
      } else {
        showToast(`Lỗi gửi server: ${result.error} (đã copy JSON)`, "error");
        if (w) {
          setWidgetState(w, "error");
          setTimeout(() => setWidgetState(w, "idle"), 1500);
        }
        console.log("[LeetCode Widget] POST fail, JSON:", json, result);
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
    const w = rect.width || el.offsetWidth || 80;
    const h = rect.height || el.offsetHeight || 80;
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
