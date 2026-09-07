# Fix: `created_at` lưu sai chuỗi "(datetime('now'))"

Trạng thái: **completed**
Source: `AI/context/known-issues.md#1` — Current Issues / Issue 1
Ngày tạo: 2026-08-30
Ngày resolve: 2026-08-30

---

## 1. Vấn đề

- **File**: `packages/database/src/schema.ts:11`
- **Mô tả**: Cột `created_at` đang lưu chuỗi literal `"(datetime('now'))"` thay vì giá trị datetime thực tế.
- **Ảnh hưởng**: Dữ liệu `created_at` trong DB không có thông tin thời gian thật, gây sai lệch khi truy vấn/sắp xếp theo thời gian tạo.
- **Nguyên nhân**: Đặt `default("(datetime('now'))")` — truyền string thay vì gọi hàm SQL `datetime('now')`. Drizzle cần dùng `sql` (ví dụ ``default(sql`(datetime('now'))`)``) để tạo default expression, chứ không phải string literal.

## 2. Expected vs Actual

- **Expected**: `created_at` được DB tự điền là timestamp hiện tại (ví dụ `2026-08-30 12:34:56`) khi insert không truyền `created_at`.
- **Actual**: `created_at` lưu nguyên chuỗi `"(datetime('now'))"` cho mọi row mới.

## 3. Reproduce

1. Xóa DB cũ `packages/database/data/leetcode.db` (nếu có) để migration mới có hiệu lực.
2. Chạy `pnpm --filter=@leetcode/database db:migrate` hoặc import `@leetcode/database` để auto-migrate.
3. Insert 1 problem không truyền `created_at` (dùng `problemDb.add` hoặc SQL raw).
4. `SELECT created_at FROM problems;` → thấy `"(datetime('now'))"` thay vì datetime.

Hoặc chạy script `node` kiểm tra schema default.

## 4. Giải pháp

- Sửa `packages/database/src/schema.ts:11`:
  ```ts
  import { sql } from "drizzle-orm";
  // ...
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  ```
- Tạo migration mới bằng `pnpm --filter=@leetcode/database db:generate` (drizzle-kit sẽ sinh `drizzle/xxxx.sql`).
- Kiểm tra `drizzle.config.ts` và `client.ts` auto-migrate vẫn hoạt động.
- Xóa DB cũ và test lại insert → `created_at` là datetime thật.

## 5. File thay đổi (dự kiến)

- `packages/database/src/schema.ts`
- `packages/database/drizzle/*.sql` (migration mới)
- Có thể `packages/database/drizzle/meta/*.json` (drizzle-kit)

Không sửa file ngoài phạm vi backlog này.

## 6. Testing

- `pnpm --filter=@leetcode/database build` (tsc --noEmit) pass.
- Insert test: verify `created_at` không còn là `"(datetime('now'))"` và match regex `^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$` hoặc ISO.
- `pnpm -r build` pass (không break package khác).

## 6b. Kết quả verify (2026-08-30)

- Fix đã nằm sẵn trong commit `fa9c962` (schema.ts đổi sang `default(sql\`(datetime('now'))\`)`) kèm migration `0001`.
- Chạy `db:generate` → `No schema changes, nothing to migrate` (không cần migration mới).
- Insert test tạm (vitest) → `created_at` lưu datetime thật, pass.
- Kiểm tra DB thật: mọi row `created_at` đều là timestamp (vd `2026-08-30 15:19:46`), `COUNT(*) WHERE created_at = '(datetime(''now''))'` = 0.
- `pnpm -r build` pass.

## 7. Tiêu chí hoàn thành (DoD)

- [x] `schema.ts` dùng `sql`(datetime('now'))` thay vì string literal.
- [x] Migration mới được generate (đã có trong `fa9c962`, `db:generate` xác nhận không còn thay đổi).
- [x] Insert không truyền `created_at` → DB lưu datetime thật.
- [x] Build pass.
- [x] Cập nhật `AI/context/known-issues.md` (chuyển issue sang Resolved).

## 8. Hoàn thành

Khi xong, chạy từ **repo root**:

```bat
AI\skills\bug-fix\move-backlog-to-completed.bat fix-created-at-default
```

- Script dùng `move` (không `copy`) để tiết kiệm token, tránh chép sang trang khác.
- Sau move, cập nhật `AI/context/known-issues.md` → `Resolved Issues`.

## 9. Ghi chú

- Chỉ làm backlog này, không gộp với backlog khác.
- Không copy nội dung sang `AI/plans/active/` hay file khác.
- Tham khảo `AI/skills/bug-fix/SKILL.md` Phase 1 để trace → fix → test.
