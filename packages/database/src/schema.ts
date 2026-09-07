import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const problems = sqliteTable("problems", {
  id: integer("id").primaryKey(),
  slug: text("slug"),
  title: text("title").notNull(),
  url: text("url"),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  description: text("description").notNull(),
  template: text("template"),
  editorial: text("editorial"),
  testCases: text("test_cases", { mode: "json" }).$type<{ input: unknown; expected: unknown }[]>().default([]),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const problemAssets = sqliteTable(
  "problem_assets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    problemId: integer("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    originalUrl: text("original_url").notNull(),
    localPath: text("local_path").notNull(),
    hash: text("hash").notNull(),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
  },
  (table) => ({
    hashIdx: index("problem_assets_hash_idx").on(table.hash),
    problemIdx: index("problem_assets_problem_idx").on(table.problemId),
  }),
);

export const hints = sqliteTable(
  "hints",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    problemId: integer("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    ord: integer("ord").notNull(),
    content: text("content").notNull(),
  },
  (table) => ({
    problemOrdIdx: index("hints_problem_ord_idx").on(table.problemId, table.ord),
  }),
);

export const docFiles = sqliteTable(
  "doc_files",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lang: text("lang", { enum: ["en", "vi"] }).notNull(),
    sourceFile: text("source_file").notNull(),
    sourceUrl: text("source_url"),
    category: text("category").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
    totalSections: integer("total_sections").notNull().default(0),
    rawMarkdown: text("raw_markdown"),
  },
  (table) => ({
    langSourceIdx: index("doc_files_lang_source_idx").on(table.lang, table.sourceFile),
  }),
);

export const docSections = sqliteTable(
  "doc_sections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lang: text("lang", { enum: ["en", "vi"] }).notNull(),
    sectionId: text("section_id").notNull(),
    docFileId: integer("doc_file_id")
      .notNull()
      .references(() => docFiles.id, { onDelete: "cascade" }),
    ord: integer("ord").notNull(),
    title: text("title").notNull(),
    headingLevel: integer("heading_level").notNull().default(2),
    anchor: text("anchor"),
    summary: text("summary"),
    keywords: text("keywords", { mode: "json" }).$type<string[]>().default([]),
    syntax: text("syntax"),
    returns: text("returns"),
    mutates: integer("mutates"),
    mdnUrl: text("mdn_url"),
    examples: text("examples", { mode: "json" }).$type<{ code: string; explanation: string }[]>().default([]),
    tables: text("tables", { mode: "json" }).$type<string[]>().default([]),
    related: text("related", { mode: "json" }).$type<string[]>().default([]),
    content: text("content").notNull(),
    contentHtml: text("content_html"),
    searchText: text("search_text"),
    category: text("category").notNull(),
  },
  (table) => ({
    langSectionIdx: index("doc_sections_lang_section_idx").on(table.lang, table.sectionId),
    langCategoryIdx: index("doc_sections_lang_category_idx").on(table.lang, table.category),
    fileOrdIdx: index("doc_sections_file_ord_idx").on(table.docFileId, table.ord),
  }),
);
