/**
 * DocsService — nạp docs data từ SQLite → build DocsIndex → setDocsData()
 * để dùng search core của @leetcode/javascript-docs (sync, in-memory).
 * Hydrate 1 lần khi boot (287 sections × 2 lang, < 6MB).
 */
import {
  getIndex,
  getIndexVi,
  setDocsData,
  searchDocs,
  searchDocsVi,
  getCategories,
  getCategoriesVi,
  getSectionByIdSync,
  getSectionByIdSyncVi,
} from "@leetcode/javascript-docs";
import { docsDb, seedDocs } from "@leetcode/database";
import { buildDocsIndex } from "./docs-index.util.js";
import type { FastifyBaseLogger } from "fastify";
// Shape DB (nullable) vs types của javascript-docs (required) — seeder luôn ghi đủ
// giá trị nên cast tại boundary này là an toàn.
type JsDocsData = Parameters<typeof setDocsData>;
type JsDocFile = NonNullable<JsDocsData[0]["files"]>[number];
type DocsLang = "en" | "vi";

export class DocsService {
  private loaded = false;
  /** Nạp data từ DB (seed nếu rỗng), build index, setDocsData cho cả 2 lang */
  async hydrate(log: FastifyBaseLogger): Promise<void> {
    if (this.loaded) return;
    const data: Record<DocsLang, { index: ReturnType<typeof buildDocsIndex>; files: JsDocFile[] }> = {
      en: { index: null as never, files: [] },
      vi: { index: null as never, files: [] },
    };
    for (const lang of ["en", "vi"] as const) {
      if ((await docsDb.countFiles(lang)) === 0) {
        log.info(`docs ${lang} rỗng trong DB — tự seed từ javascript-docs JSON`);
        await seedDocs();
      }
      const files = await docsDb.getDocFiles(lang);
      data[lang] = { index: buildDocsIndex(files, lang), files: files as unknown as JsDocFile[] };
    }
    setDocsData(
      { index: data.en.index, files: data.en.files },
      { index: data.vi.index, files: data.vi.files },
    );
    this.loaded = true;
    log.info(
      `Docs hydrated: en ${data.en.index.totalEntries} entries, vi ${data.vi.index.totalEntries} entries`,
    );
  }

  /** GET /api/docs/search */
  search(query: string, lang: DocsLang, opts: { category?: string; keyword?: string; limit?: number }) {
    const search = lang === "vi" ? searchDocsVi : searchDocs;
    return search(query, { limit: opts.limit ?? 20, category: opts.category, keyword: opts.keyword });
  }

  /** GET /api/docs/categories */
  getCategories(lang: DocsLang): string[] {
    return lang === "vi" ? getCategoriesVi() : getCategories();
  }

  /** GET /api/docs/section/:id */
  getSection(id: string, lang: DocsLang) {
    return lang === "vi" ? getSectionByIdSyncVi(id) : getSectionByIdSync(id);
  }

  /** GET /api/docs/meta — entries cho autocomplete client (mặc định EN) */
  getMeta(lang: DocsLang = "en") {
    const idx = lang === "vi" ? getIndexVi() : getIndex();
    return {
      lang: idx.lang,
      totalEntries: idx.totalEntries,
      categories: idx.categories,
      entries: idx.entries,
    };
  }

  /** Kiểm tra đã nạp chưa (cho health/debug) */
  isLoaded(): boolean {
    return this.loaded;
  }

  /** GET /api/docs/file/:file — raw markdown từ DB (DocPage fetch) */
  async getRawMarkdown(file: string, lang: DocsLang): Promise<string | undefined> {
    return docsDb.getRawMarkdown(lang, file);
  }
}
