/**
 * Parser: code template từ DOM / __NEXT_DATA__ / window.monaco.
 */

/**
 * Tìm đệ quy object có `code` và `lang`/`langSlug` trong JSON.
 */
function findCodeSnippetInJson(data: unknown, preferredLang = "javascript"): string | undefined {
  const stack: unknown[] = [data];
  const candidates: { lang: string; code: string }[] = [];
  const seen = new WeakSet<object>();
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (seen.has(cur)) continue;
    seen.add(cur);
    if (Array.isArray(cur)) {
      for (const v of cur) stack.push(v);
      continue;
    }
    const obj = cur as Record<string, unknown>;
    if (typeof obj["code"] === "string" && (typeof obj["lang"] === "string" || typeof obj["langSlug"] === "string")) {
      const lang = (obj["lang"] as string) ?? (obj["langSlug"] as string) ?? "";
      candidates.push({ lang: String(lang).toLowerCase(), code: String(obj["code"]) });
    }
    if (typeof obj["code"] === "string" && obj["code"].length > 10 && /function|class|var |let |const/.test(String(obj["code"]))) {
      if (!obj["lang"] && !obj["langSlug"]) {
        const codeStr = String(obj["code"]);
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
  return candidates[0]?.code?.trim();
}

/**
 * Trích xuất code template (JS mặc định nếu có).
 * Ưu tiên: data-track-load="code_editor" → __NEXT_DATA__ → monaco view-lines → monaco global → CodeMirror → pre.
 * Đặt `data-track-load="code_editor"` và `__NEXT_DATA__` trước `window.monaco` để tránh lấy nhầm model cũ (shipWithinDays).
 */
export function extractTemplate(doc: Document): string | undefined {
  // 1) Thử container code_editor cụ thể — chính xác nhất
  const codeEditorContainer = doc.querySelector('[data-track-load="code_editor"]');
  if (codeEditorContainer) {
    const monacoInEditor = codeEditorContainer.querySelector(".monaco-editor");
    if (monacoInEditor) {
      const lines = codeEditorContainer.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
      if (lines.length > 0) {
        const text = Array.from(lines)
          .map((el) => (el.textContent ?? "").replace(/\u00a0/g, " "))
          .join("\n")
          .trim();
        if (text && text.length > 2 && text.length < 50000 && /function|class|var |let |const |return|=>/.test(text)) {
          return text;
        }
      }
      const t = (monacoInEditor.textContent ?? "").trim();
      if (t && t.length > 10 && t.length < 50000 && /function|class|var |let |const |return|=>/.test(t)) {
        return t;
      }
    }
    const t2 = (codeEditorContainer.textContent ?? "").trim();
    if (t2 && /function|class|var |let |const |return|=>/.test(t2) && t2.length > 10 && t2.length < 50000) {
      const cleaned = t2
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n");
      if (cleaned && /function|class|var |let |const |return|=>/.test(cleaned)) {
        return cleaned;
      }
    }
  }

  // 2) Thử từ __NEXT_DATA__
  try {
    const nextDataEl = doc.getElementById("__NEXT_DATA__") ?? doc.querySelector('script#__NEXT_DATA__');
    if (nextDataEl?.textContent) {
      const data = JSON.parse(nextDataEl.textContent);
      const found = findCodeSnippetInJson(data);
      if (found) return found;
    }
    for (const s of Array.from(doc.querySelectorAll('script[type="application/json"]'))) {
      try {
        const d = JSON.parse(s.textContent ?? "");
        const f = findCodeSnippetInJson(d);
        if (f) return f;
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  // 3) Monaco view-lines — fallback DOM
  const monacoLines = doc.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
  if (monacoLines.length > 0) {
    const text = Array.from(monacoLines)
      .map((el) => (el.textContent ?? "").replace(/\u00a0/g, " "))
      .join("\n")
      .trim();
    if (text && text.length > 2 && text.length < 50000 && /function|class|var |let |const |return|=>/.test(text)) {
      return text;
    }
  }

  const monacoEl = doc.querySelector(".monaco-editor");
  if (monacoEl) {
    const t = (monacoEl.textContent ?? "").trim();
    if (t && t.length > 10 && t.length < 50000 && /function|class|var |let |const |def |public/.test(t)) {
      return t;
    }
  }

  // 4) window.monaco global — để cuối cùng để tránh lấy model cũ
  try {
    const win = (typeof window !== "undefined" ? window : null) as unknown as Record<string, unknown> | null;
    const monaco = win?.["monaco"] as { editor?: { getModels?: () => { getValue?: () => string; getLanguageId?: () => string }[] } } | undefined;
    if (monaco?.editor?.getModels) {
      const models = monaco.editor.getModels();
      if (models && models.length > 0) {
        for (let i = models.length - 1; i >= 0; i--) {
          const v = models[i]?.getValue?.();
          if (typeof v === "string" && v.trim().length > 10 && v.trim().length < 50000 && /function|class|var |let |const |return|=>/.test(v)) {
            const lang = models[i]?.getLanguageId?.();
            if (lang && String(lang).toLowerCase().includes("javascript")) return v.trim();
          }
        }
        for (let i = models.length - 1; i >= 0; i--) {
          const v = models[i]?.getValue?.();
          if (typeof v === "string" && v.trim().length > 10 && v.trim().length < 50000 && /function|class|var |let |const/.test(v)) {
            return v.trim();
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // 5) CodeMirror
  const cm = doc.querySelector(".CodeMirror-code, .cm-content");
  if (cm) {
    const t = (cm.textContent ?? "").trim();
    if (t && t.length > 2 && t.length < 20000) {
      const inConsole = cm.closest(".flex-1.overflow-y-auto");
      if (!inConsole && /function|class|var |let |const/.test(t)) return t;
    }
  }

  // 6) Pre/code chứa template
  const pres = Array.from(doc.querySelectorAll("pre"));
  for (const pre of pres) {
    const t = (pre.textContent ?? "").trim();
    if (t && /function\s+\w+|class\s+\w+|var\s+\w+|let\s+\w+/.test(t) && t.length < 5000) {
      return t;
    }
  }

  return undefined;
}
