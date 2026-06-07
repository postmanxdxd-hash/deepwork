"use client";

interface StreakBadgeProps {
  habitStreak: number;
  habitName: string;
  weeklyStreak: number;
  showNeverMissTwice?: boolean;
}

export function StreakBadge({
  habitStreak,
  habitName,
  weeklyStreak,
  showNeverMissTwice = false,
}: StreakBadgeProps) {
  if (showNeverMissTwice) {
    return (
      <div className="rounded-xl bg-[var(--warning)]/20 border border-[var(--warning)]/40 px-3 py-2 text-xs font-semibold text-[var(--warning)]">
        Don&apos;t miss twice
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {habitStreak > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          <span>🔥</span>
          <span>
            {habitStreak}d · {habitName}
          </span>
        </div>
      )}
      {weeklyStreak > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          <span>⭐</span>
          <span>{weeklyStreak} solid week{weeklyStreak !== 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}
