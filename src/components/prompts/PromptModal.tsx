"use client";

import clsx from "clsx";

interface PromptModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSnooze?: () => void;
  onSkip?: () => void;
  submitLabel?: string;
  snoozeLabel?: string;
  skipLabel?: string;
  required?: boolean;
}

export function PromptModal({
  open,
  title,
  subtitle,
  placeholder,
  value,
  onChange,
  onSubmit,
  onSnooze,
  onSkip,
  submitLabel = "Save",
  snoozeLabel = "Snooze",
  skipLabel = "Skip for today",
  required = false,
}: PromptModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        className="relative w-full max-w-md card p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4"
      >
        <h2 className="text-xl font-bold mb-1">{title}</h2>
        {subtitle && (
          <p className="text-sm text-[var(--text-muted)] mb-4">{subtitle}</p>
        )}
        <textarea
          autoFocus
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-4"
        />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={required && !value.trim()}
            className={clsx(
              "w-full rounded-xl py-3 font-semibold transition-soft cursor-pointer",
              required && !value.trim()
                ? "bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--accent)] text-white hover:opacity-90"
            )}
          >
            {submitLabel}
          </button>
          <div className="flex gap-2">
            {onSnooze && (
              <button
                type="button"
                onClick={onSnooze}
                className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--text-muted)] cursor-pointer hover:bg-[var(--bg)]"
              >
                {snoozeLabel}
              </button>
            )}
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--text-muted)] cursor-pointer hover:bg-[var(--bg)]"
              >
                {skipLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
