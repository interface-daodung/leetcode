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

    return {
      id,
      slug,
      title,
      difficulty,
      tags,
      description,
      url,
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
