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
  onEdit?: () => void;
  /** Done ↔ unset only — no attempted or blank states. */
  binary?: boolean;
  applyBlankPenalties?: boolean;
}

export function HabitRow({
  habit,
  tier,
  log,
  onCycle,
  onEdit,
  binary = false,
  applyBlankPenalties = true,
}: HabitRowProps) {
  const rawStatus = log?.status ?? null;
  const status =
    binary && rawStatus !== "done" ? null : rawStatus;
  const pts =
    status === "done" || (!binary && log?.status)
      ? pointsForHabitLog(habit, tier, log, applyBlankPenalties)
      : binary
        ? null
        : log?.status
          ? pointsForHabitLog(habit, tier, log, applyBlankPenalties)
          : null;

  return (
    <div
      className={clsx(
        "w-full flex items-center gap-2 p-3.5 rounded-xl mb-2 transition-soft",
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
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] cursor-pointer"
          aria-label={`Rename ${habit.name}`}
        >
          ✏️
        </button>
      )}
      <button
        type="button"
        onClick={onCycle}
        className="flex-1 flex items-center gap-3 text-left cursor-pointer min-w-0"
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
              : !binary && status === "attempted"
                ? "border-[var(--warning)] text-[var(--warning)] bg-[var(--warning)]/10"
                : !binary && status === "blank"
                  ? "border-[var(--danger)] text-[var(--danger)] bg-[var(--danger)]/10"
                  : "border-[var(--border)] text-[var(--text-muted)]"
          )}
          style={
            status === "done"
              ? { background: tier.color_accent, borderColor: tier.color_accent }
              : undefined
          }
        >
          {status === "done"
            ? "X"
            : !binary && status === "attempted"
              ? "•"
              : !binary && status === "blank"
                ? "—"
                : "·"}
        </div>
      </button>
    </div>
  );
}
