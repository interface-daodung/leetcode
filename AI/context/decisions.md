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
