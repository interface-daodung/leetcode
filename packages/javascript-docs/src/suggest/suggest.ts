import { getAllSuggestItems, snippetItems } from "./index.js";
import { MEMBER_ITEMS } from "./members.js";
import { VALUE_ITEMS } from "./values.js";
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
  /** true nếu caret đứng ngay sau "=" hoặc "= " (gợi ý giá trị: new Map(), parseInt()...) */
  afterEquals: boolean;
  /** true nếu ký tự cuối là khoảng trắng/\n/\t và không có word đang gõ (gợi ý khai báo const/let/var) */
  afterSpace: boolean;
}

/** Regex 1 lần — module scope. */
const WORD_RE = /([A-Za-z_$][\w$]*)$/;
const MEMBER_RE = /([A-Za-z_$][\w$]*)\.\s*(?:([A-Za-z_$][\w$]*))?$/;
const ALGO_RE = /(?:^|[^\w$])al\/([A-Za-z_$][\w$]*)?$/;
const EQUALS_RE = /=\s*$/;
const EQUALS_WORD_RE = /=\s*[A-Za-z_$][\w$]*$/;
const SPACE_RE = /\s$/;

/** Prefix trigger riêng cho nhóm thuật toán/pattern. */
export const ALGO_TRIGGER = "al/";

/** Dò context từ text trước caret. */
export function detectContext(textBeforeCaret: string): SuggestContext {
  const lineStart = Math.max(textBeforeCaret.lastIndexOf("\n"), -1);
  const linePrefix = textBeforeCaret.slice(lineStart + 1);

  const algoM = linePrefix.match(ALGO_RE);
  if (algoM) {
    return { linePrefix, wordPrefix: algoM[1] ?? "", receiver: null, algo: true, afterEquals: false, afterSpace: false };
  }

  const wordM = linePrefix.match(WORD_RE);
  const wordPrefix = wordM ? wordM[1] : "";

  const memberM = linePrefix.match(MEMBER_RE);
  const receiver = memberM ? memberM[1] : null;

  const afterEquals = EQUALS_RE.test(linePrefix) || (!!wordPrefix && EQUALS_WORD_RE.test(linePrefix));
  const beforeWord = linePrefix.slice(0, linePrefix.length - wordPrefix.length);
  const afterSpace = !receiver && !afterEquals && SPACE_RE.test(beforeWord);

  return { linePrefix, wordPrefix, receiver, algo: false, afterEquals, afterSpace };
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

/** Item khai báo đầu dòng: const/let/var/function/class. */
const DECL_IDS = new Set(["keyword.const", "keyword.let", "keyword.var", "keyword.function", "keyword.class"]);

function pickDecls(): SuggestItem[] {
  return getAllSuggestItems().filter((it) => DECL_IDS.has(it.id));
}

/**
 * Gợi ý theo context + type suy luận từ toàn bộ code.
 * - Sau "al/" → CHỈ thuật toán mẫu (kind "pattern"), UI sẽ xóa "al/" khi chèn.
 * - Sau "=" / "= " → giá trị: new Map()/Set()/[], parseInt(), Boolean()...
 * - Ký tự cuối là space/\n/\t (chưa gõ word) → chỉ khai báo const/let/var/function/class.
 * - Sau dấu "." → chỉ method/property của receiver type (nếu biết type).
 * - Đang gõ word → lọc theo prefix, KHÔNG hiện pattern (giảm nhiễu).
 */
export function suggestForCode(code: string, textBeforeCaret: string): SuggestItem[] {
  const ctx = detectContext(textBeforeCaret);

  if (ctx.algo) {
    return rank(snippetItems.filter((it) => it.kind === "pattern"), ctx.wordPrefix);
  }

  if (ctx.afterEquals) {
    // value items luôn đứng trước API cùng prefix (bump +1000)
    const pool = ctx.wordPrefix
      ? [...VALUE_ITEMS.map((v) => ({ ...v, priority: (v.priority ?? 0) + 1000 })), ...getAllSuggestItems()]
      : VALUE_ITEMS;
    return rank(pool, ctx.wordPrefix);
  }

  if (ctx.receiver) {
    const vars = extractVars(code);
    const type = vars.get(ctx.receiver);
    if (!type) return [];
    const members = MEMBER_ITEMS.filter((it) => it.receiverTypes?.includes(type));
    return rank(members, ctx.wordPrefix);
  }

  if (ctx.afterSpace) {
    return rank(pickDecls(), ctx.wordPrefix);
  }

  const items = ctx.wordPrefix.length >= 2 ? getAllSuggestItems() : [...snippetItems, ...getAllSuggestItems().filter((it) => it.kind !== "api")];
  return rank(items.filter((it) => it.kind !== "pattern"), ctx.wordPrefix);
}

/** Wrapper tiện dụng cho UI: truyền code + text trước caret. */
export function suggest(ctx: SuggestContext, vars: Map<string, string>): SuggestItem[] {
  if (ctx.algo) {
    return rank(snippetItems.filter((it) => it.kind === "pattern"), ctx.wordPrefix);
  }
  if (ctx.afterEquals) {
    const pool = ctx.wordPrefix
      ? [...VALUE_ITEMS.map((v) => ({ ...v, priority: (v.priority ?? 0) + 1000 })), ...getAllSuggestItems()]
      : VALUE_ITEMS;
    return rank(pool, ctx.wordPrefix);
  }
  if (ctx.receiver) {
    const type = vars.get(ctx.receiver);
    if (!type) return [];
    const members = MEMBER_ITEMS.filter((it) => it.receiverTypes?.includes(type));
    return rank(members, ctx.wordPrefix);
  }
  if (ctx.afterSpace) {
    return rank(pickDecls(), ctx.wordPrefix);
  }
  const items = ctx.wordPrefix.length >= 2 ? getAllSuggestItems() : snippetItems;
  return rank(items.filter((it) => it.kind !== "pattern"), ctx.wordPrefix);
}
