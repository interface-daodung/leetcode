import type { ProblemClip } from "@leetcode/shared";

export interface ParseResult {
  clip: ProblemClip | null;
  error: string | null;
}

export function parseProblemClipJson(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { clip: null, error: "JSON rỗng" };

  let obj: unknown;
  try {
    obj = JSON.parse(trimmed);
  } catch (e) {
    return { clip: null, error: `JSON không hợp lệ: ${String(e)}` };
  }

  if (typeof obj !== "object" || obj === null) {
    return { clip: null, error: "JSON phải là object" };
  }

  const o = obj as Record<string, unknown>;

  if (typeof o["id"] !== "number" || !Number.isInteger(o["id"]) || (o["id"] as number) <= 0) {
    return { clip: null, error: "Thiếu hoặc sai `id` (phải là số nguyên dương)" };
  }
  if (typeof o["title"] !== "string" || (o["title"] as string).trim().length === 0) {
    return { clip: null, error: "Thiếu `title`" };
  }
  if (o["difficulty"] !== "easy" && o["difficulty"] !== "medium" && o["difficulty"] !== "hard") {
    return { clip: null, error: "Thiếu hoặc sai `difficulty` (easy|medium|hard)" };
  }
  if (typeof o["description"] !== "string" || (o["description"] as string).trim().length === 0) {
    return { clip: null, error: "Thiếu `description` (HTML)" };
  }

  const clip: ProblemClip = {
    id: o["id"] as number,
    slug: typeof o["slug"] === "string" ? (o["slug"] as string) : "",
    title: (o["title"] as string).trim(),
    url: typeof o["url"] === "string" ? (o["url"] as string) : undefined,
    difficulty: o["difficulty"] as ProblemClip["difficulty"],
    tags: Array.isArray(o["tags"]) ? (o["tags"] as string[]) : [],
    description: o["description"] as string,
    template: typeof o["template"] === "string" ? (o["template"] as string) : undefined,
    hints: Array.isArray(o["hints"]) ? (o["hints"] as string[]) : undefined,
    clippedAt: typeof o["clippedAt"] === "string" ? (o["clippedAt"] as string) : undefined,
  };

  return { clip, error: null };
}

/**
 * Sanitize HTML cơ bản trước khi dangerouslySetInnerHTML.
 * Loại bỏ script/iframe/event handler để tránh XSS.
 */
export function sanitizeDescriptionHtml(html: string): string {
  // Tạo div tạm để parse, chạy trong browser
  if (typeof document === "undefined") return html;
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());
  // Xoá event handler attributes
  template.content.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
      if (attr.name === "href" && attr.value.trim().toLowerCase().startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return template.innerHTML;
}
