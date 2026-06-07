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
  return "w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
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

  useEffect(() => {
    setName(habit.name);
    setIcon(habit.icon);
    setType(habit.type);
    setCadence(habit.cadence);
  }, [habit.id, habit.name, habit.icon, habit.type, habit.cadence]);

  const saveField = async (fields: Parameters<typeof updateHabit>[2]) => {
    await updateHabit(supabase, habit.id, fields);
    await onSaved();
  };

  return (
    <div className="rounded-lg bg-[var(--bg)] p-2.5 space-y-2">
      <div className="flex gap-2">
        <input
          className={inputClass() + " w-12 text-center"}
          value={icon}
          maxLength={4}
          onChange={(e) => setIcon(e.target.value)}
          onBlur={() => {
            if (icon !== habit.icon) saveField({ icon });
          }}
        />
        <input
          className={inputClass() + " flex-1"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim() && name !== habit.name) saveField({ name: name.trim() });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
        <button
          type="button"
          onClick={onDelete}
          className="text-[var(--danger)] text-xs px-2 cursor-pointer hover:bg-[var(--danger)]/10 rounded-lg"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2">
        <select
          className={inputClass()}
          value={type}
          disabled={saving}
          onChange={(e) => {
            const v = e.target.value as HabitType;
            setType(v);
            saveField({ type: v });
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
          disabled={saving}
          onChange={(e) => {
            const v = e.target.value as Cadence;
            setCadence(v);
            saveField({ cadence: v });
          }}
        >
          {CADENCES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
