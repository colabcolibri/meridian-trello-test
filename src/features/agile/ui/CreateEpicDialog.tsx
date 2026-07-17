import { useEffect, useState } from "react";
import type { EpicStatus, Version } from "../../../domain/agileTypes";
import { EPIC_STATUS_OPTIONS } from "../../../domain/agileConstants";
import { stringifyStringList } from "../../../domain/meridianJson";
import { StringListEditor } from "./ListFieldEditor";
import { invokeErrorMessage } from "../../../lib/errors";
import { validateName } from "../../../domain/validators";
import { epicService } from "../epicService";
import { versionService } from "../versionService";
import { VersionMultiPicker } from "./VersionMultiPicker";
import { MeridianWizardShell, type WizardStep } from "./MeridianWizardShell";
import { UsField, UsFieldGrid, UsForm, UsSelectField, UsTextareaField, UsTextField } from "./UsFormFields";

const STEPS: WizardStep[] = [
  { id: "meta", label: "Epic", hint: "Frontmatter — title, outcome, status, versions and profiles." },
  { id: "capability", label: "Capability", hint: "User problem and expected product behavior." },
  { id: "outcome", label: "Outcome", hint: "Expected outcome and epic out of scope." },
  { id: "review", label: "Review", hint: "Check the epic-template mirror." },
];

export function CreateEpicDialog({
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
  const [versions, setVersions] = useState<Version[]>([]);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EpicStatus>("active");
  const [outcome, setOutcome] = useState("");
  const [capability, setCapability] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [outOfScope, setOutOfScope] = useState("");
  const [notes, setNotes] = useState("");
  const [profiles, setProfiles] = useState<string[]>([""]);
  const [versionIds, setVersionIds] = useState<string[]>([]);

  useEffect(() => {
    void versionService.list(projectId).then(setVersions).catch(() => setVersions([]));
  }, [projectId]);

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      const err = validateName(title);
      if (err) return err;
      if (!outcome.trim()) return "Outcome is required — one epic delivery sentence.";
      if (versionIds.length < 1) return "Select at least one linked version.";
      return null;
    }
    if (index === 1) {
      if (capability.trim().length < 40) {
        return "Capability must describe problem and behavior (min. ~40 characters).";
      }
      return null;
    }
    if (index === 2) {
      if (!expectedOutcome.trim()) return "Expected outcome is required.";
      if (!outOfScope.trim()) return "Out of scope for this epic is required.";
      return null;
    }
    return null;
  };

  const toggleVersion = (id: string) => {
    setVersionIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
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
      await epicService.create(
        projectId,
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
      title="New epic"
      subtitle="Mirror of docs/epics/*.md — capability, outcome and product boundaries."
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
      submitLabel="Create epic"
    >
      {step === 0 && (
        <UsForm>
          <UsFieldGrid cols={2}>
            <UsTextField
              id="e-title"
              label="Title"
              required
              value={title}
              onChange={setTitle}
              placeholder="Capability name"
            />
            <UsSelectField
              id="e-status"
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
          <UsTextField
            id="e-outcome"
            label="Outcome"
            required
            value={outcome}
            onChange={setOutcome}
            placeholder="One sentence — epic done at product level"
          />
          <VersionMultiPicker
            versions={versions}
            selectedIds={versionIds}
            onToggle={toggleVersion}
            required
          />
          <UsField label="Profiles" hint="Profiles from 03_user_types.md">
            <StringListEditor items={profiles} onChange={setProfiles} placeholder="User profile" />
          </UsField>
        </UsForm>
      )}

      {step === 1 && (
        <UsForm>
          <UsTextareaField
            id="e-cap"
            label="Capability"
            required
            hint="Two short paragraphs — problem → behavior."
            value={capability}
            onChange={setCapability}
            placeholder="Paragraph 1: user problem today…&#10;&#10;Paragraph 2: what the product offers after…"
            rows={8}
          />
        </UsForm>
      )}

      {step === 2 && (
        <UsForm>
          <UsTextareaField
            id="e-exp"
            label="Expected outcome"
            required
            value={expectedOutcome}
            onChange={setExpectedOutcome}
            placeholder="How the manager recognizes the epic is done"
            rows={3}
          />
          <UsTextareaField
            id="e-oos"
            label="Out of scope for this epic"
            required
            value={outOfScope}
            onChange={setOutOfScope}
            placeholder="Bullets com rationale"
            rows={3}
          />
          <UsTextareaField
            id="e-notes"
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Decisions, risks, links"
            rows={2}
          />
        </UsForm>
      )}

      {step === 3 && (
        <div className="us-review-card">
          <p className="us-review-card__title">{title}</p>
          <p className="us-review-card__body">
            {outcome}
            {"\n\n"}
            Versions: {versionIds.join(", ") || "—"}
          </p>
        </div>
      )}
    </MeridianWizardShell>
  );
}
