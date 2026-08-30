import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.js";
import { ProblemDetail } from "./components/ProblemDetail.js";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/problems" replace />} />
        <Route path="/problems" element={<Navigate to="/problems" replace />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="*" element={<Navigate to="/problems" replace />} />
      </Route>
    </Routes>
  );
}

export default App;