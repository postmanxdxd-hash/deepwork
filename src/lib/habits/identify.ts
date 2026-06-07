import type { Habit } from "@/lib/types";

export type HabitRole = "mit" | "highlight";

export function getHabitRole(habit: Habit): HabitRole | null {
  const role = habit.special_config?.role;
  if (role === "mit" || role === "highlight") return role;
  const n = habit.name.toLowerCase();
  if (n.includes("most important task") || n === "mit") return "mit";
  if (n.includes("highlight")) return "highlight";
  return null;
}

export function findHabitByRole(habits: Habit[], role: HabitRole): Habit | undefined {
  return habits.find((h) => getHabitRole(h) === role);
}
