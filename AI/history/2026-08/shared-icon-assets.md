# Shared icon assets

Ngày: 2026-08-31

## Bối cảnh

App cần một nơi trung tâm lưu file ảnh icon (nhiều định dạng) và helper để các
app (web, extension, winget...) link ảnh làm icon/logp mà không phải copy ảnh
rời rạc ở từng app.

## Thay đổi

### `packages/shared/asset/icon/` (mới)

- Folder lưu file ảnh icon. Người dùng tự thêm file; `.gitkeep` giữ folder trong git.
- Logo chính đặt tên `leetcodeLab` gồm các định dạng: `leetcodeLab.icon`, `leetcodeLab.png`, `leetcodeLab.webp`.

### `packages/shared/src/icons.ts` (mới)

- `ICON_FORMATS` — `["icon", "png", "webp"]` (thứ tự ưu tiên).
- `ICON_FILES` — map tên icon → tên file từng định dạng.
- `APP_ICON_NAME` — `"leetcodeLab"`.
- `getIconPath(name, format)` — path tương đối từ root package (`asset/icon/...`).
- `getIconFileName(name, format)` — tên file ảnh.
- `getAppIconUrl(baseUrl, name, format)` — URL hoàn chỉnh.

### `packages/shared/src/index.ts`

- Export thêm `ICON_FORMATS`, `ICON_FILES`, `APP_ICON_NAME`, `getIconPath`, `getIconFileName`, `getAppIconUrl`, type `IconFormat`.

## Kết quả

- `pnpm --filter=@leetcode/shared build` (tsc --noEmit) pass.
- Cập nhật README + `AI/STATUS.md`, `AI/index/PACKAGE_STRUCTURE.md`, `AI/index/APP_STRUCTURE.md`.
