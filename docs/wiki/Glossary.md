# Glossary {#glossary}

> Thuật ngữ chuyên dụng trong project. Xem `AI/context/glossary.md`.

---

| Term | Ý nghĩa |
|------|---------|
| `@leetcode/*` | Workspace alias cho packages nội bộ trong monorepo |
| `ProblemMeta` | Type định nghĩa metadata của problem (id, title, difficulty, tags, description, template, url, slug, testCases, createdAt) |
| `ProblemClip` | Type dữ liệu clip từ Extension (extends ProblemMeta + hints, clippedAt) |
| `ProblemEngine` | Class quản lý in-memory problem registry và test runner (singleton `engine`) |
| `ProblemDatabase` | Class CRUD cho SQLite via Drizzle ORM (singleton `problemDb`) |
| `ProblemTreeState` | Pure state tree: `byDifficulty`, `byTag`, `byId` cho search/filter linh hoạt |
| `Difficulty` | Union type: `"easy" \| "medium" \| "hard"` |
| `TestCase` | Type `{ input: unknown; expected: unknown }` |
| `TestCaseResult` | Type `{ input, expected, actual, ok, error? }` — kết quả chạy từng test case |
| `EditorState` | Type `{ code: string; language: string; problemId?: number }` |
| `formatProblemId` | Util function: format `LC0001`, `LC0123`, `LC1234` |
| `AIHint` | Type `{ type: "approach" \| "optimization" \| "edge-case"; message: string }` |
| `AIResponse` | Type `{ hints: AIHint[]; explanation: string; complexity: { time: string; space: string } }` |
| `AIGuide` | Type 5 section: approach/algorithm/solution/complexity/edge-cases (mỗi section có content + explanation) |
| `SuggestItem` | Autocomplete item: `{ label, insertText, kind, detail?, docId? }` |
| `LayoutComponentName` | `"explorer" \| "editor" \| "description" \| "output" \| "ai" \| "error" \| "knowledge-search" \| "knowledge-result"` |
| `RunOutcome` | Discriminated union: `{ ok: true, passed, total, results } \| { ok: false, reason: "not-found" \| "invalid-code" }` |
| `asset.service.ts` | Service tải ảnh, SHA-256 hash, dedupe, rewrite src, lưu DB (`downloadAndRewriteImages`) |
| `problem.service.ts` | Service nghiệp vụ problem: hydrate, list, getById, run, hint, getHints, getAssets, exists, importClip |
| `downloadAndRewriteImages` | Hàm tải ảnh từ description, dedupe hash, lưu local, rewrite src thành `/assets/...` |
| `ensureAssetFiles` | Kiểm tra file asset tồn tại, thiếu thì tải lại (dùng khi hydrate/getById) |
| `extractSolutionFunction` | Trích hàm giải duy nhất từ code user (strip comment → extract → wrap) |
| `wrapSolution` | Wrap function với spread input để gọi được bởi test runner |
| `stripComments` | Loại bỏ comment khỏi code |
| `sanitizeHtml` | Sanitize HTML (DOMParser, allowlist tags/attrs) |
| `sanitizeFilename` | Safe filename cho asset local |
| `migrateLayoutJson` | Migration layout JSON cũ → mới (knowledge → knowledge-search + result tabset) |
| `flexThemeClass` | FlexLayout theme class: `flexlayout__theme_alpha_light/dark` |
| `flexCssOverrides` | CSS variables overrides đồng bộ với web theme |
| `web_accessible_resources` | Manifest V3 config cho phép extension load assets (PNG, SVG) qua `chrome.runtime.getURL` |
| `host_permissions` | Manifest V3 permissions cho fetch tới API host |
| `api-config.js` | Auto-gen từ root `.env` (prebuild), chứa `API_BASE` cho extension |
| `sync:config` | Script `scripts/sync-api-url.mjs` tạo `api-config.js` + cập nhật manifest |
| `problem_assets` | Bảng DB: id, problem_id FK, original_url, local_path, hash (+ index) |
| `hints` | Bảng DB: id, problem_id FK, ord, content |
| `lc:layout:json` | localStorage key lưu FlexLayout model JSON |
| `data-theme` | HTML attribute cho theme: `light` \| `dark` (CSS variables + Tailwind `@custom-variant`) |

---

## Acronyms

| Acronym | Full Form |
|---------|-----------|
| MV3 | Manifest Version 3 (Chrome Extension) |
| SPA | Single Page Application |
| FK | Foreign Key |
| ORM | Object-Relational Mapping |
| IIFE | Immediately Invoked Function Expression |
| AST | Abstract Syntax Tree |
| LSP | Language Server Protocol |
| CORS | Cross-Origin Resource Sharing |
| SHA-256 | Secure Hash Algorithm 256-bit |
| ESM | ECMAScript Modules |