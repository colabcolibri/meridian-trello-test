import { useEffect, useState } from "react";
import type { Sprint, SprintStatus } from "../../../domain/agileTypes";
import { SPRINT_STATUS_OPTIONS } from "../../../domain/agileConstants";
import { invokeErrorMessage } from "../../../lib/errors";
import { validateName } from "../../../domain/validators";
import { sprintService } from "../sprintService";
import { MeridianWizardShell, type WizardStep } from "./MeridianWizardShell";
import { UsField, UsFieldGrid, UsForm, UsSelectField, UsTextareaField, UsTextField } from "./UsFormFields";

const STEPS: WizardStep[] = [
  { id: "meta", label: "Sprint", hint: "Title and status." },
  { id: "goal", label: "Goal", hint: "Goal and done_when." },
  { id: "scope", label: "Scope", hint: "Out of scope." },
  { id: "review", label: "Review", hint: "Check before saving." },
];

export function EditSprintDialog({
  projectId,
  sprint,
  onClose,
  onSaved,
}: {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(sprint.title);
  const [status, setStatus] = useState<SprintStatus>(sprint.status);
  const [goal, setGoal] = useState(sprint.goal ?? "");
  const [doneWhen, setDoneWhen] = useState(sprint.done_when ?? "");
  const [outOfScope, setOutOfScope] = useState(sprint.out_of_scope ?? "");

  useEffect(() => {
    setTitle(sprint.title);
    setStatus(sprint.status);
    setGoal(sprint.goal ?? "");
    setDoneWhen(sprint.done_when ?? "");
    setOutOfScope(sprint.out_of_scope ?? "");
  }, [sprint]);

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      const err = validateName(title);
      if (err) return err;
      return null;
    }
    if (index === 1) {
      if (!goal.trim()) return "Goal is required.";
      if (!doneWhen.trim()) return "Done when is required.";
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
      await sprintService.update(projectId, sprint.id, {
        title: title.trim(),
        status,
        goal: goal.trim(),
        doneWhen: doneWhen.trim(),
        outOfScope: outOfScope.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(invokeErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MeridianWizardShell
      title={`Editar ${sprint.id}`}
      subtitle={`Versão ${sprint.version_id} — sprint Meridian.`}
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
      submitLabel="Salvar sprint"
    >
      {step === 0 && (
        <UsForm>
          <UsField label="Version" hint="Versão fixa — não alterável após criação.">
            <p className="rounded border border-[#091e4214] bg-[#091e4208] px-3 py-2 text-sm font-medium">
              {sprint.version_id}
            </p>
          </UsField>
          <UsFieldGrid cols={2}>
            <UsTextField id="es-title" label="Title" required value={title} onChange={setTitle} />
            <UsSelectField
              id="es-status"
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
          <UsTextareaField id="es-goal" label="Goal" required value={goal} onChange={setGoal} rows={3} />
          <UsTextareaField id="es-done" label="Done when" required value={doneWhen} onChange={setDoneWhen} rows={3} />
        </UsForm>
      )}
      {step === 2 && (
        <UsTextareaField id="es-oos" label="Out of scope" value={outOfScope} onChange={setOutOfScope} rows={4} />
      )}
      {step === 3 && (
        <div className="us-review-card">
          <p className="us-review-card__title">
            {sprint.version_id} · {title}
          </p>
          <p className="us-review-card__body">{goal}</p>
        </div>
      )}
    </MeridianWizardShell>
  );
}
