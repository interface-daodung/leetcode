import type { SuggestItem } from "./types.js";

/**
 * Method/property theo type receiver — bảng nhỏ hand-written (docsIndex không có Map/Set).
 * ponytail: đủ cho LeetCode; mở rộng khi thiếu, không cần generator.
 */
export const MEMBER_ITEMS: SuggestItem[] = [
  // Array
  ...["push", "pop", "shift", "unshift", "slice", "splice", "sort", "reverse", "map", "filter", "reduce", "find", "findIndex", "includes", "indexOf", "join", "concat", "some", "every", "forEach", "flat"].map(
    (m): SuggestItem => ({
      id: `member.array.${m}`,
      label: m,
      kind: "api",
      insertText: `${m}()`,
      receiverTypes: ["Array"],
      priority: m === "push" || m === "pop" || m === "length" ? 100 : 50,
    }),
  ),
  { id: "member.array.length", label: "length", kind: "api", insertText: "length", receiverTypes: ["Array"], priority: 100 },
  // String
  ...["charAt", "charCodeAt", "split", "slice", "substring", "indexOf", "includes", "startsWith", "endsWith", "trim", "toLowerCase", "toUpperCase", "replace", "repeat", "padStart", "padEnd", "at"].map(
    (m): SuggestItem => ({
      id: `member.string.${m}`,
      label: m,
      kind: "api",
      insertText: `${m}()`,
      receiverTypes: ["String"],
      priority: 50,
    }),
  ),
  { id: "member.string.length", label: "length", kind: "api", insertText: "length", receiverTypes: ["String"], priority: 100 },
  // Map
  ...["get", "set", "has", "delete", "clear", "forEach", "keys", "values", "entries"].map(
    (m): SuggestItem => ({
      id: `member.map.${m}`,
      label: m,
      kind: "api",
      insertText: `${m}()`,
      receiverTypes: ["Map"],
      priority: m === "get" || m === "set" || m === "has" ? 100 : 50,
    }),
  ),
  { id: "member.map.size", label: "size", kind: "api", insertText: "size", receiverTypes: ["Map"], priority: 90 },
  // Set
  ...["add", "has", "delete", "clear", "forEach"].map(
    (m): SuggestItem => ({
      id: `member.set.${m}`,
      label: m,
      kind: "api",
      insertText: `${m}()`,
      receiverTypes: ["Set"],
      priority: m === "add" || m === "has" ? 100 : 50,
    }),
  ),
  { id: "member.set.size", label: "size", kind: "api", insertText: "size", receiverTypes: ["Set"], priority: 90 },
  // ListNode / TreeNode
  { id: "member.listnode.val", label: "val", kind: "api", insertText: "val", receiverTypes: ["ListNode"], priority: 100 },
  { id: "member.listnode.next", label: "next", kind: "api", insertText: "next", receiverTypes: ["ListNode"], priority: 100 },
  { id: "member.treenode.val", label: "val", kind: "api", insertText: "val", receiverTypes: ["TreeNode"], priority: 100 },
  { id: "member.treenode.left", label: "left", kind: "api", insertText: "left", receiverTypes: ["TreeNode"], priority: 100 },
  { id: "member.treenode.right", label: "right", kind: "api", insertText: "right", receiverTypes: ["TreeNode"], priority: 100 },
];
