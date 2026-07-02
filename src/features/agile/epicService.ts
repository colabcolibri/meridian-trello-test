import type { Epic, EpicStatus } from "../../domain/agileTypes";
import { tauriInvoke } from "../../lib/tauriInvoke";

export interface EpicPayload {
  title: string;
  status?: EpicStatus;
  outcome?: string | null;
  capability?: string | null;
  expectedOutcome?: string | null;
  outOfScope?: string | null;
  notes?: string | null;
  profilesJson?: string | null;
  versionIdsJson?: string | null;
  id?: string;
}

function toInput(projectId: string, payload: EpicPayload, id?: string) {
  return {
    project_id: projectId,
    id: payload.id ?? id ?? null,
    title: payload.title,
    status: payload.status ?? null,
    outcome: payload.outcome ?? null,
    capability: payload.capability ?? null,
    expected_outcome: payload.expectedOutcome ?? null,
    out_of_scope: payload.outOfScope ?? null,
    notes: payload.notes ?? null,
    profiles_json: payload.profilesJson ?? null,
    version_ids_json: payload.versionIdsJson ?? null,
  };
}

export const epicService = {
  list: (projectId: string) => tauriInvoke<Epic[]>("list_epics", { projectId }),
  create: (projectId: string, payload: EpicPayload) =>
    tauriInvoke<Epic>("create_epic", { input: toInput(projectId, payload) }),
  update: (projectId: string, id: string, payload: EpicPayload & { status: EpicStatus }) =>
    tauriInvoke<Epic>("update_epic", {
      input: { ...toInput(projectId, payload, id), id, status: payload.status },
    }),
  delete: (projectId: string, id: string) =>
    tauriInvoke<void>("delete_epic", { projectId, id }),
};
