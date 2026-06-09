"use client";

import { useEffect, useRef, useState } from "react";
import type { Habit } from "@/lib/types";

interface MitInlineFieldProps {
  habit: Habit;
  content: string;
  dateKey: string;
  todayKey: string;
  onSave: (habitId: string, content: string) => Promise<void>;
}

export function MitInlineField({
  habit,
  content,
  dateKey,
  todayKey,
  onSave,
}: MitInlineFieldProps) {
  const [draft, setDraft] = useState(content);
  const focusedRef = useRef(false);
  const isToday = dateKey === todayKey;

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
    if (!content.trim()) return null;
    return (
      <div className="card p-4 mb-4">
        <div className="text-[10px] font-bold tracking-wide text-[var(--text-muted)] mb-1">
          {habit.icon} MOST IMPORTANT TASK
        </div>
        <p className="text-sm text-[var(--text)]">{content}</p>
      </div>
    );
  }

  return (
    <div className="card p-4 mb-4 border border-[var(--accent)]/30">
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
    </div>
  );
}
