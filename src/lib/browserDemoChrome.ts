import { clearBrowserAgileStore } from "../features/agile/browser/browserAgileStore";
import { isTauriRuntime } from "./isTauriRuntime";

/** True when the static web demo runs (not Tauri desktop). */
export function isBrowserDemo(): boolean {
  return typeof window !== "undefined" && !isTauriRuntime();
}

export function demoProjectsUrl(): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}projects`;
}

/** Clears localStorage sample and navigates to the project list (avoids stale :projectId routes). */
export function resetBrowserDemoAndGoToProjects(): void {
  clearBrowserAgileStore();
  window.location.assign(demoProjectsUrl());
}

export const demoHubCopy = {
  loadingProject: "Loading project…",
  backProjects: "← Projects",
  versions: "Versions",
  epics: "Epics",
  sprints: "Sprints",
  addNewF: "＋ New",
  addNewM: "＋ New",
  editVersion: "Edit version",
  editEpic: "Edit epic",
  editSprint: "Edit sprint",
  selectVersion: "Select a version.",
  epicFilterLabel: "Epic filter (optional)",
  epicFilterAll: "All epics",
  epicFilterHint: "Narrows sprints to those with stories in the epic, and pre-filters the board.",
  manageEpics: "Epics in this version",
  noEpics: "No epics linked to this version.",
  noSprints: "No sprints in this version.",
  noSprintsForEpic: (epicId: string) => `No sprints with stories in ${epicId}.`,
  versionContext: "Version context",
  openSprintBoard: "Open sprint board",
  allStoriesBoard: "Board (all stories)",
  selectVersionScope: "Select a version to see scope.",
  projectNotFound: "Project not found",
  projectNotFoundHint: "This link may be outdated. Open the sample project from the list or reset demo data.",
  backToProjects: "Back to projects",
  editShort: "Edit",
} as const;

export const desktopHubCopy = {
  loadingProject: "Carregando projeto…",
  backProjects: "← Projetos",
  versions: "Versões",
  epics: "Épicos",
  sprints: "Sprints",
  addNewF: "＋ Nova",
  addNewM: "＋ Novo",
  editVersion: "Editar versão",
  editEpic: "Editar épico",
  editSprint: "Editar sprint",
  selectVersion: "Selecione uma versão.",
  epicFilterLabel: "Filtro de épico (opcional)",
  epicFilterAll: "Todos os épicos",
  epicFilterHint: "Mostra sprints com US naquele épico e pré-filtra o quadro.",
  manageEpics: "Épicos nesta versão",
  noEpics: "Nenhum épico vinculado a esta versão.",
  noSprints: "Nenhum sprint nesta versão.",
  noSprintsForEpic: (epicId: string) => `Nenhum sprint com US em ${epicId}.`,
  versionContext: "Contexto da versão",
  openSprintBoard: "Abrir quadro do sprint",
  allStoriesBoard: "Quadro (todas as US)",
  selectVersionScope: "Selecione uma versão para ver o escopo.",
  projectNotFound: "Projeto não encontrado",
  projectNotFoundHint:
    "Este link pode estar desatualizado. Abra o projeto na lista ou crie um novo.",
  backToProjects: "Voltar aos projetos",
  editShort: "Editar",
} as const;

export type HubCopy = typeof demoHubCopy | typeof desktopHubCopy;

export function hubCopyForRuntime(): HubCopy {
  return isBrowserDemo() ? demoHubCopy : desktopHubCopy;
}

export const demoIncludedCopy = {
  selectVersion: "Select a version to see derived included scope.",
  loading: "Loading…",
  meta: (epics: number, sprints: number, stories: number) =>
    `${epics} epic(s) · ${sprints} sprint(s) · ${stories} stories`,
  noEpics: "No linked epics yet — link epics when creating or editing an epic.",
} as const;

export const desktopIncludedCopy = {
  selectVersion: "Selecione uma versão para ver o escopo incluído (derivado do banco).",
  loading: "Carregando…",
  meta: (epics: number, sprints: number, stories: number) =>
    `${epics} épico(s) · ${sprints} sprint(s) · ${stories} US`,
  noEpics: "Nenhum épico vinculado ainda — vincule na criação/edição do épico.",
} as const;

export function includedCopyForRuntime() {
  return isBrowserDemo() ? demoIncludedCopy : desktopIncludedCopy;
}
