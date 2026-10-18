import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import "./index.css";

Sentry.init({
  dsn: import.meta.env['VITE_SENTRY_DSN'] as string | undefined,
  environment: import.meta.env.MODE,
});

function AppErrorFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-7 text-center shadow-2xl">
        <p className="text-sm font-medium text-blue-300">RentalFlow</p>
        <h1 className="mt-2 text-xl font-semibold">We could not load this workspace</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Your data has not been changed. Refresh the page to try again. If the problem continues, contact your workspace administrator.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300">
          Refresh RentalFlow
        </button>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<AppErrorFallback />}>
    <AppWrapper>
      <App />
    </AppWrapper>
  </Sentry.ErrorBoundary>
);
