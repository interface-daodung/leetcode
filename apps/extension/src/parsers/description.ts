/**
 * Parser: description container + sanitize.
 */
import { parseTitle } from "./title.js";

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
  const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href^="/problems/"]'));
  for (const a of anchors) {
    if (parseTitle(a.textContent ?? "")) return a;
  }
  const titleContainer = doc.querySelector(".text-title-large");
  if (titleContainer) {
    const inside = titleContainer.querySelector<HTMLAnchorElement>('a[href^="/problems/"]');
    if (inside) return inside;
  }
  return anchors[0] ?? null;
}

/**
 * Làm sạch description HTML: loại bỏ script/style/iframe, chuẩn hoá &nbsp;
 */
export function cleanDescription(container: Element): string {
  const clone = container.cloneNode(true) as Element;
  clone.querySelectorAll("script, style, iframe, noscript, svg, button").forEach((el) => el.remove());
  let html = clone.innerHTML;
  html = html.replace(/&nbsp;/g, " ");
  html = html.trim();
  return html;
}