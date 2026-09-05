import { getAllSuggestItems, snippetItems } from "./index.js";
import { MEMBER_ITEMS } from "./members.js";
import { extractVars } from "./vars.js";
import type { SuggestItem } from "./types.js";

export interface SuggestContext {
  /** text từ đầu dòng đến caret */
  linePrefix: string;
  /** identifier đang gõ ("" nếu không gõ word) */
  wordPrefix: string;
  /** identifier trước dấu "." ngay trước word (null nếu không phải member access) */
  receiver: string | null;
  /** true nếu đang gõ sau trigger "al/" (chỉ gợi ý thuật toán mẫu) */
  algo: boolean;
}

/** Regex 1 lần — module scope. */
const WORD_RE = /([A-Za-z_$][\w$]*)$/;
const MEMBER_RE = /([A-Za-z_$][\w$]*)\.\s*(?:([A-Za-z_$][\w$]*))?$/;
const ALGO_RE = /(?:^|[^\w$])al\/([A-Za-z_$][\w$]*)?$/;

/** Prefix trigger riêng cho nhóm thuật toán/pattern. */
export const ALGO_TRIGGER = "al/";

/** Dò context từ text trước caret. */
export function detectContext(textBeforeCaret: string): SuggestContext {
  const lineStart = Math.max(textBeforeCaret.lastIndexOf("\n"), -1);
  const linePrefix = textBeforeCaret.slice(lineStart + 1);

  const algoM = linePrefix.match(ALGO_RE);
  if (algoM) {
    return { linePrefix, wordPrefix: algoM[1] ?? "", receiver: null, algo: true };
  }

  const wordM = linePrefix.match(WORD_RE);
  const wordPrefix = wordM ? wordM[1] : "";

  const memberM = linePrefix.match(MEMBER_RE);
  const receiver = memberM ? memberM[1] : null;

  return { linePrefix, wordPrefix, receiver, algo: false };
}

const MAX_RESULTS = 10;

function rank(items: SuggestItem[], wordPrefix: string): SuggestItem[] {
  const p = wordPrefix.toLowerCase();
  const scored = items
    .filter((it) => it.label.toLowerCase().startsWith(p))
    .sort(
      (a, b) =>
        (b.priority ?? 0) - (a.priority ?? 0) ||
        a.label.length - b.label.length ||
        a.label.localeCompare(b.label),
    )
    .slice(0, MAX_RESULTS);
  return scored;
}

/**
 * Gợi ý theo context + type suy luận từ toàn bộ code.
 * - Sau "al/" → CHỈ thuật toán mẫu (kind "pattern"), UI sẽ xóa "al/" khi chèn.
 * - Sau dấu "." → chỉ method/property của receiver type (nếu biết type).
 * - Không receiver → keyword + snippet + API (pattern không hiện để đỡ nhiễu).
 */
export function suggestForCode(code: string, textBeforeCaret: string): SuggestItem[] {
  const ctx = detectContext(textBeforeCaret);

  if (ctx.algo) {
    return rank(snippetItems.filter((it) => it.kind === "pattern"), ctx.wordPrefix);
  }

  if (ctx.receiver) {
    const vars = extractVars(code);
    const type = vars.get(ctx.receiver);
    if (!type) return [];
    const members = MEMBER_ITEMS.filter((it) => it.receiverTypes?.includes(type));
    return rank(members, ctx.wordPrefix);
  }

  const items = ctx.wordPrefix.length >= 2 ? getAllSuggestItems() : [...snippetItems, ...getAllSuggestItems().filter((it) => it.kind !== "api")];
  return rank(items.filter((it) => it.kind !== "pattern"), ctx.wordPrefix);
}

/** Wrapper tiện dụng cho UI: truyền code + text trước caret. */
export function suggest(ctx: SuggestContext, vars: Map<string, string>): SuggestItem[] {
  if (ctx.algo) {
    return rank(snippetItems.filter((it) => it.kind === "pattern"), ctx.wordPrefix);
  }
  if (ctx.receiver) {
    const type = vars.get(ctx.receiver);
    if (!type) return [];
    const members = MEMBER_ITEMS.filter((it) => it.receiverTypes?.includes(type));
    return rank(members, ctx.wordPrefix);
  }
  const items = ctx.wordPrefix.length >= 2 ? getAllSuggestItems() : snippetItems;
  return rank(items.filter((it) => it.kind !== "pattern"), ctx.wordPrefix);
}
