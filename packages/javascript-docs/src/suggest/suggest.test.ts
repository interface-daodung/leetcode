import { describe, expect, it } from "vitest";
import { detectContext, suggest, suggestForCode } from "./suggest.js";
import { extractVars } from "./vars.js";

describe("detectContext", () => {
  it("lấy word + receiver sau dấu chấm", () => {
    expect(detectContext("const x = arr.pu")).toEqual({
      linePrefix: "const x = arr.pu",
      wordPrefix: "pu",
      receiver: "arr",
      algo: false,
    });
  });

  it("chỉ có dấu chấm, chưa gõ word", () => {
    expect(detectContext("arr.")).toEqual({ linePrefix: "arr.", wordPrefix: "", receiver: "arr", algo: false });
  });

  it("word thường không receiver", () => {
    expect(detectContext("cons")).toEqual({ linePrefix: "cons", wordPrefix: "cons", receiver: null, algo: false });
  });

  it("trigger 'al/' → algo mode, word sau trigger", () => {
    expect(detectContext("al/bs")).toEqual({ linePrefix: "al/bs", wordPrefix: "bs", receiver: null, algo: true });
    expect(detectContext("al/")).toEqual({ linePrefix: "al/", wordPrefix: "", receiver: null, algo: true });
  });

  it("'al/' giữa identifier không kích hoạt", () => {
    expect(detectContext("xal/bs")).toEqual({ linePrefix: "xal/bs", wordPrefix: "bs", receiver: null, algo: false });
  });

  it("dòng mới reset receiver", () => {
    expect(detectContext("arr.push(x);\ncon")).toEqual({
      linePrefix: "con",
      wordPrefix: "con",
      receiver: null,
      algo: false,
    });
  });

  it("chuỗi rỗng / chỉ khoảng trắng", () => {
    expect(detectContext("")).toEqual({ linePrefix: "", wordPrefix: "", receiver: null, algo: false });
    expect(detectContext("  ")).toEqual({ linePrefix: "  ", wordPrefix: "", receiver: null, algo: false });
  });
});

describe("extractVars", () => {
  it("nhận diện Array/Map/Set/String", () => {
    const vars = extractVars('const nums = [];\nlet m = new Map();\nconst s = new Set();\nconst t = "abc";');
    expect(vars.get("nums")).toBe("Array");
    expect(vars.get("m")).toBe("Map");
    expect(vars.get("s")).toBe("Set");
    expect(vars.get("t")).toBe("String");
  });

  it("khai báo sau ghi đè", () => {
    const vars = extractVars("let x = [];\nx = new Map();");
    expect(vars.get("x")).toBe("Map");
  });
});

describe("suggest", () => {
  const code = 'const stack = [];\nconst map = new Map();\nconst s = "abc";';

  it("receiver Array + prefix 'pu' → push đầu tiên, không lẫn Map method", () => {
    const items = suggestForCode(code, "stack.pu");
    expect(items[0].label).toBe("push");
    expect(items.every((i) => i.receiverTypes?.includes("Array"))).toBe(true);
  });

  it("receiver Map + prefix rỗng → chỉ method Map", () => {
    const items = suggestForCode(code, "map.");
    expect(items.map((i) => i.label)).toContain("set");
    expect(items.every((i) => !i.receiverTypes?.includes("Array"))).toBe(true);
  });

  it("receiver String → charAt", () => {
    const items = suggestForCode(code, "s.cha");
    expect(items[0].label).toBe("charAt");
  });

  it("receiver không biết type → rỗng", () => {
    expect(suggestForCode(code, "unknownVar.")).toEqual([]);
  });

  it("word 'for' → snippet fori, không có pattern", () => {
    const items = suggestForCode(code, "for");
    expect(items.some((i) => i.id === "snippet.fori")).toBe(true);
    expect(items.every((i) => i.kind !== "pattern")).toBe(true);
  });

  it("'al/' → chỉ thuật toán mẫu", () => {
    const items = suggestForCode(code, "al/");
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.kind === "pattern")).toBe(true);
  });

  it("word 'bs' thường → không còn pattern", () => {
    const items = suggestForCode(code, "bs");
    expect(items.some((i) => i.id === "pattern.bs")).toBe(false);
  });

  it("'al/bs' → pattern binary search", () => {
    const items = suggestForCode(code, "al/bs");
    expect(items[0].id).toBe("pattern.bs");
  });

  it("1 ký tự → chỉ keyword + snippet (không API)", () => {
    const items = suggestForCode(code, "c");
    expect(items.every((i) => i.kind !== "api")).toBe(true);
    expect(items.some((i) => i.label === "const")).toBe(true);
  });

  it("cap 10 kết quả", () => {
    const items = suggestForCode(code, "s");
    expect(items.length).toBeLessThanOrEqual(10);
  });

  it("suggest(ctx, vars) hoạt động như suggestForCode", () => {
    const ctx = detectContext("map.se");
    const items = suggest(ctx, extractVars(code));
    expect(items[0].label).toBe("set");
  });
});
