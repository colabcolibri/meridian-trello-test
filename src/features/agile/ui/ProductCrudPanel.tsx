import { useState } from "react";
import type { Epic, EpicStatus, Sprint, SprintStatus, Version, VersionStatus } from "../../../domain/agileTypes";
import {
  EPIC_STATUS_OPTIONS,
  SPRINT_STATUS_OPTIONS,
  VERSION_STATUS_OPTIONS,
} from "../../../domain/agileConstants";
import { epicService } from "../epicService";
import { sprintService } from "../sprintService";
import { versionService } from "../versionService";
import { CreateEpicDialog } from "./CreateEpicDialog";
import { CreateSprintDialog } from "./CreateSprintDialog";
import { CreateVersionDialog } from "./CreateVersionDialog";

type Tab = "versions" | "epics" | "sprints";

export function ProductCrudPanel({
  projectId,
  versions,
  epics,
  sprints,
  onChanged,
}: {
  projectId: string;
  versions: Version[];
  epics: Epic[];
  sprints: Sprint[];
  onChanged: () => void;
}) {
  const [tab, setTab] = useState<Tab>("versions");
  const [error, setError] = useState<string | null>(null);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showEpicDialog, setShowEpicDialog] = useState(false);
  const [showSprintDialog, setShowSprintDialog] = useState(false);

  return (
    <div className="rounded-xl border border-[#091e4214] bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap gap-2">
        {(["versions", "epics", "sprints"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              tab === t ? "bg-[var(--trello-accent)] text-white" : "bg-[#091e420f] text-[var(--trello-text-secondary)]"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "versions" ? "Versions" : t === "epics" ? "Epics" : "Sprints"}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {tab === "versions" && (
        <div className="space-y-3">
          <div className="product-crud__toolbar">
            <p className="text-sm text-[var(--trello-text-secondary)]">
              Full Meridian contract — objective, scope and go-live.
            </p>
            <button
              type="button"
              className="trello-btn-primary product-crud__create-btn"
              onClick={() => setShowVersionDialog(true)}
            >
              ＋ New version
            </button>
          </div>
          <ul className="divide-y text-sm">
            {versions.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="font-semibold">{v.id}</span>
                <input
                  className="min-w-0 flex-1 rounded border px-2 py-1"
                  defaultValue={v.title}
                  onBlur={(e) =>
                    void versionService
                      .update(projectId, v.id, {
                        title: e.target.value,
                        status: v.status as VersionStatus,
                        outcome: v.outcome,
                        objective: v.objective,
                        doneCriteria: v.done_criteria,
                        includedJson: v.included_json,
                        explicitlyOut: v.explicitly_out,
                        goLiveChecklistJson: v.go_live_checklist_json,
                      })
                      .then(onChanged)
                      .catch((err) => setError(String(err)))
                  }
                />
                <select
                  className="rounded border px-2 py-1 text-xs"
                  value={v.status}
                  onChange={(e) =>
                    void versionService
                      .update(projectId, v.id, {
                        title: v.title,
                        status: e.target.value as VersionStatus,
                        outcome: v.outcome,
                        objective: v.objective,
                        doneCriteria: v.done_criteria,
                        includedJson: v.included_json,
                        explicitlyOut: v.explicitly_out,
                        goLiveChecklistJson: v.go_live_checklist_json,
                      })
                      .then(onChanged)
                      .catch((err) => setError(String(err)))
                  }
                >
                  {VERSION_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "epics" && (
        <div className="space-y-3">
          <div className="product-crud__toolbar">
            <p className="text-sm text-[var(--trello-text-secondary)]">
              Capability, expected outcome and boundaries — mirror of docs/epics.
            </p>
            <button
              type="button"
              className="trello-btn-primary product-crud__create-btn"
              onClick={() => setShowEpicDialog(true)}
            >
              ＋ New epic
            </button>
          </div>
          <ul className="divide-y text-sm">
            {epics.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="font-semibold">{e.id}</span>
                <input
                  className="min-w-0 flex-1 rounded border px-2 py-1"
                  defaultValue={e.title}
                  onBlur={(ev) =>
                    void epicService
                      .update(projectId, e.id, {
                        title: ev.target.value,
                        status: e.status as EpicStatus,
                        outcome: e.outcome,
                        capability: e.capability,
                        expectedOutcome: e.expected_outcome,
                        outOfScope: e.out_of_scope,
                        notes: e.notes,
                        profilesJson: e.profiles_json,
                        versionIdsJson: e.version_ids_json,
                      })
                      .then(onChanged)
                      .catch((err) => setError(String(err)))
                  }
                />
                <select
                  className="rounded border px-2 py-1 text-xs"
                  value={e.status}
                  onChange={(ev) =>
                    void epicService
                      .update(projectId, e.id, {
                        title: e.title,
                        status: ev.target.value as EpicStatus,
                        outcome: e.outcome,
                        capability: e.capability,
                        expectedOutcome: e.expected_outcome,
                        outOfScope: e.out_of_scope,
                        notes: e.notes,
                        profilesJson: e.profiles_json,
                        versionIdsJson: e.version_ids_json,
                      })
                      .then(onChanged)
                      .catch((err) => setError(String(err)))
                  }
                >
                  {EPIC_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "sprints" && (
        <div className="space-y-3">
          <div className="product-crud__toolbar">
            <p className="text-sm text-[var(--trello-text-secondary)]">
              Goal, done_when and out of scope — mirror of docs/sprints.
            </p>
            <button
              type="button"
              className="trello-btn-primary product-crud__create-btn"
              onClick={() => setShowSprintDialog(true)}
            >
              ＋ New sprint
            </button>
          </div>
          <ul className="divide-y text-sm">
            {sprints.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="font-semibold">{s.id}</span>
                <span className="text-xs text-[var(--trello-text-muted)]">{s.version_id}</span>
                <input
                  className="min-w-0 flex-1 rounded border px-2 py-1"
                  defaultValue={s.title}
                  onBlur={(ev) =>
                    void sprintService
                      .update(projectId, s.id, {
                        title: ev.target.value,
                        status: s.status as SprintStatus,
                        goal: s.goal,
                        doneWhen: s.done_when,
                        outOfScope: s.out_of_scope,
                        retrospectiveJson: s.retrospective_json,
                      })
                      .then(onChanged)
                      .catch((err) => setError(String(err)))
                  }
                />
                <select
                  className="rounded border px-2 py-1 text-xs"
                  value={s.status}
                  onChange={(ev) =>
                    void sprintService
                      .update(projectId, s.id, {
                        title: s.title,
                        status: ev.target.value as SprintStatus,
                        goal: s.goal,
                        doneWhen: s.done_when,
                        outOfScope: s.out_of_scope,
                        retrospectiveJson: s.retrospective_json,
                      })
                      .then(onChanged)
                      .catch((err) => setError(String(err)))
                  }
                >
                  {SPRINT_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showVersionDialog && (
        <CreateVersionDialog
          projectId={projectId}
          onClose={() => setShowVersionDialog(false)}
          onCreated={onChanged}
        />
      )}
      {showEpicDialog && (
        <CreateEpicDialog
          projectId={projectId}
          onClose={() => setShowEpicDialog(false)}
          onCreated={onChanged}
        />
      )}
      {showSprintDialog && (
        <CreateSprintDialog
          projectId={projectId}
          defaultVersionId={versions[0]?.id}
          onClose={() => setShowSprintDialog(false)}
          onCreated={onChanged}
        />
      )}
    </div>
  );
}
