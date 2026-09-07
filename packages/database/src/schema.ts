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
