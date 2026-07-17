import type {
  AcceptanceItemInput,
  StoryDetail,
  StoryFilters,
  StorySummary,
  Moscow,
  StoryStatus,
} from "../../domain/agileTypes";
import { tauriInvoke } from "../../lib/tauriInvoke";

function listInput(projectId: string, filters?: StoryFilters) {
  return {
    input: {
      project_id: projectId,
      sprint_id: filters?.sprintId ?? null,
      version_id: filters?.versionId ?? null,
      epic_id: filters?.epicId ?? null,
    },
  };
}

export interface CreateStoryPayload {
  title?: string;
  epicId?: string | null;
  versionId?: string | null;
  sprintId?: string | null;
  workflowColumnId?: string | null;
  asRole: string;
  iWant: string;
  soThat: string;
  why?: string | null;
  whereText?: string | null;
  approach?: string | null;
  doneWhen: string;
  outOfScope?: string | null;
  boundaryNotes?: string | null;
  architectureRefs?: string | null;
  apiDbImpact?: string | null;
  securityNotes?: string | null;
  relatedDecisions?: string | null;
  plannedJson?: string | null;
  acceptance?: AcceptanceItemInput[];
  moscow?: Moscow;
}

export interface UpdateStoryPatch {
  title?: string;
  epicId?: string | null;
  versionId?: string | null;
  sprintId?: string | null;
  asRole?: string | null;
  iWant?: string | null;
  soThat?: string | null;
  why?: string | null;
  whereText?: string | null;
  approach?: string | null;
  doneWhen?: string | null;
  moscow?: Moscow;
  ready?: boolean;
  status?: StoryStatus;
  missingNote?: string | null;
  tests?: string;
  testsStatus?: string;
  outOfScope?: string | null;
  boundaryNotes?: string | null;
  architectureRefs?: string | null;
  apiDbImpact?: string | null;
  securityNotes?: string | null;
  relatedDecisions?: string | null;
  plannedJson?: string | null;
  recordJson?: string | null;
  recordFiles?: string | null;
  recordBackend?: string | null;
  recordFrontend?: string | null;
  recordScripts?: string | null;
  recordExecuted?: string | null;
}

export const storyService = {
  list: (projectId: string, filters?: StoryFilters) =>
    tauriInvoke<StorySummary[]>("list_stories", listInput(projectId, filters)),
  get: (projectId: string, id: string) =>
    tauriInvoke<StoryDetail>("get_story", { projectId, id }),
  create: (projectId: string, payload: CreateStoryPayload) =>
    tauriInvoke<StoryDetail>("create_story", {
      input: {
        project_id: projectId,
        title: payload.title ?? payload.iWant.slice(0, 100),
        epic_id: payload.epicId ?? null,
        version_id: payload.versionId ?? null,
        sprint_id: payload.sprintId ?? null,
        workflow_column_id: payload.workflowColumnId ?? null,
        as_role: payload.asRole,
        i_want: payload.iWant,
        so_that: payload.soThat,
        why: payload.why ?? null,
        where_text: payload.whereText ?? null,
        approach: payload.approach ?? null,
        done_when: payload.doneWhen,
        out_of_scope: payload.outOfScope ?? null,
        boundary_notes: payload.boundaryNotes ?? null,
        architecture_refs: payload.architectureRefs ?? null,
        api_db_impact: payload.apiDbImpact ?? null,
        security_notes: payload.securityNotes ?? null,
        related_decisions: payload.relatedDecisions ?? null,
        planned_json: payload.plannedJson ?? null,
        acceptance: payload.acceptance ?? null,
        moscow: payload.moscow ?? null,
      },
    }),
  update: (projectId: string, id: string, patch: UpdateStoryPatch) =>
    tauriInvoke<StoryDetail>("update_story", {
      input: {
        project_id: projectId,
        id,
        title: patch.title ?? null,
        epic_id: patch.epicId ?? null,
        version_id: patch.versionId ?? null,
        sprint_id: patch.sprintId ?? null,
        as_role: patch.asRole ?? null,
        i_want: patch.iWant ?? null,
        so_that: patch.soThat ?? null,
        why: patch.why ?? null,
        where_text: patch.whereText ?? null,
        approach: patch.approach ?? null,
        done_when: patch.doneWhen ?? null,
        moscow: patch.moscow ?? null,
        ready: patch.ready ?? null,
        status: patch.status ?? null,
        missing_note: patch.missingNote ?? null,
        tests: patch.tests ?? null,
        tests_status: patch.testsStatus ?? null,
        out_of_scope: patch.outOfScope ?? null,
        boundary_notes: patch.boundaryNotes ?? null,
        architecture_refs: patch.architectureRefs ?? null,
        api_db_impact: patch.apiDbImpact ?? null,
        security_notes: patch.securityNotes ?? null,
        related_decisions: patch.relatedDecisions ?? null,
        planned_json: patch.plannedJson ?? null,
        record_json: patch.recordJson ?? null,
        record_files: patch.recordFiles ?? null,
        record_backend: patch.recordBackend ?? null,
        record_frontend: patch.recordFrontend ?? null,
        record_scripts: patch.recordScripts ?? null,
        record_executed: patch.recordExecuted ?? null,
      },
    }),
  delete: (projectId: string, id: string) =>
    tauriInvoke<void>("delete_story", { projectId, id }),
  setAcceptance: (projectId: string, storyId: string, items: AcceptanceItemInput[]) =>
    tauriInvoke("set_story_acceptance", {
      input: { project_id: projectId, story_id: storyId, items },
    }),
  setDependencies: (projectId: string, storyId: string, dependsOn: string[]) =>
    tauriInvoke<string[]>("set_story_dependencies", {
      input: { project_id: projectId, story_id: storyId, depends_on: dependsOn },
    }),
  move: (projectId: string, storyId: string, workflowColumnId: string, orderIndex: number) =>
    tauriInvoke<void>("move_story", {
      input: {
        project_id: projectId,
        story_id: storyId,
        workflow_column_id: workflowColumnId,
        order_index: orderIndex,
      },
    }),
  reorder: (projectId: string, workflowColumnId: string, orderedIds: string[]) =>
    tauriInvoke<void>("reorder_stories", { projectId, workflowColumnId, orderedIds }),
};
