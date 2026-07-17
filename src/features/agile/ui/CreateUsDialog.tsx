import { useEffect, useMemo, useState } from "react";
import type { AcceptanceItemInput, ChecklistItem, Moscow } from "../../../domain/agileTypes";
import { DEFAULT_AS_ROLE, MOSCOW_OPTIONS } from "../../../domain/agileConstants";
import { validateStoryRelations } from "../../../domain/storyRelations";
import { stringifyChecklist } from "../../../domain/meridianJson";
import { invokeErrorMessage } from "../../../lib/errors";
import { useStoryRelationOptions } from "../hooks/useStoryRelationOptions";
import { storyService, type CreateStoryPayload } from "../storyService";
import { AcceptanceEditor, ChecklistEditor } from "./ListFieldEditor";
import { MeridianWizardShell, type WizardStep } from "./MeridianWizardShell";
import {
  PreamblePreview,
  UsField,
  UsFieldGrid,
  UsForm,
  UsFormSection,
  UsSelectField,
  UsTextareaField,
  UsTextField,
} from "./UsFormFields";

const STEPS: WizardStep[] = [
  {
    id: "identity",
    label: "Identity",
    hint: "Preamble and frontmatter — who, what, version/epic/sprint.",
  },
  {
    id: "intent",
    label: "Intent",
    hint: "Why, Where and Acceptance — problem, release position and verifiable criteria.",
  },
  {
    id: "plan",
    label: "Plan",
    hint: "Done when, architecture refs and Planned draft — Meridian contract at create time.",
  },
  {
    id: "boundaries",
    label: "Boundaries",
    hint: "Optional — what this story explicitly excludes from day one.",
  },
  {
    id: "review",
    label: "Review",
    hint: "Check the docs/us template mirror before creating.",
  },
];

export interface CreateUsDialogProps {
  projectId: string;
  workflowColumnId: string;
  defaultVersionId?: string | null;
  defaultEpicId?: string | null;
  defaultSprintId?: string | null;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateUsDialog({
  projectId,
  workflowColumnId,
  defaultVersionId,
  defaultEpicId,
  defaultSprintId,
  onClose,
  onCreated,
}: CreateUsDialogProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [asRole, setAsRole] = useState(DEFAULT_AS_ROLE);
  const [iWant, setIWant] = useState("");
  const [soThat, setSoThat] = useState("");
  const [why, setWhy] = useState("");
  const [whereText, setWhereText] = useState("");
  const [doneWhen, setDoneWhen] = useState("");
  const [approach, setApproach] = useState("");
  const [architectureRefs, setArchitectureRefs] = useState("");
  const [apiDbImpact, setApiDbImpact] = useState("");
  const [securityNotes, setSecurityNotes] = useState("");
  const [relatedDecisions, setRelatedDecisions] = useState("");
  const [planned, setPlanned] = useState<ChecklistItem[]>([{ label: "", done: false }]);
  const [outOfScope, setOutOfScope] = useState("");
  const [boundaryNotes, setBoundaryNotes] = useState("");
  const [versionId, setVersionId] = useState(defaultVersionId ?? "");
  const [epicId, setEpicId] = useState(defaultEpicId ?? "");
  const [sprintId, setSprintId] = useState(defaultSprintId ?? "");
  const [moscow, setMoscow] = useState<Moscow>("Must");
  const [acceptance, setAcceptance] = useState<string[]>(["", ""]);

  const { versions, epics, sprints, epicVersionIds, sprintVersionMap, loading: loadingMeta } =
    useStoryRelationOptions(projectId, versionId);

  useEffect(() => {
    if (epicId && !epics.some((e) => e.id === epicId)) setEpicId("");
    if (sprintId && !sprints.some((s) => s.id === sprintId)) setSprintId("");
  }, [epics, sprints, epicId, sprintId]);

  const handleVersionChange = (nextVersionId: string) => {
    setVersionId(nextVersionId);
    setEpicId("");
    setSprintId("");
  };

  const filteredSprints = useMemo(() => sprints, [sprints]);

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      if (!asRole.trim() || !iWant.trim() || !soThat.trim()) {
        return "Complete the full preamble: As, I want and so that.";
      }
      return null;
    }
    if (index === 1) {
      if (!why.trim()) return "Why is required at create time (Meridian Intent).";
      if (!whereText.trim()) return "Where is required — position in the release.";
      const criteria = acceptance.map((c) => c.trim()).filter(Boolean);
      if (criteria.length < 2) {
        return "Include at least 2 observable acceptance criteria.";
      }
      return null;
    }
    if (index === 2) {
      if (!doneWhen.trim()) return "Done when is required (Meridian Plan).";
      if (!architectureRefs.trim()) {
        return "Architecture refs is required at create time — links or paths in docs/architecture.";
      }
      const plannedItems = planned.map((p) => p.label.trim()).filter(Boolean);
      if (plannedItems.length < 1) {
        return "Include at least 1 Planned item (delivery plan draft).";
      }
      return null;
    }
    return null;
  };

  const goNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    for (let i = 0; i < STEPS.length - 1; i += 1) {
      const validationError = validateStep(i);
      if (validationError) {
        setError(validationError);
        setStep(i);
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      const relationCheck = validateStoryRelations(
        { versionId: versionId || null, epicId: epicId || null, sprintId: sprintId || null },
        epicVersionIds,
        sprintId ? sprintVersionMap.get(sprintId) : null,
      );
      if (!relationCheck.ok) {
        setError(relationCheck.message ?? "Relações inválidas.");
        setSaving(false);
        return;
      }

      const acceptanceItems: AcceptanceItemInput[] = acceptance
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({ text, checked: false }));

      const payload: CreateStoryPayload = {
        title: title.trim() || undefined,
        asRole: asRole.trim(),
        iWant: iWant.trim(),
        soThat: soThat.trim(),
        why: why.trim(),
        whereText: whereText.trim(),
        doneWhen: doneWhen.trim(),
        approach: approach.trim() || null,
        architectureRefs: architectureRefs.trim(),
        apiDbImpact: apiDbImpact.trim() || null,
        securityNotes: securityNotes.trim() || null,
        relatedDecisions: relatedDecisions.trim() || null,
        plannedJson: stringifyChecklist(planned),
        outOfScope: outOfScope.trim() || null,
        boundaryNotes: boundaryNotes.trim() || null,
        versionId: versionId || null,
        epicId: epicId || null,
        sprintId: sprintId || null,
        workflowColumnId,
        moscow,
        acceptance: acceptanceItems,
      };
      await storyService.create(projectId, payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(invokeErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const versionLabel = versions.find((v) => v.id === versionId)?.title;
  const epicLabel = epics.find((e) => e.id === epicId)?.title;
  const sprintLabel = sprints.find((s) => s.id === sprintId)?.title;

  return (
    <MeridianWizardShell
      title="New user story"
      subtitle="Executable mirror of docs/us/*.md — Intent, Plan, Record and Boundaries ready for refine, implementation and AI."
      steps={STEPS}
      step={step}
      error={error}
      loading={loadingMeta}
      saving={saving}
      onClose={onClose}
      onBack={goBack}
      onStepSelect={(index) => {
        setError(null);
        setStep(index);
      }}
      onNext={goNext}
      onSubmit={() => void submit()}
      canNext={!validateStep(step)}
      canSubmit
      submitLabel="Create user story"
    >
      {step === 0 && (
        <UsForm>
          <UsFormSection
            title="User story"
            hint="Meridian preamble — As, I want, so that."
          >
            <PreamblePreview asRole={asRole} iWant={iWant} soThat={soThat} />
            <UsTextField
              id="us-as"
              label="As"
              required
              hint="Role or persona performing the action."
              value={asRole}
              onChange={setAsRole}
              placeholder="Local user"
            />
            <UsTextareaField
              id="us-want"
              label="I want"
              required
              hint="Concrete action — infinitive verb."
              value={iWant}
              onChange={setIWant}
              placeholder="create a user story with a full Meridian contract"
              rows={2}
            />
            <UsTextareaField
              id="us-that"
              label="So that"
              required
              hint="Perceived benefit — not implementation detail."
              value={soThat}
              onChange={setSoThat}
              placeholder="the board communicates product stories, not generic tasks"
              rows={2}
            />
          </UsFormSection>

          <UsFormSection title="Metadata" hint="Frontmatter — version, epic, sprint and priority.">
            <UsFieldGrid cols={2}>
              <UsTextField
                id="us-title"
                label="Short title"
                value={title}
                onChange={setTitle}
                placeholder="Derived from I want if empty"
              />
              <UsSelectField
                id="us-moscow"
                label="MoSCoW"
                required
                value={moscow}
                onChange={(v) => setMoscow(v as Moscow)}
              >
                {MOSCOW_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </UsSelectField>
              <UsSelectField id="us-version" label="Version" value={versionId} onChange={handleVersionChange}>
                <option value="">—</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} — {v.title}
                  </option>
                ))}
              </UsSelectField>
              <UsSelectField id="us-epic" label="Epic" value={epicId} onChange={setEpicId}>
                <option value="">—</option>
                {epics.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id} — {e.title}
                  </option>
                ))}
              </UsSelectField>
              <UsSelectField
                id="us-sprint"
                label="Sprint"
                span={2}
                value={sprintId}
                onChange={setSprintId}
              >
                <option value="">—</option>
                {filteredSprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.title}
                  </option>
                ))}
              </UsSelectField>
            </UsFieldGrid>
          </UsFormSection>
        </UsForm>
      )}

      {step === 1 && (
        <UsForm>
          <UsTextareaField
            id="us-why"
            label="Why"
            required
            hint="What problem does this story solve on its own?"
            value={why}
            onChange={setWhy}
            placeholder="What problem does this story solve on its own?"
            rows={3}
          />
          <UsTextareaField
            id="us-where"
            label="Where"
            required
            hint="Position in the release, dependencies, what this unblocks."
            value={whereText}
            onChange={setWhereText}
            placeholder="Position in the release, dependencies, what this unblocks"
            rows={2}
          />
          <UsField
            label="Acceptance"
            required
            hint="Minimum 2 observable criteria (demo, file, command)."
          >
            <AcceptanceEditor items={acceptance} onChange={setAcceptance} />
          </UsField>
        </UsForm>
      )}

      {step === 2 && (
        <UsForm>
          <UsFormSection title="Plan" hint="Meridian contract at create time — done when and refs required.">
            <UsTextareaField
              id="us-done"
              label="Done when"
              required
              value={doneWhen}
              onChange={setDoneWhen}
              placeholder="Objective, measurable condition to close this story"
              rows={2}
            />
            <UsTextareaField
              id="us-arch"
              label="Architecture refs"
              required
              value={architectureRefs}
              onChange={setArchitectureRefs}
              placeholder="docs/architecture/…, ADRs, relevant boundaries"
              rows={2}
            />
            <UsField
              label="Planned"
              required
              hint="Delivery plan draft — checklist."
            >
              <ChecklistEditor items={planned} onChange={setPlanned} placeholder="Planned deliverable…" />
            </UsField>
          </UsFormSection>

          <UsFormSection title="Optional" hint="Optional at create — refine later if needed.">
            <UsTextareaField
              id="us-approach"
              label="Approach"
              value={approach}
              onChange={setApproach}
              placeholder="Technical direction — filled on refine if empty"
              rows={2}
            />
            <UsTextareaField
              id="us-api"
              label="API / DB impact"
              value={apiDbImpact}
              onChange={setApiDbImpact}
              placeholder="Migrations, endpoints, affected contracts"
              rows={2}
            />
            <UsTextareaField
              id="us-sec"
              label="Security notes"
              value={securityNotes}
              onChange={setSecurityNotes}
              placeholder="Auth, sensitive data, attack surface"
              rows={2}
            />
            <UsTextField
              id="us-dec"
              label="Related decisions"
              value={relatedDecisions}
              onChange={setRelatedDecisions}
              placeholder="docs/decisions/YYYY-MM-DD.json"
            />
          </UsFormSection>
        </UsForm>
      )}

      {step === 3 && (
        <UsForm>
          <UsTextareaField
            id="us-oos"
            label="Out of scope for this story"
            value={outOfScope}
            onChange={setOutOfScope}
            placeholder="What this story explicitly does not do"
            rows={3}
          />
          <UsTextareaField
            id="us-notes"
            label="Notes"
            value={boundaryNotes}
            onChange={setBoundaryNotes}
            placeholder="Risks, links, follow-ups"
            rows={2}
          />
        </UsForm>
      )}

      {step === 4 && (
        <div>
          <div className="us-review-card">
            <p className="us-review-card__title">Preamble</p>
            <p className="us-review-card__body">
              <strong>As</strong> {asRole}, <strong>I want</strong> {iWant}, <strong>so that</strong>{" "}
              {soThat}
            </p>
          </div>
          <div className="us-review-card">
            <p className="us-review-card__title">Metadata</p>
            <p className="us-review-card__body">
              MoSCoW: {moscow}
              {versionId ? `\nVersion: ${versionId}${versionLabel ? ` — ${versionLabel}` : ""}` : ""}
              {epicId ? `\nEpic: ${epicId}${epicLabel ? ` — ${epicLabel}` : ""}` : ""}
              {sprintId ? `\nSprint: ${sprintId}${sprintLabel ? ` — ${sprintLabel}` : ""}` : ""}
            </p>
          </div>
          <div className="us-review-card">
            <p className="us-review-card__title">Intent</p>
            <p className="us-review-card__body">
              <strong>Why:</strong> {why}
              {"\n\n"}
              <strong>Where:</strong> {whereText}
              {"\n\n"}
              <strong>Acceptance:</strong>
              {"\n"}
              {acceptance
                .filter((c) => c.trim())
                .map((c, i) => `${i + 1}. ${c}`)
                .join("\n")}
            </p>
          </div>
          <div className="us-review-card">
            <p className="us-review-card__title">Plan</p>
            <p className="us-review-card__body">
              <strong>Done when:</strong> {doneWhen}
              {"\n\n"}
              <strong>Architecture refs:</strong> {architectureRefs}
              {"\n\n"}
              <strong>Planned:</strong>
              {"\n"}
              {planned
                .filter((p) => p.label.trim())
                .map((p) => `☐ ${p.label}`)
                .join("\n")}
            </p>
          </div>
        </div>
      )}
    </MeridianWizardShell>
  );
}
