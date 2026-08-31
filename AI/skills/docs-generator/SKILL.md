---
name: docs-generator
description: Tạo/cập nhật tài liệu (README, docs) từ knowledge base AI/. Use when viết docs, README, hoặc cập nhật tài liệu người dùng.
---

# Docs Generator

## Trigger

Khi được yêu cầu tạo/cập nhật tài liệu người dùng (README, docs) từ knowledge base.

## Nguồn dữ liệu

**CHỈ ĐỌC từ `AI/` + GitNexus**, KHÔNG đọc source code (trừ khi cần xác nhận qua GitNexus `query`/`context`):

```text
AI/INDEX.md
AI/PROJECT.md
AI/STATUS.md
AI/CONVENTIONS.md
AI/context/glossary.md
AI/context/decisions.md
AI/history/archived/*  (ARCHITECTURE.md, index/, walkthrough/ — bản sao tĩnh cũ)
```

Thứ tự đọc: `INDEX.md` → xác định file liên quan → đọc. Không đọc file không cần thiết.

## Đầu ra

| Vị trí | Nội dung |
|--------|----------|
| `README.md` (root) | Giới thiệu project, link tới docs |
| `<project>/README.md` | Giới thiệu từng app/package |
| `docs/README.md` | Index bộ tài liệu |
| `docs/getting-started.md` | Cài đặt, chạy project |
| `docs/features/*.md` | 1 file mỗi feature |
| `docs/architecture.md` | Cơ chế, kiến trúc, công nghệ |

## Format chuẩn

- Heading có `#id` anchor: `## Tên tính năng {#feature-name}`
- TOC link dạng `[Text](#anchor)` hoặc `[Text](file.md#anchor)`
- Anchor ASCII, không dấu, không khoảng trắng: `cai-dat` `tinh-nang-x`
- Relative links giữa file docs
- Không dùng HTML phức tạp (Obsidian/GitHub wiki đều render được)
- Không dùng hình ảnh lưu trữ ngoài

## Quy trình

1. Đọc `AI/INDEX.md` → xác định file cần đọc
2. Đọc các file `AI/` liên quan theo danh sách trên
3. Tổng hợp: features, cơ chế, công nghệ từng phần
4. Tạo/cập nhật `docs/` trước
5. Tạo/cập nhật `README.md` root và từng project, link vào `docs/`
6. Kiểm tra mọi anchor link hợp lệ

## Quy tắc

- Nội dung tiếng Việt
- Không suy diễn thông tin không có trong `AI/`
- Nếu thiếu thông tin, ghi `<!-- TODO: bổ sung -->` thay vì bịa
- KHÔNG đọc file ngoài `AI/` (trừ khi kiểm tra README đã tồn tại để ghi đè)