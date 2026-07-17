import { useState } from "react";
import type { VersionStatus } from "../../../domain/agileTypes";
import { VERSION_STATUS_OPTIONS } from "../../../domain/agileConstants";
import { stringifyChecklist } from "../../../domain/meridianJson";
import { invokeErrorMessage } from "../../../lib/errors";
import { validateName } from "../../../domain/validators";
import { versionService } from "../versionService";
import { ChecklistEditor } from "./ListFieldEditor";
import { MeridianWizardShell, type WizardStep } from "./MeridianWizardShell";
import { UsField, UsFieldGrid, UsForm, UsSelectField, UsTextareaField, UsTextField } from "./UsFormFields";

const STEPS: WizardStep[] = [
  {
    id: "meta",
    label: "Release",
    hint: "Frontmatter — name, outcome and version status.",
  },
  {
    id: "objective",
    label: "Objective",
    hint: "Objective and Done criteria — version-template paragraphs.",
  },
  {
    id: "scope",
    label: "Scope",
    hint: "Included (derivado) e Explicitly out — o que entra e o que espera.",
  },
  {
    id: "golive",
    label: "Go-live",
    hint: "Product checklist before marking complete.",
  },
  {
    id: "review",
    label: "Review",
    hint: "Check before saving to the database.",
  },
];

export function CreateVersionDialog({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<VersionStatus>("planned");
  const [outcome, setOutcome] = useState("");
  const [objective, setObjective] = useState("");
  const [doneCriteria, setDoneCriteria] = useState("");
  const [explicitlyOut, setExplicitlyOut] = useState("");
  const [goLive, setGoLive] = useState([{ label: "", done: false }]);

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      const err = validateName(title);
      if (err) return err;
      if (!outcome.trim()) return "Outcome is required — one product delivery sentence.";
      return null;
    }
    if (index === 1) {
      if (!objective.trim()) return "Objective is required (release paragraph).";
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
      await versionService.create(projectId, {
        title: title.trim(),
        status,
        outcome: outcome.trim(),
        objective: objective.trim(),
        doneCriteria: doneCriteria.trim(),
        explicitlyOut: explicitlyOut.trim(),
        goLiveChecklistJson: stringifyChecklist(goLive),
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
      title="New version"
      subtitle="Mirror of docs/versions/*.md — objective, scope, go-live and outcome."
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
      submitLabel="Create version"
    >
      {step === 0 && (
        <UsForm>
          <UsFieldGrid cols={2}>
            <UsTextField
              id="v-title"
              label="Title"
              required
              value={title}
              onChange={setTitle}
              placeholder="Short release name"
            />
            <UsSelectField
              id="v-status"
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
          <UsTextField
            id="v-outcome"
            label="Outcome"
            required
            hint="One sentence — what changes in the product when delivered."
            value={outcome}
            onChange={setOutcome}
            placeholder="When delivered, what changes in the product?"
          />
        </UsForm>
      )}

      {step === 1 && (
        <UsForm>
          <UsTextareaField
            id="v-obj"
            label="Objective"
            required
            value={objective}
            onChange={setObjective}
            placeholder="Paragraph — release theme, main capabilities"
            rows={4}
          />
          <UsTextareaField
            id="v-done"
            label="Done criteria"
            required
            value={doneCriteria}
            onChange={setDoneCriteria}
            placeholder="Observable condition to mark the version complete"
            rows={4}
          />
        </UsForm>
      )}

      {step === 2 && (
        <UsForm>
          <UsField label="Included in this version" hint="Derivado dos vínculos épico↔versão — somente leitura.">
            <p className="mb-3 text-sm text-[var(--trello-text-muted)]">
              Após criar a versão, vincule épicos na edição de épico. O included aparecerá aqui
              automaticamente.
            </p>
          </UsField>
          <UsTextareaField
            id="v-out"
            label="Explicitly out"
            required
            value={explicitlyOut}
            onChange={setExplicitlyOut}
            placeholder="Bullets with rationale — what waits for a later version"
            rows={4}
          />
        </UsForm>
      )}

      {step === 3 && (
        <UsForm>
          <UsField label="Go-live checklist" required hint="Product checklist before go-live.">
            <ChecklistEditor items={goLive} onChange={setGoLive} placeholder="Verifiable item…" />
          </UsField>
        </UsForm>
      )}

      {step === 4 && (
        <div>
          <div className="us-review-card">
            <p className="us-review-card__title">{title || "Version"}</p>
            <p className="us-review-card__body">
              Status: {status}
              {"\n"}
              Outcome: {outcome}
            </p>
          </div>
          <div className="us-review-card">
            <p className="us-review-card__title">Objective</p>
            <p className="us-review-card__body">{objective}</p>
          </div>
          <div className="us-review-card">
            <p className="us-review-card__title">Done criteria</p>
            <p className="us-review-card__body">{doneCriteria}</p>
          </div>
        </div>
      )}
    </MeridianWizardShell>
  );
}
