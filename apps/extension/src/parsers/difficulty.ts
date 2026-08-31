/**
 * Parser: difficulty từ DOM.
 */
import type { Difficulty } from "../shared.js";

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
