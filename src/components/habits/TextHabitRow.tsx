"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { Habit, Tier } from "@/lib/types";
import type { DailyLog } from "@/lib/types";

interface TextHabitRowProps {
  habit: Habit;
  tier: Tier;
  log: DailyLog | undefined;
  onSave: (content: string) => void | Promise<void>;
  onEdit?: () => void;
  multiline?: boolean;
  placeholder?: string;
  applyBlankPenalties?: boolean;
}

export function TextHabitRow({
  habit,
  tier,
  log,
  onSave,
  onEdit,
  multiline = false,
  placeholder,
  applyBlankPenalties = true,
}: TextHabitRowProps) {
  const savedContent = log?.content ?? "";
  const [draft, setDraft] = useState(savedContent);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(savedContent);
    }
  }, [savedContent, log?.id]);

  const hasContent = savedContent.trim().length > 0;
  const emptyPts = applyBlankPenalties ? tier.blank_pts : 0;
  const pts = hasContent ? tier.done_pts : emptyPts;

  const commit = async () => {
    focusedRef.current = false;
    if (draft.trim() !== savedContent.trim()) {
      await onSave(draft);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-base text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <div
      className={clsx(
        "p-3.5 rounded-xl mb-2 transition-soft border",
        hasContent ? "" : "card"
      )}
      style={
        hasContent
          ? {
              background: tier.color_bg,
              borderColor: tier.color_accent + "44",
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2 mb-2">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent-soft)] cursor-pointer"
            aria-label={`Rename ${habit.name}`}
          >
            ✏️
          </button>
        )}
        <span className="text-xl w-7 text-center shrink-0">{habit.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--text)]">
            {habit.name}
          </div>
          <div
            className={clsx(
              "text-[11px] font-bold",
              hasContent ? "text-[var(--success)]" : "text-[var(--text-muted)]"
            )}
          >
            {hasContent
              ? `+${pts}`
              : applyBlankPenalties
                ? `${pts} if empty`
                : "not due yet"}{" "}
            pts
          </div>
        </div>
        {hasContent && (
          <span
            className="text-xs font-bold px-2 py-1 rounded-lg text-white"
            style={{ background: tier.color_accent }}
          >
            Done
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={commit}
          placeholder={placeholder ?? "Write your reflection..."}
          rows={4}
          autoComplete="off"
          autoCorrect="on"
          className={`${fieldClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={commit}
          placeholder={placeholder ?? "What's the highlight?"}
          autoComplete="off"
          autoCorrect="on"
          enterKeyHint="done"
          className={fieldClass}
        />
      )}
    </div>
  );
}
