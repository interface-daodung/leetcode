import { describe, it, expect, vi, afterEach } from "vitest";

import { diagnoseConnection } from "./api.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("diagnoseConnection", () => {
  it("trả ok=true khi /health 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", { status: 200, statusText: "OK" })),
    );
    const r = await diagnoseConnection();
    expect(r.ok).toBe(true);
    expect(r.status).toBe(200);
    expect(r.errorKind).toBe("");
    expect(r.detail).toMatch(/200/);
  });

  it("phân loại lỗi connection-refused khi fetch fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    const r = await diagnoseConnection();
    expect(r.ok).toBe(false);
    expect(r.errorKind).toBe("connection-refused");
    expect(r.detail).toContain("Failed to fetch");
  });

  it("phân loại timeout khi AbortError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const e = new Error("aborted");
            e.name = "AbortError";
            reject(e);
          });
        });
      }),
    );
    const r = await diagnoseConnection(50);
    expect(r.ok).toBe(false);
    expect(r.errorKind).toBe("timeout");
  });

  it("trả http khi server trả 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 500, statusText: "Internal Server Error" })),
    );
    const r = await diagnoseConnection();
    expect(r.ok).toBe(false);
    expect(r.status).toBe(500);
    expect(r.errorKind).toBe("http");
  });
});
