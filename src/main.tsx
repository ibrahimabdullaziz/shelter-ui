import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthBootstrap } from "./components/auth/AuthBootstrap";
import { queryClient } from "./lib/queryClient";
import { hydrateAuthStore } from "./store/authStore";

const root = createRoot(document.getElementById("root")!);

function renderApp() {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthBootstrap>
            <App />
          </AuthBootstrap>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void hydrateAuthStore().then(renderApp, renderApp);
