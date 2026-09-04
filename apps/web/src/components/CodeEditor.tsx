import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { suggestForCode } from "@leetcode/javascript-docs";
import type { SuggestItem } from "@leetcode/javascript-docs";
import { useTheme } from "../lib/theme.js";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("css", css);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
}

/** Tạo HTML syntax-highlighted (nội dung <code>) từ text value. */
function buildHighlightedHtml(code: string, lang: string, theme: "light" | "dark"): string {
  const markup = renderToStaticMarkup(
    <SyntaxHighlighter
      language={lang}
      style={theme === "dark" ? oneDark : oneLight}
      customStyle={{ margin: 0, background: "transparent", padding: 0 }}
      codeTagProps={{ style: { fontFamily: "inherit" } }}
    >
      {code}
    </SyntaxHighlighter>,
  );
  const tmp = document.createElement("div");
  tmp.innerHTML = markup;
  const codeEl = tmp.querySelector("code");
  return codeEl ? codeEl.innerHTML : "";
}

/** Vị trí caret (số ký tự tính từ đầu) trong editor. */
function getCaretOffset(root: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let acc = 0;
  let current: Node | null;
  while ((current = walker.nextNode())) {
    if (current === range.startContainer) return acc + range.startOffset;
    acc += (current as Text).data.length;
  }
  return acc;
}

/** Đặt caret tại vị trí ký tự `offset`. */
function setCaretOffset(root: HTMLElement, offset: number): void {
  const sel = window.getSelection();
  if (!sel) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let acc = 0;
  let current: Node | null;
  let target: Node | null = null;
  let targetOffset = 0;
  while ((current = walker.nextNode())) {
    const len = (current as Text).data.length;
    if (acc + len >= offset) {
      target = current;
      targetOffset = offset - acc;
      break;
    }
    acc += len;
  }
  const range = document.createRange();
  if (target) {
    range.setStart(target, targetOffset);
    range.collapse(true);
  } else {
    range.selectNodeContents(root);
    range.collapse(false);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

/** Vị trí pixel của caret trong editor (để đặt dropdown). */
function getCaretRect(): DOMRect | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);
  let rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0 && range.startContainer.nodeType === Node.ELEMENT_NODE) {
    const el = range.startContainer as HTMLElement;
    const child = el.childNodes[range.startOffset] ?? el.lastChild;
    if (child) {
      const r = document.createRange();
      r.selectNode(child);
      rect = r.getBoundingClientRect();
    }
  }
  return rect;
}

const KIND_BADGE: Record<SuggestItem["kind"], string> = {
  keyword: "kw",
  snippet: "snip",
  pattern: "algo",
  api: "api",
};

/**
 * Code editor contentEditable + SyntaxHighlighter + bộ nhắc code (autocomplete).
 * - Div contentEditable hiển thị code highlight thật (text có màu, selection tự nhiên).
 * - Không overlay → không lệch dòng, không bị che selection.
 * - Mỗi lần nhập: lưu vị trí caret → update state → render lại highlight → khôi phục caret.
 * - Gợi ý: `suggestForCode` từ @leetcode/javascript-docs (API + snippet + pattern, không AI).
 */
export function CodeEditor({ value, onChange, language = "javascript", placeholder }: CodeEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const caretRef = useRef<number | null>(null);
  const lang = language === "typescript" ? "typescript" : language === "python" ? "python" : "javascript";
  const jsOnly = lang === "javascript";

  const [items, setItems] = useState<SuggestItem[]>([]);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [manual, setManual] = useState(false);
  const itemsRef = useRef<SuggestItem[]>([]);
  itemsRef.current = items;

  const computeSuggestions = useCallback(
    (force = false) => {
      const el = editorRef.current;
      if (!el || !jsOnly) return;
      const caret = getCaretOffset(el);
      const text = el.innerText.replace(/\u00a0/g, " ").replace(/\n$/, "");
      const before = text.slice(0, caret);
      const next = suggestForCode(text, before);
      if (next.length === 0 && !force) {
        setItems([]);
        return;
      }
      const rect = getCaretRect();
      const host = el.getBoundingClientRect();
      if (rect) setPos({ top: rect.bottom - host.top + 2, left: rect.left - host.left });
      setItems(next);
      setActive(0);
    },
    [jsOnly],
  );

  const hideSuggestions = useCallback(() => {
    setItems([]);
    setManual(false);
  }, []);

  const applySuggestion = useCallback(
    (item: SuggestItem) => {
      const el = editorRef.current;
      if (!el) return;
      const caret = getCaretOffset(el);
      const text = el.innerText.replace(/\u00a0/g, " ").replace(/\n$/, "");
      const before = text.slice(0, caret);
      const wordM = before.match(/[A-Za-z_$][\w$]*$/);
      const start = caret - (wordM ? wordM[0].length : 0);
      const next = text.slice(0, start) + item.insertText + text.slice(caret);
      caretRef.current = start + item.insertText.length;
      onChange(next);
      hideSuggestions();
    },
    [onChange, hideSuggestions],
  );

  const applySuggestionRef = useRef(applySuggestion);
  applySuggestionRef.current = applySuggestion;

  const highlightedHtml = useMemo(
    () => (value.trim() === "" ? "" : buildHighlightedHtml(value, lang, theme)),
    [value, lang, theme],
  );

  // Áp highlight vào DOM (imperative, không qua React children để tránh mất focus).
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const nextText = value.replace(/\n$/, "");
    // Luôn cập nhật highlight từ value hiện tại; tránh loop bằng cách so sánh markup.
    if (el.dataset.hl === highlightedHtml) return;
    el.innerHTML = highlightedHtml;
    el.dataset.hl = highlightedHtml;
    if (caretRef.current !== null) {
      setCaretOffset(el, Math.min(caretRef.current, nextText.length));
      caretRef.current = null;
    }
  }, [highlightedHtml, value]);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      caretRef.current = getCaretOffset(el);
      const text = el.innerText.replace(/\u00a0/g, " ");
      onChange(text.replace(/\n$/, ""));
      computeSuggestions();
    },
    [onChange, computeSuggestions],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!jsOnly) return;
      const list = itemsRef.current;
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        if (list.length > 0 && !manual) hideSuggestions();
        else computeSuggestions(true);
        return;
      }
      if (list.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % list.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + list.length) % list.length);
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        applySuggestionRef.current(list[Math.min(active, list.length - 1)]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        hideSuggestions();
      }
    },
    [jsOnly, manual, active, computeSuggestions, hideSuggestions],
  );

  return (
    <div className="relative min-h-[300px] overflow-auto rounded-xl border border-border bg-code-bg font-mono">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Trình soạn thảo mã"
        spellCheck={false}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={hideSuggestions}
        className="code-editor-ce"
        data-placeholder={placeholder ?? ""}
      />
      {jsOnly && items.length > 0 && pos && (
        <div
          className="absolute z-20 max-h-64 w-80 overflow-auto rounded-lg border border-border bg-panel shadow-xl"
          style={{ top: pos.top, left: pos.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs ${
                i === active ? "bg-accent/20" : "hover:bg-accent/10"
              }`}
              onMouseEnter={() => setActive(i)}
              onClick={() => applySuggestion(it)}
            >
              <span className="shrink-0 rounded bg-accent/20 px-1 font-mono text-[10px] uppercase text-accent">
                {KIND_BADGE[it.kind]}
              </span>
              <span className="truncate font-mono text-text-primary">{it.label}</span>
              {it.detail && <span className="truncate text-text-muted">{it.detail}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
