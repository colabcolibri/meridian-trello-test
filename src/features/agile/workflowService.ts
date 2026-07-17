import type { WorkflowColumn } from "../../domain/agileTypes";
import { tauriInvoke } from "../../lib/tauriInvoke";

export const workflowService = {
  listColumns: (projectId: string) =>
    tauriInvoke<WorkflowColumn[]>("list_workflow_columns", { projectId }),
};
