import { describe, it, expect } from "vitest";
import { stripComments, extractFunctionName, extractSolutionFunction, wrapSolution } from "./solution.util.js";

describe("stripComments", () => {
  it("giữ nguyên code không comment", () => {
    expect(stripComments("var x = 1;")).toBe("var x = 1;");
  });
  it("xóa // comment", () => {
    expect(stripComments("var x = 1; // inline")).toBe("var x = 1; ");
  });
  it("xóa /* */ comment", () => {
    expect(stripComments("var x = /* block */ 1;")).toBe("var x =  1;");
  });
  it("giữ nguyên chuỗi có //", () => {
    expect(stripComments("var x = '//';")).toBe("var x = '//';");
  });
  it("giữ nguyên template literal", () => {
    expect(stripComments("var x = `/* not comment */`;")).toBe("var x = `/* not comment */`;");
  });
});

describe("extractFunctionName", () => {
  it("function declaration", () => {
    expect(extractFunctionName("function foo(x) {}")).toBe("foo");
  });
  it("var assignment", () => {
    expect(extractFunctionName("var foo = function(x) {}")).toBe("foo");
  });
  it("let assignment arrow", () => {
    expect(extractFunctionName("let foo = (x) => x + 1")).toBe("foo");
  });
  it("async function", () => {
    expect(extractFunctionName("const foo = async function() {}")).toBe("foo");
  });
  it("null khi không có hàm", () => {
    expect(extractFunctionName("var x = 1;")).toBeNull();
  });
});

describe("extractSolutionFunction", () => {
  it("function declaration", () => {
    const fn = extractSolutionFunction("function twoSum(nums, target) { return [0,1]; }");
    expect(fn).toBeInstanceOf(Function);
    expect(fn([1, 2], 3)).toEqual([0, 1]);
  });
  it("var assignment", () => {
    const fn = extractSolutionFunction("var twoSum = function(nums, target) { return [0,1]; };");
    expect(fn).toBeInstanceOf(Function);
    expect(fn([1, 2], 3)).toEqual([0, 1]);
  });
  it("const arrow", () => {
    const fn = extractSolutionFunction("const twoSum = (nums, target) => [0, 1];");
    expect(fn).toBeInstanceOf(Function);
    expect(fn([1, 2], 3)).toEqual([0, 1]);
  });
  it("lọc comment trước khi trích", () => {
    const code = `
      /**
       * @param {number[]} nums
       * @param {number} target
       */
      var removeNthFromEnd = function(head, n) {
        return head;
      };
    `;
    const fn = extractSolutionFunction(code);
    expect(fn).toBeInstanceOf(Function);
  });
  it("ném lỗi khi không có hàm", () => {
    expect(() => extractSolutionFunction("var x = 1;")).toThrow();
  });
  it("ném lỗi khi code rỗng", () => {
    expect(() => extractSolutionFunction("// only comment")).toThrow();
  });
});

describe("wrapSolution", () => {
  it("truyền array input làm spread arguments", () => {
    const fn = ((a: number, b: number) => a + b) as unknown as (...args: unknown[]) => unknown;
    const wrapped = wrapSolution(fn);
    expect(wrapped([3, 4])).toBe(7);
  });
  it("truyền object input làm spread values", () => {
    const fn = ((a: number, b: number) => a + b) as unknown as (...args: unknown[]) => unknown;
    const wrapped = wrapSolution(fn);
    expect(wrapped({ a: 3, b: 4 })).toBe(7);
  });
  it("truyền scalar input không spread", () => {
    const fn = ((x: number) => x * 2) as unknown as (...args: unknown[]) => unknown;
    const wrapped = wrapSolution(fn);
    expect(wrapped(5)).toBe(10);
  });
});