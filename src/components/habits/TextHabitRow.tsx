"use client";

import clsx from "clsx";
import type { Habit, Tier } from "@/lib/types";
import type { DailyLog } from "@/lib/types";

interface TextHabitRowProps {
  habit: Habit;
  tier: Tier;
  log: DailyLog | undefined;
  onChange: (content: string) => void;
  multiline?: boolean;
  placeholder?: string;
}

export function TextHabitRow({
  habit,
  tier,
  log,
  onChange,
  multiline = false,
  placeholder,
}: TextHabitRowProps) {
  const content = log?.content ?? "";
  const hasContent = content.trim().length > 0;
  const pts = hasContent ? tier.done_pts : tier.blank_pts;

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
      <div className="flex items-center gap-3 mb-2">
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
            {hasContent ? `+${pts}` : `${pts} if empty`} pts
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
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Write your reflection..."}
          rows={4}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      ) : (
        <input
          type="text"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "What's the highlight?"}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      )}
    </div>
  );
}
