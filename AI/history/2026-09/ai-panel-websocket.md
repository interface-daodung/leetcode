# Tab AI hướng dẫn giải qua WebSocket

Nhánh: `feat/ai-panel-websocket` (2026-09-02)

## Mục tiêu

Thêm panel **AI** vào dockable layout của `apps/web` nhằm sinh hướng dẫn giải bài toán. Yêu cầu chính:

1. Dùng `packages/ai`.
2. AI prompt/template giữ **server-side** (không lộ ra client) — giao tiếp bằng **WebSocket**.
3. `apps/web` có tab layout + nút, đầu vào là thông tin bài toán, đầu ra là JSON hướng dẫn + lời giải mẫu, giải thích từng phần.
4. Mỗi phần có nút mở **ChatGPT web** (`chatgpt.com/?q=`) điền sẵn prompt — vì model AI cục bộ nhỏ khó giải thích bài lớn.

## Thay đổi

### `packages/ai/src/index.ts`
- Thêm `AIProblemInput` (dữ liệu bài toán server cần để sinh hướng dẫn).
- Thêm `AIGuide` / `AIGuideSection` — JSON khuôn mẫu hướng dẫn (5 section: approach, algorithm, solution, complexity, edge-cases), mỗi section có `content` + `explanation` (giải thích từng phần).
- `generateGuide(problem)` — hàm sinh guide; **đây là nơi chứa "skill prompt" của AI, chỉ trả kết quả, không lộ template.**
- `buildChatGptPrompt(problem)` / `buildChatGptUrl(problem)` — prompt + URL mở ChatGPT điền sẵn, trỏ URL bài toán.
- Giữ nguyên `getHint` / `explainSolution` (chỉ đổi tham số `_problemId`/`_userCode` thành `_` prefix để khỏi unused — web build có `noUnusedParameters`).
- Thêm `index.test.ts` (4 tests).

### `apps/server/src`
- `app.ts` — `await app.register(fastifyWebsocket)`.
- `routes/ai.routes.ts` — `GET /ws/ai` (websocket).
- `controllers/ai.controller.ts` — nhận `{ type: "guide", problem }`, gọi `generateGuide`, trả `{ type: "guide", guide }`; lỗi → `{ type: "error", error }`.
- `routes/index.ts` — đăng ký `registerAiRoutes`.
- `ai.controller.test.ts` (3 tests) — test handler trực tiếp bằng MockSocket.
- Thêm `@fastify/websocket@^10.0.0` (v11 yêu cầu Fastify 5, dự án dùng Fastify 4 → v10 là phiên bản tương thích cuối cùng), `ws` (deps) + `@types/ws` (devDeps).

### `packages/layout/src/workspace.ts`
- `LayoutComponentName` thêm `"ai"`.
- `ALL_COMPONENTS` thêm `"ai"` (7 phần tử).
- `defaultTabsetId("ai")` → `tabset-output`.
- `createDefaultLayout` thêm tab `ai` vào `tabset-output`.
- `defaultName("ai")` → `"AI"`.
- Cập nhật `workspace.test.ts`.

### `apps/web/src`
- `components/workspace/useAI.ts` — hook WebSocket: kết nối `ws(s)://<API_BASE>/ws/ai`, `requestGuide(problem)` gửi JSON, cập nhật `guide`/`error`/`loading`.
- `components/workspace/AIPanel.tsx` — panel: nút "Sinh hướng dẫn giải", render 5 section, mỗi section nút "Giải thích (AI)" (hiện explanation) + "ChatGPT ↗" (mở `buildChatGptUrl`), nút "JSON" hiện guide thô.
- `WorkspaceLayout.tsx` — factory thêm `case "ai"`.
- `Header.tsx` — `PANEL_LABELS.ai = "AI"`.
- `WorkspaceContext.tsx` — `panelsVisible` state init thêm `ai: true`.
- `package.json` / `tsconfig.json` / `vite.config.ts` — thêm `@leetcode/ai`.

## Luồng

```
AIPanel (web)
  │ nút "Sinh hướng dẫn giải" → requestGuide(problem)
  │ WebSocket /ws/ai
  ▼
server: ai.controller.handle
  │ generateGuide(problem) [prompt/template server-side, KHÔNG lộ client]
  ▼
  { type:"guide", guide:{ sections:[...content+explanation] } }
  ▼
AIPanel render; mỗi section "ChatGPT ↗" → chatgpt.com/?q=<prompt bài toán>
```

## Kiểm chứng

- `pnpm -r build` pass.
- `pnpm -r test` pass (layout 10, ai 4, server 39+, ...).
- Thủ công: mở web → tab AI → chọn bài → nút Sinh → thấy 5 section; bấm "Giải thích (AI)" hiện giải thích; bấm "ChatGPT" mở chatgpt.com điền prompt.