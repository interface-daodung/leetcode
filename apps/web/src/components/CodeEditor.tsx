import { useMemo, useRef } from "react";
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

export function CodeEditor({ value, onChange, language = "javascript", placeholder }: CodeEditorProps) {
  const { theme } = useTheme();
  const preRef = useRef<HTMLPreElement | null>(null);
  const lang = language === "typescript" ? "typescript" : language === "python" ? "python" : "javascript";

  const highlighted = useMemo(
    () =>
      value.trim() === "" ? (
        <span className="text-text-muted">{placeholder ?? ""}</span>
      ) : (
        <SyntaxHighlighter
          language={lang}
          style={theme === "dark" ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            background: "transparent",
            padding: 0,
            fontSize: "0.85rem",
            lineHeight: 1.6,
          }}
          codeTagProps={{ style: { fontFamily: "inherit" } }}
        >
          {value.replace(/\n$/, "\n ")}
        </SyntaxHighlighter>
      ),
    [value, lang, theme, placeholder],
  );

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="relative min-h-[300px] rounded-xl border border-border bg-code-bg font-mono">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        spellCheck={false}
        placeholder={placeholder}
        aria-label="Trình soạn thảo mã"
        className="code-editor-overlay h-full w-full"
      />
      <pre
        ref={preRef}
        aria-hidden
        className="code-editor-highlight pointer-events-none absolute inset-0 m-0 overflow-hidden p-3"
      >
        {highlighted}
      </pre>
    </div>
  );
}