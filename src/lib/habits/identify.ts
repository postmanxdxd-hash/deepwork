import type { Habit, Tier } from "@/lib/types";

export type HabitRole = "mit" | "highlight";

export function getHabitRole(habit: Habit): HabitRole | null {
  if (habit.role === "mit" || habit.role === "highlight") return habit.role;
  return null;
}

export function findHabitByRole(habits: Habit[], role: HabitRole): Habit | undefined {
  return habits.find((h) => getHabitRole(h) === role);
}

export function findFajrHabit(habits: Habit[], tiers: Tier[]): Habit | undefined {
  const fajrTier = tiers.find((t) => t.label.toUpperCase().includes("FAJR"));
  if (!fajrTier) return undefined;
  return habits.find((h) => h.tier_id === fajrTier.id && h.cadence === "daily");
}
