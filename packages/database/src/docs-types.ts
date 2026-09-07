/**
 * Kiểu dữ liệu docs tối thiểu dùng chung cho seeder/DB layer.
 * Khớp cấu trúc JSON sinh từ packages/javascript-docs (types đầy đủ ở package đó,
 * DB không import ngược sang javascript-docs để tránh vòng phụ thuộc).
 */
export interface DocExample {
  code: string;
  explanation: string;
}

export interface DocSectionRow {
  id: string;
  title: string;
  headingLevel?: number;
  anchor?: string | null;
  summary?: string | null;
  keywords?: string[];
  syntax?: string | null;
  returns?: string | null;
  mutates?: boolean | null;
  mdnUrl?: string | null;
  examples?: DocExample[];
  tables?: string[];
  related?: string[];
  content?: string;
  contentHtml?: string | null;
  searchText?: string | null;
  category?: string;
}

export interface DocFile {
  sourceFile: string;
  sourceUrl?: string | null;
  category: string;
  title: string;
  description?: string | null;
  tags?: string[];
  sections: DocSectionRow[];
}
