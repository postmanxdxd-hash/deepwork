"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { WeeklyGrid } from "@/components/grid/WeeklyGrid";
import { calcWeekScore, getWeekQualityLabel } from "@/lib/scoring";

export default function WeekPage() {
  const router = useRouter();
  const { tiers, habits, weekDates, logs, scoringContext, loading } = useApp();

  const weekScore = calcWeekScore(scoringContext, weekDates);
  const label = getWeekQualityLabel(weekScore);

  const handleCellClick = (habitId: string, date: string) => {
    router.push(`/today?date=${date}&habit=${habitId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Weekly Overview</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Week score:{" "}
          <span className="font-bold text-[var(--success)]">
            {weekScore > 0 ? `+${weekScore}` : weekScore}
          </span>{" "}
          · {label}
        </p>
      </div>
      <WeeklyGrid
        tiers={tiers}
        habits={habits}
        weekDates={weekDates}
        logs={logs}
        scoringContext={scoringContext}
        onCellClick={handleCellClick}
      />
      <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
        Tap a cell to jump to that day&apos;s log
      </p>
    </div>
  );
}
