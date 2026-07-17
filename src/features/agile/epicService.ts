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
  };
}

export const epicService = {
  list: (projectId: string) => tauriInvoke<Epic[]>("list_epics", { projectId }),
  listForVersion: (projectId: string, versionId: string) =>
    tauriInvoke<{ id: string; title: string }[]>("list_epics_for_version", { projectId, versionId }),
  getVersionIds: (projectId: string, epicId: string) =>
    tauriInvoke<string[]>("get_epic_versions", { projectId, epicId }),
  setVersions: (projectId: string, epicId: string, versionIds: string[]) =>
    tauriInvoke<void>("set_epic_versions", {
      input: { project_id: projectId, epic_id: epicId, version_ids: versionIds },
    }),
  create: async (projectId: string, payload: EpicPayload, versionIds: string[]) => {
    const epic = await tauriInvoke<Epic>("create_epic", { input: toInput(projectId, payload) });
    if (versionIds.length > 0) {
      await tauriInvoke<void>("set_epic_versions", {
        input: { project_id: projectId, epic_id: epic.id, version_ids: versionIds },
      });
    }
    return epic;
  },
  update: async (
    projectId: string,
    id: string,
    payload: EpicPayload & { status: EpicStatus },
    versionIds: string[],
  ) => {
    const epic = await tauriInvoke<Epic>("update_epic", {
      input: { ...toInput(projectId, payload, id), id, status: payload.status },
    });
    await tauriInvoke<void>("set_epic_versions", {
      input: { project_id: projectId, epic_id: id, version_ids: versionIds },
    });
    return epic;
  },
  delete: (projectId: string, id: string) =>
    tauriInvoke<void>("delete_epic", { projectId, id }),
};
