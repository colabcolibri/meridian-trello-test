import type { ReactNode } from "react";

/* ── Layout containers ─────────────────────────────────────────── */

export function UsForm({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["us-form", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function UsFormSection({
  title,
  hint,
  children,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="us-form-section">
      {(title || hint) && (
        <header className="us-form-section__head">
          {title && <h4 className="us-form-section__title">{title}</h4>}
          {hint && <p className="us-form-section__hint">{hint}</p>}
        </header>
      )}
      <div className="us-form-section__body">{children}</div>
    </section>
  );
}

export function UsFieldGrid({
  cols = 1,
  children,
  className,
}: {
  cols?: 1 | 2;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "us-field-grid",
        cols === 2 ? "us-field-grid--2" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/* ── Single field unit (label + hint + control) ─────────────────── */

export function UsField({
  id,
  label,
  required,
  hint,
  children,
  span = 1,
}: {
  id?: string;
  label: ReactNode;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  span?: 1 | 2;
}) {
  return (
    <div className={["us-field", span === 2 ? "us-field--span-2" : ""].filter(Boolean).join(" ")}>
      <label htmlFor={id} className="us-field__head">
        <span className={`us-field__label ${required ? "us-field__label--required" : ""}`}>
          {label}
        </span>
        {hint && <span className="us-field__hint">{hint}</span>}
      </label>
      <div className="us-field__control">{children}</div>
    </div>
  );
}

/* ── Raw controls (use inside UsField or composites) ───────────── */

export function UsTextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      className="us-control us-control--input"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function UsTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      id={id}
      className="us-control us-control--textarea"
      rows={rows}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function UsSelect({
  id,
  value,
  onChange,
  children,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      id={id}
      className="us-control us-control--select"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );
}

/* ── Composites (label + control bundled) ───────────────────────── */

export function UsTextField({
  id,
  label,
  required,
  hint,
  span,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  hint?: string;
  span?: 1 | 2;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <UsField id={id} label={label} required={required} hint={hint} span={span}>
      <UsTextInput
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </UsField>
  );
}

export function UsTextareaField({
  id,
  label,
  required,
  hint,
  span,
  value,
  onChange,
  placeholder,
  rows,
  disabled,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  hint?: string;
  span?: 1 | 2;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <UsField id={id} label={label} required={required} hint={hint} span={span}>
      <UsTextarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
    </UsField>
  );
}

export function UsSelectField({
  id,
  label,
  required,
  hint,
  span,
  value,
  onChange,
  disabled,
  children,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  hint?: string;
  span?: 1 | 2;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <UsField id={id} label={label} required={required} hint={hint} span={span}>
      <UsSelect id={id} value={value} onChange={onChange} disabled={disabled}>
        {children}
      </UsSelect>
    </UsField>
  );
}

/* ── Legacy section (modals de detalhe) ─────────────────────────── */

export function UsSection({
  number,
  title,
  hint,
  children,
}: {
  number: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="us-section">
      <div className="us-section__head">
        <span className="us-section__number">{number}</span>
        <h3 className="us-section__title">{title}</h3>
      </div>
      {hint && <p className="us-section__hint">{hint}</p>}
      {children}
    </section>
  );
}

/** @deprecated Use UsField or UsTextField */
export function UsFieldLabel({
  htmlFor,
  required,
  children,
  hint,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="us-field__head">
      <span className={`us-field__label ${required ? "us-field__label--required" : ""}`}>
        {children}
      </span>
      {hint && <span className="us-field__hint">{hint}</span>}
    </label>
  );
}

export function PreamblePreview({
  asRole,
  iWant,
  soThat,
}: {
  asRole: string;
  iWant: string;
  soThat: string;
}) {
  const empty = !asRole.trim() && !iWant.trim() && !soThat.trim();
  return (
    <div className={`us-preamble-preview${empty ? " us-preamble-preview--empty" : ""}`}>
      <p className="us-preamble-preview__label">Live preview</p>
      <p className="us-preamble-preview__text">
        <span className="us-preamble-preview__kw">As</span>{" "}
        <span className="us-preamble-preview__val">{asRole.trim() || "…"}</span>
        {", "}
        <span className="us-preamble-preview__kw">I want</span>{" "}
        <span className="us-preamble-preview__val">{iWant.trim() || "…"}</span>
        {", "}
        <span className="us-preamble-preview__kw">so that</span>{" "}
        <span className="us-preamble-preview__val">{soThat.trim() || "…"}</span>
      </p>
    </div>
  );
}
