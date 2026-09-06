import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle disabled:opacity-60 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30";

function Field({
  id, label, hint, error, required, children,
}: {
  id: string; label?: string; hint?: string; error?: string; required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-danger-600" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {/* Errors are announced; hints are not, to avoid noise on every keystroke. */}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-foreground-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string; hint?: string; error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, id, required, ...props }, ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(control, error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/30", className)}
        {...props}
      />
    </Field>
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string; hint?: string; error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, id, required, ...props }, ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(control, "min-h-24 resize-y", error && "border-danger-500", className)}
        {...props}
      />
    </Field>
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string; hint?: string; error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, hint, error, id, required, children, ...props }, ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required}>
      <select
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(control, "cursor-pointer", className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
});

export function Checkbox({
  label, className, id, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <label htmlFor={fieldId} className={cn("flex cursor-pointer items-center gap-2 text-sm text-foreground", className)}>
      <input
        id={fieldId}
        type="checkbox"
        className="size-4 shrink-0 rounded border-border-strong text-primary-600 focus:ring-2 focus:ring-primary-500/40"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
