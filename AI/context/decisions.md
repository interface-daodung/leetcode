# Technical Decisions

> Lưu các quyết định kỹ thuật quan trọng và lý do của chúng.

## Decisions

### [2026-08-30] Dùng AGENT.md làm instruction entry cho opencode

#### Context

Agent cần đọc AGENT.md (và qua đó AI/INDEX.md, STATUS.md, CONVENTIONS.md) ngay khi bắt đầu làm việc, tránh đọc lan man nhiều file trong repository.

#### Decision

Khai báo `"instructions": ["AGENT.md"]` trong OpenCode config để AGENT.md được nạp vào context của Agent.

#### Reason

Agent có nguyên tắc làm việc ngay từ đầu mà không cần tự khám phá.

#### Consequences

- Mọi thay đổi về quy tắc làm việc phải đi qua AGENT.md.

### [2026-08-30] Gộp Plan Management vào skill feature-development

#### Context

Thư mục `AI/skills/plan-management/` trùng chức năng với `feature-development`, gây phân mảnh skill. Script `move-plan-to-completed.bat` đã nằm trong `feature-development/`.

#### Decision

- Xoá `AI/skills/plan-management/`.
- Quy trình plan (tạo/edit/hoàn thành) nhập vào `AI/skills/feature-development/SKILL.md` (mục Plan Management).
- Mọi tham chiếu (AGENTS.md) trỏ về `feature-development`.

### [2026-08-30] LeetCode Clipper — chọn DOM clip thay vì LeetCode API

#### Context

Cần đưa đề bài thật từ LeetCode vào hệ thống nội bộ. LeetCode GraphQL API không ổn định, bị rate-limit và đổi schema; `problems/` rỗng, seed script đã bỏ.

#### Decision

- Tạo browser extension MV3 (`apps/extension`) đọc DOM đã render trên `leetcode.com/problems/*` thay vì gọi API.
- Selector chính: `[data-track-load="description_content"]` (fallback `data-qd-rendered-description`, `HTMLContent_html__*`), parse id/slug từ `a[href^="/problems/"]`, difficulty từ `text-difficulty-*`.
- Extension copy `ProblemClip` JSON vào clipboard; web `ProblemImportPaste` paste → preview (sanitize) → `POST /api/problems/import` → `engine.register` + `problemDb.add`.
- Server hydrate `engine` từ SQLite khi khởi động để không mất dữ liệu sau restart; thêm `GET /api/problems` và CORS.
- `ProblemClip` type được thêm vào `packages/shared` để đồng bộ giữa web/server/extension (extension copy type, không phụ thuộc workspace build).

#### Reason

- Tận dụng DOM đã render sẵn, không phụ thuộc API hay auth LeetCode.
- Luồng offline, đơn giản, dễ bảo trì (chỉ cần cập nhật selector khi LeetCode đổi DOM).
- Tái sử dụng pattern widget draggable của Gemielle (`style.css`, `makeDraggable`).

#### Consequences

- Cần cập nhật selector khi LeetCode đổi class/data attribute.
- Extension phải load unpacked thủ công (chưa publish store).
- Dữ liệu clip chỉ có `description` HTML; `testCases` để rỗng phase 1, có thể parse từ Example sau này.
