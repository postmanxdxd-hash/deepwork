"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/providers/AppProvider";
import {
  addHabit,
  addTier,
  deleteHabit,
  deleteTier,
  updateHabit,
  updateRubricName,
  updateTier,
} from "@/lib/rubric/editor";
import type { Cadence, Habit, HabitType, Tier } from "@/lib/types";

const HABIT_TYPES: { value: HabitType; label: string }[] = [
  { value: "standard", label: "Standard (tap X/•/—)" },
  { value: "text", label: "Text (write = done)" },
  { value: "deepwork", label: "Deep Work blocks" },
  { value: "gym", label: "Gym (weekly)" },
];

const CADENCES: { value: Cadence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

function inputClass() {
  return "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
}

export function RubricEditor() {
  const supabase = createClient();
  const { rubric, tiers, habits, refresh } = useApp();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedTier, setExpandedTier] = useState<string | null>(
    tiers[0]?.id ?? null
  );

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const run = async (fn: () => Promise<void>) => {
    setSaving(true);
    try {
      await fn();
      await refresh();
      showMsg("Saved");
    } catch (e) {
      showMsg(e instanceof Error ? e.message : "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const tierHabits = (tierId: string) =>
    habits.filter((h) => h.tier_id === tierId).sort((a, b) => a.sort_order - b.sort_order);

  const handleTierField = (tier: Tier, field: keyof Tier, value: string | number) => {
    run(async () => {
      await updateTier(supabase, tier.id, { [field]: value });
    });
  };

  const handleHabitField = (
    habit: Habit,
    field: keyof Habit,
    value: string | number
  ) => {
    run(async () => {
      await updateHabit(supabase, habit.id, { [field]: value });
    });
  };

  if (!rubric) return null;

  return (
    <section className="card p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold">Edit rubric</h2>
        {message && (
          <span className="text-xs text-[var(--success)] font-medium">{message}</span>
        )}
      </div>

      <label className="block text-xs text-[var(--text-muted)] mb-1">Rubric name</label>
      <input
        className={inputClass() + " mb-4"}
        defaultValue={rubric.name}
        onBlur={(e) => {
          if (e.target.value !== rubric.name) {
            run(async () => {
              await updateRubricName(supabase, rubric.id, e.target.value);
            });
          }
        }}
      />

      <div className="space-y-3">
        {tiers.map((tier) => {
          const open = expandedTier === tier.id;
          const th = tierHabits(tier.id);
          return (
            <div key={tier.id} className="rounded-xl border border-[var(--border)] overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedTier(open ? null : tier.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left cursor-pointer transition-soft hover:bg-[var(--bg)]"
                style={{ background: open ? tier.color_bg : undefined }}
              >
                <div
                  className="w-1 h-5 rounded-full shrink-0"
                  style={{ background: tier.color_accent }}
                />
                <span className="text-sm font-bold flex-1" style={{ color: tier.color_text }}>
                  {tier.label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{th.length} habits</span>
                <span className="text-[var(--text-muted)]">{open ? "▾" : "▸"}</span>
              </button>

              {open && (
                <div className="px-3 pb-3 border-t border-[var(--border)]">
                  <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                    <div>
                      <label className="text-[10px] text-[var(--text-muted)]">Tier label</label>
                      <input
                        className={inputClass()}
                        defaultValue={tier.label}
                        onBlur={(e) => handleTierField(tier, "label", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <label className="text-[10px] text-[var(--text-muted)]">Done</label>
                        <input
                          type="number"
                          className={inputClass()}
                          defaultValue={tier.done_pts}
                          onBlur={(e) =>
                            handleTierField(tier, "done_pts", parseInt(e.target.value, 10))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--text-muted)]">Tried</label>
                        <input
                          type="number"
                          className={inputClass()}
                          defaultValue={tier.attempted_pts}
                          onBlur={(e) =>
                            handleTierField(
                              tier,
                              "attempted_pts",
                              parseInt(e.target.value, 10)
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--text-muted)]">Blank</label>
                        <input
                          type="number"
                          className={inputClass()}
                          defaultValue={tier.blank_pts}
                          onBlur={(e) =>
                            handleTierField(tier, "blank_pts", parseInt(e.target.value, 10))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {th.map((habit) => (
                      <div
                        key={habit.id}
                        className="rounded-lg bg-[var(--bg)] p-2.5 space-y-2"
                      >
                        <div className="flex gap-2">
                          <input
                            className={inputClass() + " w-12 text-center"}
                            defaultValue={habit.icon}
                            maxLength={4}
                            onBlur={(e) =>
                              handleHabitField(habit, "icon", e.target.value)
                            }
                          />
                          <input
                            className={inputClass() + " flex-1"}
                            defaultValue={habit.name}
                            onBlur={(e) =>
                              handleHabitField(habit, "name", e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete "${habit.name}"?`)) {
                                run(async () => {
                                  await deleteHabit(supabase, habit.id);
                                });
                              }
                            }}
                            className="text-[var(--danger)] text-xs px-2 cursor-pointer hover:bg-[var(--danger)]/10 rounded-lg"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <select
                            className={inputClass()}
                            defaultValue={habit.type}
                            onChange={(e) =>
                              handleHabitField(habit, "type", e.target.value)
                            }
                          >
                            {HABIT_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <select
                            className={inputClass()}
                            defaultValue={habit.cadence}
                            onChange={(e) =>
                              handleHabitField(habit, "cadence", e.target.value)
                            }
                          >
                            {CADENCES.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        run(async () => {
                          await addHabit(supabase, tier.id, th.length);
                        })
                      }
                      className="text-xs font-semibold text-[var(--accent)] cursor-pointer hover:underline"
                    >
                      + Add habit
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        if (confirm(`Delete tier "${tier.label}" and all its habits?`)) {
                          run(async () => {
                            await deleteTier(supabase, tier.id);
                          });
                        }
                      }}
                      className="text-xs font-semibold text-[var(--danger)] cursor-pointer hover:underline ml-auto"
                    >
                      Delete tier
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() =>
          run(async () => {
            await addTier(supabase, rubric.id, tiers.length);
          })
        }
        className="mt-4 w-full rounded-xl border border-dashed border-[var(--accent)] text-[var(--accent)] py-2.5 text-sm font-semibold cursor-pointer hover:bg-[var(--accent-soft)] transition-soft"
      >
        + Add tier
      </button>
    </section>
  );
}
