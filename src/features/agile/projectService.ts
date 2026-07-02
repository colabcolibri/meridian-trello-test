import type { Project } from "../../domain/agileTypes";
import { tauriInvoke } from "../../lib/tauriInvoke";

export const projectService = {
  list: () => tauriInvoke<Project[]>("list_projects"),
  get: (id: string) => tauriInvoke<Project>("get_project", { id }),
  create: (name: string, description?: string | null) =>
    tauriInvoke<Project>("create_project", { input: { name, description: description ?? null } }),
  update: (id: string, name: string, description?: string | null) =>
    tauriInvoke<Project>("update_project", {
      input: { id, name, description: description ?? null },
    }),
  delete: (id: string) => tauriInvoke<void>("delete_project", { id }),
  getLastProjectId: () => tauriInvoke<string | null>("get_last_project_id"),
  setLastProjectId: (projectId: string | null) =>
    tauriInvoke<void>("set_last_project_id", { input: { project_id: projectId } }),
};
