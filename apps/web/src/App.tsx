import { formatProblemId } from "@leetcode/shared";
import { createEditorState, languageTemplates } from "@leetcode/editor";
import { useState, useEffect } from "react";
import { ProblemImportPaste } from "./components/ProblemImportPaste.js";

function App() {
  const [editorState, setEditorState] = useState(createEditorState());
  const [output, setOutput] = useState("");
  const [problems, setProblems] = useState<{ id: number; title: string; difficulty: string }[]>([]);

  const fetchProblems = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/problems");
      if (res.ok) {
        const data = (await res.json()) as { id: number; title: string; difficulty: string }[];
        setProblems(Array.isArray(data) ? data : []);
      }
    } catch {
      // server chưa chạy thì bỏ qua
    }
  };

  useEffect(() => {
    void fetchProblems();
  }, []);

  const handleRun = () => {
    try {
      const fn = new Function("return " + editorState.code)();
      const result = fn();
      setOutput(`Result: ${JSON.stringify(result)}`);
    } catch (e) {
      setOutput(`Error: ${e}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "960px", margin: "0 auto" }}>
      <h1>LeetCode Lab</h1>
      <p>Problem ID format: {formatProblemId(1)}</p>

      <ProblemImportPaste onImported={() => void fetchProblems()} />

      {problems.length > 0 && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
          <strong>Đã lưu ({problems.length}):</strong>{" "}
          {problems.map((p) => (
            <span key={p.id} style={{ display: "inline-block", margin: "0.25rem", padding: "2px 8px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "999px", fontSize: "0.8rem" }}>
              {p.id}. {p.title} ({p.difficulty})
            </span>
          ))}
        </div>
      )}

      <textarea
        value={editorState.code}
        onChange={(e) => setEditorState({ ...editorState, code: e.target.value })}
        defaultValue={languageTemplates.javascript}
        style={{ width: "100%", height: "300px", fontFamily: "monospace", fontSize: "14px" }}
      />
      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleRun} style={{ marginRight: "1rem", padding: "0.5rem 1rem" }}>
          Run Code
        </button>
        <pre style={{ background: "#f5f5f5", padding: "1rem", whiteSpace: "pre-wrap" }}>{output}</pre>
      </div>
    </div>
  );
}

export default App;