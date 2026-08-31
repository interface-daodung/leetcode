import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./lib/theme.js";
import { WorkspaceProvider } from "./components/workspace/WorkspaceContext.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);