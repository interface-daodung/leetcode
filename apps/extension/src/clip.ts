/**
 * Orchestrator: build ProblemClip từ Document + validate.
 */
import type { ProblemClip } from "./shared.js";
import { parseTitle, extractSlug } from "./parsers/title.js";
import { normalizeDifficulty, extractDifficulty } from "./parsers/difficulty.js";
import { extractTags } from "./parsers/tags.js";
import { findDescriptionContainer, findTitleAnchor, cleanDescription } from "./parsers/description.js";
import { extractHints } from "./parsers/hints.js";
import { extractTemplate } from "./parsers/template.js";
import { extractTestCases } from "./parsers/testcases.js";

export { parseTitle, extractSlug };
export { normalizeDifficulty, extractDifficulty };
export { extractTags };
export { findDescriptionContainer, findTitleAnchor, cleanDescription };
export { extractHints };
export { extractTemplate };
export { extractTestCases };

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
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("problems");
      if (idx >= 0 && parts[idx + 1]) slug = parts[idx + 1];
    } catch {
      // ignore
    }
  }

  if (!title) {
    const docTitle = doc.title ?? "";
    title = docTitle.replace(/\s*-\s*LeetCode\s*$/i, "").trim();
    const parsed = parseTitle(title);
    if (parsed) {
      id = parsed.id;
      title = parsed.title;
    }
  }

  if (id === null || Number.isNaN(id)) {
    const parsed = parseTitle(title);
    if (parsed) {
      id = parsed.id;
      title = parsed.title;
    } else {
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
