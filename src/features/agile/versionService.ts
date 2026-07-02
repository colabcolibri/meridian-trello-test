import type { Version, VersionIncluded, VersionIncludedEpic, VersionStatus } from "../../domain/agileTypes";
import { tauriInvoke } from "../../lib/tauriInvoke";

export interface VersionPayload {
  title: string;
  status?: VersionStatus;
  outcome?: string | null;
  objective?: string | null;
  doneCriteria?: string | null;
  explicitlyOut?: string | null;
  goLiveChecklistJson?: string | null;
  id?: string;
}

function toInput(projectId: string, payload: VersionPayload, id?: string) {
  return {
    project_id: projectId,
    id: payload.id ?? id ?? null,
    title: payload.title,
    status: payload.status ?? null,
    outcome: payload.outcome ?? null,
    objective: payload.objective ?? null,
    done_criteria: payload.doneCriteria ?? null,
    included_json: null,
    explicitly_out: payload.explicitlyOut ?? null,
    go_live_checklist_json: payload.goLiveChecklistJson ?? null,
  };
}

export const versionService = {
  list: (projectId: string) => tauriInvoke<Version[]>("list_versions", { projectId }),
  create: (projectId: string, payload: VersionPayload) =>
    tauriInvoke<Version>("create_version", { input: toInput(projectId, payload) }),
  update: (projectId: string, id: string, payload: VersionPayload & { status: VersionStatus }) =>
    tauriInvoke<Version>("update_version", {
      input: { ...toInput(projectId, payload, id), id, status: payload.status },
    }),
  delete: (projectId: string, id: string) =>
    tauriInvoke<void>("delete_version", { projectId, id }),
  getIncluded: (projectId: string, versionId: string) =>
    tauriInvoke<VersionIncluded>("get_version_included", { projectId, versionId }),
};

export type { VersionIncluded, VersionIncludedEpic };
