import { describe, it, expect } from "vitest";
import {
  createProblemTreeState,
  registerProblem,
  removeProblem,
  findProblem,
  listByDifficulty,
  listByTag,
  searchProblems,
  getTags,
  getDifficultyCounts,
  hydrateProblems,
} from "./problemTree.js";
import type { ProblemMeta } from "@leetcode/shared";

const p = (id: number, title: string, difficulty: ProblemMeta["difficulty"], tags: string[] = []): ProblemMeta => ({
  id,
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  title,
  difficulty,
  tags,
});

describe("ProblemTree", () => {
  it("createProblemTreeState tạo state rỗng", () => {
    const s = createProblemTreeState();
    expect(s.total).toBe(0);
    expect(s.byDifficulty.easy).toEqual([]);
    expect(s.byTag.size).toBe(0);
  });

  it("registerProblem thêm problem vào byDifficulty + byId", () => {
    let s = createProblemTreeState();
    s = registerProblem(s, p(1, "Two Sum", "easy", ["array"]));
    expect(s.total).toBe(1);
    expect(s.byDifficulty.easy).toHaveLength(1);
    expect(findProblem(s, 1)?.title).toBe("Two Sum");
  });

  it("registerProblem gom theo tags", () => {
    let s = createProblemTreeState();
    s = registerProblem(s, p(1, "Two Sum", "easy", ["array", "hash"]));
    s = registerProblem(s, p(2, "Contains Dup", "easy", ["array"]));
    expect(getTags(s)).toEqual(["array", "hash"]);
    expect(listByTag(s, "array")).toHaveLength(2);
    expect(listByTag(s, "hash")).toHaveLength(1);
  });

  it("registerProblem trùng id không tăng total", () => {
    let s = createProblemTreeState();
    s = registerProblem(s, p(1, "A", "easy"));
    s = registerProblem(s, p(1, "A2", "easy"));
    expect(s.total).toBe(1);
    expect(findProblem(s, 1)?.title).toBe("A2");
  });

  it("removeProblem xóa khỏi mọi index", () => {
    let s = createProblemTreeState();
    s = registerProblem(s, p(1, "A", "easy", ["x"]));
    s = registerProblem(s, p(2, "B", "hard", ["x"]));
    s = removeProblem(s, 1);
    expect(s.total).toBe(1);
    expect(findProblem(s, 1)).toBeUndefined();
    expect(listByDifficulty(s, "easy")).toHaveLength(0);
    expect(listByTag(s, "x")).toHaveLength(1);
  });

  it("listByDifficulty không truyền difficulty → tất cả", () => {
    let s = createProblemTreeState();
    s = registerProblem(s, p(1, "A", "easy"));
    s = registerProblem(s, p(2, "B", "hard"));
    expect(listByDifficulty(s)).toHaveLength(2);
    expect(listByDifficulty(s, "easy").map((x) => x.id)).toEqual([1]);
  });

  it("searchProblems lọc theo query + difficulty", () => {
    let s = createProblemTreeState();
    s = registerProblem(s, p(1, "Two Sum", "easy", []));
    s = registerProblem(s, p(2, "Two Sum II", "medium", []));
    s = registerProblem(s, p(3, "Add Numbers", "easy", []));
    expect(searchProblems(s, { query: "two sum" }).map((x) => x.id)).toEqual([1, 2]);
    expect(searchProblems(s, { query: "two", difficulty: "easy" }).map((x) => x.id)).toEqual([1]);
    expect(searchProblems(s, { query: "999" })).toHaveLength(0);
  });

  it("searchProblems sắp xếp theo id tăng dần", () => {
    let s = createProblemTreeState();
    s = registerProblem(s, p(20, "B", "easy"));
    s = registerProblem(s, p(3, "A", "easy"));
    expect(searchProblems(s).map((x) => x.id)).toEqual([3, 20]);
  });

  it("getDifficultyCounts trả đúng số lượng", () => {
    let s = createProblemTreeState();
    s = registerProblem(s, p(1, "A", "easy"));
    s = registerProblem(s, p(2, "B", "easy"));
    s = registerProblem(s, p(3, "C", "hard"));
    expect(getDifficultyCounts(s)).toEqual({ easy: 2, medium: 0, hard: 1 });
  });

  it("hydrateProblems nạp nhiều problem", () => {
    const s = hydrateProblems(createProblemTreeState(), [p(1, "A", "easy"), p(2, "B", "medium")]);
    expect(s.total).toBe(2);
  });
});
