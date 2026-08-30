import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const problems = sqliteTable("problems", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  description: text("description").notNull(),
  solution: text("solution"),
  testCases: text("test_cases", { mode: "json" }).$type<{ input: unknown; expected: unknown }[]>().default([]),
  createdAt: text("created_at").default("(datetime('now'))"),
});