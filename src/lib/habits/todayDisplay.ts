import type { Habit, TierWithHabits } from "@/lib/types";

/** Gym and weekly review are logged at the bottom of Today (not in main tier list). */
export function isWeeklyOnlyOnToday(habit: Habit): boolean {
  return habit.type === "gym" || habit.cadence === "weekly";
}

/** Today list order: Fajr → Hard (Deep Work) → Medium → Easy. Hard+ excluded. */
export function getTodayTierSortIndex(label: string): number {
  const u = label.toUpperCase();
  if (u.includes("FAJR")) return 0;
  if (u.includes("HARD+")) return 99;
  if (u.includes("HARD")) return 1;
  if (u.includes("MEDIUM")) return 2;
  if (u.includes("EASY")) return 3;
  return 4;
}

export function filterHabitsForTodayList(
  habits: Habit[],
  options: {
    hideMit: boolean;
    hideFajr: boolean;
    fajrHabitId?: string;
  }
): Habit[] {
  return habits.filter((h) => {
    if (options.hideMit && h.role === "mit") return false;
    if (options.hideFajr && options.fajrHabitId && h.id === options.fajrHabitId) {
      return false;
    }
    if (isWeeklyOnlyOnToday(h)) return false;
    return true;
  });
}

export function getTodayTierSections(
  tiersWithHabits: TierWithHabits[],
  options: { hideMit: boolean; hideFajr: boolean; fajrHabitId?: string }
): TierWithHabits[] {
  return tiersWithHabits
    .filter((tw) => !tw.label.toUpperCase().includes("HARD+"))
    .map((tw) => ({
      ...tw,
      habits: filterHabitsForTodayList(tw.habits, options),
    }))
    .filter((tw) => tw.habits.length > 0)
    .sort(
      (a, b) => getTodayTierSortIndex(a.label) - getTodayTierSortIndex(b.label)
    );
}
