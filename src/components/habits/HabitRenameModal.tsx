"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/providers/AppProvider";
import { updateHabit } from "@/lib/rubric/editor";
import type { Habit } from "@/lib/types";

interface HabitRenameModalProps {
  habit: Habit | null;
  open: boolean;
  onClose: () => void;
}

export function HabitRenameModal({ habit, open, onClose }: HabitRenameModalProps) {
  const supabase = createClient();
  const { refresh } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setIcon(habit.icon);
      setError(null);
    }
  }, [habit]);

  if (!open || !habit) return null;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name can't be empty");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateHabit(supabase, habit.id, {
        name: trimmed,
        icon: icon.trim() || habit.icon,
      });
      await refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md card p-6 m-4 rounded-2xl shadow-2xl">
        <h2 className="text-lg font-bold mb-1">Rename habit</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Change how this habit appears on your Today list.
        </p>

        <div className="flex gap-3 mb-4">
          <div className="shrink-0">
            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Emoji</label>
            <input
              className="w-14 h-12 text-center text-xl rounded-xl border border-[var(--border)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={icon}
              maxLength={4}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Name</label>
            <input
              autoFocus
              className="w-full h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-[var(--danger)] mb-3">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-[var(--accent)] text-white py-3 text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save name"}
          </button>
        </div>
      </div>
    </div>
  );
}
