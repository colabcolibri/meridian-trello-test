import type { Sprint, SprintStatus } from "../../domain/agileTypes";
import { tauriInvoke } from "../../lib/tauriInvoke";

export interface SprintPayload {
  versionId: string;
  title: string;
  status?: SprintStatus;
  goal?: string | null;
  doneWhen?: string | null;
  outOfScope?: string | null;
  retrospectiveJson?: string | null;
  id?: string;
}

function toInput(projectId: string, payload: SprintPayload, id?: string) {
  return {
    project_id: projectId,
    version_id: payload.versionId,
    id: payload.id ?? id ?? null,
    title: payload.title,
    status: payload.status ?? null,
    goal: payload.goal ?? null,
    done_when: payload.doneWhen ?? null,
    out_of_scope: payload.outOfScope ?? null,
    retrospective_json: payload.retrospectiveJson ?? null,
  };
}

export const sprintService = {
  list: (projectId: string, versionId?: string | null) =>
    tauriInvoke<Sprint[]>("list_sprints", {
      projectId,
      versionId: versionId ?? null,
    }),
  create: (projectId: string, payload: SprintPayload) =>
    tauriInvoke<Sprint>("create_sprint", { input: toInput(projectId, payload) }),
  update: (projectId: string, id: string, payload: Omit<SprintPayload, "versionId"> & { status: SprintStatus }) =>
    tauriInvoke<Sprint>("update_sprint", {
      input: {
        project_id: projectId,
        id,
        title: payload.title,
        status: payload.status,
        goal: payload.goal ?? null,
        done_when: payload.doneWhen ?? null,
        out_of_scope: payload.outOfScope ?? null,
        retrospective_json: payload.retrospectiveJson ?? null,
      },
    }),
  delete: (projectId: string, id: string) =>
    tauriInvoke<void>("delete_sprint", { projectId, id }),
  getLastSprintId: (projectId: string) =>
    tauriInvoke<string | null>("get_last_sprint_id", { projectId }),
  setLastSprintId: (projectId: string, sprintId: string | null) =>
    tauriInvoke<void>("set_last_sprint_id", {
      input: { project_id: projectId, sprint_id: sprintId },
    }),
};
