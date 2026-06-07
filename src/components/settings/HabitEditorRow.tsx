"use client";

import { useEffect, useState } from "react";
import type { Habit } from "@/lib/types";
import { updateHabit } from "@/lib/rubric/editor";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cadence, HabitType } from "@/lib/types";

const HABIT_TYPES: { value: HabitType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "text", label: "Text" },
  { value: "deepwork", label: "Deep Work" },
  { value: "gym", label: "Gym" },
];

const CADENCES: { value: Cadence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

function inputClass() {
  return "w-full min-h-[44px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
}

export function HabitEditorRow({
  habit,
  supabase,
  onSaved,
  onDelete,
  saving,
}: {
  habit: Habit;
  supabase: SupabaseClient;
  onSaved: () => Promise<void>;
  onDelete: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon);
  const [type, setType] = useState(habit.type);
  const [cadence, setCadence] = useState(habit.cadence);
  const [dirty, setDirty] = useState(false);
  const [rowSaving, setRowSaving] = useState(false);
  const [rowMessage, setRowMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(habit.name);
    setIcon(habit.icon);
    setType(habit.type);
    setCadence(habit.cadence);
    setDirty(false);
  }, [habit.id, habit.name, habit.icon, habit.type, habit.cadence]);

  const markDirty = () => setDirty(true);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setRowMessage("Name required");
      return;
    }
    setRowSaving(true);
    setRowMessage(null);
    try {
      await updateHabit(supabase, habit.id, {
        name: trimmed,
        icon: icon.trim() || habit.icon,
        type,
        cadence,
      });
      await onSaved();
      setDirty(false);
      setRowMessage("Saved");
      setTimeout(() => setRowMessage(null), 2000);
    } catch (e) {
      setRowMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setRowSaving(false);
    }
  };

  return (
    <div className="rounded-lg bg-[var(--bg)] p-3 space-y-3 border border-[var(--border)]">
      <div className="flex gap-2 items-end">
        <div className="shrink-0">
          <label className="text-[10px] text-[var(--text-muted)] block mb-1">Emoji</label>
          <input
            className={inputClass() + " w-14 text-center text-lg"}
            value={icon}
            maxLength={4}
            onChange={(e) => {
              setIcon(e.target.value);
              markDirty();
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-[10px] text-[var(--text-muted)] block mb-1">Habit name</label>
          <input
            className={inputClass()}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              markDirty();
            }}
          />
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 w-11 h-11 rounded-lg text-[var(--danger)] cursor-pointer hover:bg-[var(--danger)]/10"
          aria-label="Delete habit"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2">
        <select
          className={inputClass()}
          value={type}
          disabled={saving || rowSaving}
          onChange={(e) => {
            setType(e.target.value as HabitType);
            markDirty();
          }}
        >
          {HABIT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className={inputClass()}
          value={cadence}
          disabled={saving || rowSaving}
          onChange={(e) => {
            setCadence(e.target.value as Cadence);
            markDirty();
          }}
        >
          {CADENCES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || rowSaving || saving}
          className="flex-1 min-h-[44px] rounded-xl bg-[var(--accent)] text-white text-sm font-semibold cursor-pointer disabled:opacity-40"
        >
          {rowSaving ? "Saving..." : "Save"}
        </button>
        {rowMessage && (
          <span className="text-xs text-[var(--success)] font-medium">{rowMessage}</span>
        )}
      </div>
    </div>
  );
}
