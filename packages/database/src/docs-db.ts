/**
 * DocsDatabase — đọc docs data (doc_files + doc_sections) từ SQLite.
 * Row được map sang shape DocFile/DocSection của @leetcode/javascript-docs
 * (structural typing — DB không import ngược sang javascript-docs).
 */
import { db, schema } from "./client.js";
import { eq, and, asc } from "drizzle-orm";
import type { DocFile, DocSectionRow } from "./docs-types.js";

export type DocsLang = "en" | "vi";

export interface DocSectionFull extends DocSectionRow {
  ord: number;
}

interface DocFileRow {
  id: number;
  lang: string;
  sourceFile: string;
  sourceUrl: string | null;
  category: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  totalSections: number;
}

interface DocSectionDbRow {
  sectionId: string;
  ord: number;
  title: string;
  headingLevel: number;
  anchor: string | null;
  summary: string | null;
  keywords: string[] | null;
  syntax: string | null;
  returns: string | null;
  mutates: number | null;
  mdnUrl: string | null;
  examples: { code: string; explanation: string }[] | null;
  tables: string[] | null;
  related: string[] | null;
  content: string;
  contentHtml: string | null;
  searchText: string | null;
  category: string;
}

function sectionRowToDomain(r: DocSectionDbRow): DocSectionFull {
  return {
    id: r.sectionId,
    ord: r.ord,
    title: r.title,
    headingLevel: r.headingLevel,
    anchor: r.anchor,
    summary: r.summary,
    keywords: r.keywords ?? [],
    syntax: r.syntax,
    returns: r.returns,
    mutates: r.mutates === null ? null : r.mutates !== 0,
    mdnUrl: r.mdnUrl,
    examples: r.examples ?? [],
    tables: r.tables ?? [],
    related: r.related ?? [],
    content: r.content,
    contentHtml: r.contentHtml,
    searchText: r.searchText,
    category: r.category,
  };
}

function fileRowToDomain(f: DocFileRow, sections: DocSectionFull[]): DocFile {
  return {
    sourceFile: f.sourceFile,
    sourceUrl: f.sourceUrl,
    category: f.category,
    title: f.title,
    description: f.description,
    tags: f.tags ?? [],
    sections: sections.map(({ ord: _ord, ...s }) => s),
  };
}

export class DocsDatabase {
  /** Đếm số doc_files của 1 lang (kiểm tra đã seed chưa) */
  async countFiles(lang: DocsLang): Promise<number> {
    const rows = await db.select({ id: schema.docFiles.id }).from(schema.docFiles).where(eq(schema.docFiles.lang, lang));
    return rows.length;
  }

  /** Toàn bộ DocFile của 1 lang (kèm sections đúng thứ tự) */
  async getDocFiles(lang: DocsLang): Promise<DocFile[]> {
    const fileRows = await db.select().from(schema.docFiles).where(eq(schema.docFiles.lang, lang));
    const sectionRows = await db
      .select()
      .from(schema.docSections)
      .where(eq(schema.docSections.lang, lang))
      .orderBy(asc(schema.docSections.docFileId), asc(schema.docSections.ord));
    const byFile = new Map<number, DocSectionDbRow[]>();
    for (const s of sectionRows) {
      const list = byFile.get(s.docFileId) ?? [];
      list.push(s as unknown as DocSectionDbRow);
      byFile.set(s.docFileId, list);
    }
    return fileRows
      .sort((a, b) => a.sourceFile.localeCompare(b.sourceFile))
      .map((f) => fileRowToDomain(f as unknown as DocFileRow, (byFile.get(f.id) ?? []).map(sectionRowToDomain)));
  }

  /** 1 section theo id (per-lang) — query trực tiếp, không load toàn bộ */
  async getSectionById(lang: DocsLang, sectionId: string): Promise<DocSectionFull | undefined> {
    const [row] = await db
      .select()
      .from(schema.docSections)
      .where(and(eq(schema.docSections.lang, lang), eq(schema.docSections.sectionId, sectionId)))
      .limit(1);
    return row ? sectionRowToDomain(row as unknown as DocSectionDbRow) : undefined;
  }

  /** Raw markdown của 1 doc file (per-lang) — web DocPage fetch để render */
  async getRawMarkdown(lang: DocsLang, sourceFile: string): Promise<string | undefined> {
    const [row] = await db
      .select({ rawMarkdown: schema.docFiles.rawMarkdown })
      .from(schema.docFiles)
      .where(and(eq(schema.docFiles.lang, lang), eq(schema.docFiles.sourceFile, sourceFile)))
      .limit(1);
    return row?.rawMarkdown ?? undefined;
  }

  /** Danh sách sourceFile có sẵn (per-lang) — cho fallback lang và list trang doc */
  async listSourceFiles(lang: DocsLang): Promise<string[]> {
    const rows = await db
      .select({ sourceFile: schema.docFiles.sourceFile })
      .from(schema.docFiles)
      .where(eq(schema.docFiles.lang, lang));
    return rows.map((r) => r.sourceFile);
  }
}

export const docsDb = new DocsDatabase();
