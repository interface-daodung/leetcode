import { describe, it, expect } from "vitest";
import {
  getAllKeywords,
  getAllKeywordsVi,
  getByCategory,
  getByCategoryVi,
  getById,
  getByIdVi,
  getByKeyword,
  getCategories,
  getCategoriesVi,
  getDocFileSync,
  getDocFileSyncVi,
  getIndex,
  getIndexVi,
  getSectionByIdSync,
  getSectionByIdSyncVi,
  searchDocs,
  searchDocsVi,
  suggestCommands,
  suggestCommandsVi,
} from "./search.js";

describe("javascript-docs search", () => {
  it("index có đủ metadata", () => {
    const idx = getIndex();
    expect(idx.totalSources).toBe(13);
    expect(idx.totalEntries).toBeGreaterThan(200);
    expect(idx.categories).toContain("array");
    expect(idx.categories).toContain("string");
    expect(idx.keywordIndex["push"]).toBeDefined();
  });

  it("searchDocs tìm push (array)", () => {
    const res = searchDocs("push");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].id).toContain("push");
  });

  it("searchDocs phân biệt category", () => {
    const res = searchDocs("split", { category: "string" });
    expect(res.every((r) => r.category === "string")).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it("searchDocs trả rỗng khi query rỗng và không filter", () => {
    expect(searchDocs("")).toEqual([]);
    expect(searchDocs("   ")).toEqual([]);
  });

  it("suggestCommands gợi ý theo prefix", () => {
    const sug = suggestCommands("arr");
    expect(sug.length).toBeGreaterThan(0);
    // phần lớn title hoặc keyword bắt đầu với arr
    expect(sug[0].title.toLowerCase() + sug[0].keywords.join(" ")).toContain("arr");
  });

  it("getById trả về entry chính xác", () => {
    const e = getById("array-push");
    expect(e).toBeDefined();
    expect(e?.title.toLowerCase()).toBe("push");
  });

  it("getByCategory trả về đúng số lượng", () => {
    const arr = getByCategory("array");
    expect(arr.length).toBeGreaterThan(10);
    expect(arr.every((e) => e.category === "array")).toBe(true);
  });

  it("getByKeyword trả về entries chứa keyword", () => {
    const res = getByKeyword("push");
    expect(res.length).toBeGreaterThan(0);
  });

  it("getAllKeywords chứa các keyword phổ biến", () => {
    const kws = getAllKeywords();
    expect(kws).toContain("array");
    expect(kws).toContain("string");
    expect(kws.length).toBeGreaterThan(100);
  });

  it("getCategories trả về 13 categories", () => {
    const cats = getCategories();
    expect(cats.length).toBe(13);
  });

  it("getDocFileSync đọc file array", () => {
    const doc = getDocFileSync("array");
    expect(doc).toBeDefined();
    expect(doc?.sourceFile).toBe("array-examples.md");
    expect(doc?.sections.length).toBeGreaterThan(20);
  });

  it("getSectionByIdSync đọc section string-split", () => {
    const sec = getSectionByIdSync("string-split");
    expect(sec).toBeDefined();
    expect(sec?.syntax).toBeDefined();
    expect(sec?.examples.length).toBeGreaterThan(0);
  });

  it("search phân biệt mutates metadata", () => {
    const push = getById("array-push");
    expect(push?.mutates).toBe(true);
    const slice = getById("array-array-slice");
    if (slice) expect(slice.mutates).toBe(false);
  });
});

describe("javascript-docs search (tiếng Việt)", () => {
  it("index vi có đủ metadata", () => {
    const idx = getIndexVi();
    expect(idx.totalSources).toBe(13);
    expect(idx.totalEntries).toBeGreaterThan(200);
    expect(idx.categories).toContain("array");
    expect(idx.lang).toBe("vi");
  });

  it("searchDocsVi tìm theo keyword tiếng Việt", () => {
    const res = searchDocsVi("push");
    expect(res.length).toBeGreaterThan(0);
  });

  it("getByIdVi trả về entry tiếng Việt", () => {
    const e = getByIdVi("array-push");
    expect(e).toBeDefined();
  });

  it("getByCategoryVi trả về đúng category", () => {
    const arr = getByCategoryVi("array");
    expect(arr.length).toBeGreaterThan(10);
    expect(arr.every((e) => e.category === "array")).toBe(true);
  });

  it("getCategoriesVi trả về 13 categories", () => {
    const cats = getCategoriesVi();
    expect(cats.length).toBe(13);
  });

  it("getAllKeywordsVi có dữ liệu", () => {
    const kws = getAllKeywordsVi();
    expect(kws.length).toBeGreaterThan(100);
  });

  it("getDocFileSyncVi đọc file array", () => {
    const doc = getDocFileSyncVi("array");
    expect(doc).toBeDefined();
    expect(doc?.sourceFile).toBe("array-examples.md");
    expect(doc?.sections.length).toBeGreaterThan(20);
  });

  it("getSectionByIdSyncVi đọc section string-split", () => {
    const sec = getSectionByIdSyncVi("string-split");
    expect(sec).toBeDefined();
    expect(sec?.examples.length).toBeGreaterThan(0);
  });

  it("suggestCommandsVi gợi ý theo prefix", () => {
    const sug = suggestCommandsVi("arr");
    expect(sug.length).toBeGreaterThan(0);
  });
});
