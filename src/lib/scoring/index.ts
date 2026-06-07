import type {
  DailyLog,
  Habit,
  HabitStatus,
  Tier,
  WeekQuality,
} from "@/lib/types";
import { isFajrTier } from "@/lib/habits/identify";
import { shouldApplyBlankPenalties } from "@/lib/reminders/timezone";
import {
  GYM_POINTS,
  WEEK_BENCHMARKS,
  pointsForDeepWorkBlocks,
} from "@/lib/types";

export interface ScoringContext {
  tiers: Tier[];
  habits: Habit[];
  logs: DailyLog[];
  weekDates: string[];
  timezone?: string;
  now?: Date;
}

function tierById(tiers: Tier[], id: string): Tier | undefined {
  return tiers.find((t) => t.id === id);
}

function habitById(habits: Habit[], id: string): Habit | undefined {
  return habits.find((h) => h.id === id);
}

function logFor(
  logs: DailyLog[],
  habitId: string,
  date: string
): DailyLog | undefined {
  return logs.find((l) => l.habit_id === habitId && l.log_date === date);
}

export function effectiveStatus(
  habit: Habit,
  log: DailyLog | undefined
): HabitStatus | null {
  if (habit.type === "text") {
    const content = log?.content?.trim();
    return content ? "done" : null;
  }
  if (habit.type === "deepwork") {
    const blocks = log?.deepwork_blocks ?? 0;
    return blocks > 0 ? "done" : null;
  }
  return log?.status ?? null;
}

export function pointsForHabitLog(
  habit: Habit,
  tier: Tier,
  log: DailyLog | undefined,
  applyBlankPenalties = true
): number {
  if (habit.type === "deepwork") {
    return pointsForDeepWorkBlocks(log?.deepwork_blocks ?? 0);
  }
  if (habit.type === "gym") {
    return 0; // counted at week level
  }
  if (habit.type === "text") {
    const content = log?.content?.trim();
    if (content) return tier.done_pts;
    if (!applyBlankPenalties) return 0;
    return tier.blank_pts;
  }
  const status = log?.status;
  if (isFajrTier(tier)) {
    if (status === "done") return tier.done_pts;
    if (!applyBlankPenalties && !status) return 0;
    return tier.blank_pts;
  }
  if (!status) return applyBlankPenalties ? tier.blank_pts : 0;
  if (status === "done") return tier.done_pts;
  if (status === "attempted") return tier.attempted_pts;
  return tier.blank_pts;
}

function scoringNow(ctx: ScoringContext): Date {
  return ctx.now ?? new Date();
}

function scoringTimezone(ctx: ScoringContext): string {
  return ctx.timezone ?? "Asia/Beirut";
}

export function calcDayScore(ctx: ScoringContext, dateKey: string): number {
  const applyBlank = shouldApplyBlankPenalties(
    dateKey,
    scoringTimezone(ctx),
    scoringNow(ctx)
  );
  let score = 0;
  for (const habit of ctx.habits) {
    if (habit.type === "gym") continue;
    if (habit.cadence === "weekly") continue;
    const tier = tierById(ctx.tiers, habit.tier_id);
    if (!tier) continue;
    const log = logFor(ctx.logs, habit.id, dateKey);
    score += pointsForHabitLog(habit, tier, log, applyBlank);
  }
  return score;
}

export function getGymSessionsForWeek(
  ctx: ScoringContext,
  weekDates: string[]
): number {
  let max = 0;
  for (const date of weekDates) {
    const gymHabit = ctx.habits.find((h) => h.type === "gym");
    if (!gymHabit) return 0;
    const log = logFor(ctx.logs, gymHabit.id, date);
    if (log?.gym_sessions != null) {
      max = Math.max(max, log.gym_sessions);
    }
  }
  return max;
}

export function getWeeklyReviewContent(
  ctx: ScoringContext,
  weekDates: string[]
): string {
  const reviewHabit = ctx.habits.find(
    (h) => h.type === "text" && h.cadence === "weekly"
  );
  if (!reviewHabit) return "";
  for (let i = weekDates.length - 1; i >= 0; i--) {
    const log = logFor(ctx.logs, reviewHabit.id, weekDates[i]);
    if (log?.content?.trim()) return log.content.trim();
  }
  return "";
}

export function calcGymWeekPoints(
  ctx: ScoringContext,
  weekDates: string[]
): number {
  const gymSessions = getGymSessionsForWeek(ctx, weekDates);
  return GYM_POINTS[Math.min(Math.max(gymSessions, 0), 5)] ?? -5;
}

export function calcWeekScoreRaw(
  ctx: ScoringContext,
  weekDates: string[],
  options?: { includeGym?: boolean }
): number {
  const includeGym = options?.includeGym ?? false;

  let score = weekDates.reduce(
    (sum, dk) => sum + calcDayScore(ctx, dk),
    0
  );

  if (includeGym) {
    score += calcGymWeekPoints(ctx, weekDates);
  }

  const reviewHabit = ctx.habits.find(
    (h) => h.type === "text" && h.cadence === "weekly"
  );
  if (reviewHabit) {
    const tier = tierById(ctx.tiers, reviewHabit.tier_id);
    const lastDay = weekDates[weekDates.length - 1];
    const applyReviewBlank = shouldApplyBlankPenalties(
      lastDay,
      scoringTimezone(ctx),
      scoringNow(ctx)
    );
    if (tier) {
      const content = getWeeklyReviewContent(ctx, weekDates);
      if (content) {
        score += tier.done_pts;
      } else if (applyReviewBlank) {
        score += tier.blank_pts;
      }
    }
  }

  return score;
}

export function calcWeekScore(
  ctx: ScoringContext,
  weekDates: string[]
): number {
  const raw = calcWeekScoreRaw(ctx, weekDates);
  return raw < 0 ? 0 : raw;
}

export function getWeekQuality(score: number): WeekQuality {
  if (score >= 60) return "excellent";
  if (score >= 30) return "solid";
  if (score >= 0) return "rough";
  return "bad";
}

export function getWeekQualityLabel(score: number): string {
  const q = getWeekQuality(score);
  return WEEK_BENCHMARKS.find((b) => b.quality === q)?.label ?? "Rough";
}

export function countDoneToday(
  ctx: ScoringContext,
  dateKey: string
): { done: number; total: number } {
  const dailyHabits = ctx.habits.filter(
    (h) => h.cadence === "daily" && h.type !== "gym"
  );
  let done = 0;
  for (const habit of dailyHabits) {
    const log = logFor(ctx.logs, habit.id, dateKey);
    const status = effectiveStatus(habit, log);
    if (status === "done") done++;
    if (habit.type === "deepwork" && (log?.deepwork_blocks ?? 0) > 0) {
      if (status !== "done") done++;
    }
  }
  return { done, total: dailyHabits.length };
}

export function calcHabitStreak(
  ctx: ScoringContext,
  habitId: string,
  upToDate: string,
  maxDays = 365
): number {
  const habit = habitById(ctx.habits, habitId);
  if (!habit) return 0;

  let streak = 0;
  const end = new Date(upToDate + "T12:00:00");

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const log = logFor(ctx.logs, habitId, key);
    const status = effectiveStatus(habit, log);
    if (status === "done") {
      streak++;
    } else if (i === 0 && !status) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function calcTopHabitStreak(
  ctx: ScoringContext,
  upToDate: string
): { habitId: string; streak: number; name: string } | null {
  let best: { habitId: string; streak: number; name: string } | null = null;
  for (const habit of ctx.habits) {
    if (habit.type === "gym" || habit.cadence === "weekly") continue;
    const streak = calcHabitStreak(ctx, habit.id, upToDate);
    if (!best || streak > best.streak) {
      best = { habitId: habit.id, streak, name: habit.name };
    }
  }
  return best;
}

export function calcWeeklyQualityStreak(
  allWeekStarts: string[],
  ctxFactory: (weekStart: string) => ScoringContext,
  upToWeekStart: string
): number {
  const sorted = [...allWeekStarts].sort().reverse();
  const startIdx = sorted.indexOf(upToWeekStart);
  if (startIdx === -1) return 0;

  let streak = 0;
  for (let i = startIdx; i < sorted.length; i++) {
    const weekDates = getWeekDatesFromStart(sorted[i]);
    const ctx = ctxFactory(sorted[i]);
    const score = calcWeekScore(ctx, weekDates);
    const quality = getWeekQuality(score);
    if (quality === "excellent" || quality === "solid") {
      streak++;
    } else if (i === startIdx) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function getWeekDatesFromStart(weekStart: string): string[] {
  const start = new Date(weekStart + "T12:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export function wasYesterdayMissed(
  ctx: ScoringContext,
  todayKey: string
): boolean {
  const today = new Date(todayKey + "T12:00:00");
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];
  return calcDayScore(ctx, yesterdayKey) <= 0;
}

export function cycleStatus(current: HabitStatus | null): HabitStatus | null {
  if (!current) return "done";
  if (current === "done") return "attempted";
  if (current === "attempted") return "blank";
  return null;
}

/** Done ↔ unset only (Fajr and other binary habits). */
export function cycleBinaryStatus(current: HabitStatus | null): HabitStatus | null {
  return current === "done" ? null : "done";
}

export function statusSymbol(
  habit: Habit,
  log: DailyLog | undefined
): string {
  if (habit.type === "text") {
    return log?.content?.trim() ? "✎" : "—";
  }
  if (habit.type === "deepwork") {
    const b = log?.deepwork_blocks ?? 0;
    return b > 0 ? String(b) : "—";
  }
  if (habit.type === "gym") {
    const s = log?.gym_sessions;
    return s != null ? String(s) : "—";
  }
  const s = log?.status;
  if (s === "done") return "X";
  if (s === "attempted") return "•";
  if (s === "blank") return "—";
  return "·";
}
