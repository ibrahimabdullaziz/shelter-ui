import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { AuthBootstrap } from "./components/auth/AuthBootstrap";
import { queryClient } from "./lib/queryClient";
import { router } from "./router";
import { hydrateAuthStore } from "./store/authStore";
import { RouterProvider } from "react-router-dom";

const root = createRoot(document.getElementById("root")!);

function renderApp() {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void hydrateAuthStore().then(renderApp, renderApp);
