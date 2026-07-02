import { invoke } from "@tauri-apps/api/core";
import { isTauriRuntime } from "./isTauriRuntime";

const BROWSER_MSG =
  "Backend unavailable: open the app window (pnpm tauri dev), not http://localhost:1420 in the browser.";

export async function tauriInvoke<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  if (!isTauriRuntime()) {
    throw new Error(BROWSER_MSG);
  }
  return invoke<T>(command, args);
}
