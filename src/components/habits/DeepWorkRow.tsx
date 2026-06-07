"use client";

import clsx from "clsx";
import { DEEPWORK_BLOCK_MINUTES, DEEPWORK_POINTS, pointsForDeepWorkBlocks } from "@/lib/types";

interface DeepWorkRowProps {
  blocks: number;
  onChange: (blocks: number) => void;
}

export function DeepWorkRow({ blocks, onChange }: DeepWorkRowProps) {
  const pts = pointsForDeepWorkBlocks(blocks);
  const label = `${DEEPWORK_BLOCK_MINUTES}m`;

  return (
    <div
      className={clsx(
        "p-3.5 rounded-xl mb-2 border transition-soft",
        blocks > 0 ? "border-[var(--danger)]/30" : "card"
      )}
      style={blocks > 0 ? { background: "#fdecea22" } : undefined}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">🧠</span>
        <div className="flex-1">
          <div className="text-sm font-semibold">Deep Work</div>
          <div
            className={clsx(
              "text-[11px] font-bold",
              pts > 0 ? "text-[var(--success)]" : "text-[var(--text-muted)]"
            )}
          >
            {blocks > 0
              ? `${blocks} block${blocks !== 1 ? "s" : ""} × ${label} → +${pts} pts`
              : `0 blocks — not done yet`}
            {blocks > 3 && (
              <span className="text-[var(--text-muted)] font-normal">
                {" "}
                (+{DEEPWORK_POINTS[3]} per block after 3rd)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, blocks - 1))}
          disabled={blocks === 0}
          aria-label="Remove one block"
          className="h-11 w-11 shrink-0 rounded-xl border-2 border-[var(--border)] text-lg font-bold text-[var(--text-muted)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold tabular-nums text-[var(--text)]">
            {blocks}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            {blocks === 1 ? "block" : "blocks"} × {label}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(blocks + 1)}
          aria-label="Add one block"
          className="h-11 w-11 shrink-0 rounded-xl border-2 border-[var(--danger)] bg-[var(--danger)] text-lg font-bold text-white cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
