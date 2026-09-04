# Plan: Nhắc code (autocomplete) cho CodeEditor

> Nguồn cảm hứng: `packages/javascript-docs/tmp_reference_vi/Clippings/Liệt kê cú pháp JavaScript.md`
> (thiết kế JSON schema + 3 tầng gợi ý: API exact → snippet → context completion, không cần AI)

## Mục tiêu

Gợi ý code khi giải LeetCode bằng JS trong `apps/web`: giảm lỗi chính tả + tăng tốc gõ.
Không AI, không LSP server — chỉ dữ liệu hữu hạn + regex context.

## Quyết định kiến trúc (đã chốt theo luật phân tầng)

| Thành phần | Đặt ở | Lý do |
| --- | --- | --- |
| Data + logic gợi ý (pure) | `packages/javascript-docs/src/suggest/` | Đã có API + docs + test; domain logic độc lập → package, không nhét vào web |
| UI dropdown + caret | `apps/web/src/components/CodeEditor.tsx` | Logic vẽ giao diện ở web components |
| Snippets/patterns LeetCode | JSON hand-written trong package | Phần "nguyên liệu" hữu hạn, kiểm soát tay |
| API JS chuẩn | **Tái sử dụng `docsIndex.entries`** đã có sẵn trong package | Không generator, không file mới — đúng tinh thần "không phát minh lại bánh xe" |

**Không dùng Monaco** (roadmap có nhắc nhưng chưa chốt): editor hiện tại là contentEditable +
Prism, giữ nguyên. Thêm Monaco = rewrite editor + bundle ~5MB, không cần cho phạm vi này.
Nâng cấp Monaco là upgrade path nếu về sau cần snippet tab-stop.

## Data model (rút gọn từ schema trong tài liệu tham khảo)

```ts
// packages/javascript-docs/src/suggest/types.ts
export interface SuggestItem {
  id: string;              // vd "array.push", "snippet.fori", "pattern.binary-search"
  label: string;           // text match theo prefix
  kind: "api" | "snippet" | "pattern" | "keyword";
  insertText: string;      // plain text (không tab-stop — ponytail: nâng cấp khi có Monaco)
  detail?: string;         // signature / mô tả ngắn 1 dòng
  docId?: string;          // link tới docsIndex entry → mở Knowledge Result panel
  receiverTypes?: string[]; // ["Array"] | ["String"] | ["Map"]... — chỉ dùng khi sau dấu "."
  priority?: number;       // ranking, mặc định 0
}
```

3 nguồn item:

1. **API** — build lúc load từ `docsIndex.entries` (lọc category `array|string|object|number|math|map|set`...
   theo keywords/syntax có sẵn). Không tạo file JSON mới.
2. **Keywords** — mảng hard-code ~25 từ (`const/let/function/if/else/for/while/return/...`) trong `keywords.ts`.
3. **Snippets + patterns** — `data/snippets.json` (~15): `fori`, `forof`, `mapnew`, `setnew`, `stack`,
   `queue`, `freq`, `sortnum`, `dfs`, `bfs`, `bs` (binary search), `tp` (two pointers), `sw` (sliding window),
   `ListNode`, `TreeNode`. Mỗi item: `label`, `insertText` (code JS thụt lề 4 space), `detail`, `priority`.

## Logic gợi ý (pure, testable)

```ts
// packages/javascript-docs/src/suggest/suggest.ts
export interface SuggestContext {
  linePrefix: string;   // text từ đầu dòng đến caret
  wordPrefix: string;   // identifier đang gõ ("pu" trong "arr.pu")
  receiver: string | null; // identifier trước dấu "." ("arr" trong "arr.pu")
}
export function detectContext(textBeforeCaret: string): SuggestContext;
export function suggest(ctx: SuggestContext, vars: Map<string, string>): SuggestItem[];
```

- `detectContext`: regex trên `linePrefix` — `/([A-Za-z_$][\w$]*)$/` lấy word, `/([A-Za-z_$][\w$]*)\.$/` lấy receiver.
- `vars`: Map tên biến → type, quét bằng regex trên toàn code (không parser/AST — đủ cho LeetCode scale):
  - `= [` → `Array`, `new Map(` → `Map`, `new Set(` → `Set`, `= ""` / `.split(` → `String`,
    `= \d` → `Number`, `new ListNode(` → `ListNode`, `new TreeNode(` → `TreeNode`.
- Ranking: `receiver` khớp `receiverTypes` → chỉ hiện method/property của type đó (tầng 3 trong tài liệu);
  không có receiver → keyword + snippet + API toàn cục, sort theo `priority` desc rồi `label` asc, cắt top 10.
- `insertText` snippet chèn nguyên khối nhiều dòng.

## UI (apps/web)

Trong `CodeEditor.tsx`:

- State `suggestions: SuggestItem[]` + `activeIndex`.
- `handleInput` hiện có → sau `onChange`, tính `getCaretOffset` + `textBeforeCaret` → gọi `detectContext` +
  `extractVars(value)` + `suggest(...)`. Rỗng → ẩn dropdown.
- Dropdown absolute-positioned trong wrapper `relative` hiện có, render dưới caret (đo vị trí bằng
  Range.getBoundingClientRect của caret — caret helpers đã có sẵn trong file).
- Phím: `Ctrl+Space` mở/ép hiện; `↑/↓` chọn; `Tab`/`Enter` chèn; `Esc` đóng.
  **Chỉ bắt phím khi dropdown đang mở** — Enter/Tab bình thường vẫn hoạt động bình thường.
- Chèn text: sửa `value` quanh caret offset → `onChange(newText)` → set `caretRef` sau khối chèn.
- Gợi ý API có `docId` → click vào item mở panel `knowledge-result` (dùng `focusPanelTab` đã có ở feature
  knowledge-split — xem `WorkspaceContext`).

## Test

`packages/javascript-docs/src/suggest/suggest.test.ts` (Vitest, cạnh file logic — theo skill vitest-logic-testing):

- `detectContext`: `"arr.pu"` → receiver `arr`, word `pu`; `"cons"` → word `cons`; `"  "` → rỗng.
- `extractVars`: `const nums = []` → Array; `const m = new Map()` → Map; `const s = "abc"` → String.
- `suggest`: receiver Array + word `pu` → `push` đầu danh sách; word `for` → snippet `fori`; top 10 cap;
  Map receiver không lẫn Array method.

## Bước thực hiện

1. `packages/javascript-docs/src/suggest/`: `types.ts`, `data/snippets.json`, `keywords.ts`,
   `api.ts` (build từ docsIndex), `vars.ts`, `suggest.ts` + `suggest.test.ts`. Export qua `src/index.ts`.
2. `pnpm --filter=@leetcode/javascript-docs test | build`.
3. `apps/web/src/components/CodeEditor.tsx`: dropdown + key handling + chèn text.
4. `pnpm --filter=@leetcode/web build` + smoke test thủ công (`pnpm dev` + server): gõ `arr.` sau
   `const arr = []`, `fori`, `Ctrl+Space`.
5. Docs: cập nhật `AI/STATUS.md`, `AI/history/2026-09/code-suggest.md`, decision (`AI/context/decisions.md`)
   về "autocomplete data-driven, không Monaco".
6. Commit từng bước (`feat(code-suggest): ...`).

## Ngoài phạm vi (deferred)

- Tab-stop `${1:...}` placeholder — chỉ khi có Monaco.
- Type inference qua assignment chain (`const x = arr.map(...)`), scope analysis — regex đủ dùng trước.
- Tự sinh API data từ MDN — `docsIndex` đã phủ nhu cầu.
- Ranking học theo usageWeight (lịch sử dùng) — cần DB, chưa đáng.
