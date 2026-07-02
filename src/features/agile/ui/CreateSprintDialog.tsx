import { useEffect, useState } from "react";
import type { SprintStatus, Version } from "../../../domain/agileTypes";
import { SPRINT_STATUS_OPTIONS } from "../../../domain/agileConstants";
import { invokeErrorMessage } from "../../../lib/errors";
import { validateName } from "../../../domain/validators";
import { sprintService } from "../sprintService";
import { versionService } from "../versionService";
import { MeridianWizardShell, type WizardStep } from "./MeridianWizardShell";
import { UsFieldGrid, UsForm, UsSelectField, UsTextareaField, UsTextField } from "./UsFormFields";

const STEPS: WizardStep[] = [
  { id: "meta", label: "Sprint", hint: "Frontmatter — version, title and status." },
  { id: "goal", label: "Goal", hint: "Goal and done_when — observable sprint-template sentences." },
  { id: "scope", label: "Scope", hint: "Out of scope — what is excluded from this sprint." },
  { id: "review", label: "Review", hint: "Check before creating." },
];

export function CreateSprintDialog({
  projectId,
  defaultVersionId,
  onClose,
  onCreated,
}: {
  projectId: string;
  defaultVersionId?: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  const [versionId, setVersionId] = useState(defaultVersionId ?? "");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<SprintStatus>("planned");
  const [goal, setGoal] = useState("");
  const [doneWhen, setDoneWhen] = useState("");
  const [outOfScope, setOutOfScope] = useState("");

  useEffect(() => {
    void versionService
      .list(projectId)
      .then((vers) => {
        setVersions(vers);
        if (defaultVersionId) {
          setVersionId(defaultVersionId);
        } else if (vers[0]) {
          setVersionId(vers[0].id);
        }
      })
      .catch(() => setVersions([]));
  }, [projectId, defaultVersionId]);

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      const err = validateName(title);
      if (err) return err;
      if (!versionId) return "Select the sprint version.";
      return null;
    }
    if (index === 1) {
      if (!goal.trim()) return "Goal is required — one measurable sentence.";
      if (!doneWhen.trim()) return "Done when is required — observable closing condition.";
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
      await sprintService.create(projectId, {
        versionId,
        title: title.trim(),
        status,
        goal: goal.trim(),
        doneWhen: doneWhen.trim(),
        outOfScope: outOfScope.trim() || null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(invokeErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MeridianWizardShell
      title="New sprint"
      subtitle="Mirror of docs/sprints/*.md — goal, done_when and time-box boundaries."
      steps={STEPS}
      step={step}
      error={error}
      saving={saving}
      onClose={onClose}
      onBack={() => {
        setError(null);
        setStep((s) => Math.max(s - 1, 0));
      }}
      onStepSelect={(index) => {
        setError(null);
        setStep(index);
      }}
      onNext={goNext}
      onSubmit={() => void submit()}
      canNext={!validateStep(step)}
      canSubmit
      submitLabel="Create sprint"
    >
      {step === 0 && (
        <UsForm>
          <UsSelectField id="s-version" label="Version" required value={versionId} onChange={setVersionId}>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} — {v.title}
              </option>
            ))}
          </UsSelectField>
          <UsFieldGrid cols={2}>
            <UsTextField
              id="s-title"
              label="Title"
              required
              value={title}
              onChange={setTitle}
              placeholder="Short sprint name"
            />
            <UsSelectField
              id="s-status"
              label="Status"
              required
              value={status}
              onChange={(v) => setStatus(v as SprintStatus)}
            >
              {SPRINT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </UsSelectField>
          </UsFieldGrid>
        </UsForm>
      )}

      {step === 1 && (
        <UsForm>
          <UsTextareaField
            id="s-goal"
            label="Goal"
            required
            value={goal}
            onChange={setGoal}
            placeholder="One sentence — what this sprint proves or delivers"
            rows={3}
          />
          <UsTextareaField
            id="s-done"
            label="Done when"
            required
            value={doneWhen}
            onChange={setDoneWhen}
            placeholder="Observable condition — not 'all stories done'"
            rows={3}
          />
        </UsForm>
      )}

      {step === 2 && (
        <UsForm>
          <UsTextareaField
            id="s-oos"
            label="Out of scope for this sprint"
            value={outOfScope}
            onChange={setOutOfScope}
            placeholder="What is explicitly deferred — capacity, dependency, priority"
            rows={4}
          />
        </UsForm>
      )}

      {step === 3 && (
        <div className="us-review-card">
          <p className="us-review-card__title">
            {versionId} · {title}
          </p>
          <p className="us-review-card__body">
            <strong>Goal:</strong> {goal}
            {"\n\n"}
            <strong>Done when:</strong> {doneWhen}
            {outOfScope.trim() ? `\n\nOut of scope:\n${outOfScope}` : ""}
          </p>
        </div>
      )}
    </MeridianWizardShell>
  );
}
