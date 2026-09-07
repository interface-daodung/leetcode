/**
 * Build DocsIndex từ DocFile[] (shape DB của @leetcode/database, nạp từ SQLite) —
 * thay cho index.json của generate.py. entries = section fields + tags cấp file.
 */
import { buildKeywordIndex } from "@leetcode/javascript-docs";
import type { DocsIndex, IndexEntry } from "@leetcode/javascript-docs";
import type { DocFile as DbDocFile } from "@leetcode/database";

export function buildDocsIndex(files: DbDocFile[], lang: DocsIndex["lang"] = "en"): DocsIndex {
  const entries: IndexEntry[] = [];
  const sources: DocsIndex["sources"] = [];
  const categories = new Set<string>();

  for (const f of files) {
    categories.add(f.category);
    sources.push({ file: f.sourceFile, title: f.title, category: f.category, sections: f.sections.length });
    for (const s of f.sections) {
      entries.push({
        id: s.id,
        title: s.title,
        category: s.category ?? f.category,
        sourceFile: f.sourceFile,
        anchor: s.anchor ?? "",
        summary: s.summary ?? "",
        keywords: s.keywords ?? [],
        syntax: s.syntax ?? null,
        returns: s.returns ?? null,
        mutates: s.mutates ?? null,
        mdnUrl: s.mdnUrl ?? null,
        searchText: s.searchText ?? "",
        tags: f.tags ?? [],
      });
    }
  }

  return {
    version: "2",
    lang,
    generatedAt: new Date().toISOString(),
    generator: "docs-index.util (DB)",
    sourceRepo: "https://github.com/Kernix13/javascript-cheat-sheet",
    totalSources: files.length,
    totalEntries: entries.length,
    categories: [...categories].sort(),
    entries,
    keywordIndex: buildKeywordIndex(entries),
    sources,
  };
}
