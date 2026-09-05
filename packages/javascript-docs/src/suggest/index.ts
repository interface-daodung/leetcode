import { getApiItems } from "./api.js";
import { keywordItems } from "./keywords.js";
import snippetsData from "./data/snippets.json" with { type: "json" };
import type { SuggestItem } from "./types.js";

export type { SuggestItem } from "./types.js";
export type { SuggestContext } from "./suggest.js";
export { detectContext, suggest, suggestForCode } from "./suggest.js";
export { extractVars } from "./vars.js";
export { MEMBER_ITEMS } from "./members.js";
export { VALUE_ITEMS } from "./values.js";

/** Danh sách snippet + pattern LeetCode (hand-written, hữu hạn). */
export const snippetItems: SuggestItem[] = snippetsData as SuggestItem[];

let allCache: SuggestItem[] | null = null;

/** Toàn bộ item (keyword + snippet/pattern + API) — dùng cho gợi ý không receiver. */
export function getAllSuggestItems(): SuggestItem[] {
  if (allCache) return allCache;
  allCache = [...keywordItems, ...snippetItems, ...getApiItems()];
  return allCache;
}
