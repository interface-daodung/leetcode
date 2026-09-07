/**
 * Parser: editorial (solution article) từ tab /editorial/ của LeetCode.
 * Trích HTML sạch gồm các Approach (Intuition/Algorithm/Implementation/Complexity)
 * và video solution (iframe vimeo → giữ src).
 */

const EDITORIAL_SELECTORS = [
  '[class*="solution-markdown_markdown"]',
  '[class*="markdown-content_markdown"]',
  '[data-track-load="description_content"]',
];

/** Tìm container editorial trên trang (ưu tiên solution-markdown). */
export function findEditorialContainer(doc: Document): Element | null {
  for (const sel of EDITORIAL_SELECTORS) {
    const el = doc.querySelector(sel);
    if (el) return el;
  }
  return null;
}

/**
 * Làm sạch HTML editorial:
 * - giữ iframe (vimeo video + playground code) nhưng bỏ sandbox/loading attributes thừa
 * - bỏ script/style/svg/button/noscript
 * - chuẩn hoá &nbsp;
 */
export function cleanEditorial(container: Element): string {
  const clone = container.cloneNode(true) as Element;
  clone.querySelectorAll("script, style, noscript, button, svg, form").forEach((el) => el.remove());
  // Giữ iframe video/playground: gọn attribute, width 100%
  clone.querySelectorAll("iframe").forEach((el) => {
    const src = el.getAttribute("src") ?? "";
    el.setAttribute("src", src);
    el.removeAttribute("sandbox");
    el.removeAttribute("translate");
    el.removeAttribute("loading");
    if (el.hasAttribute("width") && el.getAttribute("width") !== "100%") el.setAttribute("width", "100%");
  });
  // Bỏ anchor link-icon của heading (svg đã remove, anchor còn rỗng)
  clone.querySelectorAll("a[aria-hidden='true']").forEach((el) => el.remove());
  let html = clone.innerHTML;
  html = html.replace(/&nbsp;/g, " ");
  return html.trim();
}

/**
 * Trích xuất editorial HTML từ document.
 * Trả về undefined nếu trang không phải tab Editorial (hoặc chưa render).
 */
export function extractEditorial(doc: Document): string | undefined {
  const container = findEditorialContainer(doc);
  if (!container) return undefined;
  const html = cleanEditorial(container);
  // Trang /problems/ (đề bài) cũng có class markdown-content — nhưng không có heading "Solution Article".
  // Chỉ nhận khi có dấu hiệu editorial (heading Solution Article / Approach / video vimeo / playground).
  const hasEditorialMarkers =
    /Solution Article/i.test(html) ||
    /Approach\s*\d/i.test(html) ||
    /player\.vimeo\.com/.test(html) ||
    /leetcode\.com\/playground\//.test(html);
  if (!html || !hasEditorialMarkers) return undefined;
  return html;
}
