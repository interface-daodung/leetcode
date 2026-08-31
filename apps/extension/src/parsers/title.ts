/**
 * Parser: tiêu đề và slug từ DOM/URL.
 */

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
