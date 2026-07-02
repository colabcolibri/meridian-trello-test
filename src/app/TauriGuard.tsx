import { isTauriRuntime } from "../lib/isTauriRuntime";

export function TauriGuard({ children }: { children: React.ReactNode }) {
  if (isTauriRuntime()) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="max-w-lg rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Open the desktop app</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You are viewing the frontend in the browser only. SQLite and Rust commands{" "}
          <strong>only work in the Tauri window</strong>.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>In the terminal: <code className="rounded bg-slate-100 px-1">pnpm tauri dev</code></li>
          <li>Use the <strong>Local Kanban</strong> window that opens automatically</li>
          <li>Do not use <code className="rounded bg-slate-100 px-1">localhost:1420</code> in Chrome/Safari</li>
        </ol>
      </div>
    </main>
  );
}
