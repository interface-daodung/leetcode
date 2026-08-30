import { describe, it, expect } from "vitest";
import {
  parseTitle,
  extractSlug,
  normalizeDifficulty,
  findDescriptionContainer,
  findTitleAnchor,
  extractDifficulty,
  extractTags,
  cleanDescription,
  buildProblemClip,
  isValidProblemClip,
} from "./clipper.js";

describe("parseTitle", () => {
  it("parse dạng '5. Title'", () => {
    expect(parseTitle("5. Longest Palindromic Substring")).toEqual({
      id: 5,
      title: "Longest Palindromic Substring",
    });
  });

  it("parse '1. Two Sum'", () => {
    expect(parseTitle("1. Two Sum")).toEqual({ id: 1, title: "Two Sum" });
  });

  it("trim và xử lý space dư", () => {
    expect(parseTitle("  10 .  Hello World  ")).toEqual({ id: 10, title: "Hello World" });
  });

  it("không parse khi thiếu số", () => {
    expect(parseTitle("Longest Palindromic Substring")).toBeNull();
  });

  it("không parse khi rỗng", () => {
    expect(parseTitle("")).toBeNull();
  });
});

describe("extractSlug", () => {
  it("lấy slug từ /problems/slug/", () => {
    expect(extractSlug("/problems/longest-palindromic-substring/")).toBe(
      "longest-palindromic-substring",
    );
  });

  it("lấy slug từ /problems/slug không slash cuối", () => {
    expect(extractSlug("/problems/two-sum")).toBe("two-sum");
  });

  it("trả rỗng nếu không match", () => {
    expect(extractSlug("/other/path")).toBe("");
  });
});

describe("normalizeDifficulty", () => {
  it.each([
    ["Easy", "easy"],
    ["easy", "easy"],
    ["MEDIUM", "medium"],
    ["Hard", "hard"],
  ] as const)("%s → %s", (input, expected) => {
    expect(normalizeDifficulty(input)).toBe(expected);
  });

  it("trả null nếu không hợp lệ", () => {
    expect(normalizeDifficulty("unknown")).toBeNull();
  });
});

describe("findDescriptionContainer", () => {
  it("ưu tiên data-track-load=description_content", () => {
    document.body.innerHTML = `
      <div data-track-load="description_content"><p>Hello</p></div>
      <div data-qd-rendered-description><p>Other</p></div>
    `;
    const el = findDescriptionContainer(document);
    expect(el?.getAttribute("data-track-load")).toBe("description_content");
  });

  it("fallback data-qd-rendered-description", () => {
    document.body.innerHTML = `<div data-qd-rendered-description><p>Fallback</p></div>`;
    expect(findDescriptionContainer(document)).not.toBeNull();
  });

  it("trả null nếu không có", () => {
    document.body.innerHTML = `<div>nope</div>`;
    expect(findDescriptionContainer(document)).toBeNull();
  });
});

describe("extractDifficulty", () => {
  it("lấy từ class text-difficulty-medium", () => {
    document.body.innerHTML = `<div class="text-difficulty-medium">Medium</div>`;
    expect(extractDifficulty(document)).toBe("medium");
  });

  it("lấy từ badge text", () => {
    document.body.innerHTML = `<div><span>Easy</span></div>`;
    expect(extractDifficulty(document)).toBe("easy");
  });

  it("trả null nếu không tìm thấy", () => {
    document.body.innerHTML = `<div></div>`;
    expect(extractDifficulty(document)).toBeNull();
  });
});

describe("findTitleAnchor", () => {
  it("tìm anchor có dạng 'ID. Title'", () => {
    document.body.innerHTML = `
      <div class="text-title-large"><a href="/problems/two-sum/">1. Two Sum</a></div>
      <a href="/problems/other/">Other</a>
    `;
    const a = findTitleAnchor(document);
    expect(a?.getAttribute("href")).toBe("/problems/two-sum/");
  });
});

describe("extractTags", () => {
  it("lấy tags từ a[href^=\"/tag/\"]", () => {
    document.body.innerHTML = `
      <div class="mt-2 flex flex-wrap gap-1 pl-7">
        <a href="/tag/linked-list/">Linked List</a>
        <a href="/tag/two-pointers/">Two Pointers</a>
      </div>
    `;
    expect(extractTags(document)).toEqual(["Linked List", "Two Pointers"]);
  });

  it("lấy tags theo mẫu debai.html (4 topics)", () => {
    document.body.innerHTML = `
      <div class="mt-2 flex flex-wrap gap-1 pl-7">
        <a target="_blank" rel="noopener noreferrer" class="no-underline hover:text-current relative inline-flex items-center justify-center text-caption px-2 py-1 gap-1 rounded-full bg-fill-secondary text-text-secondary" href="/tag/two-pointers/">Two Pointers</a>
        <a target="_blank" rel="noopener noreferrer" class="no-underline hover:text-current relative inline-flex items-center justify-center text-caption px-2 py-1 gap-1 rounded-full bg-fill-secondary text-text-secondary" href="/tag/string/">String</a>
        <a target="_blank" rel="noopener noreferrer" class="no-underline hover:text-current relative inline-flex items-center justify-center text-caption px-2 py-1 gap-1 rounded-full bg-fill-secondary text-text-secondary" href="/tag/dynamic-programming/">Dynamic Programming</a>
        <a target="_blank" rel="noopener noreferrer" class="no-underline hover:text-current relative inline-flex items-center justify-center text-caption px-2 py-1 gap-1 rounded-full bg-fill-secondary text-text-secondary" href="/tag/manacher/">Manacher</a>
      </div>
    `;
    expect(extractTags(document)).toEqual(["Two Pointers", "String", "Dynamic Programming", "Manacher"]);
  });

  it("dedupe tags (không phân biệt hoa thường)", () => {
    document.body.innerHTML = `
      <div><a href="/tag/string/">String</a><a href="/tag/string/">String</a><a href="/tag/STRING/">STRING</a></div>
    `;
    expect(extractTags(document)).toEqual(["String"]);
  });

  it("trả [] nếu không có tag anchor", () => {
    document.body.innerHTML = `<div><a href="/problems/two-sum/">1. Two Sum</a></div>`;
    expect(extractTags(document)).toEqual([]);
  });

  it("loại bỏ tag rỗng và trim whitespace", () => {
    document.body.innerHTML = `<div><a href="/tag/empty/">  </a><a href="/tag/valid/">  Linked   List  </a></div>`;
    expect(extractTags(document)).toEqual(["Linked List"]);
  });
});

describe("cleanDescription", () => {
  it("loại bỏ script/style/iframe/button và giữ p/pre", () => {
    document.body.innerHTML = `
      <div id="c"><p>Hello</p><script>alert(1)</script><style>body{}</style><pre>code</pre><button>click</button></div>
    `;
    const container = document.getElementById("c")!;
    const html = cleanDescription(container);
    expect(html).toContain("<p>Hello</p>");
    expect(html).toContain("<pre>code</pre>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<button>");
  });

  it("thay &nbsp; bằng space", () => {
    document.body.innerHTML = `<div id="c"><p>&nbsp;hello&nbsp;</p></div>`;
    const container = document.getElementById("c")!;
    // jsdom sẽ decode &nbsp; thành \u00a0, nhưng cleanDescription thay thế string "&nbsp;"
    // Nên test với innerHTML chứa &nbsp; literal
    container.innerHTML = "<p>&nbsp;hello&nbsp;</p>";
    const html = cleanDescription(container);
    expect(html).not.toContain("&nbsp;");
  });
});

describe("buildProblemClip", () => {
  it("build đầy đủ từ DOM mẫu de_bai", () => {
    document.body.innerHTML = `
      <div class="text-title-large"><a href="/problems/longest-palindromic-substring/">5. Longest Palindromic Substring</a></div>
      <div class="text-difficulty-medium">Medium</div>
      <div data-track-load="description_content"><p>Given a string <code>s</code></p><pre>Example</pre></div>
    `;
    document.title = "Longest Palindromic Substring - LeetCode";
    const clip = buildProblemClip(document, "https://leetcode.com/problems/longest-palindromic-substring/");
    expect(clip).not.toBeNull();
    expect(clip!.id).toBe(5);
    expect(clip!.slug).toBe("longest-palindromic-substring");
    expect(clip!.title).toBe("Longest Palindromic Substring");
    expect(clip!.difficulty).toBe("medium");
    expect(clip!.description).toContain("Given a string");
    expect(clip!.url).toBe("https://leetcode.com/problems/longest-palindromic-substring/");
    expect(clip!.tags).toEqual([]);
  });

  it("build với tags từ DOM debai.html", () => {
    document.body.innerHTML = `
      <div class="text-title-large"><a href="/problems/longest-palindromic-substring/">5. Longest Palindromic Substring</a></div>
      <div class="text-difficulty-medium">Medium</div>
      <div data-track-load="description_content"><p>desc</p></div>
      <div class="mt-2 flex flex-wrap gap-1 pl-7">
        <a href="/tag/two-pointers/">Two Pointers</a>
        <a href="/tag/string/">String</a>
        <a href="/tag/dynamic-programming/">Dynamic Programming</a>
      </div>
    `;
    const clip = buildProblemClip(document, "https://leetcode.com/problems/longest-palindromic-substring/");
    expect(clip!.tags).toEqual(["Two Pointers", "String", "Dynamic Programming"]);
  });

  it("build với 1 tag Linked List như feedback", () => {
    document.body.innerHTML = `
      <div class="text-title-large"><a href="/problems/add-two-numbers/">2. Add Two Numbers</a></div>
      <div class="text-difficulty-medium">Medium</div>
      <div data-track-load="description_content"><p>desc</p></div>
      <a target="_blank" rel="noopener noreferrer" class="no-underline hover:text-current relative inline-flex items-center justify-center text-caption px-2 py-1 gap-1 rounded-full bg-fill-secondary text-text-secondary" href="/tag/linked-list/">Linked List</a>
    `;
    const clip = buildProblemClip(document, "https://leetcode.com/problems/add-two-numbers/");
    expect(clip!.tags).toEqual(["Linked List"]);
  });

  it("trả null nếu không có description", () => {
    document.body.innerHTML = `<div></div>`;
    expect(buildProblemClip(document, "https://leetcode.com/problems/two-sum/")).toBeNull();
  });

  it("fallback slug từ URL nếu thiếu anchor", () => {
    document.body.innerHTML = `<div data-track-load="description_content"><p>desc</p></div>`;
    const clip = buildProblemClip(document, "https://leetcode.com/problems/two-sum/");
    expect(clip!.slug).toBe("two-sum");
  });
});

describe("isValidProblemClip", () => {
  it("valid", () => {
    expect(
      isValidProblemClip({
        id: 5,
        slug: "a",
        title: "T",
        difficulty: "easy",
        tags: [],
        description: "<p>hi</p>",
      }),
    ).toBe(true);
  });

  it("invalid nếu thiếu title", () => {
    expect(
      isValidProblemClip({
        id: 5,
        slug: "a",
        title: "",
        difficulty: "easy",
        tags: [],
        description: "<p>hi</p>",
      }),
    ).toBe(false);
  });

  it("invalid nếu id = 0", () => {
    expect(
      isValidProblemClip({
        id: 0,
        slug: "a",
        title: "T",
        difficulty: "easy",
        tags: [],
        description: "<p>hi</p>",
      }),
    ).toBe(false);
  });
});
