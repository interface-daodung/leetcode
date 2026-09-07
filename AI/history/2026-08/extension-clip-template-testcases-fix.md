# Extension — Fix template nhiễm và thiếu testCases (2026-08-31)

## Vấn đề

Clip bài `1091. Shortest Path in Binary Matrix` bằng widget LC cho JSON sai:

```json
{
  "id": 1091,
  "slug": "shortest-path-in-binary-matrix",
  "template": "var shipWithinDays = function(weights, days) {}",
  "testCases": undefined
}
```

- **Template nhiễm**: `shipWithinDays` là template của bài khác (1011), không phải `shortestPathBinaryMatrix`. Người dùng duyệt nhiều bài trên cùng tab, LeetCode SPA không reload, `window.monaco.editor.getModels()` giữ lại model cũ.
- **Thiếu testCases**: `testCases` không được trích xuất, JSON `testCases` rỗng dù description có 3 Example.

Nhánh fix: `fix/extension-template-testcases` — 53 tests pass (thêm 4 regression).

## Nguyên nhân

### 1. Template — thứ tự ưu tiên sai `src/clipper.ts:216`

```
Trước: window.monaco (models[0]) → __NEXT_DATA__ → [data-track-load="code_editor"] → monaco view-lines
```

- `models[0]` luôn lấy model đầu tiên (cũ nhất). Khi user mở `shipWithinDays` trước, model đó ở index 0, bài mới tạo model ở cuối (`models[1]`). Clip `1091` lấy nhầm `models[0]`.
- Không kiểm tra ngôn ngữ/lang, không kiểm tra nội dung có giống code thật không.
- `code_editor` DOM (chính xác nhất) lại đứng sau global, nên không có cơ hội chạy.

### 2. TestCases — thiếu nguồn fallback `src/clipper.ts:391`

```
Trước: hidden cm-content (opacity-0) → visible console (flex-1 overflow-y-auto) → __NEXT_DATA__.testCases
```

- Hidden `div.mt-0.h-0.overflow-hidden.opacity-0` không tồn tại trên `1091` (LeetCode đổi class), selector `div.opacity-0.h-0` quá hẹp, không match `div[class*="opacity-0"][class*="h-0"]`.
- `findTestCasesInJson` chỉ xử lý `testCases: [{input, expected}]`, bỏ qua `exampleTestcases: string` dạng `"[[0,1],[1,0]]\n[[0,0,0],...]"` mà LeetCode embed trong `__NEXT_DATA__`.
- Không có fallback từ `description <pre>` (Example Input/Output) — nơi duy nhất luôn có dữ liệu cho mọi bài.

## Giải pháp

### Template — đổi thứ tự và lọc `window.monaco`

```
Sau: [data-track-load="code_editor"] → __NEXT_DATA__ → monaco view-lines → window.monaco (duyệt ngược + lọc)
```

- `code_editor` DOM lên đầu: lấy thẳng editor của bài hiện tại, tránh nhiễm cross-problem.
- `__NEXT_DATA__` lên trước `window.monaco`: JSON đáng tin cậy hơn global memory.
- `window.monaco` xuống cuối, duyệt ngược (`models.length-1 → 0`), ưu tiên `getLanguageId() === "javascript"`, kiểm regex `/function|class|var|let|const|return|=>/` trước khi trả về. Tránh lấy model rỗng/cũ.

Code: `extractTemplate()` + `findCodeSnippetInJson()` giữ nguyên, chỉ đổi nhánh ưu tiên.

### TestCases — thêm 2 nguồn mới

1. **Hidden selector mở rộng**: `div[class*="opacity-0"][class*="h-0"]`, `div.overflow-hidden.opacity-0`, fallback quét mọi `.cm-content` có parent `opacity-0`/`h-0`.

2. **`__NEXT_DATA__` parser mở rộng**: `findTestCasesInJson()` giờ đọc `exampleTestcases` / `exampleTestcaseList` / `jsonExampleTestcases` là string, gọi `parseExampleTestcasesString()` tách `\n`, `JSON.parse` từng dòng, trả `[{input, expected: null}]` nếu không tìm thấy object `testCases`. Xử lý cả `Input: grid = [[...]]` dạng text.

3. **Description fallback** (mới): `extractTestCasesFromDescription()` quét `findDescriptionContainer() → pre`, regex `/Input:\s*([\s\S]*?)\s*Output:/` và `/Output:\s*([\s\S]*)/`, parse `grid = [[0,1],[1,0]]` → `{grid: [[0,1],[1,0]]}`, `Output: 2` → `2`. Dùng cho `1091` cho 3 cases:
   - `{grid: [[0,1],[1,0]]} → 2`
   - `{grid: [[0,0,0],[1,1,0],[1,1,0]]} → 4`
   - `{grid: [[1,0,0],[1,1,0],[1,1,0]]} → -1`

Thứ tự mới: `hidden → visible console → __NEXT_DATA__ (cả exampleTestcases string) → description <pre>`.

## Đồng bộ

- `apps/extension/src/clipper.ts` là source of truth, `apps/extension/content.js` đồng bộ thủ công (4 hàm: `parseExampleTestcasesString`, `extractTestCasesFromDescription`, `findTestCasesInJson`, `extractTemplate`, `extractTestCases`).
- Thêm 4 test regression trong `clipper.test.ts`: ưu tiên `code_editor` trước `window.monaco`, fallback `__NEXT_DATA__`, `extractTestCasesFromDescription` cho `1091`, `buildProblemClip` đầy đủ 3 cases.

## Kiểm thử

- `pnpm --filter=@leetcode/extension test` → 53 pass (49 cũ + 4 mới).
- Clip thủ công `1091` sau fix: `template` chứa `shortestPathBinaryMatrix`, `testCases.length === 3`, đúng `grid`/`expected`.

## Tài liệu cập nhật

- `AI/ARCHITECTURE.md`: Data Flow + extension template/testCases 4 nguồn.
- `AI/STATUS.md`: mục mới 2026-08-31 extension fix.
- `AI/context/decisions.md`: decision mới.
- `AI/context/known-issues.md`: resolved issue #2 + #3.
- `AI/walkthrough/extension.md`: mẹo khi template sai.
