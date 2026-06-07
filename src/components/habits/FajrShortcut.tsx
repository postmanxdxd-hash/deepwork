"use client";

import type { Habit } from "@/lib/types";

interface FajrShortcutProps {
  habit: Habit;
  isLogged: boolean;
  dateKey: string;
  todayKey: string;
  onMarkDone: (habitId: string) => Promise<void>;
}

export function FajrShortcut({
  habit,
  isLogged,
  dateKey,
  todayKey,
  onMarkDone,
}: FajrShortcutProps) {
  if (dateKey !== todayKey || isLogged) return null;

  return (
    <button
      type="button"
      onClick={() => onMarkDone(habit.id)}
      className="w-full mb-4 rounded-2xl bg-[var(--accent)] text-white py-4 px-4 text-left shadow-md active:scale-[0.98] transition-soft"
    >
      <span className="text-lg mr-2">{habit.icon}</span>
      <span className="font-bold">Mark Fajr done</span>
      <span className="block text-xs text-white/80 mt-0.5">
        One win before anything else
      </span>
    </button>
  );
}
