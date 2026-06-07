"use client";

import clsx from "clsx";
import { DEEPWORK_BLOCK_MINUTES, pointsForDeepWorkBlocks } from "@/lib/types";

interface DeepWorkRowProps {
  blocks: number;
  onChange: (blocks: number) => void;
}

export function DeepWorkRow({ blocks, onChange }: DeepWorkRowProps) {
  const pts = pointsForDeepWorkBlocks(blocks);
  const label = `${DEEPWORK_BLOCK_MINUTES}m`;

  const decrement = () => onChange(Math.max(0, blocks - 1));
  const increment = () => onChange(blocks + 1);

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
            {blocks} block{blocks !== 1 ? "s" : ""} × {label} →{" "}
            {pts > 0 ? `+${pts}` : "0"} pts
            {blocks > 3 && (
              <span className="text-[var(--text-muted)] font-normal">
                {" "}
                (max pts at 3+)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2.5">
        <button
          type="button"
          onClick={decrement}
          disabled={blocks === 0}
          aria-label="Remove one block"
          className="h-10 w-10 shrink-0 rounded-lg border-2 border-[var(--border)] text-lg font-bold text-[var(--text-muted)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          −
        </button>
        <div className="flex-1 text-center text-sm font-semibold tabular-nums">
          {blocks} × {label}
        </div>
        <button
          type="button"
          onClick={increment}
          aria-label="Add one block"
          className="h-10 w-10 shrink-0 rounded-lg border-2 border-[var(--danger)] bg-[var(--danger)] text-lg font-bold text-white cursor-pointer"
        >
          +
        </button>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2, 3].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange(b === blocks ? 0 : b)}
            className={clsx(
              "flex-1 h-9 rounded-lg font-bold text-[11px] transition-soft cursor-pointer border-2",
              blocks === b && b > 0
                ? "bg-[var(--danger)] border-[var(--danger)] text-white"
                : blocks === b && b === 0
                  ? "border-[var(--text-muted)] text-[var(--text-muted)] bg-[var(--bg)]"
                  : blocks >= b && b > 0
                    ? "bg-[var(--danger)]/20 border-[var(--danger)]/40 text-[var(--danger)]"
                    : "border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg)]"
            )}
          >
            {b === 0 ? "None" : `${b}×${label}`}
          </button>
        ))}
      </div>
    </div>
  );
}
