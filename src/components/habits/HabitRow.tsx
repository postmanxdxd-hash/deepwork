"use client";

import clsx from "clsx";
import type { Habit, Tier } from "@/lib/types";
import { pointsForHabitLog } from "@/lib/scoring";
import type { DailyLog } from "@/lib/types";

interface HabitRowProps {
  habit: Habit;
  tier: Tier;
  log: DailyLog | undefined;
  onCycle: () => void;
}

export function HabitRow({ habit, tier, log, onCycle }: HabitRowProps) {
  const status = log?.status ?? null;
  const pts = log?.status
    ? pointsForHabitLog(habit, tier, log)
    : null;

  return (
    <button
      type="button"
      onClick={onCycle}
      className={clsx(
        "w-full flex items-center gap-3 p-3.5 rounded-xl mb-2 transition-soft text-left cursor-pointer",
        status === "done"
          ? "border"
          : status === "blank"
            ? "bg-[var(--bg)] border border-[var(--border)]"
            : "card"
      )}
      style={
        status === "done"
          ? {
              background: tier.color_bg,
              borderColor: tier.color_accent + "44",
            }
          : undefined
      }
    >
      <span className="text-xl w-7 text-center shrink-0">{habit.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text)] truncate">
          {habit.name}
        </div>
        {pts !== null && (
          <div
            className={clsx(
              "text-[11px] font-bold",
              pts > 0
                ? "text-[var(--success)]"
                : pts < 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--text-muted)]"
            )}
          >
            {pts > 0 ? `+${pts}` : pts === 0 ? "±0" : pts} pts
          </div>
        )}
      </div>
      <div
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 border-2 transition-soft",
          status === "done"
            ? "text-white border-transparent"
            : status === "attempted"
              ? "border-[var(--warning)] text-[var(--warning)] bg-[var(--warning)]/10"
              : status === "blank"
                ? "border-[var(--danger)] text-[var(--danger)] bg-[var(--danger)]/10"
                : "border-[var(--border)] text-[var(--text-muted)]"
        )}
        style={
          status === "done"
            ? { background: tier.color_accent, borderColor: tier.color_accent }
            : undefined
        }
      >
        {status === "done" ? "X" : status === "attempted" ? "•" : status === "blank" ? "—" : "·"}
      </div>
    </button>
  );
}
