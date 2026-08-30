import { formatProblemId } from "@leetcode/shared";
import { createEditorState, languageTemplates } from "@leetcode/editor";
import { engine } from "@leetcode/problem-engine";
import { useState } from "react";

function App() {
  const [editorState, setEditorState] = useState(createEditorState());
  const [output, setOutput] = useState("");

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
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>LeetCode Lab</h1>
      <p>Problem ID format: {formatProblemId(1)}</p>
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