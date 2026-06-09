"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import type { Habit, HabitStatus, Tier } from "@/lib/types";

interface MitInlineFieldProps {
  habit: Habit;
  tier: Tier;
  content: string;
  status: HabitStatus | null;
  dateKey: string;
  todayKey: string;
  onSave: (habitId: string, content: string) => Promise<void>;
  onMarkDone: (habitId: string) => Promise<void>;
}

export function MitInlineField({
  habit,
  tier,
  content,
  status,
  dateKey,
  todayKey,
  onSave,
  onMarkDone,
}: MitInlineFieldProps) {
  const [draft, setDraft] = useState(content);
  const focusedRef = useRef(false);
  const isToday = dateKey === todayKey;
  const hasContent = content.trim().length > 0;
  const isDone = status === "done";

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(content);
    }
  }, [content, dateKey]);

  const commit = async () => {
    focusedRef.current = false;
    const trimmed = draft.trim();
    if (trimmed !== content.trim()) {
      await onSave(habit.id, trimmed);
    }
  };

  if (!isToday) {
    if (!hasContent) return null;
    return (
      <div
        className="p-4 mb-4 rounded-xl border"
        style={{
          background: tier.color_bg,
          borderColor: tier.color_accent + "44",
        }}
      >
        <div className="text-[10px] font-bold tracking-wide text-[var(--text-muted)] mb-1">
          {habit.icon} MOST IMPORTANT TASK
        </div>
        <p className="text-sm text-[var(--text)] mb-2">{content}</p>
        <div
          className={clsx(
            "text-[11px] font-bold",
            isDone ? "text-[var(--success)]" : "text-[var(--warning)]"
          )}
        >
          {isDone ? `Done · +${tier.done_pts} pts` : `Attempted · ±0 pts`}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "card p-4 mb-4 border",
        isDone && "border-[var(--success)]/30"
      )}
      style={
        isDone
          ? {
              background: tier.color_bg,
              borderColor: tier.color_accent + "44",
            }
          : undefined
      }
    >
      <label
        htmlFor="mit-inline"
        className="block text-[10px] font-bold tracking-wide text-[var(--accent)] mb-2"
      >
        {habit.icon} Most Important Task
      </label>
      <textarea
        id="mit-inline"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={commit}
        placeholder="What's the one thing that matters most today?"
        rows={2}
        autoComplete="off"
        autoCorrect="on"
        enterKeyHint="done"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
      />

      {hasContent && !isDone && (
        <button
          type="button"
          onClick={() => onMarkDone(habit.id)}
          className="mt-3 w-full rounded-xl py-3 px-4 text-left font-bold text-white shadow-md active:scale-[0.98] transition-soft"
          style={{ background: tier.color_accent }}
        >
          Mark done · +{tier.done_pts} pts
          <span className="block text-xs font-normal text-white/80 mt-0.5">
            Filled in counts as attempted (±0). Tap when you actually finished it.
          </span>
        </button>
      )}

      {hasContent && isDone && (
        <div className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--success)]">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ background: tier.color_accent }}
          >
            ✓
          </span>
          Done · +{tier.done_pts} pts
        </div>
      )}

      {!hasContent && (
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          {tier.blank_pts < 0 ? `${tier.blank_pts} if left empty` : "No penalty if empty"}
        </p>
      )}
    </div>
  );
}
