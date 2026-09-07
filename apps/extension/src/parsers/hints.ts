/**
 * Parser: hints (mỗi hint là HTML string) từ DOM.
 */

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

    let contentEl: Element | null =
      container.querySelector("div.overflow-hidden > div") ??
      container.querySelector('[class*="HTMLContent_html"]') ??
      container.querySelector("div.mt-2");

    if (!contentEl) {
      const allDivs = Array.from(container.querySelectorAll("div"));
      for (const d of allDivs) {
        if (d.textContent?.trim() && !/^Hint\s*\d+/i.test(d.textContent.trim()) && d !== labelEl) {
          if (d.className.includes("HTMLContent") || d.className.includes("pl-7") || d.className.includes("text-sd-foreground")) {
            contentEl = d;
            break;
          }
        }
      }
    }

    if (!contentEl) continue;
    const clone = contentEl.cloneNode(true) as Element;
    clone.querySelectorAll("script, style, iframe, noscript, button, svg").forEach((el) => el.remove());
    let html = clone.innerHTML.trim();
    if (!html) {
      const text = (contentEl.textContent ?? "").trim();
      if (text) html = text;
    }
    if (html) hints.push(html);
  }

  // Fallback: quét trực tiếp các block overflow-hidden chứa hint
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
