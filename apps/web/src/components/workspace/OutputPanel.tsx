import { useWorkspace } from "./WorkspaceContext.js";
import { TestCaseTabs } from "../TestCaseTabs.js";

export function OutputPanel() {
  const { results, runPassed, runTotal, output } = useWorkspace();

  if (!results && !output) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        <p className="text-sm">Bấm Run để xem kết quả</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      {output && <p className="mb-2 text-sm text-text-secondary">{output}</p>}
      {results && results.length > 0 && (
        <TestCaseTabs results={results} passed={runPassed} total={runTotal} />
      )}
    </div>
  );
}