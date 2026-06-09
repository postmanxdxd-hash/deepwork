"use client";

import type { DailyLog, Habit, Tier } from "@/lib/types";
import { isWeekend, shouldApplyBlankPenalties } from "@/lib/reminders/timezone";
import { GymRow } from "./GymRow";
import { TextHabitRow } from "./TextHabitRow";

interface WeeklyLogSectionProps {
  gymHabit: Habit | undefined;
  weeklyReviewHabit: Habit | undefined;
  weeklyReviewTier: Tier | undefined;
  weekDates: string[];
  dateKey: string;
  gymLogDate: string;
  logs: DailyLog[];
  timezone?: string;
  onGym: (habitId: string, sessions: number) => void;
  onTextChange: (habitId: string, content: string) => void;
}

export function WeeklyLogSection({
  gymHabit,
  weeklyReviewHabit,
  weeklyReviewTier,
  weekDates,
  dateKey,
  gymLogDate,
  logs,
  timezone = "Asia/Beirut",
  onGym,
  onTextChange,
}: WeeklyLogSectionProps) {
  const showWeeklyReview =
    Boolean(weeklyReviewHabit && weeklyReviewTier) &&
    isWeekend(dateKey, timezone);

  if (!gymHabit && !showWeeklyReview) return null;

  const logFor = (habitId: string, logDate: string) =>
    logs.find((l) => l.habit_id === habitId && l.log_date === logDate);

  const weeklyReviewLog = weeklyReviewHabit
    ? (() => {
        for (let i = weekDates.length - 1; i >= 0; i--) {
          const log = logFor(weeklyReviewHabit.id, weekDates[i]);
          if (log?.content?.trim()) return log;
        }
        return logFor(weeklyReviewHabit.id, gymLogDate);
      })()
    : undefined;

  const applyBlankPenalties = shouldApplyBlankPenalties(dateKey, timezone);

  return (
    <section className="mb-5 mt-6 pt-4 border-t border-[var(--border)]">
      <h2 className="text-xs font-bold tracking-wide text-[var(--text-muted)] mb-3">
        WEEKLY
      </h2>
      {gymHabit && (
        <GymRow
          sessions={logFor(gymHabit.id, gymLogDate)?.gym_sessions ?? 0}
          onChange={(s) => onGym(gymHabit.id, s)}
        />
      )}
      {showWeeklyReview && weeklyReviewHabit && weeklyReviewTier && (
        <TextHabitRow
          habit={weeklyReviewHabit}
          tier={weeklyReviewTier}
          log={weeklyReviewLog}
          applyBlankPenalties={applyBlankPenalties}
          multiline
          onSave={(c) => onTextChange(weeklyReviewHabit.id, c)}
          placeholder="How was your week? Wins, lessons, focus for next week..."
        />
      )}
    </section>
  );
}
