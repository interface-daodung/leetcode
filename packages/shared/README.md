# @leetcode/shared

Types, utilities, constants dùng chung cho toàn bộ monorepo.

## Nội dung

- `Difficulty` — `"easy" | "medium" | "hard"`
- `ProblemMeta` — metadata problem (id, title, difficulty, tags, ...)
- `TestCase` — `{ input: unknown; expected: unknown }`
- `AIHint` — `{ type: "approach" | "optimization" | "edge-case"; message: string }`
- `AIResponse` — `{ hints: AIHint[]; explanation: string; complexity: { time: string; space: string } }`
- `EditorState` — `{ code: string; language: string; problemId?: number }`
- `formatProblemId` — format id dạng `LC0001`
- `ICON_FORMATS` / `ICON_FILES` / `APP_ICON_NAME` / `getIconPath` / `getIconFileName` / `getAppIconUrl` — quản lý icon app

## Icon (asset/icon)

- Folder `asset/icon/` lưu file ảnh icon (người dùng tự thêm). Mỗi icon có thể có
  nhiều định dạng (`.icon`, `.png`, `.webp`, ...).
- Logo chính đặt tên `leetcodeLab` (`leetcodeLab.icon`, `leetcodeLab.png`, `leetcodeLab.webp`).
- Dùng helper để lấy path/URL:
  - `getIconPath()` → `asset/icon/leetcodeLab.png` (path tương đối từ root package)
  - `getIconFileName(name, format)` → tên file ảnh
  - `getAppIconUrl(baseUrl, name, format)` → URL hoàn chỉnh cho web/extension

## Dependency

Không phụ thuộc package nội bộ nào. Được dùng bởi tất cả apps và packages.