# Shared icon assets (copy - không logic)

Ngày: 2026-08-31

## Bối cảnh

App cần một nơi lưu file ảnh icon dùng chung và bản copy ảnh cần thiết cho từng
app. Đã từng thử thêm helper/logic TS (`src/icons.ts`, `appIcon.ts`, alias
`@icons`, `sync-icons.mjs`...) nhưng bị **loại bỏ** theo yêu cầu để tránh rối
code — giữ thật đơn giản: chỉ đặt file ảnh, không code thêm.

## Thay đổi cuối

### `packages/shared/asset/icon/` (mới)

- Folder lưu ảnh icon gốc dùng chung: `leetcodeLab.ico`, `leetcodeLab.png`, `leetcodeLab.webp`.

### Copy ảnh vào asset riêng từng app

- `apps/web/public/assets/leetcodeLab.{ico,png,webp}` — bản copy cho web.
- `apps/extension/assets/leetcodeLab.{ico,png,webp}` — bản copy cho extension.
- Các app tự tham chiếu ảnh cục bộ của mình, không dùng chung trực tiếp từ shared.

### Đã loại bỏ (không giữ)

- `packages/shared/src/icons.ts` + export icon trong `src/index.ts`.
- `apps/web/src/appIcon.ts`, `src/vite-env.d.ts`, alias `@icons` (vite.config + tsconfig).
- Sửa `Header.tsx`/`Layout.tsx` (logo img + favicon).
- `apps/extension/scripts/sync-icons.mjs`, sửa `manifest.json`/`content.js`/`style.css`/`package.json`.
- Bổ sung `.gitignore`.

## Kết quả

- `pnpm -r build` pass.
- Trạng thái: chỉ có ảnh copy trong asset từng app; không còn logic/helper icon.
