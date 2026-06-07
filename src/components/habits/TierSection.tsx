"use client";

import type { DailyLog, Habit, Tier } from "@/lib/types";
import { isFajrHabit } from "@/lib/habits/identify";
import { tierPointsLabel } from "@/lib/rubric/templates";
import { HabitRow } from "./HabitRow";
import { TextHabitRow } from "./TextHabitRow";
import { DeepWorkRow } from "./DeepWorkRow";

interface TierSectionProps {
  tier: Tier;
  habits: Habit[];
  tiers: Tier[];
  dateKey: string;
  logs: DailyLog[];
  onCycle: (habitId: string) => void;
  onTextChange: (habitId: string, content: string) => void;
  onDeepWork: (habitId: string, blocks: number) => void;
  onEditHabit?: (habit: Habit) => void;
}

export function TierSection({
  tier,
  habits,
  tiers,
  dateKey,
  logs,
  onCycle,
  onTextChange,
  onDeepWork,
  onEditHabit,
}: TierSectionProps) {
  if (!habits.length) return null;

  const logFor = (habitId: string, date: string) =>
    logs.find((l) => l.habit_id === habitId && l.log_date === date);

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
        if (habit.type === "text") {
          const log = logFor(habit.id, dateKey);
          return (
            <TextHabitRow
              key={habit.id}
              habit={habit}
              tier={tier}
              log={log}
              onChange={(c) => onTextChange(habit.id, c)}
              onEdit={onEditHabit ? () => onEditHabit(habit) : undefined}
              placeholder={
                habit.name.includes("MIT") || habit.name.includes("Important")
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
            binary={isFajrHabit(habit, tiers)}
            onCycle={() => onCycle(habit.id)}
            onEdit={onEditHabit ? () => onEditHabit(habit) : undefined}
          />
        );
      })}
    </section>
  );
}
