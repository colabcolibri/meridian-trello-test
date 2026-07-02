import { useCallback, useEffect, useState } from "react";
import type {
  AcceptanceItemInput,
  Epic,
  Moscow,
  Sprint,
  StoryDetail,
  StoryStatus,
  StorySummary,
  Version,
} from "../../../domain/agileTypes";
import {
  DEFAULT_AS_ROLE,
  MOSCOW_OPTIONS,
  STORY_STATUS_OPTIONS,
} from "../../../domain/agileConstants";
import { validateTitle } from "../../../domain/validators";
import { invokeErrorMessage } from "../../../lib/errors";
import { epicService } from "../epicService";
import { sprintService } from "../sprintService";
import { storyService } from "../storyService";
import { versionService } from "../versionService";

interface UsStoryModalProps {
  projectId: string;
  storyId: string;
  onClose: () => void;
  onChanged: () => void;
}

function parsePlanned(json: string | null): { label: string; done: boolean }[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (typeof item === "string") return { label: item, done: false };
      const obj = item as { label?: string; done?: boolean };
      return { label: obj.label ?? "", done: !!obj.done };
    });
  } catch {
    return [];
  }
}

export function UsStoryModal({ projectId, storyId, onClose, onChanged }: UsStoryModalProps) {
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [allStories, setAllStories] = useState<StorySummary[]>([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [detail, vers, eps, sprs, stories] = await Promise.all([
      storyService.get(projectId, storyId),
      versionService.list(projectId),
      epicService.list(projectId),
      sprintService.list(projectId),
      storyService.list(projectId),
    ]);
    setStory(detail);
    setVersions(vers);
    setEpics(eps);
    setSprints(sprs);
    setAllStories(stories.filter((s) => s.id !== storyId));
  }, [projectId, storyId]);

  useEffect(() => {
    void load().catch((err) => setError(invokeErrorMessage(err)));
  }, [load]);

  const save = async () => {
    if (!story) return;
    const titleErr = validateTitle(story.title);
    if (titleErr) {
      setError(titleErr);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await storyService.update(projectId, story.id, {
        title: story.title,
        epicId: story.epic_id,
        versionId: story.version_id,
        sprintId: story.sprint_id,
        asRole: story.as_role,
        iWant: story.i_want,
        soThat: story.so_that,
        why: story.why,
        whereText: story.where_text,
        approach: story.approach,
        doneWhen: story.done_when,
        moscow: story.moscow,
        ready: story.ready,
        status: story.status,
        missingNote: story.missing_note,
        tests: story.tests,
        testsStatus: story.tests_status,
        outOfScope: story.out_of_scope,
        boundaryNotes: story.boundary_notes,
        architectureRefs: story.architecture_refs,
        apiDbImpact: story.api_db_impact,
        securityNotes: story.security_notes,
        relatedDecisions: story.related_decisions,
        plannedJson: story.planned_json,
        recordFiles: story.record_files,
        recordBackend: story.record_backend,
        recordFrontend: story.record_frontend,
        recordScripts: story.record_scripts,
        recordExecuted: story.record_executed,
      });
      const acceptanceItems: AcceptanceItemInput[] = story.acceptance.map((a) => ({
        id: a.id,
        text: a.text,
        checked: a.checked,
      }));
      await storyService.setAcceptance(projectId, story.id, acceptanceItems);
      await storyService.setDependencies(projectId, story.id, story.depends_on);
      setEditing(false);
      await load();
      onChanged();
    } catch (err) {
      setError(invokeErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateAcceptance = (index: number, patch: Partial<AcceptanceItemInput>) => {
    if (!story) return;
    const next = [...story.acceptance];
    next[index] = { ...next[index], ...patch, id: next[index].id, text: patch.text ?? next[index].text };
    setStory({ ...story, acceptance: next });
  };

  const addAcceptance = () => {
    if (!story) return;
    setStory({
      ...story,
      acceptance: [
        ...story.acceptance,
        {
          id: `tmp-${Date.now()}`,
          story_id: story.id,
          text: "",
          checked: false,
          order_index: story.acceptance.length,
        },
      ],
    });
  };

  const removeAcceptance = (index: number) => {
    if (!story) return;
    setStory({ ...story, acceptance: story.acceptance.filter((_, i) => i !== index) });
  };

  const toggleDependency = (depId: string) => {
    if (!story) return;
    const has = story.depends_on.includes(depId);
    setStory({
      ...story,
      depends_on: has ? story.depends_on.filter((id) => id !== depId) : [...story.depends_on, depId],
    });
  };

  const updatePlannedItem = (index: number, patch: Partial<{ label: string; done: boolean }>) => {
    if (!story) return;
    const items = parsePlanned(story.planned_json);
    items[index] = { ...items[index], ...patch };
    setStory({ ...story, planned_json: JSON.stringify(items) });
  };

  const addPlannedItem = () => {
    if (!story) return;
    const items = parsePlanned(story.planned_json);
    items.push({ label: "", done: false });
    setStory({ ...story, planned_json: JSON.stringify(items) });
  };

  if (!story) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="rounded-lg bg-white p-6 text-sm text-[var(--trello-text-secondary)]">
          Loading story…
        </div>
      </div>
    );
  }

  const planned = parsePlanned(story.planned_json);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 md:py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="my-auto w-full max-w-3xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="us-modal-title"
      >
        <header className="flex flex-wrap items-start gap-3 border-b border-[#091e4214] px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase text-[var(--trello-text-muted)]">
              {story.id} · {story.status}
              {story.blocked ? " · blocked" : ""}
            </p>
            {editing ? (
              <input
                className="mt-1 w-full rounded border border-[#091e4233] px-2 py-1.5 text-lg font-semibold"
                value={story.title}
                onChange={(e) => setStory({ ...story, title: e.target.value })}
              />
            ) : (
              <h2 id="us-modal-title" className="mt-1 text-lg font-semibold text-[var(--trello-text-primary)]">
                {story.title}
              </h2>
            )}
            <p className="mt-2 text-sm text-[var(--trello-text-secondary)]">
              <strong>As</strong> {story.as_role || DEFAULT_AS_ROLE}, <strong>I want</strong>{" "}
              {story.i_want || "…"}, <strong>so that</strong> {story.so_that || "…"}
            </p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  className="trello-btn-primary px-3 py-1.5 text-sm"
                  disabled={saving}
                  onClick={() => void save()}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="trello-btn-ghost px-3 py-1.5 text-sm"
                  onClick={() => {
                    setEditing(false);
                    void load();
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="trello-btn-primary px-3 py-1.5 text-sm" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
            <button
              type="button"
              className="rounded p-2 text-[var(--trello-text-muted)] hover:bg-[#091e420f]"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        {error && (
          <p className="mx-5 mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {editing && (
            <div className="mb-6 grid gap-3 rounded-lg border border-dashed border-[#091e4226] p-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block font-medium">Preamble</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    className="rounded border px-2 py-1.5"
                    placeholder="As"
                    value={story.as_role ?? ""}
                    onChange={(e) => setStory({ ...story, as_role: e.target.value || null })}
                  />
                  <input
                    className="rounded border px-2 py-1.5"
                    placeholder="I want"
                    value={story.i_want ?? ""}
                    onChange={(e) => setStory({ ...story, i_want: e.target.value || null })}
                  />
                  <input
                    className="rounded border px-2 py-1.5"
                    placeholder="So that"
                    value={story.so_that ?? ""}
                    onChange={(e) => setStory({ ...story, so_that: e.target.value || null })}
                  />
                </div>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Version</span>
                <select
                  className="w-full rounded border px-2 py-1.5"
                  value={story.version_id ?? ""}
                  onChange={(e) => setStory({ ...story, version_id: e.target.value || null })}
                >
                  <option value="">—</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Epic</span>
                <select
                  className="w-full rounded border px-2 py-1.5"
                  value={story.epic_id ?? ""}
                  onChange={(e) => setStory({ ...story, epic_id: e.target.value || null })}
                >
                  <option value="">—</option>
                  {epics.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Sprint</span>
                <select
                  className="w-full rounded border px-2 py-1.5"
                  value={story.sprint_id ?? ""}
                  onChange={(e) => setStory({ ...story, sprint_id: e.target.value || null })}
                >
                  <option value="">—</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">MoSCoW</span>
                <select
                  className="w-full rounded border px-2 py-1.5"
                  value={story.moscow}
                  onChange={(e) => setStory({ ...story, moscow: e.target.value as Moscow })}
                >
                  {MOSCOW_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Status</span>
                <select
                  className="w-full rounded border px-2 py-1.5"
                  value={story.status}
                  onChange={(e) => setStory({ ...story, status: e.target.value as StoryStatus })}
                >
                  {STORY_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={story.ready}
                  onChange={(e) => setStory({ ...story, ready: e.target.checked })}
                />
                Ready for implementation
              </label>
              {story.status === "🔶" && (
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">Missing (required for 🔶)</span>
                  <input
                    className="w-full rounded border px-2 py-1.5"
                    value={story.missing_note ?? ""}
                    onChange={(e) => setStory({ ...story, missing_note: e.target.value || null })}
                  />
                </label>
              )}
            </div>
          )}

          <section className="mb-8">
            <h3 className="mb-3 border-b border-[#091e4214] pb-1 text-sm font-bold uppercase tracking-wide text-[var(--trello-accent)]">
              1 · Intent
            </h3>
            <div className="mb-4">
              <h4 className="mb-1 text-sm font-semibold">Why</h4>
              {editing ? (
                <textarea
                  className="w-full rounded border px-2 py-1.5 text-sm"
                  rows={3}
                  value={story.why ?? ""}
                  onChange={(e) => setStory({ ...story, why: e.target.value || null })}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-[var(--trello-text-secondary)]">
                  {story.why || "—"}
                </p>
              )}
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold">Acceptance</h4>
              <ul className="space-y-2">
                {story.acceptance.map((item, index) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      disabled={!editing}
                      onChange={(e) => updateAcceptance(index, { checked: e.target.checked })}
                    />
                    {editing ? (
                      <>
                        <input
                          className="min-w-0 flex-1 rounded border px-2 py-1"
                          value={item.text}
                          onChange={(e) => updateAcceptance(index, { text: e.target.value })}
                        />
                        <button type="button" className="text-red-600" onClick={() => removeAcceptance(index)}>
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className={item.checked ? "line-through opacity-70" : ""}>{item.text}</span>
                    )}
                  </li>
                ))}
              </ul>
              {editing && (
                <button
                  type="button"
                  className="mt-2 text-sm text-[var(--trello-accent)] hover:underline"
                  onClick={addAcceptance}
                >
                  ＋ Add criterion
                </button>
              )}
            </div>
            <div className="mt-4">
              <h4 className="mb-1 text-sm font-semibold">Depends on</h4>
              {editing ? (
                <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-2 text-sm">
                  {allStories.map((s) => (
                    <label key={s.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={story.depends_on.includes(s.id)}
                        onChange={() => toggleDependency(s.id)}
                      />
                      <span>
                        {s.id} — {s.title}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--trello-text-secondary)]">
                  {story.depends_on.length > 0 ? story.depends_on.join(", ") : "—"}
                </p>
              )}
            </div>
          </section>

          <section className="mb-8">
            <h3 className="mb-3 border-b border-[#091e4214] pb-1 text-sm font-bold uppercase tracking-wide text-[var(--trello-accent)]">
              2 · Plan
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-semibold">Done when</h4>
                {editing ? (
                  <input
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    value={story.done_when ?? ""}
                    onChange={(e) => setStory({ ...story, done_when: e.target.value || null })}
                  />
                ) : (
                  <p className="text-sm text-[var(--trello-text-secondary)]">{story.done_when || "—"}</p>
                )}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">Where</h4>
                {editing ? (
                  <textarea
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    rows={2}
                    value={story.where_text ?? ""}
                    onChange={(e) => setStory({ ...story, where_text: e.target.value || null })}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-[var(--trello-text-secondary)]">
                    {story.where_text || "—"}
                  </p>
                )}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">Approach</h4>
                {editing ? (
                  <textarea
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    rows={3}
                    value={story.approach ?? ""}
                    onChange={(e) => setStory({ ...story, approach: e.target.value || null })}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-[var(--trello-text-secondary)]">
                    {story.approach || "—"}
                  </p>
                )}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">Architecture refs</h4>
                {editing ? (
                  <textarea
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    rows={2}
                    value={story.architecture_refs ?? ""}
                    onChange={(e) =>
                      setStory({ ...story, architecture_refs: e.target.value || null })
                    }
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-[var(--trello-text-secondary)]">
                    {story.architecture_refs || "—"}
                  </p>
                )}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">API / DB impact</h4>
                {editing ? (
                  <textarea
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    rows={2}
                    value={story.api_db_impact ?? ""}
                    onChange={(e) =>
                      setStory({ ...story, api_db_impact: e.target.value || null })
                    }
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-[var(--trello-text-secondary)]">
                    {story.api_db_impact || "—"}
                  </p>
                )}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">Security notes</h4>
                {editing ? (
                  <textarea
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    rows={2}
                    value={story.security_notes ?? ""}
                    onChange={(e) =>
                      setStory({ ...story, security_notes: e.target.value || null })
                    }
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-[var(--trello-text-secondary)]">
                    {story.security_notes || "—"}
                  </p>
                )}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">Related decisions</h4>
                {editing ? (
                  <input
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    value={story.related_decisions ?? ""}
                    onChange={(e) =>
                      setStory({ ...story, related_decisions: e.target.value || null })
                    }
                  />
                ) : (
                  <p className="text-sm text-[var(--trello-text-secondary)]">
                    {story.related_decisions || "—"}
                  </p>
                )}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">Planned</h4>
                {editing ? (
                  <ul className="space-y-2">
                    {planned.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={(e) => updatePlannedItem(index, { done: e.target.checked })}
                        />
                        <input
                          className="min-w-0 flex-1 rounded border px-2 py-1"
                          value={item.label}
                          onChange={(e) => updatePlannedItem(index, { label: e.target.value })}
                        />
                      </li>
                    ))}
                    <button
                      type="button"
                      className="text-sm text-[var(--trello-accent)] hover:underline"
                      onClick={addPlannedItem}
                    >
                      ＋ Item planned
                    </button>
                  </ul>
                ) : (
                  <ul className="space-y-1 text-sm text-[var(--trello-text-secondary)]">
                    {planned.length === 0 && <li>—</li>}
                    {planned.map((item, index) => (
                      <li key={index} className={item.done ? "line-through opacity-70" : ""}>
                        {item.done ? "☑" : "☐"} {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="mb-3 border-b border-[#091e4214] pb-1 text-sm font-bold uppercase tracking-wide text-[var(--trello-accent)]">
              3 · Boundaries
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-semibold">Out of scope</h4>
                {editing ? (
                  <textarea
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    rows={2}
                    value={story.out_of_scope ?? ""}
                    onChange={(e) => setStory({ ...story, out_of_scope: e.target.value || null })}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-[var(--trello-text-secondary)]">
                    {story.out_of_scope || "—"}
                  </p>
                )}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold">Notes</h4>
                {editing ? (
                  <textarea
                    className="w-full rounded border px-2 py-1.5 text-sm"
                    rows={2}
                    value={story.boundary_notes ?? ""}
                    onChange={(e) => setStory({ ...story, boundary_notes: e.target.value || null })}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-[var(--trello-text-secondary)]">
                    {story.boundary_notes || "—"}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 border-b border-[#091e4214] pb-1 text-sm font-bold uppercase tracking-wide text-[var(--trello-text-muted)]">
              4 · Record
            </h3>
            <p className="mb-3 text-xs text-[var(--trello-text-muted)]">
              Filled when closing the story — Files, layers and Executed.
            </p>
            <div className="space-y-3 text-sm">
              {(
                [
                  ["Files", "record_files"],
                  ["Backend", "record_backend"],
                  ["Frontend", "record_frontend"],
                  ["Scripts / Docs", "record_scripts"],
                  ["Executed", "record_executed"],
                ] as const
              ).map(([label, key]) => (
                <div key={key}>
                  <h4 className="mb-1 font-semibold">{label}</h4>
                  {editing ? (
                    <textarea
                      className="w-full rounded border px-2 py-1.5 text-sm"
                      rows={2}
                      value={story[key] ?? ""}
                      onChange={(e) => setStory({ ...story, [key]: e.target.value || null })}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-[var(--trello-text-secondary)]">
                      {story[key]?.trim() || "—"}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--trello-text-muted)]">
              Tests: {story.tests} · {story.tests_status}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
