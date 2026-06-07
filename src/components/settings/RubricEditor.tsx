"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/providers/AppProvider";
import {
  addHabit,
  addTier,
  deleteHabit,
  deleteTier,
  updateRubricName,
  updateTier,
} from "@/lib/rubric/editor";
import { HabitEditorRow } from "@/components/settings/HabitEditorRow";
import type { Tier } from "@/lib/types";

function inputClass() {
  return "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
}

export function RubricEditor() {
  const supabase = createClient();
  const { rubric, tiers, habits, refresh } = useApp();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedTiers(new Set(tiers.map((t) => t.id)));
  }, [tiers]);

  const toggleTier = (id: string) => {
    setExpandedTiers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  if (!rubric) return null;

  return (
    <section className="card p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold">Edit rubric</h2>
        {message && (
          <span className="text-xs text-[var(--success)] font-medium">{message}</span>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-4">
        All tiers start expanded. Edit the name, then tap <strong>Save</strong> on each habit.
      </p>

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
          const open = expandedTiers.has(tier.id);
          const th = tierHabits(tier.id);
          return (
            <div key={tier.id} className="rounded-xl border border-[var(--border)] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleTier(tier.id)}
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
                            handleTierField(tier, "attempted_pts", parseInt(e.target.value, 10))
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
                      <HabitEditorRow
                        key={habit.id}
                        habit={habit}
                        supabase={supabase}
                        saving={saving}
                        onSaved={refresh}
                        onDelete={() => {
                          if (confirm(`Delete "${habit.name}"?`)) {
                            run(async () => {
                              await deleteHabit(supabase, habit.id);
                            });
                          }
                        }}
                      />
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
