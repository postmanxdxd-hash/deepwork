"use client";

import { Fragment } from "react";
import clsx from "clsx";
import { DAYS } from "@/lib/types";
import type { DailyLog, Habit, Tier } from "@/lib/types";
import { statusSymbol } from "@/lib/scoring";
import { calcDayScore } from "@/lib/scoring";
import type { ScoringContext } from "@/lib/scoring";

interface WeeklyGridProps {
  tiers: Tier[];
  habits: Habit[];
  weekDates: string[];
  logs: DailyLog[];
  scoringContext: ScoringContext;
  onCellClick: (habitId: string, date: string) => void;
}

export function WeeklyGrid({
  tiers,
  habits,
  weekDates,
  logs,
  scoringContext,
  onCellClick,
}: WeeklyGridProps) {
  const logFor = (habitId: string, date: string) =>
    logs.find((l) => l.habit_id === habitId && l.log_date === date);

  const tierGroups = tiers
    .map((tier) => ({
      tier,
      habits: habits.filter((h) => h.tier_id === tier.id),
    }))
    .filter((g) => g.habits.length > 0);

  return (
    <div className="overflow-x-auto card">
      <table className="w-full min-w-[640px] text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left p-3 text-[var(--text-muted)] font-medium sticky left-0 bg-[var(--bg-card)] z-10 min-w-[140px]">
              Habit
            </th>
            {weekDates.map((d, i) => (
              <th
                key={d}
                className="p-2 text-center text-[var(--text-muted)] font-medium text-xs"
              >
                {DAYS[i]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tierGroups.map(({ tier, habits: tierHabits }) => (
            <Fragment key={tier.id}>
              <tr className="bg-[var(--bg)]">
                <td
                  colSpan={8}
                  className="px-3 py-1.5 text-xs font-bold tracking-wide"
                  style={{ color: tier.color_text, background: tier.color_bg }}
                >
                  {tier.label}
                </td>
              </tr>
              {tierHabits.map((habit) => (
                <tr
                  key={habit.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="p-3 sticky left-0 bg-[var(--bg-card)] z-10">
                    <div className="flex items-center gap-2">
                      <span>{habit.icon}</span>
                      <span className="font-medium text-xs truncate max-w-[120px]">
                        {habit.name}
                      </span>
                    </div>
                  </td>
                  {weekDates.map((d) => {
                    if (habit.cadence === "weekly" || habit.type === "gym") {
                      const showCell = d === weekDates[weekDates.length - 1];
                      if (!showCell) {
                        return (
                          <td
                            key={d}
                            className="p-2 text-center text-[var(--text-muted)] text-xs"
                          >
                            —
                          </td>
                        );
                      }
                    }
                    const log = logFor(habit.id, d);
                    const sym = statusSymbol(habit, log);
                    const active = sym !== "·" && sym !== "—";
                    return (
                      <td key={d} className="p-1">
                        <button
                          type="button"
                          onClick={() => onCellClick(habit.id, d)}
                          className={clsx(
                            "w-full h-9 rounded-lg font-bold text-xs transition-soft cursor-pointer",
                            active
                              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)]"
                          )}
                        >
                          {sym}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
          <tr className="bg-[var(--bg)] font-bold">
            <td className="p-3 sticky left-0 bg-[var(--bg)] text-xs text-[var(--text-muted)]">
              Daily total
            </td>
            {weekDates.map((d) => {
              const score = calcDayScore(scoringContext, d);
              return (
                <td
                  key={d}
                  className={clsx(
                    "p-2 text-center text-xs",
                    score > 0
                      ? "text-[var(--success)]"
                      : score < 0
                        ? "text-[var(--danger)]"
                        : "text-[var(--text-muted)]"
                  )}
                >
                  {score > 0 ? `+${score}` : score}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
