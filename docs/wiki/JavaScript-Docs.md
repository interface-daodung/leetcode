# JavaScript Docs {#javascript-docs}

## Tổng quan

`packages/javascript-docs` — Static JS/TS reference documentation + **autocomplete/nhắc code** cho LeetCode JavaScript.

- Dùng bởi `apps/web` (CodeEditor autocomplete)
- Export qua `src/index.ts`

## Thành phần

### 1. Static Docs (`src/docs/`)

- `docsIndex` — Index các entry: `Array`, `String`, `Map`, `Set`, `ListNode`, `TreeNode`, ...
- Mỗi entry: `name`, `description`, `methods[]`, `staticMethods[]`, `constructor`, `examples[]`
- Placeholder content, chưa đầy đủ

### 2. Autocomplete/Suggest (`src/suggest/`)

Logic nhắc code **data-driven + regex**, không AI, không Monaco, không LSP.

| File | Chức năng |
|------|-----------|
| `data/snippets.json` | 18 snippet/pattern LeetCode hand-written (`fori`, `bs`, `tp`, `sw`, `dfs`, `bfs`, `ListNode`, ...) |
| `members.ts` | Methods theo type: `Array`, `String`, `Map`, `Set`, `ListNode`, `TreeNode` |
| `keywords.ts` | JS keywords (`const`, `let`, `function`, `return`, `if`, `for`, ...) |
| `api.ts` | Build từ `docsIndex.entries` có sẵn |
| `vars.ts` | Type inference regex (nhận khai báo trực tiếp: `= []`, `new Map()`, chuỗi literal, `ListNode`/`TreeNode`) |
| `suggest.ts` | `detectContext` + `extractVars` + `suggestForCode` (ranking cap 10) |

### 3. SuggestItem

```typescript
interface SuggestItem {
  label: string;           // Hiển thị
  insertText: string;      // Text chèn
  kind: "snippet" | "method" | "keyword" | "variable" | "type";
  detail?: string;         // Mô tả ngắn
  docId?: string;          // Link tới docsIndex entry (cho Knowledge panel sau này)
}
```

## UI Integration

- `apps/web/src/components/CodeEditor.tsx`
- Ctrl+Space mở/đóng dropdown ép buộc
- ↑/↓ chọn, Tab/Enter chèn, Esc đóng
- Vị trí theo caret rect (getBoundingClientRect)
- Chỉ bật cho JavaScript (`language === "javascript"`)

## Type Inference (Heuristic)

Chỉ nhận khai báo trực tiếp:

```javascript
const arr = [];           // → Array
const map = new Map();    // → Map
const str = "hello";      // → String
const node = new ListNode(); // → ListNode
```

- Không AST, không chain inference (`arr.map(x => x).filter(...)` không infer)
- Regex đủ đúng ở scale bài LeetCode

## Snippets (18 patterns)

| Trigger | Mô tả |
|---------|-------|
| `fori` | `for (let i = 0; i < n; i++)` |
| `forof` | `for (const x of arr)` |
| `fore` | `arr.forEach(x => )` |
| `map` | `arr.map(x => )` |
| `filter` | `arr.filter(x => )` |
| `reduce` | `arr.reduce((a, b) => , init)` |
| `bs` | Binary search template |
| `tp` | Two pointers template |
| `sw` | Sliding window template |
| `dfs` | DFS recursion template |
| `bfs` | BFS queue template |
| `rec` | Recursion template |
| `listnode` | ListNode class + helper |
| `treenode` | TreeNode class + helper |
| `heap` | MinHeap/MaxHeap class |
| `trie` | Trie class |
| `unionfind` | UnionFind class |
| `seg` | SegmentTree class |

## Dependency

```
@leetcode/javascript-docs ──▶ @leetcode/shared
```

## Build & Test

```bash
pnpm --filter=@leetcode/javascript-docs build   # tsc --noEmit
pnpm --filter=@leetcode/javascript-docs test    # Vitest (38 tests: docs + suggest)
pnpm --filter=@leetcode/javascript-docs lint    # ESLint
```

## Ghi chú

- Không Monaco Editor — editor contentEditable + Prism giữ nguyên
- Monaco = rewrite editor + bundle ~5MB, chỉ cần khi muốn tab-stop placeholder (upgrade path rõ ràng)
- Regex đủ đúng ở scale bài LeetCode; AST chỉ đáng khi cần chain inference
- Snippet chèn plain text (không con trỏ giữa ngoặc); chấp nhận đổi bằng tốc độ triển khai
- `docId` trên API item sẵn cho việc nối Knowledge panel sau này