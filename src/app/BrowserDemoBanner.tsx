import { isTauriRuntime } from "../lib/isTauriRuntime";
import { resetBrowserDemoAndGoToProjects } from "../lib/browserDemoChrome";

export function BrowserDemoBanner() {
  if (isTauriRuntime()) return null;

  return (
    <div
      className="browser-demo-banner"
      role="status"
    >
      <p className="browser-demo-banner__text">
        <strong>Web demo</strong> — data is stored only in this browser (localStorage). Nothing is sent
        to a server. For the full SQLite app, run{" "}
        <code className="browser-demo-banner__code">pnpm tauri dev</code>.
      </p>
      <button
        type="button"
        className="browser-demo-banner__reset"
        onClick={() => {
          if (
            window.confirm(
              "Reset the demo to the initial sample data? Your edits in this browser will be lost.",
            )
          ) {
            resetBrowserDemoAndGoToProjects();
          }
        }}
      >
        Reset sample data
      </button>
    </div>
  );
}
