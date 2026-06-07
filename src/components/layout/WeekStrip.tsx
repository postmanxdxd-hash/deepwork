"use client";

import clsx from "clsx";
import { DAYS } from "@/lib/types";
import { formatDateKey } from "@/lib/dates";

interface WeekStripProps {
  weekDates: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  dayScores: number[];
}

export function WeekStrip({
  weekDates,
  selectedIndex,
  onSelect,
  dayScores,
}: WeekStripProps) {
  const todayStr = formatDateKey(new Date());

  return (
    <div className="flex gap-1.5">
      {weekDates.map((d, i) => {
        const isToday = d === todayStr;
        const isSel = i === selectedIndex;
        const ds = dayScores[i] ?? 0;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onSelect(i)}
            className={clsx(
              "flex-1 rounded-xl py-2 transition-soft cursor-pointer",
              isSel
                ? "bg-[var(--accent)] text-white"
                : isToday
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]"
                  : "bg-white/10 text-[var(--text-muted)] dark:bg-white/5"
            )}
          >
            <div className="text-[10px] font-semibold font-mono">{DAYS[i]}</div>
            <div
              className={clsx(
                "text-[9px] mt-0.5 font-bold",
                isSel
                  ? "text-white/90"
                  : ds > 0
                    ? "text-[var(--success)]"
                    : ds < 0
                      ? "text-[var(--danger)]"
                      : "text-[var(--text-muted)]"
              )}
            >
              {ds > 0 ? `+${ds}` : ds}
            </div>
          </button>
        );
      })}
    </div>
  );
}
