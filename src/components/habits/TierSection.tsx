"use client";

import type { DailyLog, Habit, Tier } from "@/lib/types";
import { tierPointsLabel } from "@/lib/rubric/templates";
import { HabitRow } from "./HabitRow";
import { TextHabitRow } from "./TextHabitRow";
import { DeepWorkRow } from "./DeepWorkRow";
import { GymRow } from "./GymRow";

interface TierSectionProps {
  tier: Tier;
  habits: Habit[];
  dateKey: string;
  weekDates: string[];
  logs: DailyLog[];
  onCycle: (habitId: string) => void;
  onTextChange: (habitId: string, content: string) => void;
  onDeepWork: (habitId: string, blocks: number) => void;
  onGym: (habitId: string, sessions: number) => void;
  gymLogDate: string;
}

export function TierSection({
  tier,
  habits,
  dateKey,
  weekDates,
  logs,
  onCycle,
  onTextChange,
  onDeepWork,
  onGym,
  gymLogDate,
}: TierSectionProps) {
  if (!habits.length) return null;

  const logFor = (habitId: string, date: string) =>
    logs.find((l) => l.habit_id === habitId && l.log_date === date);

  const weeklyLogFor = (habitId: string) => {
    for (let i = weekDates.length - 1; i >= 0; i--) {
      const log = logFor(habitId, weekDates[i]);
      if (log?.content?.trim()) return log;
    }
    return logFor(habitId, gymLogDate);
  };

  return (
    <section className="mb-5">
      <div
        className="flex items-center gap-2 mb-2.5 px-3 py-1.5 rounded-lg"
        style={{ background: tier.color_bg }}
      >
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: tier.color_accent }}
        />
        <span
          className="text-xs font-extrabold tracking-wide"
          style={{ color: tier.color_text }}
        >
          {tier.label}
        </span>
        <span
          className="text-[11px] ml-1 opacity-60"
          style={{ color: tier.color_text }}
        >
          {tierPointsLabel(tier)}
        </span>
      </div>

      {habits.map((habit) => {
        if (habit.type === "deepwork") {
          const log = logFor(habit.id, dateKey);
          return (
            <DeepWorkRow
              key={habit.id}
              blocks={log?.deepwork_blocks ?? 0}
              onChange={(b) => onDeepWork(habit.id, b)}
            />
          );
        }
        if (habit.type === "gym") {
          const log = logFor(habit.id, gymLogDate);
          return (
            <GymRow
              key={habit.id}
              sessions={log?.gym_sessions ?? 0}
              onChange={(s) => onGym(habit.id, s)}
            />
          );
        }
        if (habit.type === "text") {
          const log =
            habit.cadence === "weekly"
              ? weeklyLogFor(habit.id)
              : logFor(habit.id, dateKey);
          return (
            <TextHabitRow
              key={habit.id}
              habit={habit}
              tier={tier}
              log={log}
              onChange={(c) => onTextChange(habit.id, c)}
              multiline={habit.cadence === "weekly"}
              placeholder={
                habit.cadence === "weekly"
                  ? "How was your week? Wins, lessons, focus for next week..."
                  : habit.name.includes("MIT") || habit.name.includes("Important")
                    ? "What's the one thing that matters most today?"
                    : "What was the best part of your day?"
              }
            />
          );
        }
        const log = logFor(habit.id, dateKey);
        return (
          <HabitRow
            key={habit.id}
            habit={habit}
            tier={tier}
            log={log}
            onCycle={() => onCycle(habit.id)}
          />
        );
      })}
    </section>
  );
}
