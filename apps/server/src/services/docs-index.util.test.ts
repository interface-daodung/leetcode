import { describe, it, expect } from "vitest";
import { buildDocsIndex } from "./docs-index.util.js";
import type { DocFile } from "@leetcode/database";

const files: DocFile[] = [
  {
    sourceFile: "array-examples.md",
    sourceUrl: null,
    category: "array",
    title: "Array examples",
    description: null,
    tags: ["array", "collection"],
    sections: [
      {
        id: "array-push",
        ord: 0,
        title: "push",
        headingLevel: 2,
        anchor: "#push",
        summary: "Thêm phần tử vào cuối mảng",
        keywords: ["push", "array"],
        syntax: "arr.push(item)",
        returns: null,
        mutates: true,
        mdnUrl: null,
        examples: [],
        tables: [],
        related: [],
        content: "push content",
        contentHtml: "<p>push</p>",
        searchText: "push array thêm phần tử",
        category: "array",
      },
      {
        id: "array-slice",
        ord: 1,
        title: "slice",
        headingLevel: 2,
        anchor: null,
        summary: null,
        keywords: ["slice", "array"],
        syntax: null,
        returns: null,
        mutates: false,
        mdnUrl: null,
        examples: [],
        tables: [],
        related: [],
        content: "slice content",
        contentHtml: null,
        searchText: "",
        category: "array",
      },
    ],
  },
];

describe("buildDocsIndex", () => {
  it("build entries + keywordIndex + categories từ DocFile DB shape", () => {
    const idx = buildDocsIndex(files, "en");
    expect(idx.totalSources).toBe(1);
    expect(idx.totalEntries).toBe(2);
    expect(idx.categories).toEqual(["array"]);
    expect(idx.keywordIndex["push"]).toEqual(["array-push"]);
    expect(idx.keywordIndex["array"]).toEqual(["array-push", "array-slice"]);
    expect(idx.keywordIndex["slice"]).toEqual(["array-slice"]);
    expect(idx.sources[0]).toEqual({ file: "array-examples.md", title: "Array examples", category: "array", sections: 2 });
  });

  it("entries đủ trường cho search core (fallback cho nullable)", () => {
    const idx = buildDocsIndex(files, "vi");
    const slice = idx.entries.find((e) => e.id === "array-slice");
    expect(slice).toMatchObject({
      id: "array-slice",
      category: "array",
      syntax: null,
      mutates: false,
      tags: ["array", "collection"],
    });
    expect(idx.lang).toBe("vi");
  });
});
