import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ProblemMeta } from "@leetcode/shared";
import { ProblemService } from "./problem.service.js";

// Mock download ảnh — tránh network trong test
vi.mock("./asset.service.js", () => ({
  downloadAndRewriteImages: vi.fn(async (description: string) => description),
}));

const { downloadAndRewriteImages } = await import("./asset.service.js");

// Mock DB
const dbMock = {
  getAllWithHints: vi.fn(),
  get: vi.fn(),
  add: vi.fn(),
  updateDescription: vi.fn(),
  setHints: vi.fn(),
  getHints: vi.fn(),
  findAssetsByProblem: vi.fn(),
  findAssetByHash: vi.fn(),
  addAsset: vi.fn(),
};

// Mock engine (registry)
function createEngineMock() {
  const problems = new Map<number, ProblemMeta & { description: string }>();
  return {
    register: vi.fn((p: ProblemMeta & { description: string }) => {
      problems.set(p.id, p);
    }),
    get: vi.fn((id: number) => problems.get(id)),
    getRandom: vi.fn(),
    runTests: vi.fn(),
  };
}

describe("ProblemService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hydrate đọc từ DB và register vào engine", async () => {
    const reg = createEngineMock();
    const rows = [
      { id: 1, slug: "two-sum", title: "Two Sum", difficulty: "easy", tags: ["array"], description: "desc", template: null, url: null, testCases: [], hints: ["h1"] },
    ] as unknown as ProblemMeta[];
    dbMock.getAllWithHints.mockResolvedValue(rows);

    const svc = new ProblemService(dbMock as never, reg as never);
    const log = { info: vi.fn() };
    await svc.hydrate(log as never);

    expect(reg.register).toHaveBeenCalledTimes(1);
    expect(log.info).toHaveBeenCalledWith("Hydrated 1 problems from SQLite into engine");
  });

  it("run trả kết quả pass/total + problemId khi problem tồn tại", () => {
    const reg = createEngineMock();
    reg.register({ id: 1, slug: "a", title: "A", difficulty: "easy", tags: [], description: "", testCases: [] });
    reg.runTests.mockReturnValue({ passed: 2, total: 2 });

    const svc = new ProblemService(dbMock as never, reg as never);
    const result = svc.run(1, "function(){ return 1 }");

    expect(result).toEqual({ ok: true, passed: 2, total: 2, problemId: "LC0001" });
  });

  it("run trả not-found khi problem không tồn tại", () => {
    const svc = new ProblemService(dbMock as never, createEngineMock() as never);
    expect(svc.run(99, "function(){}")).toEqual({ ok: false, reason: "not-found" });
  });

  it("run trả invalid-code khi code không chạy được", () => {
    const reg = createEngineMock();
    reg.register({ id: 1, slug: "a", title: "A", difficulty: "easy", tags: [], description: "", testCases: [] });

    const svc = new ProblemService(dbMock as never, reg as never);
    const result = svc.run(1, "this is not valid js {");

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.reason).toBe("invalid-code");
    }
  });

  it("importClip: register + add DB + lưu hints, trả problem với hints/assets", async () => {
    const reg = createEngineMock();
    dbMock.add.mockResolvedValue(undefined);
    dbMock.setHints.mockResolvedValue(undefined);
    dbMock.findAssetsByProblem.mockResolvedValue([{ id: 1, localPath: "slug/img.png" }]);

    const svc = new ProblemService(dbMock as never, reg as never);
    const clip = {
      id: 7,
      slug: "my-slug",
      title: "My Problem",
      difficulty: "medium",
      tags: ["array"],
      description: "<p>hello</p>",
      hints: ["hint 1", "hint 2"],
    } as never;

    const result = await svc.importClip(clip, "http://localhost:3000");

    expect(reg.register).toHaveBeenCalledTimes(1);
    expect(dbMock.add).toHaveBeenCalledTimes(1);
    expect(dbMock.setHints).toHaveBeenCalledWith(7, ["hint 1", "hint 2"]);
    expect(downloadAndRewriteImages).toHaveBeenCalledWith("<p>hello</p>", "my-slug", "http://localhost:3000", 7);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.problem.hints).toEqual(["hint 1", "hint 2"]);
      expect(result.problem.assets).toEqual([{ id: 1, localPath: "slug/img.png" }]);
    }
  });

  it("exists trả true khi engine có problem", async () => {
    const reg = createEngineMock();
    reg.register({ id: 5, slug: "b", title: "B", difficulty: "hard", tags: [], description: "", testCases: [] });
    const svc = new ProblemService(dbMock as never, reg as never);
    expect(await svc.exists(5)).toBe(true);
    expect(await svc.exists(6)).toBe(false);
  });
});
