# Add API

## Workflow

1. Xác định API contract.
2. Tìm routing layer hiện tại.
3. Tìm controller/handler hiện tại.
4. Tìm service layer.
5. Tìm validation.
6. Tìm error handling.
7. Tìm authentication/authorization.
8. Implement theo architecture hiện tại.
9. Test API.
10. Cập nhật walkthrough.
11. Cập nhật data/API index nếu cần.

## Ghi chú project cụ thể

- Routing layer: `apps/server/src/index.ts` (Fastify).
- Validation: Zod (`z.object().parse(...)`) trực tiếp trong handler.
- Service layer: packages như `@leetcode/problem-engine`, `@leetcode/ai`.
- Hiện chưa có authentication/authorization.
