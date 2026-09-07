import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useLocation } from "react-router-dom";
import { marked } from "marked";

/**
 * DocPage — đọc 1 file .md từ packages/javascript-docs/src/docs/vi|en
 * và render ra HTML (không tạo nhiều file html, chỉ đọc từ code).
 *
 * Route: /doc/:file  (file không gồm .md, vd "function-examples")
 * Query: ?lang=vi|en  (mặc định vi) — để mở cả bản en nếu cần
 * Hash: #anchor — tự scroll tới heading (slug từ KnowledgeResultPanel)
 *
 * Nguồn: packages/javascript-docs/src/docs/vi/*.md  (đã copy từ tmp_reference_vi)
 *        packages/javascript-docs/src/docs/en/*.md
 * Dùng Vite import.meta.glob với ?raw để bundle toàn bộ .md thành string.
 */

// Glob toàn bộ md của cả 2 ngôn ngữ — Vite sẽ bundle dưới dạng ?raw
// Đường dẫn tính từ file này: apps/web/src/pages/DocPage.tsx
const viModules = import.meta.glob("../../../../packages/javascript-docs/src/docs/vi/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const enModules = import.meta.glob("../../../../packages/javascript-docs/src/docs/en/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

function resolveModule(file: string, lang: string): (() => Promise<string>) | undefined {
  const modules = lang === "en" ? enModules : viModules;
  // key dạng "../../../../packages/javascript-docs/src/docs/vi/array-examples.md"
  const hit = Object.entries(modules).find(([k]) => k.endsWith(`/${file}.md`) || k.endsWith(`/${file}`));
  return hit?.[1];
}

// slug giống logic python slugify trong generate.py — để anchor #es6-syntax khớp với heading
// Python dùng re.UNICODE nên \w giữ chữ có dấu (phương-thức -> phương-thức)
// JS dùng unicode property escape để giữ dấu tiếng Việt
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function DocPage() {
  const { file } = useParams<{ file: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const lang = (searchParams.get("lang") === "en" ? "en" : "vi") as "vi" | "en";
  const [html, setHtml] = useState<string>("");
  const [raw, setRaw] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!file) {
      setError("Thiếu tên file");
      setLoading(false);
      return;
    }
    const loader = resolveModule(file, lang) ?? resolveModule(file, lang === "vi" ? "en" : "vi");
    if (!loader) {
      setError(`Không tìm thấy file: ${file}.md (${lang})`);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    loader()
      .then((md) => {
        setRaw(md);
        const rawHtml = marked.parse(md, { gfm: true, breaks: false }) as string;
        // Gắn id cho heading để anchor #es6-syntax hoạt động — khớp logic slugify của generate.py
        const parsed = rawHtml.replace(/<h([1-6])>(.*?)<\/h\1>/g, (_m: string, level: string, inner: string) => {
          const stripped = inner.replace(/<[^>]+>/g, "");
          const id = slugify(stripped);
          return `<h${level} id="${id}">${inner}</h${level}>`;
        });
        setHtml(parsed);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [file, lang]);

  // Scroll tới anchor sau khi render — hỗ trợ http://localhost:5173/doc/README#es6-syntax
  useEffect(() => {
    if (!html) return;
    const doScroll = () => {
      const hash = location.hash || window.location.hash;
      if (!hash) return;
      const id = decodeURIComponent(hash.slice(1));
      // 1) khớp trực tiếp id
      let el: Element | null = document.getElementById(id);
      // 2) thử slugify lại (phòng khi id trong URL khác case/dấu)
      if (!el) {
        const slug = slugify(id);
        el = document.getElementById(slug) ?? document.querySelector(`[id="${CSS.escape(slug)}"]`);
      }
      // 3) fallback: tìm heading có text chứa hash (cho trường hợp anchor tiếng Việt)
      if (!el) {
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const target = id.toLowerCase();
        const targetSlug = slugify(target);
        for (const h of headings) {
          if (h.id === target || h.id === targetSlug || slugify(h.textContent ?? "") === targetSlug || (h.textContent ?? "").toLowerCase().includes(target)) {
            el = h;
            break;
          }
        }
      }
      if (el) {
        // bù header sticky (h-14 ~56px + doc header) để không bị che
        const y = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    };
    // delay 1 frame để DOM đã paint
    const t = window.setTimeout(doScroll, 80);
    return () => window.clearTimeout(t);
  }, [html, location.hash]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="text-sm text-text-muted">Đang tải {file}.md ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="mb-4 text-sm text-danger">{error}</p>
        <Link to="/" className="text-sm text-accent underline">
          ← Về trang chính
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg-primary">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-header-bg px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-text-secondary no-underline hover:text-text-primary">
            ← Trang chính
          </Link>
          <span className="text-sm text-text-muted">/</span>
          <span className="text-sm font-semibold text-text-primary">{file}.md</span>
          <span className="rounded bg-bg-hover px-1.5 py-0.5 text-[11px] text-text-muted">{lang.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link
            to={`/doc/${file}?lang=${lang === "vi" ? "en" : "vi"}`}
            className="rounded border border-border bg-bg-elevated px-2.5 py-1 text-text-secondary no-underline hover:bg-bg-hover"
          >
            {lang === "vi" ? "EN" : "VI"}
          </Link>
          <a
            href={`https://github.com/Kernix13/javascript-cheat-sheet/blob/main/${file}.md`}
            target="_blank"
            rel="noreferrer"
            className="text-text-muted no-underline hover:text-accent"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Rendered markdown — dùng chung style knowledge-markdown */}
        <div className="knowledge-markdown" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Raw fallback — gập lại */}
        <details className="mt-8 rounded-lg border border-border bg-sidebar-bg p-3">
          <summary className="cursor-pointer text-xs font-medium text-text-primary">Nguồn Markdown thô</summary>
          <pre className="mt-3 max-h-[60vh] overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-text-secondary">{raw}</pre>
        </details>
      </div>
    </div>
  );
}
