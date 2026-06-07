"use client";

import clsx from "clsx";
import { GYM_POINTS } from "@/lib/types";

interface GymRowProps {
  sessions: number;
  onChange: (sessions: number) => void;
}

export function GymRow({ sessions, onChange }: GymRowProps) {
  const pts = GYM_POINTS[Math.min(Math.max(sessions, 0), 5)] ?? -5;

  return (
    <div
      className={clsx(
        "p-3.5 rounded-xl mb-2 border transition-soft",
        sessions > 0 ? "border-[var(--danger)]/30" : "card"
      )}
      style={sessions > 0 ? { background: "#fdecea22" } : undefined}
    >
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-xl">💪</span>
        <div className="flex-1">
          <div className="text-sm font-semibold">Gym (Weekly)</div>
          <div
            className={clsx(
              "text-[11px] font-bold",
              pts >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
            )}
          >
            {sessions} session{sessions !== 1 ? "s" : ""} →{" "}
            {pts >= 0 ? `+${pts}` : pts} pts
          </div>
        </div>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={clsx(
              "flex-1 h-9 rounded-lg font-bold text-sm transition-soft cursor-pointer border-2",
              sessions === n
                ? "bg-[var(--danger)] border-[var(--danger)] text-white"
                : "border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg)]"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
