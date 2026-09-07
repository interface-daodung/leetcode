/**
 * Seed docs data từ `packages/javascript-docs/src/data/{en,vi}/*.json` vào SQLite.
 * Kèm raw markdown từ `src/docs/{lang}/<sourceFile>` lưu vào doc_files.raw_markdown
 * (web DocPage fetch từ API thay vì bundle .md vào build).
 * Idempotent: xoá doc_files theo lang (cascade doc_sections) rồi insert lại.
 *
 * Chạy: pnpm --filter=@leetcode/database db:seed-docs
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { db, sqlite, schema } from "./client.js";
import type { DocFile } from "./docs-types.js";

const require = createRequire(import.meta.url);
// Resolve qua package.json của @leetcode/javascript-docs để không phụ thuộc CWD
const docsRoot = resolve(
  dirname(require.resolve("@leetcode/javascript-docs/package.json")),
  "src/data",
);
const mdRoot = resolve(
  dirname(require.resolve("@leetcode/javascript-docs/package.json")),
  "src/docs",
);

const LANGS = ["en", "vi"] as const;
const SKIP_FILES = new Set(["index.json", "all.json"]);

export async function seedDocs(): Promise<{ lang: string; files: number; sections: number }[]> {
  const results: { lang: string; files: number; sections: number }[] = [];
  for (const lang of LANGS) {
    const dir = `${docsRoot}/${lang}`;
    const files = readdirSync(dir).filter((f) => f.endsWith(".json") && !SKIP_FILES.has(f));
    await db.delete(schema.docFiles).where(sqlEq(lang));
    for (const file of files) {
      const doc = JSON.parse(readFileSync(`${dir}/${file}`, "utf-8")) as DocFile;
      // Raw markdown cùng tên (sourceFile), bỏ qua nếu thiếu — DocPage sẽ báo 404
      let rawMarkdown: string | null = null;
      try {
        rawMarkdown = readFileSync(`${mdRoot}/${lang}/${doc.sourceFile}`, "utf-8");
      } catch {
        rawMarkdown = null;
      }
      const [row] = await db
        .insert(schema.docFiles)
        .values({
          lang,
          sourceFile: doc.sourceFile,
          sourceUrl: doc.sourceUrl ?? null,
          category: doc.category,
          title: doc.title,
          description: doc.description ?? null,
          tags: doc.tags ?? [],
          totalSections: doc.sections.length,
          rawMarkdown,
        })
        .returning({ id: schema.docFiles.id });
      if (doc.sections.length > 0) {
        await db.insert(schema.docSections).values(
          doc.sections.map((s, ord) => ({
            lang,
            sectionId: s.id,
            docFileId: row.id,
            ord,
            title: s.title,
            headingLevel: s.headingLevel ?? 2,
            anchor: s.anchor ?? null,
            summary: s.summary ?? null,
            keywords: s.keywords ?? [],
            syntax: s.syntax ?? null,
            returns: s.returns ?? null,
            mutates: s.mutates === null || s.mutates === undefined ? null : s.mutates ? 1 : 0,
            mdnUrl: s.mdnUrl ?? null,
            examples: s.examples ?? [],
            tables: s.tables ?? [],
            related: s.related ?? [],
            content: s.content ?? "",
            contentHtml: s.contentHtml ?? null,
            searchText: s.searchText ?? null,
            category: s.category ?? doc.category,
          })),
        );
      }
    }
    const [{ count }] = (await sqlite.execute({
      sql: "SELECT COUNT(*) as count FROM doc_sections WHERE lang = ?",
      args: [lang],
    })).rows as unknown as { count: number }[];
    results.push({ lang, files: files.length, sections: count });
  }
  return results;
}

// helper eq tránh import trùng tên `eq` hai nơi
import { eq } from "drizzle-orm";
function sqlEq(lang: string) {
  return eq(schema.docFiles.lang, lang as "en" | "vi");
}
