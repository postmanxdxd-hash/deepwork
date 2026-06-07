export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getWeekDates(anchor: Date = new Date()): string[] {
  const start = getWeekStart(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return formatDateKey(d);
  });
}

export function getWeekDatesForOffset(weeksAgo: number): string[] {
  const anchor = new Date();
  anchor.setDate(anchor.getDate() - weeksAgo * 7);
  return getWeekDates(anchor);
}

export function parseDateKey(key: string): Date {
  return new Date(key + "T12:00:00");
}

export function formatDisplayDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatMonthYear(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
}

export function getHistoryWeekStarts(count = 8): string[] {
  const starts: string[] = [];
  for (let i = 0; i < count; i++) {
    starts.push(getWeekDatesForOffset(i)[0]);
  }
  return starts;
}
