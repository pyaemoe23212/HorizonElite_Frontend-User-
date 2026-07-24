import React from 'react';
import { Save } from 'lucide-react';

interface FormLabelProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FormLabel({ label, children, className = '' }: FormLabelProps): React.JSX.Element {
  const required = label.includes('*');

  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex min-h-7 items-end text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {required ? (
          <>
            {label.replace('*', '')}
            <span className="ml-0.5 text-red-500">*</span>
          </>
        ) : label}
      </span>
      {children}
    </label>
  );
}

interface FormSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function FormSection({ id, title, description, children }: FormSectionProps): React.JSX.Element {
  return (
    <section id={id} className="he-soft-card scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
      <div className="mb-6 border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-semibold text-[#073b70]">{title}</h2>
        {description && <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface SaveButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export function SaveButton({ children, disabled = false }: SaveButtonProps): React.JSX.Element {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="he-action inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#073b70] px-6 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#052f59] disabled:opacity-50"
    >
      <Save size={15} />
      {children}
    </button>
  );
}
