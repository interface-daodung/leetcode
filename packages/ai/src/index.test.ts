import { describe, it, expect } from "vitest";
import { generateGuide, buildChatGptUrl, buildChatGptPrompt, getHint, explainSolution } from "./index.js";

const problem = {
  id: 1,
  title: "Two Sum",
  slug: "two-sum",
  url: "https://leetcode.com/problems/two-sum",
  difficulty: "easy",
  tags: ["array", "hash-table"],
  description: "Given nums...",
  template: "function twoSum(nums, target) {}",
  hints: ["Use a map"],
};

describe("generateGuide", () => {
  it("trả guide có đủ 5 section (approach/algorithm/solution/complexity/edge-cases)", async () => {
    const guide = await generateGuide(problem);
    expect(guide.problemId).toBe(1);
    expect(guide.title).toBe("Two Sum");
    expect(guide.difficulty).toBe("easy");
    expect(guide.tags).toEqual(["array", "hash-table"]);
    expect(guide.url).toBe("https://leetcode.com/problems/two-sum");
    const ids = guide.sections.map((s) => s.id);
    expect(ids).toEqual(["approach", "algorithm", "solution", "complexity", "edge-cases"]);
  });

  it("mỗi section đều có content + explanation", async () => {
    const guide = await generateGuide(problem);
    for (const section of guide.sections) {
      expect(section.content.length).toBeGreaterThan(0);
      expect(section.explanation.length).toBeGreaterThan(0);
    }
  });
});

describe("buildChatGptUrl / buildChatGptPrompt", () => {
  it("prompt chứa URL bài toán", () => {
    const prompt = buildChatGptPrompt(problem);
    expect(prompt).toContain("Hãy giải thích bài toán này");
    expect(prompt).toContain("https://leetcode.com/problems/two-sum");
  });

  it("url chatgpt.com encode prompt đúng", () => {
    const url = buildChatGptUrl(problem);
    expect(url.startsWith("https://chatgpt.com/?q=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("https://leetcode.com/problems/two-sum");
  });
});

describe("getHint / explainSolution (backward compat)", () => {
  it("getHint trả AIResponse với hints + complexity", async () => {
    const res = await getHint(1, "code");
    expect(res.hints.length).toBeGreaterThan(0);
    expect(res.complexity.time).toBeTruthy();
    expect(res.explanation).toBeTruthy();
  });

  it("explainSolution trả chuỗi giải thích", async () => {
    expect(await explainSolution(1, "sol")).toContain("1");
  });
});