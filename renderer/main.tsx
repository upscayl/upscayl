import "./styles/globals.css";
import { Provider } from "jotai";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Tooltip } from "react-tooltip";
import App from "./App";
import PostHogProviderWrapper from "./components/posthog-provider-wrapper";
import { Toaster } from "./components/ui/toaster";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/error-fallback";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider>
        <PostHogProviderWrapper>
          <App />
          <Toaster />
          <Tooltip
            className="z-[999] max-w-sm break-words !bg-secondary"
            id="tooltip"
          />
        </PostHogProviderWrapper>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
