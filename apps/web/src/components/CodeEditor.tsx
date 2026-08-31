import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
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

/**
 * Code editor contentEditable + SyntaxHighlighter.
 * - Div contentEditable hiển thị code highlight thật (text có màu, selection tự nhiên).
 * - Không overlay → không lệch dòng, không bị che selection.
 * - Mỗi lần nhập: lưu vị trí caret → update state → render lại highlight → khôi phục caret.
 */
export function CodeEditor({ value, onChange, language = "javascript", placeholder }: CodeEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const caretRef = useRef<number | null>(null);
  const lang = language === "typescript" ? "typescript" : language === "python" ? "python" : "javascript";

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
    },
    [onChange],
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
        className="code-editor-ce"
        data-placeholder={placeholder ?? ""}
      />
    </div>
  );
}