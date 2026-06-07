"use client";

import clsx from "clsx";
import { DEEPWORK_POINTS } from "@/lib/types";

interface DeepWorkRowProps {
  blocks: number;
  onChange: (blocks: number) => void;
}

export function DeepWorkRow({ blocks, onChange }: DeepWorkRowProps) {
  const pts = DEEPWORK_POINTS[Math.min(blocks, 3)] ?? 0;

  return (
    <div
      className={clsx(
        "p-3.5 rounded-xl mb-2 border transition-soft",
        blocks > 0 ? "border-[var(--danger)]/30" : "card"
      )}
      style={blocks > 0 ? { background: "#fdecea22" } : undefined}
    >
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-xl">🧠</span>
        <div className="flex-1">
          <div className="text-sm font-semibold">Deep Work</div>
          <div
            className={clsx(
              "text-[11px] font-bold",
              pts > 0 ? "text-[var(--success)]" : "text-[var(--text-muted)]"
            )}
          >
            {blocks} block{blocks !== 1 ? "s" : ""} → {pts > 0 ? `+${pts}` : "0"} pts
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange(b === blocks ? 0 : b)}
            className={clsx(
              "flex-1 h-9 rounded-lg font-bold text-[11px] transition-soft cursor-pointer border-2",
              blocks >= b && b > 0
                ? "bg-[var(--danger)] border-[var(--danger)] text-white"
                : "border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg)]"
            )}
          >
            {b === 0 ? "None" : `${b}×30m`}
          </button>
        ))}
      </div>
    </div>
  );
}
