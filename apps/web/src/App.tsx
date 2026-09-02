import { useEffect } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Header } from "./components/Header.js";
import { WorkspaceLayout } from "./components/workspace/WorkspaceLayout.js";
import { DocPage } from "./pages/DocPage.js";
import { useWorkspace } from "./components/workspace/WorkspaceContext.js";
import { useErrorStore } from "./components/workspace/ErrorContext.js";
import { fetchProblem } from "./lib/api.js";

function ProblemLoader() {
  const { id } = useParams();
  const { setProblem, setCode, setLoading, setResults, setOutput } = useWorkspace();
  const { pushError } = useErrorStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchProblem(numericId)
      .then((p) => {
        if (cancelled) return;
        if (!p) {
          setProblem(null);
          setLoading(false);
          setResults(null);
          return;
        }
        setProblem(p);
        setCode(p?.template ?? "");
        setOutput("");
        setResults(null);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        const detail = e instanceof Error ? e.message : String(e);
        pushError({ source: "fetch", message: `Không tải được đề bài #${numericId} (GET /api/problems/${numericId})`, detail });
        setProblem(null);
        setLoading(false);
        setResults(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, setProblem, setCode, setLoading, setResults, setOutput, pushError]);

  return <WorkspaceLayout />;
}

function App() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/problems" replace />} />
            <Route path="/problems" element={<WorkspaceLayout />} />
            <Route path="/problems/:id" element={<ProblemLoader />} />
            <Route path="/doc/:file" element={<DocPage />} />
            <Route path="*" element={<Navigate to="/problems" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;