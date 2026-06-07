const DEFAULT_TZ = "Asia/Beirut";

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
