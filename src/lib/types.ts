export type HabitStatus = "done" | "attempted" | "blank";
export type HabitType = "standard" | "text" | "deepwork" | "gym";
export type Cadence = "daily" | "weekly";
export type ThemeMode = "light" | "dark" | "system";
export type WeekQuality = "excellent" | "solid" | "rough" | "bad";

export interface Tier {
  id: string;
  rubric_id: string;
  label: string;
  done_pts: number;
  attempted_pts: number;
  blank_pts: number;
  sort_order: number;
  color_bg: string;
  color_accent: string;
  color_text: string;
}

export type HabitRole = "mit" | "highlight";

export interface Habit {
  id: string;
  tier_id: string;
  name: string;
  icon: string;
  type: HabitType;
  cadence: Cadence;
  role: HabitRole | null;
  special_config: Record<string, unknown>;
  sort_order: number;
}

export interface Rubric {
  id: string;
  user_id: string;
  name: string;
  template_source: string | null;
}

export interface DailyLog {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  status: HabitStatus | null;
  content: string | null;
  deepwork_blocks: number;
  gym_sessions: number | null;
}

export interface JournalNote {
  id: string;
  user_id: string;
  content: string;
  note_date: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  onboarding_complete: boolean;
  theme: ThemeMode;
  timezone: string;
  mvd_threshold: number;
  reminder_morning_enabled: boolean;
  reminder_morning_time: string;
  reminder_evening_enabled: boolean;
  reminder_evening_time: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
}

export interface DayData {
  habits: Record<string, HabitStatus | null>;
  content: Record<string, string>;
  deepWork: number;
  gymSessions: number | null;
  weeklyReview: string;
}

export interface TierWithHabits extends Tier {
  habits: Habit[];
}

export const DEEPWORK_BLOCK_MINUTES = 25;
export const DEEPWORK_POINTS = [0, 2, 5, 9] as const;

/** Blocks 1–2 use tiered totals; block 3 = +9, each block after 3 adds another +9. */
export function pointsForDeepWorkBlocks(blocks: number): number {
  const n = Math.max(0, Math.floor(blocks));
  if (n === 0) return DEEPWORK_POINTS[0];
  if (n < 3) return DEEPWORK_POINTS[n] ?? 0;
  const blockThreePts = DEEPWORK_POINTS[3];
  return blockThreePts + (n - 3) * blockThreePts;
}
export const GYM_POINTS: Record<number, number> = {
  0: -5,
  1: -5,
  2: -5,
  3: 5,
  4: 10,
  5: 15,
};

export const WEEK_BENCHMARKS = [
  { label: "Excellent", min: 60, max: 80, quality: "excellent" as WeekQuality },
  { label: "Solid", min: 30, max: 50, quality: "solid" as WeekQuality },
  { label: "Rough", min: 0, max: 20, quality: "rough" as WeekQuality },
  { label: "Bad Week", min: -Infinity, max: -1, quality: "bad" as WeekQuality },
];

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
