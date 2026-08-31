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
  extractHints,
  extractTemplate,
  extractTestCases,
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

  it("valid với hints + template + url", () => {
    expect(
      isValidProblemClip({
        id: 5,
        slug: "a",
        title: "T",
        url: "https://leetcode.com/problems/two-sum/",
        difficulty: "easy",
        tags: [],
        description: "<p>hi</p>",
        template: "function solve(){}",
        hints: ["hint1", "hint2"],
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

describe("extractHints", () => {
  it("lấy 1 hint từ mẫu HTML lightbulb", () => {
    document.body.innerHTML = `
      <div><div class="flex flex-col"><div class="group flex cursor-pointer items-center transition-colors text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1"><div class="flex-1 text-sm leading-[22px]"><div class="flex items-center gap-2 text-sd-foreground"><div class="relative text-[16px] leading-[normal] p-0.5 before:block before:h-4 before:w-4 fill-none stroke-current"><svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height="1em" width="0.75em" class="svg-inline--fa fa-lightbulb absolute h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em] left-1/2 top-1/2"><path fill="currentColor" d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5H109c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8l0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4l0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5H226.4c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8l0 0 0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80V416H272v16c0 44.2-35.8 80-80 80z"></path></svg></div><div class="text-body">Hint 1</div></div></div><div class="text-[24px] transition-colors text-gray-4 dark:text-dark-gray-4 group-hover:text-gray-5 dark:group-hover:text-dark-gray-5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" class="origin-center transition-transform rotate-180"><path fill-rule="evenodd" d="M16.293 9.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L12 13.586l4.293-4.293z" clip-rule="evenodd"></path></svg></div></div><div class="overflow-hidden transition-all" style="height: auto; transition-duration: 0.25s;"><div class="mt-2 pl-7 text-body text-sd-foreground HTMLContent_html__0OZLp">Maintain two pointers and update one with a delay of n steps.</div></div></div></div>
    `;
    const hints = extractHints(document);
    expect(hints).toHaveLength(1);
    expect(hints[0]).toContain("Maintain two pointers");
  });

  it("lấy 3 hints", () => {
    document.body.innerHTML = `
      <div class="flex flex-col"><div class="group"><div class="text-body">Hint 1</div></div><div class="overflow-hidden"><div>Hint content 1</div></div></div>
      <div class="flex flex-col"><div class="group"><div class="text-body">Hint 2</div></div><div class="overflow-hidden"><div>Hint content 2</div></div></div>
      <div class="flex flex-col"><div class="group"><div class="text-body">Hint 3</div></div><div class="overflow-hidden"><div>Hint content 3</div></div></div>
    `;
    const hints = extractHints(document);
    expect(hints).toEqual(["Hint content 1", "Hint content 2", "Hint content 3"]);
  });

  it("trả [] nếu không có hint", () => {
    document.body.innerHTML = `<div data-track-load="description_content"><p>desc</p></div>`;
    expect(extractHints(document)).toEqual([]);
  });
});

describe("extractTemplate", () => {
  it("lấy template từ monaco view-line", () => {
    document.body.innerHTML = `
      <div class="monaco-editor"><div class="view-lines"><div class="view-line">function twoSum(nums, target) {</div><div class="view-line">  return [];</div><div class="view-line">}</div></div></div>
    `;
    const tpl = extractTemplate(document);
    expect(tpl).toContain("function twoSum");
  });

  it("trả undefined nếu không có editor", () => {
    document.body.innerHTML = `<div><p>no editor</p></div>`;
    expect(extractTemplate(document)).toBeUndefined();
  });
});

describe("buildProblemClip với hints/template/url", () => {
  it("build kèm hints và template và url", () => {
    document.body.innerHTML = `
      <div class="text-title-large"><a href="/problems/two-sum/">1. Two Sum</a></div>
      <div class="text-difficulty-easy">Easy</div>
      <div data-track-load="description_content"><p>desc</p></div>
      <div class="flex flex-col"><div class="group"><div class="text-body">Hint 1</div></div><div class="overflow-hidden"><div>Hint A</div></div></div>
      <div class="monaco-editor"><div class="view-lines"><div class="view-line">function solve(){}</div></div></div>
    `;
    document.title = "Two Sum - LeetCode";
    const clip = buildProblemClip(document, "https://leetcode.com/problems/two-sum/");
    expect(clip).not.toBeNull();
    expect(clip!.url).toBe("https://leetcode.com/problems/two-sum/");
    expect(clip!.hints).toEqual(["Hint A"]);
    expect(clip!.template).toContain("function solve");
  });
});

describe("extractTemplate với DOM code_editor mẫu mới", () => {
  it("lấy template từ data-track-load=code_editor với monaco view-lines (ListNode)", () => {
    document.body.innerHTML = `
      <div class="flex flex-col min-h-0 flex-1 pb-2" data-track-load="code_editor" translate="no">
        <div class="relative min-h-0 flex-1">
          <div class="relative h-full w-full" data-keybinding-context="1" data-mode-id="javascript">
            <div class="monaco-editor no-user-select showUnused showDeprecated vs-dark" role="code" data-uri="inmemory://model/1" style="width: 493px; height: 218px;">
              <div data-mprt="3" class="overflow-guard" style="width: 493px; height: 218px;">
                <div class="view-lines monaco-mouse-cursor-text" role="presentation">
                  <div class="view-line"><span><span class="mtk3">/**</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> * Definition for singly-linked list.</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> * function ListNode(val, next) {</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> *     this.val = (val===undefined ? 0 : val)</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> *     this.next = (next===undefined ? null : next)</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> * }</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> */</span></span></div>
                  <div class="view-line"><span><span class="mtk3">/**</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> * @param {ListNode} head</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> * @param {number} n</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> * @return {ListNode}</span></span></div>
                  <div class="view-line"><span><span class="mtk3"> */</span></span></div>
                  <div class="view-line"><span><span class="mtk3">var removeNthFromEnd = function(head, n) {</span></span></div>
                  <div class="view-line"><span><span class="mtk3">    </span></span></div>
                  <div class="view-line"><span><span class="mtk3">};</span></span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const tpl = extractTemplate(document);
    expect(tpl).toBeDefined();
    expect(tpl).toContain("ListNode");
    expect(tpl).toContain("removeNthFromEnd");
    expect(tpl).toContain("@param");
  });

  it("fallback lấy template từ __NEXT_DATA__ khi monaco không có", () => {
    document.body.innerHTML = `
      <div><p>no editor</p></div>
      <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"question":{"codeSnippets":[{"lang":"javascript","code":"function hello() { return 1; }"},{"lang":"python","code":"def hello():"}]}}}}</script>
    `;
    const tpl = extractTemplate(document);
    expect(tpl).toContain("function hello");
  });
});

describe("extractTestCases", () => {
  it("lấy 3 testCases từ hidden cm-content (opacity-0) — mẫu console Wrong Answer", () => {
    document.body.innerHTML = `
      <div class="flex-1 overflow-y-auto"><div><div class="space-y-4 px-5 py-4"><div>Case 3 active</div></div></div></div>
      <div class="mt-0 h-0 overflow-hidden opacity-0">
        <div class="h-full space-y-2">
          <div class="flex flex-col pt-4"><div class="text-xs font-medium">Input</div><div class="px-4"><div class="cm-editor"><div class="cm-content"><div class="cm-line">[1,2,3,4,5]</div><div class="cm-line">2</div><div class="cm-line">[1]</div><div class="cm-line">1</div><div class="cm-line">[1,2]</div><div class="cm-line">1</div></div></div></div></div>
          <div class="flex flex-col pt-4"><div class="text-xs font-medium">Output</div><div class="px-4"><div class="cm-editor"><div class="cm-content"><div class="cm-line">undefined</div><div class="cm-line">undefined</div><div class="cm-line">undefined</div></div></div></div></div>
          <div class="pb-4"><div class="flex flex-col pt-4"><div class="text-xs font-medium">Expected</div><div class="px-4"><div class="cm-editor"><div class="cm-content"><div class="cm-line">[1,2,3,5]</div><div class="cm-line">[]</div><div class="cm-line">[1]</div></div></div></div></div></div>
        </div>
      </div>
      <!-- visible labels để param names -->
      <div><div class="mx-3 mb-2 text-xs">head =</div><div class="mx-3 mb-2 text-xs">n =</div></div>
    `;
    const tcs = extractTestCases(document);
    expect(tcs).toBeDefined();
    expect(tcs).toHaveLength(3);
    expect(tcs![0].expected).toEqual([1,2,3,5]);
    expect(tcs![1].expected).toEqual([]);
    expect(tcs![2].expected).toEqual([1]);
    // input của case 0 phải có head và n
    expect(tcs![0].input).toEqual({ head: [1,2,3,4,5], n: 2 });
    expect(tcs![1].input).toEqual({ head: [1], n: 1 });
  });

  it("lấy 1 testCase từ visible console khi không có hidden", () => {
    document.body.innerHTML = `
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-4">
          <div><div class="mx-3 mb-2 text-xs">head =</div><div class="font-menlo">[1,2]</div></div>
          <div><div class="mx-3 mb-2 text-xs">n =</div><div class="font-menlo">1</div></div>
          <div><span class="text-green-s">[1]</span></div>
        </div>
      </div>
    `;
    const tcs = extractTestCases(document);
    expect(tcs).toBeDefined();
    expect(tcs).toHaveLength(1);
    expect(tcs![0].input).toEqual({ head: [1,2], n: 1 });
    expect(tcs![0].expected).toEqual([1]);
  });

  it("trả undefined nếu không có test case", () => {
    document.body.innerHTML = `<div><p>no console</p></div>`;
    expect(extractTestCases(document)).toBeUndefined();
  });

  it("parse testCases từ __NEXT_DATA__ fallback", () => {
    document.body.innerHTML = `
      <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"question":{"testCases":[{"input":{"nums":[2,7,11,15],"target":9},"expected":[0,1]}]}}}}</script>
    `;
    const tcs = extractTestCases(document);
    expect(tcs).toEqual([{ input: { nums: [2,7,11,15], target: 9 }, expected: [0,1] }]);
  });
});

describe("buildProblemClip với testCases", () => {
  it("build kèm testCases từ hidden editor", () => {
    document.body.innerHTML = `
      <div class="text-title-large"><a href="/problems/remove-nth-node-from-end-of-list/">19. Remove Nth Node From End of List</a></div>
      <div class="text-difficulty-medium">Medium</div>
      <div data-track-load="description_content"><p>Given linked list</p></div>
      <div class="flex flex-col min-h-0 flex-1 pb-2" data-track-load="code_editor"><div class="monaco-editor"><div class="view-lines"><div class="view-line">var removeNthFromEnd = function(head, n) {</div><div class="view-line">};</div></div></div></div>
      <div class="mt-0 h-0 overflow-hidden opacity-0">
        <div><div class="flex flex-col pt-4"><div class="text-xs font-medium">Input</div><div class="cm-content"><div class="cm-line">[1,2,3,4,5]</div><div class="cm-line">2</div></div></div>
        <div class="flex flex-col pt-4"><div class="text-xs font-medium">Expected</div><div class="cm-content"><div class="cm-line">[1,2,3,5]</div></div></div></div>
      </div>
      <div><div class="mx-3 mb-2 text-xs">head =</div><div class="mx-3 mb-2 text-xs">n =</div></div>
    `;
    const clip = buildProblemClip(document, "https://leetcode.com/problems/remove-nth-node-from-end-of-list/");
    expect(clip).not.toBeNull();
    expect(clip!.testCases).toBeDefined();
    expect(clip!.testCases).toHaveLength(1);
    expect(clip!.testCases![0].expected).toEqual([1,2,3,5]);
    expect(clip!.template).toContain("removeNthFromEnd");
  });
});

describe("regression: shortestPathBinaryMatrix — template không bị nhiễm shipWithinDays", () => {
  it("ưu tiên code_editor thay vì window.monaco cũ", () => {
    // Mô phỏng window.monaco có model cũ shipWithinDays, nhưng code_editor có shortestPath
    (window as unknown as Record<string, unknown>)["monaco"] = {
      editor: {
        getModels: () => [
          { getValue: () => "var shipWithinDays = function(weights, days) {}", getLanguageId: () => "javascript" },
          { getValue: () => "var shortestPathBinaryMatrix = function(grid) {}", getLanguageId: () => "javascript" },
        ],
      },
    };
    document.body.innerHTML = `
      <div data-track-load="description_content"><p>Given an n x n binary matrix grid</p><pre><strong>Input:</strong> grid = [[0,1],[1,0]]\n<strong>Output:</strong> 2</pre></div>
      <div class="text-title-large"><a href="/problems/shortest-path-in-binary-matrix/">1091. Shortest Path in Binary Matrix</a></div>
      <div class="flex flex-col min-h-0 flex-1 pb-2" data-track-load="code_editor"><div class="monaco-editor"><div class="view-lines"><div class="view-line">var shortestPathBinaryMatrix = function(grid) {</div><div class="view-line">};</div></div></div></div>
      <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"question":{"codeSnippets":[{"lang":"javascript","code":"var shortestPathBinaryMatrix = function(grid) {\\n    \\n};"}]}}}}</script>
    `;
    const tpl = extractTemplate(document);
    expect(tpl).toContain("shortestPathBinaryMatrix");
    expect(tpl).not.toContain("shipWithinDays");
    // cleanup
    delete (window as unknown as Record<string, unknown>)["monaco"];
  });

  it("fallback __NEXT_DATA__ khi code_editor trống, không lấy shipWithinDays từ monaco", () => {
    (window as unknown as Record<string, unknown>)["monaco"] = {
      editor: {
        getModels: () => [{ getValue: () => "var shipWithinDays = function(weights, days) {}", getLanguageId: () => "javascript" }],
      },
    };
    document.body.innerHTML = `
      <div data-track-load="description_content"><p>desc</p></div>
      <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"question":{"codeSnippets":[{"lang":"javascript","code":"var shortestPathBinaryMatrix = function(grid) {\\n};"}]}}}}</script>
    `;
    const tpl = extractTemplate(document);
    expect(tpl).toContain("shortestPathBinaryMatrix");
    expect(tpl).not.toContain("shipWithinDays");
    delete (window as unknown as Record<string, unknown>)["monaco"];
  });

  it("extractTestCases từ description <pre> cho shortestPathBinaryMatrix", () => {
    document.body.innerHTML = `
      <div data-track-load="description_content">
        <p>Given an <code>n x n</code> binary matrix <code>grid</code></p>
        <pre><strong>Input:</strong> grid = [[0,1],[1,0]]\n<strong>Output:</strong> 2</pre>
        <pre><strong>Input:</strong> grid = [[0,0,0],[1,1,0],[1,1,0]]\n<strong>Output:</strong> 4</pre>
        <pre><strong>Input:</strong> grid = [[1,0,0],[1,1,0],[1,1,0]]\n<strong>Output:</strong> -1</pre>
      </div>
    `;
    const tcs = extractTestCases(document);
    expect(tcs).toBeDefined();
    expect(tcs).toHaveLength(3);
    expect(tcs![0].input).toEqual({ grid: [[0,1],[1,0]] });
    expect(tcs![0].expected).toBe(2);
    expect(tcs![1].expected).toBe(4);
    expect(tcs![2].expected).toBe(-1);
  });

  it("buildProblemClip đầy đủ cho 1091 với 3 testCases từ description", () => {
    document.body.innerHTML = `
      <div class="text-title-large"><a href="/problems/shortest-path-in-binary-matrix/">1091. Shortest Path in Binary Matrix</a></div>
      <div class="text-difficulty-medium">Medium</div>
      <div data-track-load="description_content">
        <p>Given an <code>n x n</code> binary matrix <code>grid</code></p>
        <pre><strong>Input:</strong> grid = [[0,1],[1,0]]\n<strong>Output:</strong> 2</pre>
        <pre><strong>Input:</strong> grid = [[0,0,0],[1,1,0],[1,1,0]]\n<strong>Output:</strong> 4</pre>
        <pre><strong>Input:</strong> grid = [[1,0,0],[1,1,0],[1,1,0]]\n<strong>Output:</strong> -1</pre>
      </div>
      <div class="flex flex-col min-h-0 flex-1 pb-2" data-track-load="code_editor"><div class="monaco-editor"><div class="view-lines"><div class="view-line">var shortestPathBinaryMatrix = function(grid) {</div><div class="view-line">};</div></div></div></div>
    `;
    const clip = buildProblemClip(document, "https://leetcode.com/problems/shortest-path-in-binary-matrix/description/");
    expect(clip).not.toBeNull();
    expect(clip!.id).toBe(1091);
    expect(clip!.slug).toBe("shortest-path-in-binary-matrix");
    expect(clip!.template).toContain("shortestPathBinaryMatrix");
    expect(clip!.template).not.toContain("shipWithinDays");
    expect(clip!.testCases).toBeDefined();
    expect(clip!.testCases).toHaveLength(3);
    expect(clip!.testCases![0].expected).toBe(2);
  });
});
