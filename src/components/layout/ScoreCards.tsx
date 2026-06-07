"use client";

import clsx from "clsx";
import { getWeekQualityLabel } from "@/lib/scoring";

interface ScoreCardsProps {
  dayScore: number;
  weekScore: number;
  doneCount: number;
  totalCount: number;
  mvdThreshold?: number;
  showMvd?: boolean;
}

export function ScoreCards({
  dayScore,
  weekScore,
  doneCount,
  totalCount,
  mvdThreshold = 10,
  showMvd = false,
}: ScoreCardsProps) {
  const weekLabel = getWeekQualityLabel(weekScore);
  const weekColor =
    weekScore >= 60
      ? "var(--success)"
      : weekScore >= 30
        ? "var(--warning)"
        : weekScore >= 0
          ? "var(--warning)"
          : "var(--danger)";

  const mvdMet = showMvd && dayScore >= mvdThreshold;

  return (
    <div className="flex gap-2.5">
      <div className="flex-1 rounded-2xl bg-white/10 p-3">
        <div className="text-[10px] text-white/60 mb-1 tracking-wide">TODAY</div>
        <div
          className={clsx(
            "text-3xl font-bold",
            dayScore >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
          )}
        >
          {dayScore > 0 ? `+${dayScore}` : dayScore}
        </div>
        <div className="text-[10px] text-white/60 mt-1">
          {doneCount}/{totalCount} done
        </div>
        {mvdMet && (
          <div className="text-[10px] font-semibold text-[var(--success)] mt-1.5">
            Good enough for today
          </div>
        )}
      </div>
      <div className="flex-1 rounded-2xl bg-white/10 p-3">
        <div className="text-[10px] text-white/60 mb-1 tracking-wide">THIS WEEK</div>
        <div
          className={clsx(
            "text-3xl font-bold",
            weekScore >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
          )}
        >
          {weekScore > 0 ? `+${weekScore}` : weekScore}
        </div>
        <div className="text-[10px] font-bold mt-1" style={{ color: weekColor }}>
          {weekLabel}
        </div>
      </div>
    </div>
  );
}
