/**
 * Type inference cực đơn giản bằng regex — không parser/AST.
 * Đủ cho code LeetCode: khai báo biến trực tiếp với literal/constructor.
 * Quy tắc sau (xuất hiện muộn hơn trong code) ghi đè quy tắc trước.
 * ponytail: nâng cấp khi cần chain inference (`const x = arr.map(...)`) → lúc đó mới đáng viết AST walk.
 */

const DECL_PATTERNS: { re: RegExp; type: string }[] = [
  { re: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\[/, type: "Array" },
  { re: /(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*new Map\b/, type: "Map" },
  { re: /(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*new Set\b/, type: "Set" },
  { re: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:["'`]|.*\.split\s*\()/, type: "String" },
  { re: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*-?\d/, type: "Number" },
  { re: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*new ListNode\b/, type: "ListNode" },
  { re: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*new TreeNode\b/, type: "TreeNode" },
  { re: /function\s+dfs\s*\(\s*([A-Za-z_$][\w$]*)/, type: "TreeNode" },
];

/** Quét toàn bộ code → Map tên biến → type suy được. Khai báo sau ghi đè khai báo trước. */
export function extractVars(code: string): Map<string, string> {
  const vars = new Map<string, string>();
  const hits: { name: string; type: string; pos: number }[] = [];
  for (const { re, type } of DECL_PATTERNS) {
    for (const m of code.matchAll(new RegExp(re.source, "g"))) {
      hits.push({ name: m[1], type, pos: m.index });
    }
  }
  hits.sort((a, b) => a.pos - b.pos);
  for (const h of hits) vars.set(h.name, h.type);
  return vars;
}
