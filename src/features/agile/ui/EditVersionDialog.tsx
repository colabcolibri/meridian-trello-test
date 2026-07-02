import { useEffect, useState } from "react";
import type { Version, VersionStatus } from "../../../domain/agileTypes";
import { VERSION_STATUS_OPTIONS } from "../../../domain/agileConstants";
import { parseChecklist, stringifyChecklist } from "../../../domain/meridianJson";
import { invokeErrorMessage } from "../../../lib/errors";
import { validateName } from "../../../domain/validators";
import { versionService } from "../versionService";
import { ChecklistEditor } from "./ListFieldEditor";
import { MeridianWizardShell, type WizardStep } from "./MeridianWizardShell";
import { UsField, UsFieldGrid, UsForm, UsSelectField, UsTextareaField, UsTextField } from "./UsFormFields";
import { VersionIncludedSummary } from "./VersionIncludedSummary";

const STEPS: WizardStep[] = [
  { id: "meta", label: "Release", hint: "Frontmatter — name, outcome and version status." },
  { id: "objective", label: "Objective", hint: "Objective and Done criteria." },
  { id: "scope", label: "Scope", hint: "Included derivado e Explicitly out." },
  { id: "golive", label: "Go-live", hint: "Product checklist before marking complete." },
  { id: "review", label: "Review", hint: "Check before saving." },
];

export function EditVersionDialog({
  projectId,
  version,
  onClose,
  onSaved,
}: {
  projectId: string;
  version: Version;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(version.title);
  const [status, setStatus] = useState<VersionStatus>(version.status);
  const [outcome, setOutcome] = useState(version.outcome ?? "");
  const [objective, setObjective] = useState(version.objective ?? "");
  const [doneCriteria, setDoneCriteria] = useState(version.done_criteria ?? "");
  const [explicitlyOut, setExplicitlyOut] = useState(version.explicitly_out ?? "");
  const [goLive, setGoLive] = useState(parseChecklist(version.go_live_checklist_json));

  useEffect(() => {
    setTitle(version.title);
    setStatus(version.status);
    setOutcome(version.outcome ?? "");
    setObjective(version.objective ?? "");
    setDoneCriteria(version.done_criteria ?? "");
    setExplicitlyOut(version.explicitly_out ?? "");
    setGoLive(parseChecklist(version.go_live_checklist_json));
  }, [version]);

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      const err = validateName(title);
      if (err) return err;
      if (!outcome.trim()) return "Outcome is required.";
      return null;
    }
    if (index === 1) {
      if (!objective.trim()) return "Objective is required.";
      if (!doneCriteria.trim()) return "Done criteria is required.";
      return null;
    }
    if (index === 2) {
      if (!explicitlyOut.trim()) return "Explicitly out is required.";
      return null;
    }
    if (index === 3) {
      if (goLive.map((g) => g.label.trim()).filter(Boolean).length < 1) {
        return "Go-live checklist needs at least 1 item.";
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
      await versionService.update(projectId, version.id, {
        title: title.trim(),
        status,
        outcome: outcome.trim(),
        objective: objective.trim(),
        doneCriteria: doneCriteria.trim(),
        explicitlyOut: explicitlyOut.trim(),
        goLiveChecklistJson: stringifyChecklist(goLive),
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
      title={`Editar ${version.id}`}
      subtitle="Versão Meridian — included derivado do banco."
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
      submitLabel="Salvar versão"
    >
      {step === 0 && (
        <UsForm>
          <UsFieldGrid cols={2}>
            <UsTextField id="ev-title" label="Title" required value={title} onChange={setTitle} />
            <UsSelectField
              id="ev-status"
              label="Status"
              required
              value={status}
              onChange={(v) => setStatus(v as VersionStatus)}
            >
              {VERSION_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </UsSelectField>
          </UsFieldGrid>
          <UsTextField id="ev-outcome" label="Outcome" required value={outcome} onChange={setOutcome} />
        </UsForm>
      )}
      {step === 1 && (
        <UsForm>
          <UsTextareaField id="ev-obj" label="Objective" required value={objective} onChange={setObjective} rows={4} />
          <UsTextareaField
            id="ev-done"
            label="Done criteria"
            required
            value={doneCriteria}
            onChange={setDoneCriteria}
            rows={4}
          />
        </UsForm>
      )}
      {step === 2 && (
        <UsForm>
          <UsField label="Included in this version" hint="Derivado — épicos vinculados via junction.">
            <VersionIncludedSummary projectId={projectId} versionId={version.id} />
          </UsField>
          <UsTextareaField
            id="ev-out"
            label="Explicitly out"
            required
            value={explicitlyOut}
            onChange={setExplicitlyOut}
            rows={4}
          />
        </UsForm>
      )}
      {step === 3 && (
        <UsForm>
          <UsField label="Go-live checklist" required>
            <ChecklistEditor items={goLive} onChange={setGoLive} placeholder="Verifiable item…" />
          </UsField>
        </UsForm>
      )}
      {step === 4 && (
        <div className="us-review-card">
          <p className="us-review-card__title">
            {version.id} — {title}
          </p>
          <p className="us-review-card__body">{outcome}</p>
        </div>
      )}
    </MeridianWizardShell>
  );
}
