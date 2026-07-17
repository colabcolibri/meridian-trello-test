import { isTauriRuntime } from "../lib/isTauriRuntime";
import { clearBrowserAgileStore } from "../features/agile/browser/browserAgileStore";

export function BrowserDemoBanner() {
  if (isTauriRuntime()) return null;

  return (
    <div
      className="browser-demo-banner"
      role="status"
    >
      <p className="browser-demo-banner__text">
        <strong>Demo web</strong> — dados salvos só neste navegador (localStorage). Nada é enviado
        a servidor. Para SQLite completo, use{" "}
        <code className="browser-demo-banner__code">pnpm tauri dev</code>.
      </p>
      <button
        type="button"
        className="browser-demo-banner__reset"
        onClick={() => {
          if (
            window.confirm(
              "Apagar todos os dados desta demo neste navegador? Esta ação não pode ser desfeita.",
            )
          ) {
            clearBrowserAgileStore();
            window.location.reload();
          }
        }}
      >
        Limpar demo
      </button>
    </div>
  );
}
