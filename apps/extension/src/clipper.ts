/**
 * Logic thuần để clip đề bài LeetCode từ DOM.
 * Không phụ thuộc vào chrome API — có thể test với jsdom.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface TestCase {
  input: unknown;
  expected: unknown;
}

export interface ProblemClip {
  id: number;
  slug: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  template?: string;
  testCases?: TestCase[];
  hints?: string[];
  clippedAt: string;
}

/**
 * Parse "5. Longest Palindromic Substring" → { id: 5, title: "Longest Palindromic Substring" }
 */
export function parseTitle(raw: string): { id: number; title: string } | null {
  const trimmed = raw.trim();
  // Dạng "5. Title" hoặc "5 . Title"
  const m = trimmed.match(/^(\d+)\s*\.\s*(.+)$/);
  if (m) {
    return { id: Number(m[1]), title: m[2].trim() };
  }
  return null;
}

/**
 * Lấy slug từ href "/problems/longest-palindromic-substring/" hoặc "/problems/slug"
 */
export function extractSlug(href: string): string {
  const m = href.match(/\/problems\/([^/]+)\/?/);
  return m ? m[1] : "";
}

/**
 * Chuẩn hoá difficulty text → "easy"|"medium"|"hard"
 */
export function normalizeDifficulty(raw: string): Difficulty | null {
  const lower = raw.trim().toLowerCase();
  if (lower === "easy") return "easy";
  if (lower === "medium") return "medium";
  if (lower === "hard") return "hard";
  return null;
}

/**
 * Tìm container chứa mô tả đề bài.
 * Thứ tự ưu tiên theo plan §5.1
 */
export function findDescriptionContainer(doc: Document): Element | null {
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

/**
 * Tìm anchor chứa title + slug.
 */
export function findTitleAnchor(doc: Document): HTMLAnchorElement | null {
  // Ưu tiên anchor trong header title
  const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href^="/problems/"]'));
  // Chọn anchor có text chứa ".\s" (dạng "5. Title") hoặc nằm gần .text-title-large
  for (const a of anchors) {
    if (parseTitle(a.textContent ?? "")) return a;
  }
  // Fallback: anchor đầu tiên nếu chỉ có 1
  // Nhưng nếu có nhiều (như discussion link), chọn cái gần title container
  const titleContainer = doc.querySelector(".text-title-large");
  if (titleContainer) {
    const inside = titleContainer.querySelector<HTMLAnchorElement>('a[href^="/problems/"]');
    if (inside) return inside;
  }
  return anchors[0] ?? null;
}

/**
 * Trích xuất difficulty từ DOM.
 */
export function extractDifficulty(doc: Document): Difficulty | null {
  // Thử class text-difficulty-*
  const diffEl = doc.querySelector('[class*="text-difficulty"]');
  if (diffEl) {
    const normalized = normalizeDifficulty(diffEl.textContent ?? "");
    if (normalized) return normalized;
    // class có thể là text-difficulty-medium
    const className = diffEl.className;
    if (className.includes("text-difficulty-easy")) return "easy";
    if (className.includes("text-difficulty-medium")) return "medium";
    if (className.includes("text-difficulty-hard")) return "hard";
  }
  // Fallback: tìm badge chứa Easy/Medium/Hard
  const badges = Array.from(doc.querySelectorAll("div, span"));
  for (const b of badges) {
    const txt = (b.textContent ?? "").trim();
    if (txt === "Easy" || txt === "Medium" || txt === "Hard") {
      // Đảm bảo badge nhỏ (không phải description)
      if (b.children.length === 0 || b.textContent?.length === txt.length) {
        const n = normalizeDifficulty(txt);
        if (n) return n;
      }
    }
  }
  return null;
}

/**
 * Trích xuất tags từ DOM — các anchor href="/tag/*" (Topics).
 * VD: <a href="/tag/linked-list/">Linked List</a> → "Linked List"
 */
export function extractTags(doc: Document): string[] {
  const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href^="/tag/"]'));
  const tags: string[] = [];
  const seen = new Set<string>();
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

/**
 * Trích xuất hints (mỗi hint là HTML string).
 * LeetCode render mỗi hint là 1 block `div.flex.flex-col` chứa header `Hint N`
 * với icon lightbulb và content trong `div.overflow-hidden > div.HTMLContent_html__*`.
 */
export function extractHints(doc: Document): string[] {
  const hints: string[] = [];
  // Mỗi hint là một container flex-col chứa label Hint N
  const containers = Array.from(doc.querySelectorAll("div.flex.flex-col"));
  for (const container of containers) {
    const labelEl = container.querySelector("div.text-body");
    if (!labelEl) continue;
    const labelText = (labelEl.textContent ?? "").trim();
    if (!/^Hint\s*\d+/i.test(labelText)) continue;

    // Content nằm trong overflow-hidden hoặc HTMLContent
    let contentEl: Element | null =
      container.querySelector("div.overflow-hidden > div") ??
      container.querySelector('[class*="HTMLContent_html"]') ??
      container.querySelector("div.mt-2");

    // Fallback: tìm div sau header
    if (!contentEl) {
      const allDivs = Array.from(container.querySelectorAll("div"));
      for (const d of allDivs) {
        if (d.textContent?.trim() && !/^Hint\s*\d+/i.test(d.textContent.trim()) && d !== labelEl) {
          // heuristric: div có class HTMLContent hoặc pl-7
          if (d.className.includes("HTMLContent") || d.className.includes("pl-7") || d.className.includes("text-sd-foreground")) {
            contentEl = d;
            break;
          }
        }
      }
    }

    if (!contentEl) continue;
    // Loại bỏ script/style trong hint
    const clone = contentEl.cloneNode(true) as Element;
    clone.querySelectorAll("script, style, iframe, noscript, button, svg").forEach((el) => el.remove());
    let html = clone.innerHTML.trim();
    if (!html) {
      const text = (contentEl.textContent ?? "").trim();
      if (text) html = text;
    }
    if (html) hints.push(html);
  }

  // Fallback: nếu không tìm thấy theo container, thử tìm trực tiếp các block overflow-hidden chứa hint
  if (hints.length === 0) {
    const hintHeaders = Array.from(doc.querySelectorAll("div.text-body")).filter((el) => /^Hint\s*\d+/i.test((el.textContent ?? "").trim()));
    for (const header of hintHeaders) {
      const parent = header.closest("div.flex.flex-col") ?? header.parentElement?.closest("div.flex.flex-col");
      if (!parent) continue;
      const contentEl = parent.querySelector("div.overflow-hidden div");
      if (!contentEl) continue;
      const clone = contentEl.cloneNode(true) as Element;
      clone.querySelectorAll("script, style, iframe, noscript, button, svg").forEach((el) => el.remove());
      const html = clone.innerHTML.trim() || (contentEl.textContent ?? "").trim();
      if (html && !hints.includes(html)) hints.push(html);
    }
  }

  return hints;
}

/**
 * Trích xuất code template (JS mặc định nếu có).
 * Ưu tiên: monaco global → __NEXT_DATA__ → data-track-load="code_editor" → monaco view-lines.
 */
export function extractTemplate(doc: Document): string | undefined {
  // 0) Thử lấy từ window.monaco (full value, không bị virtualize)
  try {
    const win = (typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : null) as
      | Record<string, unknown>
      | null;
    const monaco = win?.["monaco"] as { editor?: { getModels?: () => { getValue?: () => string }[] } } | undefined;
    if (monaco?.editor?.getModels) {
      const models = monaco.editor.getModels();
      if (models && models.length > 0) {
        const v = models[0]?.getValue?.();
        if (typeof v === "string" && v.trim().length > 2 && v.trim().length < 50000) return v.trim();
      }
    }
  } catch {
    // ignore
  }

  // 0b) Thử từ __NEXT_DATA__ (LeetCode embed codeSnippets)
  try {
    const nextDataEl = doc.getElementById("__NEXT_DATA__") ?? doc.querySelector('script#__NEXT_DATA__');
    if (nextDataEl?.textContent) {
      const data = JSON.parse(nextDataEl.textContent);
      const found = findCodeSnippetInJson(data);
      if (found) return found;
    }
    // Thử các script application/json khác
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

  // 1) Thử container code_editor cụ thể (sample mới)
  const codeEditorContainer = doc.querySelector('[data-track-load="code_editor"]');
  if (codeEditorContainer) {
    // Trong container này tìm monaco
    const monacoInEditor = codeEditorContainer.querySelector(".monaco-editor");
    if (monacoInEditor) {
      const lines = codeEditorContainer.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
      if (lines.length > 0) {
        const text = Array.from(lines)
          .map((el) => (el.textContent ?? "").replace(/\u00a0/g, " "))
          .join("\n")
          .trim();
        if (text && text.length > 2 && text.length < 50000) return text;
      }
      const t = (monacoInEditor.textContent ?? "").trim();
      if (t && t.length > 10 && t.length < 50000) return t;
    }
    // Fallback: lấy toàn bộ text trong code_editor (loại bỏ line numbers)
    const t2 = (codeEditorContainer.textContent ?? "").trim();
    // Heuristic: nếu chứa function/var/class thì likely là template
    if (t2 && /function|class|var |let |const |return|=>/.test(t2) && t2.length < 50000 && t2.length > 10) {
      // Loại bỏ line numbers (chỉ số dòng) nếu có
      const cleaned = t2
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n");
      if (cleaned) return cleaned;
    }
  }

  // 2) Monaco editor — LeetCode dùng monaco (fallback chung)
  const monacoLines = doc.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
  if (monacoLines.length > 0) {
    const text = Array.from(monacoLines)
      .map((el) => (el.textContent ?? "").replace(/\u00a0/g, " "))
      .join("\n")
      .trim();
    if (text && text.length > 2 && text.length < 50000) {
      if (/function|class|var |let |const |return|=>/.test(text)) return text;
      if (text.split("\n").length >= 1) return text;
    }
  }

  const monaco = doc.querySelector(".monaco-editor");
  if (monaco) {
    const t = (monaco.textContent ?? "").trim();
    if (t && t.length > 10 && t.length < 50000 && /function|class|var |let |const |def |public/.test(t)) {
      return t;
    }
  }

  // 3) CodeMirror
  const cm = doc.querySelector(".CodeMirror-code, .cm-content");
  if (cm) {
    const t = (cm.textContent ?? "").trim();
    if (t && t.length > 2 && t.length < 20000) {
      // Chỉ trả về nếu có vẻ là code template, không phải test case console (tránh nhầm với test case Input)
      // Nếu cm nằm trong console (flex-1 overflow-y-auto) thì bỏ qua
      const inConsole = cm.closest(".flex-1.overflow-y-auto");
      if (!inConsole && /function|class|var |let |const/.test(t)) return t;
    }
  }

  // 4) Pre/code chứa template
  const pres = Array.from(doc.querySelectorAll("pre"));
  for (const pre of pres) {
    const t = (pre.textContent ?? "").trim();
    if (t && /function\s+\w+|class\s+\w+|var\s+\w+|let\s+\w+/.test(t) && t.length < 5000) {
      return t;
    }
  }

  return undefined;
}

function findCodeSnippetInJson(data: unknown, preferredLang = "javascript"): string | undefined {
  // Tìm đệ quy các object có `code` và `lang`/`langSlug`
  const stack: unknown[] = [data];
  const candidates: { lang: string; code: string }[] = [];
  const seen = new WeakSet<object>();
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (seen.has(cur as object)) continue;
    seen.add(cur as object);
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
      // fallback: nếu object có code trông như template nhưng không có lang, vẫn thử
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
  // Ưu tiên javascript
  const js = candidates.find((c) => c.lang.includes("javascript") || c.lang.includes("js"));
  if (js) return js.code.trim();
  return candidates[0]?.code?.trim();
}

/**
 * Parse JSON an toàn cho test case line (vd "[1,2]" → array, "1" → 1, "[1]" → array)
 */
function parseJsonLine(line: string): unknown {
  const trimmed = line.trim();
  if (!trimmed) return trimmed;
  try {
    return JSON.parse(trimmed);
  } catch {
    // Thử parse dạng LeetCode linked list "[1,2,3]" đã ok, nếu là "null" etc
    // Nếu không phải JSON, trả về raw string (loại bỏ quotes nếu có)
    return trimmed;
  }
}

/**
 * Trích xuất testCases từ console DOM.
 * Hỗ trợ 2 dạng:
 * - Hidden cm-content (opacity-0) chứa Input/Output/Expected cho tất cả cases
 * - Visible per-case Input/Output/Expected trong flex-1 overflow-y-auto
 */
export function extractTestCases(doc: Document): { input: unknown; expected: unknown }[] | undefined {
  // Thử 1: Hidden editor với tất cả cases (sample thứ 2)
  const hidden = (doc.querySelector("div.mt-0.h-0.overflow-hidden.opacity-0") ??
    doc.querySelector("div.opacity-0.h-0") ??
    doc.querySelector("div.h-0.overflow-hidden.opacity-0")) as Element | null;

  if (hidden) {
    const cmContents = Array.from(hidden.querySelectorAll(".cm-content"));
    // Sample có 3 cm-content: Input (6 lines), Output (3), Expected (3)
    // Tìm theo header text "Input"/"Output"/"Expected" để map đúng
    let inputLines: string[] = [];
    let expectedLines: string[] = [];

    // Thử map theo thứ tự header
    const headers = Array.from(hidden.querySelectorAll("div.text-xs.font-medium"));
    const headerTexts = headers.map((h) => (h.textContent ?? "").trim().toLowerCase());
    // Nếu có header, lấy cm-content tương ứng theo index
    if (headerTexts.includes("input") && headerTexts.includes("expected")) {
      const inputIdx = headerTexts.indexOf("input");
      const expectedIdx = headerTexts.indexOf("expected");
      if (cmContents[inputIdx]) {
        inputLines = Array.from(cmContents[inputIdx].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      }
      if (cmContents[expectedIdx]) {
        expectedLines = Array.from(cmContents[expectedIdx].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      }
    } else if (cmContents.length >= 3) {
      // Fallback theo thứ tự Input, Output, Expected như sample
      inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      expectedLines = Array.from(cmContents[2].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
    } else if (cmContents.length === 2) {
      inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      expectedLines = Array.from(cmContents[1].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
    }

    inputLines = inputLines.filter((l) => l.length > 0);
    expectedLines = expectedLines.filter((l) => l.length > 0);

    if (inputLines.length > 0 && expectedLines.length > 0) {
      const parsed = buildTestCasesFromLines(inputLines, expectedLines, doc);
      if (parsed && parsed.length > 0) return parsed;
    }
  }

  // Thử 2: Visible console per-case (flex-1 overflow-y-auto)
  const consoleContainer = doc.querySelector("div.flex-1.overflow-y-auto");
  if (consoleContainer) {
    const inputLabels = Array.from(consoleContainer.querySelectorAll("div.mx-3.mb-2.text-xs")).map((el) => (el.textContent ?? "").trim().replace(/\s*=\s*$/, ""));
    // Expected có thể ở span.text-green-s hoặc div.font-menlo dưới header "Expected"
    let expectedEl: Element | null =
      consoleContainer.querySelector("span.text-green-s") ??
      consoleContainer.querySelector("span[class*='text-green']") ??
      consoleContainer.querySelector("div.group.relative.rounded-lg.bg-fill-4")?.parentElement?.querySelector("span.text-green-s") ??
      null;
    if (!expectedEl) {
      // Fallback: tìm header "Expected" rồi lấy font-menlo kế tiếp
      const expectedHeader = Array.from(consoleContainer.querySelectorAll("div.text-xs.font-medium")).find(
        (el) => (el.textContent ?? "").trim().toLowerCase() === "expected",
      );
      if (expectedHeader) {
        const maybe = expectedHeader.parentElement?.parentElement?.querySelector("div.font-menlo, span.text-green-s");
        if (maybe) expectedEl = maybe;
      }
    }
    if (!expectedEl) {
      // Fallback: tìm span/div chứa JSON array như "[1]" trong console
      const candidates = Array.from(consoleContainer.querySelectorAll("span, div.font-menlo"));
      expectedEl = candidates.find((el) => {
        const t = (el.textContent ?? "").trim();
        return /^\s*\[.*\]\s*$/.test(t) || t === "[]" || /^\s*\d+\s*$/.test(t);
      }) ?? null;
      // Ưu tiên phần tử có class text-green hoặc nằm dưới Expected
      const green = candidates.find((el) => el.className.includes("text-green") || el.className.includes("green"));
      if (green) expectedEl = green;
    }
    if (inputLabels.length > 0) {
      const inputValues: unknown[] = [];
      const labelElements = Array.from(consoleContainer.querySelectorAll("div.mx-3.mb-2.text-xs"));
      for (const labelEl of labelElements) {
        const container = labelEl.parentElement ?? labelEl.closest("div.group");
        const valueEl = container?.querySelector("div.font-menlo") ?? (labelEl.nextElementSibling as Element | null);
        if (valueEl) {
          const raw = (valueEl.textContent ?? "").trim();
          if (raw) inputValues.push(parseJsonLine(raw));
        } else {
          // Fallback: lấy text ngay sau label
          const next = labelEl.nextElementSibling;
          if (next) {
            const raw = (next.textContent ?? "").trim();
            if (raw) inputValues.push(parseJsonLine(raw));
          }
        }
      }
      const expectedRaw = (expectedEl?.textContent ?? "").trim();
      const expected = expectedRaw ? parseJsonLine(expectedRaw) : undefined;
      if (inputValues.length > 0 && expected !== undefined) {
        // Tạo input object nếu có label
        let input: unknown;
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

  // Thử 3: Tìm trong __NEXT_DATA__ (LeetCode embed question test cases)
  try {
    const nextDataEl = doc.getElementById("__NEXT_DATA__") ?? doc.querySelector('script#__NEXT_DATA__');
    if (nextDataEl?.textContent) {
      const data = JSON.parse(nextDataEl.textContent);
      const tcs = findTestCasesInJson(data);
      if (tcs && tcs.length > 0) return tcs;
    }
  } catch {
    // ignore
  }

  return undefined;
}

function findTestCasesInJson(data: unknown): { input: unknown; expected: unknown }[] | undefined {
  const stack: unknown[] = [data];
  const seen = new WeakSet<object>();
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (seen.has(cur as object)) continue;
    seen.add(cur as object);
    if (Array.isArray(cur)) {
      // Nếu array chứa object với input/expected, có thể là testCases
      if (cur.length > 0 && typeof cur[0] === "object" && cur[0] && "input" in (cur[0] as Record<string, unknown>) && "expected" in (cur[0] as Record<string, unknown>)) {
        return cur as { input: unknown; expected: unknown }[];
      }
      for (const v of cur) stack.push(v);
      continue;
    }
    const obj = cur as Record<string, unknown>;
    // Thử các key thường gặp
    if (Array.isArray(obj["testCases"]) && (obj["testCases"] as unknown[]).length > 0) {
      return obj["testCases"] as { input: unknown; expected: unknown }[];
    }
    if (Array.isArray(obj["exampleTestcases"]) && (obj["exampleTestcases"] as unknown[]).length > 0) {
      // exampleTestcases thường là array string như "[1,2,3]\n2" — cần parse
      // Không xử lý ở đây
    }
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object") stack.push(v);
    }
  }
  return undefined;
}

function buildTestCasesFromLines(inputLines: string[], expectedLines: string[], doc: Document): { input: unknown; expected: unknown }[] | undefined {
  if (expectedLines.length === 0) return undefined;
  const totalCases = expectedLines.length;
  const perCaseInputCount = inputLines.length / totalCases;
  // Nếu không chia hết, fallback: mỗi case 1 input
  const perCase = Number.isInteger(perCaseInputCount) && perCaseInputCount > 0 ? perCaseInputCount : 1;

  // Lấy param names từ template JSDoc hoặc visible labels
  let paramNames: string[] = [];
  // Thử từ visible Input labels
  const labelEls = Array.from(doc.querySelectorAll("div.mx-3.mb-2.text-xs"));
  const labels = labelEls.map((el) => (el.textContent ?? "").trim().replace(/\s*=\s*$/, "").trim()).filter(Boolean);
  if (labels.length === perCase) {
    paramNames = labels;
  } else {
    // Thử từ template
    const template = extractTemplate(doc);
    if (template) {
      // Tìm function signature
      const m = template.match(/function\s+\w*\s*\(([^)]*)\)/) ?? template.match(/var\s+\w+\s*=\s*function\s*\(([^)]*)\)/) ?? template.match(/\(([^)]*)\)\s*=>/);
      if (m?.[1]) {
        const params = m[1]
          .split(",")
          .map((p) => p.trim().split(/\s*=\s*/)[0].trim())
          .filter(Boolean);
        if (params.length === perCase) paramNames = params;
        else if (params.length > 0) paramNames = params.slice(0, perCase);
      }
      // Thử từ JSDoc @param
      if (paramNames.length === 0) {
        const paramMatches = Array.from(template.matchAll(/@param\s+\{[^}]+\}\s+(\w+)/g)).map((mm) => mm[1]);
        if (paramMatches.length === perCase) paramNames = paramMatches;
      }
    }
  }

  const cases: { input: unknown; expected: unknown }[] = [];
  for (let i = 0; i < totalCases; i++) {
    const inputChunk = inputLines.slice(i * perCase, (i + 1) * perCase);
    const expectedRaw = expectedLines[i];
    const expected = parseJsonLine(expectedRaw);

    let input: unknown;
    const parsedInputs = inputChunk.map(parseJsonLine);
    if (paramNames.length === parsedInputs.length && paramNames.length > 0) {
      input = Object.fromEntries(paramNames.map((k, idx) => [k, parsedInputs[idx]]));
    } else if (parsedInputs.length === 1) {
      input = parsedInputs[0];
    } else if (parsedInputs.length > 1) {
      // Nếu không có param names, thử trả về object với key generic hoặc array
      // Ưu tiên array nếu không có tên
      input = parsedInputs;
      // Nếu có thể, tạo object với key arg0, arg1...
      if (paramNames.length === 0) {
        // Để tương thích với problem-engine, nếu input là array nhiều phần tử, engine có thể cần spread?
        // Nhưng TestCase input là unknown, nên có thể là array
      }
    } else {
      input = parsedInputs[0];
    }

    cases.push({ input, expected });
  }

  return cases.length > 0 ? cases : undefined;
}

/**
 * Làm sạch description HTML: loại bỏ script/style/iframe, chuẩn hoá &nbsp;
 */
export function cleanDescription(container: Element): string {
  const clone = container.cloneNode(true) as Element;

  // Loại bỏ các tag nguy hiểm / rác — nhưng giữ hints riêng
  clone.querySelectorAll("script, style, iframe, noscript, svg, button").forEach((el) => el.remove());

  let html = clone.innerHTML;

  // Thay &nbsp; entity bằng space (nếu còn)
  html = html.replace(/&nbsp;/g, " ");
  // Trim
  html = html.trim();

  return html;
}

/**
 * Build ProblemClip từ document hiện tại.
 * Trả về null nếu không tìm thấy description.
 */
export function buildProblemClip(doc: Document, url: string): ProblemClip | null {
  const container = findDescriptionContainer(doc);
  if (!container) return null;

  const description = cleanDescription(container);
  if (!description) return null;

  const anchor = findTitleAnchor(doc);
  let id: number | null = null;
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

  // Fallback từ URL nếu chưa có slug/id
  if (!slug) {
    try {
      const u = new URL(url);
      slug = u.pathname.split("/").filter(Boolean).pop() ?? "";
      // Nếu pathname là /problems/slug/
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("problems");
      if (idx >= 0 && parts[idx + 1]) slug = parts[idx + 1];
    } catch {
      // ignore
    }
  }

  if (!title) {
    // Fallback từ document.title "Longest Palindromic Substring - LeetCode"
    const docTitle = doc.title ?? "";
    title = docTitle.replace(/\s*-\s*LeetCode\s*$/i, "").trim();
    const parsed = parseTitle(title);
    if (parsed) {
      id = parsed.id;
      title = parsed.title;
    }
  }

  // Nếu vẫn chưa có id, thử hash slug hoặc để 0 (sẽ validate ở web/server)
  if (id === null || Number.isNaN(id)) {
    // Thử parse từ title fallback
    const parsed = parseTitle(title);
    if (parsed) {
      id = parsed.id;
      title = parsed.title;
    } else {
      // Không có id → dùng 0 để báo lỗi ở validation, hoặc hash
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

/**
 * Validate JSON clip (dùng ở web/server nếu cần).
 */
export function isValidProblemClip(obj: unknown): obj is ProblemClip {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  const basic =
    typeof o["id"] === "number" &&
    Number.isInteger(o["id"]) &&
    (o["id"] as number) > 0 &&
    typeof o["slug"] === "string" &&
    typeof o["title"] === "string" &&
    (o["title"] as string).length > 0 &&
    (o["difficulty"] === "easy" || o["difficulty"] === "medium" || o["difficulty"] === "hard") &&
    Array.isArray(o["tags"]) &&
    typeof o["description"] === "string" &&
    (o["description"] as string).length > 0;
  if (!basic) return false;
  if (o["url"] !== undefined && o["url"] !== null && typeof o["url"] !== "string") return false;
  if (o["template"] !== undefined && o["template"] !== null && typeof o["template"] !== "string") return false;
  if (o["hints"] !== undefined && o["hints"] !== null && !Array.isArray(o["hints"])) return false;
  if (o["testCases"] !== undefined && o["testCases"] !== null) {
    if (!Array.isArray(o["testCases"])) return false;
    for (const tc of o["testCases"] as unknown[]) {
      if (typeof tc !== "object" || tc === null) return false;
      const tco = tc as Record<string, unknown>;
      if (!("input" in tco) || !("expected" in tco)) return false;
    }
  }
  return true;
}
