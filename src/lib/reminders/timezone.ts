const DEFAULT_TZ = "Asia/Beirut";

/** Habit days start at 4:00 AM local time — unset habits aren't penalized before then. */
export const HABIT_DAY_START_HOUR = 4;

export function getTimePartsInTimezone(
  date: Date,
  timezone: string = DEFAULT_TZ
): { hour: number; minute: number; dateKey: string } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";

  const year = get("year");
  const month = get("month");
  const day = get("day");

  return {
    hour: parseInt(get("hour"), 10) % 24,
    minute: parseInt(get("minute"), 10),
    dateKey: `${year}-${month}-${day}`,
  };
}

export function matchesTimeSlot(
  timeHHMM: string,
  timezone: string = DEFAULT_TZ,
  windowMinutes = 1,
  now = new Date()
): boolean {
  const { hour, minute } = getTimePartsInTimezone(now, timezone);
  const [targetH, targetM] = timeHHMM.split(":").map(Number);
  const nowMins = hour * 60 + minute;
  const targetMins = targetH * 60 + targetM;
  return Math.abs(nowMins - targetMins) <= windowMinutes;
}

export function formatTimeHHMM(time: string): string {
  return time.slice(0, 5);
}

/**
 * Whether unset/empty habits should receive blank penalties for `dateKey`.
 * - Future calendar days: no
 * - Past calendar days: yes
 * - Today: only from 4:00 AM local time onward
 */
/** Saturday or Sunday in the user's timezone (for `YYYY-MM-DD`). */
export function isWeekend(
  dateKey: string,
  timezone: string = DEFAULT_TZ
): boolean {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  }).format(utcNoon);
  return weekday === "Saturday" || weekday === "Sunday";
}

export function shouldApplyBlankPenalties(
  dateKey: string,
  timezone: string = DEFAULT_TZ,
  now: Date = new Date()
): boolean {
  const { dateKey: todayKey, hour, minute } = getTimePartsInTimezone(
    now,
    timezone
  );

  if (dateKey > todayKey) return false;
  if (dateKey < todayKey) return true;

  return hour * 60 + minute >= HABIT_DAY_START_HOUR * 60;
}
