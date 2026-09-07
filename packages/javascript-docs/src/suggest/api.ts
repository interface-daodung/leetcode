import { getIndex } from "../search.js";
import type { IndexEntry } from "../types.js";
import type { SuggestItem } from "./types.js";

/**
 * Build gợi ý API JS từ docsIndex có sẵn (không tạo data mới).
 * - Method: title là identifier đơn (vd "push", "charAt") → chèn `push(...)`.
 * - Static/global: title chứa dấu chấm (vd "Object.keys", "Math.max") → chèn nguyên title.
 * - Bỏ các section tổng hợp ("All methods", "Common methods"...) — không phải API đơn lẻ.
 */

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const DOTTED_RE = /^[A-Za-z_$][A-Za-z0-9_$]*\.[A-Za-z_$][A-Za-z0-9_$]*$/;

/** category docs → kiểu receiver mà method áp dụng được */
const CATEGORY_RECEIVER: Record<string, string[]> = {
  array: ["Array"],
  string: ["String"],
  object: ["Object"],
  "number-date": ["Number"],
};

function methodInsert(title: string): string {
  // map/filter/forEach/sort... thường cần callback
  if (["map", "filter", "forEach", "sort", "some", "every", "find", "findIndex"].includes(title)) {
    return `${title}((x) => x)`;
  }
  if (["push", "pop", "shift", "unshift", "reverse", "join", "split", "includes", "indexOf", "at"].includes(title)) {
    return `${title}()`;
  }
  return `${title}()`;
}

function toApiItem(e: IndexEntry): SuggestItem | null {
  const title = e.title.trim();
  const receiverTypes = CATEGORY_RECEIVER[e.category];
  if (IDENT_RE.test(title)) {
    return {
      id: `api.${e.id}`,
      label: title,
      kind: "api",
      insertText: methodInsert(title),
      detail: e.summary || e.syntax || undefined,
      docId: e.id,
      receiverTypes,
      priority: 50,
    };
  }
  if (DOTTED_RE.test(title)) {
    return {
      id: `api.${e.id}`,
      label: title,
      kind: "api",
      insertText: `${title}()`,
      detail: e.summary || undefined,
      docId: e.id,
      priority: 50,
    };
  }
  return null;
}

let cache: SuggestItem[] | null = null;

/** Toàn bộ API item build một lần từ docsIndex. */
export function getApiItems(): SuggestItem[] {
  if (cache) return cache;
  const items: SuggestItem[] = [];
  for (const e of getIndex().entries) {
    const item = toApiItem(e);
    if (item) items.push(item);
  }
  cache = items;
  return items;
}
