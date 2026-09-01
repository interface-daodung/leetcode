# @leetcode/javascript-docs

Kho reference JavaScript có cấu trúc, được sinh từ [Kernix13/javascript-cheat-sheet](https://github.com/Kernix13/javascript-cheat-sheet) — clone vào `tmp_reference/` và parse thành JSON để search không cần đọc lại Markdown.

## Cấu trúc thư mục

```
packages/javascript-docs/
├── tmp_reference/          # bản clone (đã xóa .git) — 13 file .md gốc (tiếng Anh)
│   ├── README.md           # cheatsheet tổng quan (839 lines)
│   ├── array-examples.md   # 37 sections
│   ├── string-examples.md  # 23 sections
│   ├── object-examples.md  # 24 sections
│   ├── function-examples.md# 37 sections
│   ├── loop-examples.md, conditionals-examples.md, number-date-examples.md, regex-examples.md, ...
│   └── _source.md          # ghi chú nguồn & ngày clone
├── tmp_reference_vi/       # bản dịch tiếng Việt — 13 file .md (song song với tmp_reference/)
│   └── ... (cùng 13 file, giữ nguyên code block & URL, chỉ dịch văn bản tự nhiên)
├── src/
│   ├── types.ts            # DocSection, DocFile, DocsIndex (có field lang), IndexEntry, KeywordIndex
│   ├── search.ts           # searchDocs() + searchDocsVi() + getById/getByCategory/getByKeyword/... + Vi
│   ├── index.ts            # re-export + legacy jsDocs giữ tương thích
│   └── data/               # JSON đã sinh (commit cùng repo)
│       ├── en/             # JSON tiếng Anh
│       │   ├── index.json  # master index: 287 entries, 435 keywords, lang="en"
│       │   ├── all.json    # gộp toàn bộ docs + index
│       │   ├── array-examples.json
│       │   └── ... (1 JSON / 1 MD)
│       └── vi/             # JSON tiếng Việt (cùng 287 entries, 531 keywords, lang="vi")
│           ├── index.json
│           ├── all.json
│           └── ... (1 JSON / 1 MD)
└── scripts/
    └── generate.py         # script Python sinh lại JSON từ tmp_reference/ hoặc tmp_reference_vi/ (--lang en|vi|all)
```

## JSON Schema

Mỗi `*.json` trong `src/data/en/` hoặc `src/data/vi/` (ví dụ `array-examples.json`):

```json
{
  "sourceFile": "array-examples.md",
  "sourceUrl": "https://github.com/Kernix13/javascript-cheat-sheet/blob/main/array-examples.md",
  "category": "array",
  "title": "Array method examples",
  "description": "...",
  "tags": ["array", "collection", "list"],
  "totalSections": 37,
  "sections": [
    {
      "id": "array-push",
      "title": "push",
      "headingLevel": 3,
      "anchor": "#push",
      "summary": "Adds one or more elements to the end of an array and returns the new length...",
      "keywords": ["array", "push", "mutate", "length"],
      "syntax": "arr.push(val1, val2, ...)",
      "returns": "the new length",
      "mutates": true,
      "mdnUrl": "https://developer.mozilla.org/.../Array/push",
      "examples": [{ "code": "let arr = ['a','b']; arr.push('e')", "explanation": "..." }],
      "tables": [],
      "related": ["unshift"],
      "content": "... (4000 chars)",
      "searchText": "push adds one or more elements...",
      "sourceFile": "array-examples.md",
      "category": "array"
    }
  ]
}
```

`index.json` — master search index (có thêm `lang: "en" | "vi"`):

```json
{
  "version": "1.0.0",
  "lang": "en",
  "generatedAt": "2026-08-31T04:26:12Z",
  "totalSources": 13,
  "totalEntries": 287,
  "categories": ["array","cheatsheet","conditional","fcc","function","loop","notes","number-date","object","practical","react","regex","string"],
  "entries": [
    { "id": "array-push", "title": "push", "category": "array", "keywords": ["array","push"], "syntax": "arr.push(...)", "searchText": "...", "summary": "...", "mdnUrl": "..." }
  ],
  "keywordIndex": { "push": ["array-push"], "array": ["array-push","array-pop", ...] },
  "sources": [{ "file": "array-examples.md", "title": "Array method examples", "category": "array", "sections": 37 }]
}
```

Metadata đủ để:
- **Search keyword**: `keywordIndex` map + `searchText` lowercase + `keywords` array
- **Nhắc lệnh (suggest)**: `suggestCommands(prefix)` dùng `title.startsWith` + `keywords`
- **Filter theo category/tags**: `category`, `tags` trên mỗi entry
- **Hiển thị syntax/returns/mutate**: phục vụ tooltip hoặc AI prompt

## Sử dụng

```ts
import { searchDocs, suggestCommands, getByCategory, getById, getIndex, getDocFileSync } from "@leetcode/javascript-docs";

// Tìm kiếm toàn văn (tiếng Anh — mặc định đọc từ src/data/en/)
searchDocs("array push mutate");          // → [{id:"array-push", title:"push", ...}]
searchDocs("string split", { category: "string", limit: 5 });
searchDocs("closure", { keyword: "closure" });

// Gợi ý lệnh cho autocomplete / AI prompt
suggestCommands("arr"); // → ["array-slice", "array-push", ...]
suggestCommands("reg"); // → ["regex-lookaheads", "regex-capture-groups", ...]

// Lấy theo category / keyword
getByCategory("array");      // 37 entries
getByKeyword("push");        // entries chứa keyword push
getById("array-push");       // 1 entry

// Đọc chi tiết section (có examples, tables, content)
import { getSectionByIdSync } from "@leetcode/javascript-docs";
getSectionByIdSync("string-split"); // → DocSection với code mẫu

// Đọc file gốc đầy đủ
const doc = getDocFileSync("array"); // hoặc "array-examples.md"
console.log(doc.sections.length);

// Index thô (để tự build search khác)
const idx = getIndex(); // lang="en"
console.log(idx.totalEntries, idx.keywordIndex["map"]);

// ——— Tiếng Việt (đọc từ src/data/vi/) ———
import { searchDocsVi, suggestCommandsVi, getByCategoryVi, getByIdVi, getIndexVi, getDocFileSyncVi } from "@leetcode/javascript-docs";

searchDocsVi("mảng push");               // tìm bằng tiếng Việt
suggestCommandsVi("mảng");
getByCategoryVi("array");
getByIdVi("array-push");
getDocFileSyncVi("array");
getIndexVi(); // lang="vi", 287 entries, 531 keywords
```

Legacy API vẫn hoạt động (deprecated):

```ts
import { jsDocs, getDoc } from "@leetcode/javascript-docs";
getDoc("Array Methods"); // → {topic, content, examples}
```

## Build & test

```bash
pnpm --filter=@leetcode/javascript-docs build   # tsc --noEmit
pnpm --filter=@leetcode/javascript-docs test    # vitest run --passWithNoTests
pnpm --filter=@leetcode/javascript-docs lint    # eslint src --ext .ts
```

## Regenerate JSON

```bash
# Yêu cầu Python 3.10+
python packages/javascript-docs/scripts/generate.py              # sinh cả en/ và vi/
python packages/javascript-docs/scripts/generate.py --lang en    # chỉ tiếng Anh → src/data/en/
python packages/javascript-docs/scripts/generate.py --lang vi    # chỉ tiếng Việt → src/data/vi/
# hoặc chỉ định lại tmp_reference nếu clone mới:
python scripts/generate.py --src tmp_reference --out src/data/en --lang en
python scripts/generate.py --src tmp_reference_vi --out src/data/vi --lang vi
```

Script sẽ đọc 13 `*.md`, trích headings (h2/h3/h4), code blocks, bảng, MDN links, và sinh `*.json` + `index.json` + `all.json` vào thư mục tương ứng (`en/` hoặc `vi/`).

## tmp_reference

- Nguồn: https://github.com/Kernix13/javascript-cheat-sheet (branch main, clone ngày 2026-08-31)
- Đã xóa `.git` để tránh nested repo; giữ nguyên `.md` để trace nguồn.
- Xem `tmp_reference/_source.md` để biết chi tiết commit gốc.

## Dependency

- `@leetcode/shared` (workspace)
