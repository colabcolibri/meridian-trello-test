import { invoke } from "@tauri-apps/api/core";
import { BrowserAgileStore } from "../features/agile/browser/browserAgileStore";
import { isTauriRuntime } from "./isTauriRuntime";

export async function tauriInvoke<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  if (!isTauriRuntime()) {
    return BrowserAgileStore.instance().invoke<T>(command, args);
  }
  return invoke<T>(command, args);
}
