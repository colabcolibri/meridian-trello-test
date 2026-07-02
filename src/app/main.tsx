import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TauriGuard } from "./TauriGuard";
import { AppRouter } from "./router";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TauriGuard>
      <AppRouter />
    </TauriGuard>
  </StrictMode>,
);
