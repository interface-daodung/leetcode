# 2026-09-04 — Nhắc code (autocomplete) trong CodeEditor

Nhánh: `feat/code-suggest`
Plan: `AI/plans/completed/code-suggest.md`
Nguồn cảm hứng: `packages/javascript-docs/tmp_reference_vi/Clippings/Liệt kê cú pháp JavaScript.md`

## Mục tiêu

Gợi ý code khi giải LeetCode bằng JS: giảm lỗi chính tả + tăng tốc gõ. Không AI, không Monaco, không LSP —
dữ liệu hữu hạn + regex context (theo hướng dẫn trong clipping).

## Thay đổi

### `packages/javascript-docs/src/suggest/` (mới, pure + testable)

- `types.ts` — `SuggestItem` (id/label/kind api|snippet|pattern|keyword/insertText/detail/priority/receiverTypes).
- `data/snippets.json` — 18 snippet + pattern LeetCode hand-written: `fori/forof/forj`, `stack`, `queue`,
  `mapnew`, `setnew`, `freq`, `bs` (binary search), `tp` (two pointers), `sw` (sliding window),
  `dfs`, `bfs`, `ListNode`, `TreeNode`...
- `keywords.ts` — ~30 keyword JS (`const`, `return`, `for`, ...).
- `members.ts` — method/property theo receiver type hand-written: Array (22), String (18), Map (10),
  Set (7), ListNode/TreeNode (val/next/left/right). `docsIndex` không có data Map/Set nên viết tay;
  phần API Array/String build từ docsIndex vẫn giữ qua `api.ts` cho gợi ý toàn cục.
- `api.ts` — build API item từ `docsIndex.entries` có sẵn (title là identifier đơn hoặc `Object.keys`,
  `Math.max`...), không tạo data mới.
- `vars.ts` — type inference bằng regex (`= []` → Array, `new Map` → Map, `= "..."` → String,
  ListNode/TreeNode...). Khai báo sau (theo vị trí trong code) ghi đè trước.
- `suggest.ts` — `detectContext` (wordPrefix + receiver sau dấu chấm, regex), `suggestForCode(code, beforeCaret)`,
  `suggest(ctx, vars)`. Ranking: priority desc → label ngắn → alphabet; cap 10.
  Không receiver: 1 ký tự chỉ hiện keyword+snippet (không nhiễu API), 2+ ký tự hiện cả API.
- `suggest.test.ts` — 16 tests (detectContext, extractVars, suggest theo receiver/type/ranking).

### `apps/web/src/components/CodeEditor.tsx`

- Thêm dropdown gợi ý absolute trong wrapper `relative`, vị trí theo `Range.getBoundingClientRect` của caret.
- `handleInput` → tính `textBeforeCaret` → `suggestForCode` → hiện/ẩn dropdown.
- Phím (chỉ khi dropdown mở, trừ Ctrl+Space): `↑/↓` chọn, `Tab/Enter` chèn, `Esc` đóng; `Ctrl+Space` mở/đóng ép.
- Chèn: thay identifier đang gõ bằng `insertText`, giữ caret sau khối chèn qua `caretRef` sẵn có.
- Chỉ bật cho `javascript` (jsOnly); onBlur đóng dropdown; `onMouseDown` preventDefault để không mất focus.
- Gợi ý 2 tầng trong clipping: member access theo type biến (tầng 3) + snippet/pattern (tầng 2).

## Kiến trúc & lý do

- Data + logic pure đặt trong `packages/javascript-docs` (domain logic độc lập — luật phân tầng 3);
  UI dropdown đặt trong `apps/web/src/components/` (luật 4).
- Không Monaco: editor contentEditable + Prism giữ nguyên; Monaco = rewrite + ~5MB bundle.
  Upgrade path: Monaco khi cần tab-stop placeholder trong snippet.
- Không AI/parser: regex context + type inference regex đủ cho scale LeetCode.
- item có `docId` (API build từ docsIndex) — sẵn sàng nối Knowledge panel sau (chưa nối trong PR này).

## Verify

- `pnpm --filter=@leetcode/javascript-docs test` — 38 tests pass (22 cũ + 16 mới).
- `pnpm --filter=@leetcode/javascript-docs build` — tsc pass.
- `pnpm --filter=@leetcode/web build` — tsc + vite pass.
- `pnpm --filter=@leetcode/web test` — 14 tests pass.
- Lint fail sẵn từ trước (thiếu `eslint.config.*` ở shared/extension — known issue, không liên quan).

## Hạn chế / deferred

- Không tab-stop `${1:...}` — chèn plain text.
- Type inference không qua assignment chain (`const x = arr.map(...)`).
- `usageWeight` học theo lịch sử gõ — cần DB, chưa đáng.
