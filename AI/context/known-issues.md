# Known Issues

## Current Issues

Chưa có issue đang mở.

---

## Resolved Issues

### 4. CORS chặn PUT /api/problems/:id — extension ghi đè thất bại

- **File**: `apps/server/src/plugins/cors.ts`, `apps/extension/content.js:851-864`
- **Mô tả**: Sau khi thêm tính năng ghi đè, extension POST `/api/problems/import` nhận 409 (đã tồn tại) → tự PUT `/api/problems/3298` để ghi đè. Browser chặn preflight vì `Access-Control-Allow-Methods: GET, POST, OPTIONS` không có PUT → `net::ERR_FAILED` (Failed to fetch).
- **Ảnh hưởng**: Tính năng ghi đè không hoạt động khi problem ID đã tồn tại; user phải xóa thủ công trong DB.
- **Nguyên nhân**: `registerCors` chỉ cho phép 3 method; CORS preflight browser kiểm tra `Access-Control-Allow-Methods` trước khi gửi PUT thực sự, không thấy PUT → block.
- **Cách fix**: Đổi `CORS_METHODS = "GET, POST, PUT, OPTIONS"` trong `cors.ts`, áp dụng cho cả `onSend` hook và `app.options("/*", ...)` handler. Cần restart server.
- **Ngày resolve**: 2026-08-31
- **History**: `AI/history/2026-08/widget-animated-images-and-overwrite.md`

### 3. Extension clip thiếu testCases cho bài chỉ có Example trong description (VD 1091)

- **File**: `apps/extension/src/clipper.ts:391` (`extractTestCases`, `findTestCasesInJson`, `extractTestCasesFromDescription`), `apps/extension/content.js`
- **Mô tả**: Clip `1091. Shortest Path in Binary Matrix` cho `testCases: undefined` dù description có 3 Example. Các bài khác có `hidden cm-content` (console) nhưng `1091` không có, `__NEXT_DATA__.testCases` là object rỗng, chỉ có `exampleTestcases` string và `<pre> Input/Output`.
- **Ảnh hưởng**: JSON clip thiếu `testCases`, web không có tab test, `engine.runTests` không chạy được.
- **Nguyên nhân**: `extractTestCases` chỉ xử lý `hidden cm-content (div.mt-0.h-0.overflow-hidden.opacity-0)` và `__NEXT_DATA__.testCases: [{input, expected}]`, bỏ qua `exampleTestcases: "[[0,1],[1,0]]\n..."` string và không có fallback từ `description <pre>`. Selector hidden quá hẹp (`div.opacity-0.h-0` không match `div[class*="opacity-0"][class*="h-0"]`).
- **Cách fix**: Mở rộng hidden selector (`div[class*="opacity-0"][class*="h-0"]` + fallback quét `.cm-content` có parent `opacity-0`/`h-0`), thêm parser `exampleTestcases`/`exampleTestcaseList`/`jsonExampleTestcases` string trong `findTestCasesInJson` + `parseExampleTestcasesString`, và thêm `extractTestCasesFromDescription` quét `description <pre>` regex `Input: grid = [[...]]` → `{grid: [...]}` + `Output: 2` → `expected`. Thứ tự mới: `hidden → console → __NEXT_DATA__ → description`. Nhánh `fix/extension-template-testcases`, 53 tests pass.
- **Ngày resolve**: 2026-08-31
- **History**: `AI/history/2026-08/extension-clip-template-testcases-fix.md`

### 2. Extension clip template nhiễm bài khác — `shipWithinDays` thay vì `shortestPathBinaryMatrix` (1091)

- **File**: `apps/extension/src/clipper.ts:216` (`extractTemplate`), `apps/extension/content.js`
- **Mô tả**: Clip `1091` cho `template: "var shipWithinDays = function(weights, days) {}"` (bài 1011) thay vì `shortestPathBinaryMatrix`.
- **Ảnh hưởng**: Template sai, `run` trong web báo lỗi hàm không tồn tại, lưu DB sai.
- **Nguyên nhân**: LeetCode SPA không reload, `window.monaco.editor.getModels()` giữ model cũ. `extractTemplate` ưu tiên `models[0]` (cũ nhất) trước `code_editor` DOM và `__NEXT_DATA__`, nên lấy nhầm model của bài trước đó. Không lọc theo ngôn ngữ hay nội dung code.
- **Cách fix**: Đổi thứ tự `extractTemplate` thành `code_editor DOM → __NEXT_DATA__ → view-lines → window.monaco (duyệt ngược + lọc javascript + regex /function|class|.../)`. `window.monaco` xuống cuối, duyệt `models.length-1 → 0`, ưu tiên `getLanguageId() === "javascript"`. Nhánh `fix/extension-template-testcases`, 53 tests pass.
- **Ngày resolve**: 2026-08-31
- **History**: `AI/history/2026-08/extension-clip-template-testcases-fix.md`

### 1. Lưu `created_at` sai giá trị — chuỗi `"(datetime('now'))"` thay vì ngày tháng thật

- **File**: `packages/database/src/schema.ts:14`
- **Mô tả**: Cột `created_at` trước đây lưu chuỗi literal `"(datetime('now'))"` thay vì giá trị datetime thực tế.
- **Ảnh hưởng**: Dữ liệu `created_at` trong DB không có thông tin thời gian thật, gây sai lệch khi truy vấn/sắp xếp theo thời gian tạo.
- **Nguyên nhân**: Trước đây dùng `default("(datetime('now'))")` — truyền string thay vì gọi hàm SQL `datetime('now')`. Drizzle cần dùng `sql` để tạo default expression.
- **Cách fix**: Đổi sang `default(sql\`(datetime('now'))\`)` tại `packages/database/src/schema.ts:14` (đã áp dụng trong commit `fa9c962`, đi kèm migration `0001`).
- **Ngày resolve**: 2026-08-30
- **Plan**: `AI/plans/completed/fix-created-at-default.md`
