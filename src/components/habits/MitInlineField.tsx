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
  const [markingDone, setMarkingDone] = useState(false);
  const focusedRef = useRef(false);
  const isToday = dateKey === todayKey;
  const hasText = Boolean(content.trim() || draft.trim());
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

  const handleMarkDone = async () => {
    const trimmed = draft.trim();
    if (!trimmed || markingDone) return;
    setMarkingDone(true);
    try {
      focusedRef.current = false;
      if (trimmed !== content.trim()) {
        await onSave(habit.id, trimmed);
      }
      await onMarkDone(habit.id);
    } finally {
      setMarkingDone(false);
    }
  };

  if (!isToday) {
    if (!hasText) return null;
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

      {hasText && !isDone && (
        <button
          type="button"
          onClick={handleMarkDone}
          disabled={markingDone}
          className="mt-3 w-full rounded-xl py-3 px-4 text-left font-bold text-white shadow-md active:scale-[0.98] transition-soft disabled:opacity-70"
          style={{ background: tier.color_accent }}
        >
          {markingDone ? "Saving…" : `Mark done · +${tier.done_pts} pts`}
          <span className="block text-xs font-normal text-white/80 mt-0.5">
            Filled in counts as attempted (±0). Tap when you actually finished it.
          </span>
        </button>
      )}

      {hasText && isDone && (
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

      {!hasText && (
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          {tier.blank_pts < 0 ? `${tier.blank_pts} if left empty` : "No penalty if empty"}
        </p>
      )}
    </div>
  );
}
