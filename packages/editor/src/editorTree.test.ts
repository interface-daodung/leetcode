import { describe, it, expect } from "vitest";
import {
  createEditorTree,
  createEditorTreeFromProblem,
  openFile,
  updateCode,
  markSaved,
  closeFile,
  setActive,
  findNode,
  toFlatFiles,
  createFileFromLanguage,
} from "./editorTree.js";

describe("EditorTree", () => {
  it("createEditorTree tạo root rỗng, active null", () => {
    const s = createEditorTree();
    expect(s.root.type).toBe("root");
    expect(s.root.children).toEqual([]);
    expect(s.activeId).toBeNull();
  });

  it("openFile thêm file mới và set active", () => {
    let s = createEditorTree();
    s = openFile(s, "file-1", "two-sum.js", "javascript", "// code");
    expect(s.root.children).toHaveLength(1);
    expect(s.activeId).toBe("file-1");
    const f = findNode(s, "file-1");
    expect(f?.name).toBe("two-sum.js");
    expect(f?.code).toBe("// code");
    expect(f?.dirty).toBe(false);
  });

  it("openFile trên file đã có chỉ đổi active, không nhân bản", () => {
    let s = createEditorTree();
    s = openFile(s, "a", "a.js");
    s = openFile(s, "b", "b.js");
    s = openFile(s, "a", "a.js");
    expect(s.root.children).toHaveLength(2);
    expect(s.activeId).toBe("a");
  });

  it("updateCode sửa code + đánh dấu dirty", () => {
    let s = createEditorTree();
    s = openFile(s, "a", "a.js");
    s = updateCode(s, "a", "new code");
    expect(findNode(s, "a")?.code).toBe("new code");
    expect(findNode(s, "a")?.dirty).toBe(true);
    // updateCode trên id không tồn tại → không đổi
    expect(updateCode(s, "nope", "x")).toBe(s);
  });

  it("markSaved hết dirty", () => {
    let s = createEditorTree();
    s = openFile(s, "a", "a.js");
    s = updateCode(s, "a", "x");
    s = markSaved(s, "a");
    expect(findNode(s, "a")?.dirty).toBe(false);
    expect(findNode(s, "a")?.savedAt).toBeTypeOf("number");
  });

  it("closeFile xóa file, active chuyển sang file kế bên", () => {
    let s = createEditorTree();
    s = openFile(s, "a", "a.js");
    s = openFile(s, "b", "b.js");
    s = setActive(s, "b");
    s = closeFile(s, "b");
    expect(findNode(s, "b")).toBeUndefined();
    expect(s.root.children).toHaveLength(1);
    expect(s.activeId).toBe("a");
  });

  it("closeFile active file cuối → active null", () => {
    let s = createEditorTree();
    s = openFile(s, "only", "only.js");
    s = closeFile(s, "only");
    expect(s.root.children).toEqual([]);
    expect(s.activeId).toBeNull();
  });

  it("setActive chỉ chấp nhận id tồn tại", () => {
    let s = createEditorTree();
    s = openFile(s, "a", "a.js");
    s = setActive(s, "bogus");
    expect(s.activeId).toBe("a");
    s = setActive(s, null);
    expect(s.activeId).toBeNull();
  });

  it("toFlatFiles trả danh sách phẳng (group không lọt)", () => {
    let s = createEditorTree();
    s = openFile(s, "a", "a.js");
    s = openFile(s, "b", "b.ts");
    const files = toFlatFiles(s);
    expect(files.map((f) => f.name)).toEqual(["a.js", "b.ts"]);
  });

  it("createEditorTreeFromProblem tạo 1 file từ template", () => {
    const s = createEditorTreeFromProblem({
      id: 1,
      slug: "two-sum",
      title: "Two Sum",
      difficulty: "easy",
      tags: [],
      template: "function twoSum() {}",
    });
    expect(s.activeId).not.toBeNull();
    const files = toFlatFiles(s);
    expect(files).toHaveLength(1);
    expect(files[0].code).toBe("function twoSum() {}");
    expect(files[0].name).toContain("Two Sum");
  });

  it("createFileFromLanguage dùng template theo language", () => {
    expect(createFileFromLanguage("x.py", "python").code).toContain("def solution");
    expect(createFileFromLanguage("x.ts", "typescript").code).toContain("function solution");
  });
});
