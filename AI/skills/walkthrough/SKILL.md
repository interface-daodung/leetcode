---
name: walkthrough
description: Hướng dẫn viết lại AI/walkthrough thành hướng dẫn sử dụng hoàn thiện, không quá kỹ thuật. Use when cập nhật walkthrough, đồng bộ history/index vào hướng dẫn người dùng.
---

# Walkthrough

## Trigger

Sử dụng khi cần viết lại hoặc cập nhật `AI/walkthrough/*.md` để hướng dẫn sử dụng hoàn thiện hơn — đặc biệt sau khi có feature mới, history/index thay đổi, hoặc walkthrough hiện tại còn sơ sài/quá kỹ thuật.

## Mục tiêu

Biến `AI/walkthrough/` từ tài liệu kỹ thuật rời rạc thành **hướng dẫn sử dụng** (user guide) rõ ràng, dễ làm theo cho người mới — tập trung vào **“làm thế nào để dùng”**, không phải **“code hoạt động thế nào”**.

## Nguồn dữ liệu (theo thứ tự)

### Bắt buộc — đọc từ `AI/`

1. `AI/INDEX.md` → xác định cấu trúc
2. `AI/PROJECT.md` — mục tiêu, phạm vi project
3. `AI/ARCHITECTURE.md` — tổng quan thành phần (chỉ lấy ý chính, không chép chi tiết kỹ thuật)
4. `AI/STATUS.md` — phase hiện tại, đã làm gì, tiếp theo là gì
5. `AI/CONVENTIONS.md` — quy ước cần nhắc cho người dùng (nếu liên quan)
6. `AI/index/PROJECT_STRUCTURE.md` — cây thư mục, entry points
7. `AI/index/APP_STRUCTURE.md` — 3 apps (web/server/extension) làm gì
8. `AI/index/PACKAGE_STRUCTURE.md` — packages để làm gì
9. `AI/index/DATA_STRUCTURE.md` — data flow ở mức người dùng (clip → import → list)
10. `AI/history/2026-08/*.md` — toàn bộ history (monorepo-init, db-path-fixed, leetcode-clipper-extension, leetcode-clipper-direct-import-assets, ...) — rút ra **hành trình tính năng** để viết hướng dẫn
11. `AI/context/decisions.md` — lý do chọn giải pháp (chỉ tóm tắt 1 câu cho user)
12. `AI/context/glossary.md` — thuật ngữ cần giải thích

### Hạn chế — đọc code chỉ khi cần

- **Ưu tiên không đọc code.** Chỉ đọc khi `AI/` thiếu thông tin và cần xác nhận hành vi thực tế.
- Nếu phải đọc, chỉ đọc **tối đa 3-5 file entry** sau, không đọc toàn bộ repo:
  - `README.md` (root)
  - `apps/web/src/App.tsx` (flow web)
  - `apps/server/src/index.ts` (endpoints, chỉ đọc phần comment/route name)
  - `apps/extension/manifest.json` + `apps/extension/README.md`
  - `packages/database/src/schema.ts` (tên bảng, không cần chi tiết Drizzle)
- **Tuyệt đối không** đọc `node_modules`, `dist`, `drizzle/*`, `data/`, hay toàn bộ `packages/*/src`.

## Đầu ra

| File | Nội dung (hướng dẫn sử dụng) |
|------|-------------------------------|
| `AI/walkthrough/frontend.md` | Cách dùng web: mở web, paste/import, xem list, chạy code |
| `AI/walkthrough/backend.md` | Cách dùng server: khởi động, kiểm tra health, các API chính ở mức người dùng |
| `AI/walkthrough/database.md` | Dữ liệu lưu ở đâu, làm sao kiểm tra, migration/auto-migrate cho người dùng |
| `AI/walkthrough/execution.md` | Luồng tổng thể từ clip → lưu → hiển thị (end-to-end cho người mới) |
| `AI/walkthrough/ai.md` | AI hint dùng thế nào (hiện placeholder, tương lai ra sao) |
| `AI/walkthrough/extension.md` *(nếu cần)* | Cách cài và dùng extension clipper |

Mỗi file là **hướng dẫn sử dụng**, không phải tài liệu kỹ thuật.

## Quy tắc viết

- **Tiếng Việt**, giọng hướng dẫn, thân thiện với người mới.
- **Không quá kỹ thuật**: tránh dump code dài, tránh giải thích Drizzle/Fastify chi tiết, tránh liệt kê type/interface. Nếu cần, chỉ nêu tên và 1 câu mô tả.
- Ưu tiên: **mục đích → điều kiện chuẩn bị → các bước làm → kết quả mong đợi → mẹo/xử lý lỗi**.
- Dùng **danh sách bước đánh số**, ví dụ minh họa, và lưu ý ngắn.
- Giữ mỗi file **ngắn gọn (50-120 dòng)**, dễ đọc hết trong 5 phút.
- Dẫn link tới `AI/index/*` và `AI/history/*` khi cần chi tiết hơn, thay vì chép lại.
- Không suy diễn thông tin không có trong `AI/` + code entry đã đọc. Thiếu thì ghi `> TODO: bổ sung`.

## Workflow

1. **Đọc `AI/INDEX.md`** → lập danh sách file `AI/` cần đọc theo mục Nguồn dữ liệu.
2. **Đọc toàn bộ `AI/history/2026-08/*.md`** (theo thứ tự thời gian) → tóm tắt hành trình: monorepo → DB → extension base → direct import + assets.
3. **Đọc `AI/index/*.md` + `AI/ARCHITECTURE.md` + `AI/STATUS.md`** → nắm thành phần và luồng hiện tại.
4. **(Nếu cần) Đọc code hạn chế** — chỉ 3-5 file entry nêu trên để xác nhận hành vi (ví dụ host đọc từ `.env`, extension `api-config.js`).
5. **Đối chiếu walkthrough hiện tại** (`AI/walkthrough/*.md`) — đánh dấu phần đã lỗi thời (ví dụ frontend cũ chỉ nói textarea chạy code, chưa có ProblemImportPaste).
6. **Viết lại từng file `AI/walkthrough/*.md`** theo mẫu dưới — thay toàn bộ nội dung cũ bằng hướng dẫn sử dụng mới, giữ heading `##` rõ ràng.
7. **Kiểm tra chéo**: mỗi bước trong walkthrough phải có nguồn từ `AI/history` hoặc `AI/index`; không thêm tính năng chưa có trong `STATUS.md`.
8. **Cập nhật `AI/INDEX.md` nếu thêm file mới** (ví dụ `walkthrough/extension.md`).

## Mẫu cấu trúc mỗi file walkthrough

```markdown
# <Tên> Walkthrough

> Hướng dẫn sử dụng cho người mới — không cần đọc code.

## Bạn sẽ làm được gì

- 2-3 bullet kết quả sau khi làm theo.

## Chuẩn bị

- Điều kiện, lệnh, env cần có (ngắn gọn).

## Các bước

### Bước 1 — ...
1. ...
2. ...

### Bước 2 — ...

## Kết quả mong đợi

- Mô tả hoặc ảnh minh họa (nếu có).

## Mẹo & xử lý lỗi

- Lỗi thường gặp → cách khắc phục.

## Đọc thêm

- Link tới AI/index/*, AI/history/*, README.
```

## Không được

- chép nguyên code dài (>10 dòng) vào walkthrough
- viết tài liệu kỹ thuật chi tiết (DRY, design pattern, ORM internals)
- đọc toàn bộ repo một cách máy móc để “cho đủ” — chỉ đọc `AI/` + tối đa 5 file entry
- suy diễn tính năng chưa có trong `AI/STATUS.md` / `AI/history`
- tạo file walkthrough mới ngoài `AI/walkthrough/` hoặc đổi tên file hiện có khi chưa cần
- bỏ qua `AI/history` — history là nguồn chính để kể lại hành trình cho người dùng
