import { describe, it, expect } from "vitest";
import { findFunctionBodyLine } from "./playground.service.js";

describe("findFunctionBodyLine", () => {
  it("function declaration", () => {
    const code = "function twoSum(nums, target) {\n  return [0, 1];\n}";
    expect(findFunctionBodyLine(code)).toBe(1);
  });

  it("template với JSDoc comment + var assignment", () => {
    const code = `/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function(head, n) {
    const dummy = new ListNode(0, head);
    return dummy.next;
};`;
    // Dòng mở `{` thân hàm nằm ở dòng 6 (cùng dòng var...)
    expect(findFunctionBodyLine(code)).toBe(6);
  });

  it("const arrow có body multi-line", () => {
    const code = "const twoSum = (nums, target) => {\n  return [0, 1];\n};";
    expect(findFunctionBodyLine(code)).toBe(1);
  });

  it("code rỗng → fallback 1", () => {
    expect(findFunctionBodyLine("")).toBe(1);
  });

  it("chỉ comment → fallback 1", () => {
    expect(findFunctionBodyLine("// just comment\n/* block */")).toBe(1);
  });

  it("bỏ qua comment chứa {", () => {
    const code = "/* { not a body */\nfunction foo() {\n  return 1;\n}";
    expect(findFunctionBodyLine(code)).toBe(2);
  });
});