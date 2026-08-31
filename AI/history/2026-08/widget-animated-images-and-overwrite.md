# Extension Widget — Animated Images + Toast SVG + Backend Overwrite (2026-08-31)

Nhánh: `feat/widget-animated-images`

## Mục tiêu

Thay icon chữ "LC" bằng ảnh động cho 4 trạng thái (idle/loading/success/error), thêm hiệu ứng Squash & Stretch khi click, dùng khung thoại SVG có text động cho toast (auto-wrap + auto font-size), và sửa backend để ghi đè problem khi ID đã tồn tại (thay vì trả 409 chặn).

## Thay đổi

### 1. Extension — widget ảnh động + Squash & Stretch

`apps/extension/content.js` + `apps/extension/style.css`:

- 4 asset ảnh PNG (`Idle.png`, `Loading.png`, `Success.png`, `Error.png`) thay cho text "LC". Truy cập qua `chrome.runtime.getURL("assets/<file>.png")` với fallback nếu không có `chrome.runtime`.
- `manifest.json` thêm `web_accessible_resources` cho 5 file asset.
- Hàm `setWidgetState(widget, state)` chuyển `img.src` giữa 4 trạng thái + class tương ứng.
- Hàm `playSquashStretch(widget)` thêm class `.squash-stretch` 1.2s rồi gỡ.
- CSS `@keyframes squashStretch` theo spec: `0% scale(1,1) → 20% scale(0.75,1.25) → 40% scale(1.25,0.75) → 55% scale(0.9,1.1) → 70% scale(1.05,0.95) → 85% scale(0.98,1.02) → 100% scale(1,1)`.

### 2. Toast — SVG với text động

`generateToastSvg(text)` port logic từ `sua_svg.js` sang JS browser:

- Fetch `assets/toast-text.svg`, parse `transform="matrix(...)"` để lấy group translate `(tx, ty)`.
- Tìm `<path d="...">` đầu tiên làm khung, parse tất cả số, robust extreme bỏ qua mỏ neo (cạnh xuất hiện 1 lần), ưu tiên cạnh lặp ≥ 2 lần → bbox khung thoại.
- Tính vùng chứa text `(safeX0..safeX1, safeY0..safeY1)` với padding 24px.
- Bắt đầu từ `maxFont = 72px`, giảm dần đến `minFont = 24px` nếu text vượt `maxWidth`. Nếu vẫn không vừa → `wrapText()` xuống dòng theo từ, rồi giảm tiếp font nếu `lines * lineHeight > maxHeight`.
- Tạo `<tspan>` cho từng dòng, escape XML, thay thế `<text>` cũ trong SVG.
- `xCenter = (safeX0 + safeX1) / 2 - tx - fontSize * 0.15` (lệch trái).
- `yStart = centerY - totalH/2 + fontSize * 0.25` (lệch lên).

`showToast(message, variant)`:

- Gọi `generateToastSvg` async → set `innerHTML` SVG, ép `max-width: 500px`, `padding: 0`.
- Position toast tại góc trên-phải của widget: `bottom = window.innerHeight - widgetRect.top + 8`, `right = window.innerWidth - widgetRect.right`. Nếu widget không tồn tại → fallback `bottom: 110px, right: 20px`.
- CSS toast: `border-radius: 20px`, bỏ `box-shadow` hoàn toàn (cả widget lẫn toast) theo yêu cầu.

### 3. Backend — PUT /api/problems/:id để ghi đè

`apps/server/src/services/problem.service.ts` — thêm `updateClip(parsed, apiBase)`:

- Tương tự `importClip()` nhưng dùng `this.db.update(id, { description, template, url, slug })` thay `add()`. `engine.register()` vẫn gọi được vì nó overwrite trong registry.
- Xử lý ảnh + hints giống `importClip`.

`apps/server/src/controllers/problems.controller.ts` — thêm handler `updateClip`:

- Validate `idParams` (URL) + `importSchema` (body, dùng chung schema).
- Trả 400 nếu `body.id !== url.id`.

`apps/server/src/routes/problems.routes.ts` — đăng ký `app.put("/problems/:id", ctrl.updateClip)`.

### 4. Extension — tự retry PUT khi 409

`postToServer(clip)` trong `content.js`:

- POST `/api/problems/import` trước.
- Nếu 201/200 → return `{ ok: true, data }`.
- Nếu 409 → tự động PUT `/api/problems/:id`, return `{ ok: true, data, overwritten: true }` nếu 200.
- Nếu 4xx khác → return `{ ok: false, error }`.

`handleClip()`:

- Bỏ branch `result.dup` (error), chỉ phân nhánh `result.ok` (thành công/ghi đè) hoặc error.
- Toast: `Đã lưu: ...` (mới) hoặc `Đã ghi đè: ...` (overwrite) — `result.overwritten` quyết định message.

### 5. CORS — thêm PUT

`apps/server/src/plugins/cors.ts`:

- `CORS_METHODS = "GET, POST, PUT, OPTIONS"` (cũ chỉ có `GET, POST, OPTIONS` → extension bị block khi gọi PUT).
- Cập nhật cả `onSend` hook và `app.options("/*", ...)` handler.

## Kết quả

- `pnpm -r build` pass (9 projects).
- `pnpm --filter=@leetcode/extension test` 53 pass.
- `pnpm --filter=@leetcode/server test` 36 pass.
- CORS preflight response giờ cho phép PUT → extension có thể retry overwrite.

## Lệnh tham khảo

```bash
pnpm --filter=@leetcode/server dev   # cần restart để áp CORS mới
pnpm --filter=@leetcode/extension sync:config
# chrome://extensions → Reload LeetCode Widget → F5 leetcode.com
```

## Ghi chú

- `content.js` chạy trực tiếp (không qua build), nên phải reload extension mỗi lần sửa.
- `assets/toast-text.svg` viewBox `512x512`; chữ mặc định `Hello, World!` 60.5px — `generateToastSvg` tự thay.
- `id` trong body PHẢI khớp với URL `PUT /:id`, nếu không 400.
- Nếu server chưa restart, CORS preflight vẫn fail PUT.
