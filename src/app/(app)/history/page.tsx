"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { getWeekDates, formatDisplayDate } from "@/lib/dates";
import {
  calcWeekScore,
  calcGymWeekPoints,
  countDoneToday,
  getWeekQualityLabel,
} from "@/lib/scoring";

export default function HistoryPage() {
  const { historyWeekStarts, scoringContext, logs, loading, setWeekAnchor } =
    useApp();
  const [selectedStart, setSelectedStart] = useState(historyWeekStarts[0]);

  const weekDates = useMemo(
    () => getWeekDates(new Date(selectedStart + "T12:00:00")),
    [selectedStart]
  );

  const ctx = useMemo(
    () => ({ ...scoringContext, weekDates, logs }),
    [scoringContext, weekDates, logs]
  );

  const weekScore = calcWeekScore(ctx, weekDates);
  const gymScore = calcGymWeekPoints(ctx, weekDates);
  const label = getWeekQualityLabel(weekScore);

  const dailyStats = weekDates.map((d) => {
    const { done, total } = countDoneToday(ctx, d);
    return { date: d, done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  const avgCompletion = Math.round(
    dailyStats.reduce((s, d) => s + d.pct, 0) / (dailyStats.length || 1)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">History</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {historyWeekStarts.map((start) => (
          <button
            key={start}
            type="button"
            onClick={() => setSelectedStart(start)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-soft cursor-pointer ${
              selectedStart === start
                ? "bg-[var(--accent)] text-white"
                : "card text-[var(--text-muted)]"
            }`}
          >
            Week of {formatDisplayDate(start).split(",")[0]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="card p-4">
          <div className="text-xs text-[var(--text-muted)] mb-1">Week score</div>
          <div className="text-2xl font-bold text-[var(--success)]">
            {weekScore > 0 ? `+${weekScore}` : weekScore}
          </div>
          {gymScore !== 0 && (
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Gym: {gymScore > 0 ? `+${gymScore}` : gymScore}
            </div>
          )}
          <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[var(--text-muted)] mb-1">
            Avg completion
          </div>
          <div className="text-2xl font-bold">{avgCompletion}%</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[var(--text-muted)] mb-1">Days logged</div>
          <div className="text-2xl font-bold">
            {dailyStats.filter((d) => d.done > 0).length}/7
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-bold mb-4">Daily breakdown</h2>
        {dailyStats.map((d) => (
          <div key={d.date} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="text-xs text-[var(--text-muted)] w-24 shrink-0">
              {formatDisplayDate(d.date).split(",")[0]}
            </span>
            <div className="flex-1 h-2 rounded-full bg-[var(--bg)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-soft"
                style={{ width: `${d.pct}%` }}
              />
            </div>
            <span className="text-xs font-medium w-12 text-right">
              {d.done}/{d.total}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setWeekAnchor(new Date(selectedStart + "T12:00:00"))}
        className="mt-4 w-full rounded-xl border border-[var(--accent)] text-[var(--accent)] py-3 text-sm font-semibold transition-soft hover:bg-[var(--accent-soft)] cursor-pointer"
      >
        View this week in Today
      </button>
    </div>
  );
}
