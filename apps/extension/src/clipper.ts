/**
 * Logic thuần để clip đề bài LeetCode từ DOM.
 * Không phụ thuộc vào chrome API — có thể test với jsdom.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface ProblemClip {
  id: number;
  slug: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  template?: string;
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
 * Thử nhiều selector: monaco editor view-line, CodeMirror, pre chứa function.
 */
export function extractTemplate(doc: Document): string | undefined {
  // 1) Monaco editor — LeetCode dùng monaco
  const monacoLines = doc.querySelectorAll(".monaco-editor .view-line, .monaco-editor .view-lines .view-line");
  if (monacoLines.length > 0) {
    const text = Array.from(monacoLines)
      .map((el) => el.textContent ?? "")
      .join("\n")
      .trim();
    // Lọc trash: nếu text quá ngắn hoặc chỉ whitespace thì bỏ
    if (text && text.length > 2 && text.length < 20000) {
      // Đảm bảo có keyword code
      if (/function|class|var |let |const |return|=>/.test(text)) return text;
      // Nếu không có keyword nhưng có nhiều dòng, vẫn trả về (có thể là template rỗng)
      if (text.split("\n").length >= 1) return text;
    }
  }

  // Fallback: toàn bộ monaco container text
  const monaco = doc.querySelector(".monaco-editor");
  if (monaco) {
    const t = (monaco.textContent ?? "").trim();
    if (t && t.length > 10 && t.length < 20000 && /function|class|var |let |const |def |public/.test(t)) {
      return t;
    }
  }

  // 2) CodeMirror
  const cm = doc.querySelector(".CodeMirror-code, .cm-content");
  if (cm) {
    const t = (cm.textContent ?? "").trim();
    if (t && t.length > 2) return t;
  }

  // 3) Thử tìm trong script/json có template (LeetCode embed)
  // 4) Pre/code chứa template (ít dùng)
  const pres = Array.from(doc.querySelectorAll("pre"));
  for (const pre of pres) {
    const t = (pre.textContent ?? "").trim();
    if (t && /function\s+\w+|class\s+\w+|var\s+\w+|let\s+\w+/.test(t) && t.length < 5000) {
      // Đảm bảo pre này không phải example trong description (description đã có)
      // Nếu pre nằm ngoài description container thì có thể là template
      return t;
    }
  }

  return undefined;
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

  return {
    id,
    slug,
    title,
    url,
    difficulty,
    tags,
    description,
    template,
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
  return true;
}
