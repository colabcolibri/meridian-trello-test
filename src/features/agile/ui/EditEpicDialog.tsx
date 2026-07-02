import { useEffect, useState } from "react";
import type { Epic, EpicStatus, Version } from "../../../domain/agileTypes";
import { EPIC_STATUS_OPTIONS } from "../../../domain/agileConstants";
import { parseStringList, stringifyStringList } from "../../../domain/meridianJson";
import { invokeErrorMessage } from "../../../lib/errors";
import { validateName } from "../../../domain/validators";
import { epicService } from "../epicService";
import { versionService } from "../versionService";
import { StringListEditor } from "./ListFieldEditor";
import { MeridianWizardShell, type WizardStep } from "./MeridianWizardShell";
import { UsField, UsFieldGrid, UsForm, UsSelectField, UsTextareaField, UsTextField } from "./UsFormFields";
import { VersionMultiPicker } from "./VersionMultiPicker";

const STEPS: WizardStep[] = [
  { id: "meta", label: "Epic", hint: "Title, outcome, status, versions." },
  { id: "capability", label: "Capability", hint: "Problem and behavior." },
  { id: "outcome", label: "Outcome", hint: "Expected outcome and boundaries." },
  { id: "review", label: "Review", hint: "Check before saving." },
];

export function EditEpicDialog({
  projectId,
  epic,
  onClose,
  onSaved,
}: {
  projectId: string;
  epic: Epic;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [title, setTitle] = useState(epic.title);
  const [status, setStatus] = useState<EpicStatus>(epic.status);
  const [outcome, setOutcome] = useState(epic.outcome ?? "");
  const [capability, setCapability] = useState(epic.capability ?? "");
  const [expectedOutcome, setExpectedOutcome] = useState(epic.expected_outcome ?? "");
  const [outOfScope, setOutOfScope] = useState(epic.out_of_scope ?? "");
  const [notes, setNotes] = useState(epic.notes ?? "");
  const [profiles, setProfiles] = useState<string[]>(parseStringList(epic.profiles_json));
  const [versionIds, setVersionIds] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const [vers, vIds] = await Promise.all([
          versionService.list(projectId),
          epicService.getVersionIds(projectId, epic.id),
        ]);
        setVersions(vers);
        setVersionIds(vIds);
      } catch (err) {
        setError(invokeErrorMessage(err));
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, [projectId, epic.id]);

  const toggleVersion = (id: string) => {
    setVersionIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      const err = validateName(title);
      if (err) return err;
      if (!outcome.trim()) return "Outcome is required.";
      if (versionIds.length < 1) return "Select at least one linked version.";
      return null;
    }
    if (index === 1 && capability.trim().length < 40) {
      return "Capability must describe problem and behavior (min. ~40 characters).";
    }
    if (index === 2) {
      if (!expectedOutcome.trim()) return "Expected outcome is required.";
      if (!outOfScope.trim()) return "Out of scope is required.";
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
      await epicService.update(
        projectId,
        epic.id,
        {
          title: title.trim(),
          status,
          outcome: outcome.trim(),
          capability: capability.trim(),
          expectedOutcome: expectedOutcome.trim(),
          outOfScope: outOfScope.trim(),
          notes: notes.trim() || null,
          profilesJson: stringifyStringList(profiles),
        },
        versionIds,
      );
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
      title={`Editar ${epic.id}`}
      subtitle="Épico Meridian — versões via relação no banco."
      steps={STEPS}
      step={step}
      error={error}
      loading={loadingMeta}
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
      submitLabel="Salvar épico"
    >
      {step === 0 && (
        <UsForm>
          <UsFieldGrid cols={2}>
            <UsTextField id="ee-title" label="Title" required value={title} onChange={setTitle} />
            <UsSelectField
              id="ee-status"
              label="Status"
              required
              value={status}
              onChange={(v) => setStatus(v as EpicStatus)}
            >
              {EPIC_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </UsSelectField>
          </UsFieldGrid>
          <UsTextField id="ee-outcome" label="Outcome" required value={outcome} onChange={setOutcome} />
          <VersionMultiPicker
            versions={versions}
            selectedIds={versionIds}
            onToggle={toggleVersion}
            required
          />
          <UsField label="Profiles">
            <StringListEditor items={profiles} onChange={setProfiles} placeholder="User profile" />
          </UsField>
        </UsForm>
      )}
      {step === 1 && (
        <UsForm>
          <UsTextareaField id="ee-cap" label="Capability" required value={capability} onChange={setCapability} rows={8} />
        </UsForm>
      )}
      {step === 2 && (
        <UsForm>
          <UsTextareaField
            id="ee-exp"
            label="Expected outcome"
            required
            value={expectedOutcome}
            onChange={setExpectedOutcome}
            rows={3}
          />
          <UsTextareaField
            id="ee-oos"
            label="Out of scope for this epic"
            required
            value={outOfScope}
            onChange={setOutOfScope}
            rows={3}
          />
          <UsTextareaField id="ee-notes" label="Notes" value={notes} onChange={setNotes} rows={2} />
        </UsForm>
      )}
      {step === 3 && (
        <div className="us-review-card">
          <p className="us-review-card__title">{title}</p>
          <p className="us-review-card__body">
            Versões: {versionIds.join(", ") || "—"}
          </p>
        </div>
      )}
    </MeridianWizardShell>
  );
}
