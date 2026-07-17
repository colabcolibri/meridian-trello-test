import { BrowserDemoBanner } from "./BrowserDemoBanner";

export function TauriGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrowserDemoBanner />
      {children}
    </>
  );
}
