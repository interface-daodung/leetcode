/**
 * Parser: tags (topics) từ DOM.
 */

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
