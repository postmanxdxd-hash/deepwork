"use client";

interface StreakBadgeProps {
  habitStreak: number;
  habitName: string;
  weeklyStreak: number;
}

export function StreakBadge({
  habitStreak,
  habitName,
  weeklyStreak,
}: StreakBadgeProps) {
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
