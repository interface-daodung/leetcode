/**
 * Kiểu dữ liệu chuẩn cho @leetcode/javascript-docs
 * Được sinh từ Kernix13/javascript-cheat-sheet (13 file .md → JSON có cấu trúc)
 */

export interface Example {
  /** Code mẫu (đã strip fence) */
  code: string;
  /** Giải thích ngắn gọn (lấy từ summary của section) */
  explanation: string;
}

export interface DocSection {
  /** id duy nhất dạng `<category>-<slug>` ví dụ `array-push` */
  id: string;
  /** tiêu đề gốc của heading (đã clean markdown) */
  title: string;
  /** cấp heading 2|3|4 */
  headingLevel: number;
  /** anchor dạng `#push` */
  anchor: string;
  /** tóm tắt 1 câu trích từ đoạn đầu của section */
  summary: string;
  /** keywords đã chuẩn hoá lowercase — dùng để search & gợi ý lệnh */
  keywords: string[];
  /** dòng syntax nếu trích được từ code block đầu */
  syntax: string | null;
  /** mô tả giá trị trả về nếu phát hiện `returns ...` */
  returns: string | null;
  /** true=mutates array, false=không mutate, null=không rõ */
  mutates: boolean | null;
  /** link MDN nếu có trong section */
  mdnUrl: string | null;
  /** các ví dụ code */
  examples: Example[];
  /** bảng markdown (tối đa 2) — chủ yếu cho README cheatsheet */
  tables: string[];
  /** các anchor liên quan trong cùng file */
  related: string[];
  /** nội dung thô (đã truncate 4000 chars) */
  content: string;
  /** chuỗi searchText đã lower-case hoá: title + summary + syntax + keywords */
  searchText: string;
  /** file nguồn ví dụ `array-examples.md` */
  sourceFile: string;
  /** category chuẩn hoá ví dụ `array`, `string`, `cheatsheet` */
  category: string;
}

export interface DocFile {
  sourceFile: string;
  sourceUrl: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  totalSections: number;
  sections: DocSection[];
}

export interface IndexEntry {
  id: string;
  title: string;
  category: string;
  sourceFile: string;
  anchor: string;
  summary: string;
  keywords: string[];
  syntax: string | null;
  returns: string | null;
  mutates: boolean | null;
  mdnUrl: string | null;
  searchText: string;
  tags: string[];
}

export interface KeywordIndex {
  [keyword: string]: string[]; // keyword → list of entry ids
}

export interface DocsIndex {
  version: string;
  lang: string;
  generatedAt: string;
  generator: string;
  sourceRepo: string;
  totalSources: number;
  totalEntries: number;
  categories: string[];
  entries: IndexEntry[];
  keywordIndex: KeywordIndex;
  sources: { file: string; title: string; category: string; sections: number }[];
}

// Legacy — giữ để tương thích ngược
export interface DocEntry {
  topic: string;
  content: string;
  examples: string[];
}
