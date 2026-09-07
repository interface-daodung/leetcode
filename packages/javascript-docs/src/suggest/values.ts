import type { SuggestItem } from "./types.js";

/**
 * Gợi ý giá trị sau dấu "=" — new Map/Set/Array, kiểu dữ liệu, parse number...
 * ponytail: tập hữu hạn đủ LeetCode; thêm khi thiếu.
 */
export const VALUE_ITEMS: SuggestItem[] = [
  { id: "value.map", label: "Map", kind: "value", insertText: "new Map()", detail: "Hash map", priority: 100 },
  { id: "value.set", label: "Set", kind: "value", insertText: "new Set()", detail: "Hash set", priority: 95 },
  { id: "value.array", label: "[]", kind: "value", insertText: "[]", detail: "Mảng rỗng", priority: 100 },
  { id: "value.listnode", label: "ListNode", kind: "value", insertText: "new ListNode()", detail: "Node linked list", priority: 60 },
  { id: "value.treenode", label: "TreeNode", kind: "value", insertText: "new TreeNode()", detail: "Node cây nhị phân", priority: 60 },
  { id: "value.true", label: "true", kind: "value", insertText: "true", priority: 40 },
  { id: "value.false", label: "false", kind: "value", insertText: "false", priority: 40 },
  { id: "value.parseint", label: "parseInt", kind: "value", insertText: "parseInt()", detail: "Chuỗi → số nguyên", priority: 1000 },
  { id: "value.parsefloat", label: "parseFloat", kind: "value", insertText: "parseFloat()", detail: "Chuỗi → số thực", priority: 995 },
  { id: "value.number", label: "Number", kind: "value", insertText: "Number()", detail: "Ép kiểu số", priority: 990 },
  { id: "value.string", label: "String", kind: "value", insertText: "String()", detail: "Ép kiểu chuỗi", priority: 985 },
  { id: "value.boolean", label: "Boolean", kind: "value", insertText: "Boolean()", detail: "Ép kiểu boolean", priority: 980 },
];
