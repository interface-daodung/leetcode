/**
 * Logic thuần để clip đề bài LeetCode từ DOM.
 * Không phụ thuộc vào chrome API — có thể test với jsdom.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface ProblemClip {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  url: string;
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
 * Làm sạch description HTML: loại bỏ script/style/iframe, chuẩn hoá &nbsp;
 */
export function cleanDescription(container: Element): string {
  const clone = container.cloneNode(true) as Element;

  // Loại bỏ các tag nguy hiểm / rác
  clone.querySelectorAll("script, style, iframe, noscript, svg, button").forEach((el) => el.remove());

  // Loại bỏ các attribute style/class không cần thiết? Giữ class tối thiểu để không vỡ layout
  // Phase 1: giữ nguyên, chỉ xoá style inline rỗng
  // Chuẩn hoá &nbsp; đã được innerHTML xử lý

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

/**
 * Validate JSON clip (dùng ở web/server nếu cần).
 */
export function isValidProblemClip(obj: unknown): obj is ProblemClip {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o["id"] === "number" &&
    Number.isInteger(o["id"]) &&
    (o["id"] as number) > 0 &&
    typeof o["slug"] === "string" &&
    typeof o["title"] === "string" &&
    (o["title"] as string).length > 0 &&
    (o["difficulty"] === "easy" || o["difficulty"] === "medium" || o["difficulty"] === "hard") &&
    Array.isArray(o["tags"]) &&
    typeof o["description"] === "string" &&
    (o["description"] as string).length > 0
  );
}
