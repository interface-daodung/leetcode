import { useCallback } from "react";
import { useWorkspace } from "./WorkspaceContext.js";
import { useErrorStore } from "./ErrorContext.js";
import { CodeEditor } from "../CodeEditor.js";
import { runCode, saveToPlayground } from "../../lib/api.js";

export function EditorPanel() {
  const { problem, code, setCode, setResults, setRunPassed, setRunTotal, setOutput, setRunning, running, output, vscodeMsg, setVscodeMsg } = useWorkspace();
  const { pushError } = useErrorStore();

  const handleRun = useCallback(async () => {
    if (!problem) return;
    setRunning(true);
    setOutput("Đang chạy...");
    setResults(null);
    try {
      const result = await runCode(problem.id, code);
      if (result.error) {
        setOutput(`Lỗi: ${result.error}`);
        pushError({ source: "code", message: `Run #${problem.id} thất bại`, detail: result.error });
      } else if (result.results) {
        setResults(result.results);
        setRunPassed(result.passed ?? 0);
        setRunTotal(result.total ?? 0);
        setOutput(`Kết quả: ${result.passed} / ${result.total} test case đúng`);
      } else {
        setOutput(`Kết quả: ${result.passed} / ${result.total} test case đúng`);
      }
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      setOutput(`Lỗi: ${detail}`);
      pushError({ source: "code", message: `Run #${problem.id} ngoại lệ`, detail });
    } finally {
      setRunning(false);
    }
  }, [problem, code, setRunning, setOutput, setResults, setRunPassed, setRunTotal, pushError]);

  const handleOpenInVscode = useCallback(async () => {
    if (!problem || !problem.slug) {
      setVscodeMsg("Không có slug để mở trong VS Code");
      return;
    }
    setVscodeMsg("Đang lưu vào playground...");
    const res = await saveToPlayground(problem.slug, code);
    if (!res.ok) {
      setVscodeMsg(`Lỗi: ${res.error}`);
      pushError({ source: "code", message: `Lưu playground thất bại (${problem.slug})`, detail: res.error });
      return;
    }
    const { path, line, column } = res.result;
    const uri = `vscode://file/${path}:${line}:${column}`;
    window.location.href = uri;
    setVscodeMsg(`Đã mở ${path}:${line}:${column}`);
  }, [problem, code, setVscodeMsg, pushError]);

  if (!problem) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        <p className="text-sm">Chọn đề bài từ Explorer để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <h2 className="m-0 text-sm font-semibold text-text-primary">Code</h2>
          <span className="rounded bg-bg-hover px-2 py-0.5 text-xs text-text-muted">JavaScript</span>
        </div>
        <div className="flex items-center gap-3">
          {output && (
            <span className={`text-xs ${output.startsWith("Kết quả") ? "text-success" : output.startsWith("Lỗi") ? "text-danger" : "text-text-secondary"}`}>
              {output}
            </span>
          )}
          {vscodeMsg && <span className="max-w-[160px] truncate text-xs text-text-secondary">{vscodeMsg}</span>}
          <button
            type="button"
            onClick={handleOpenInVscode}
            title="Mở trong VS Code"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <img src="/assets/vscode.svg" alt="VS Code" className="h-4 w-4" />
            VS Code
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {running ? "Đang chạy..." : "▶ Run"}
          </button>
        </div>
      </div>
      <div className="flex-1 p-3">
        <CodeEditor value={code} onChange={setCode} language="javascript" />
      </div>
    </div>
  );
}