import type { ReactNode } from "react";

export interface WizardStep {
  id: string;
  label: string;
  hint?: string;
}

export interface MeridianWizardShellProps {
  title: string;
  subtitle: string;
  steps: WizardStep[];
  step: number;
  error: string | null;
  loading?: boolean;
  saving?: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onStepSelect?: (index: number) => void;
  canNext: boolean;
  canSubmit: boolean;
  submitLabel?: string;
  children: ReactNode;
}

export function MeridianWizardShell({
  title,
  subtitle,
  steps,
  step,
  error,
  loading,
  saving,
  onClose,
  onBack,
  onNext,
  onSubmit,
  onStepSelect,
  canNext,
  canSubmit,
  submitLabel = "Create",
  children,
}: MeridianWizardShellProps) {
  const isLast = step >= steps.length - 1;

  return (
    <div
      className="us-modal-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="us-wizard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meridian-wizard-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="us-wizard__header">
          <div className="us-wizard__header-text">
            <p className="us-wizard__eyebrow">Meridian · structural contract</p>
            <h2 id="meridian-wizard-title" className="us-wizard__title">
              {title}
            </h2>
            <p className="us-wizard__subtitle">{subtitle}</p>
          </div>
          <button type="button" className="us-wizard__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <nav className="us-wizard__nav" aria-label="Steps">
          {steps.map((s, index) => {
            const state =
              index < step ? "done" : index === step ? "active" : "pending";
            return (
              <button
                key={s.id}
                type="button"
                className={`us-wizard__step us-wizard__step--${state}`}
                disabled={index > step}
                onClick={() => index < step && onStepSelect?.(index)}
                aria-current={index === step ? "step" : undefined}
              >
                <span className="us-wizard__step-index">{index + 1}</span>
                <span className="us-wizard__step-label">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="us-wizard__body">
          {loading ? (
            <p className="us-wizard__loading">Loading metadata…</p>
          ) : (
            <>
              <div className="us-wizard__step-head">
                <h3 className="us-wizard__step-title">{steps[step]?.label}</h3>
                {steps[step]?.hint && (
                  <p className="us-wizard__step-hint">{steps[step].hint}</p>
                )}
              </div>
              {error && <div className="us-alert-error">{error}</div>}
              {children}
            </>
          )}
        </div>

        <footer className="us-wizard__footer">
          <div className="us-wizard__footer-meta">
            Step {step + 1} of {steps.length}
          </div>
          <div className="us-wizard__footer-actions">
            <button
              type="button"
              className="us-btn-ghost"
              disabled={saving || step === 0}
              onClick={onBack}
            >
              Back
            </button>
            {!isLast ? (
              <button
                type="button"
                className="trello-btn-primary px-4 py-2 text-sm"
                disabled={saving || loading || !canNext}
                onClick={onNext}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="trello-btn-primary px-4 py-2 text-sm"
                disabled={saving || loading || !canSubmit}
                onClick={onSubmit}
              >
                {saving ? "Saving…" : submitLabel}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
