"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/providers/AppProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { ThemeMode } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile, refresh } = useApp();
  const { theme, setTheme } = useTheme();

  const [morningEnabled, setMorningEnabled] = useState(
    profile?.reminder_morning_enabled ?? true
  );
  const [eveningEnabled, setEveningEnabled] = useState(
    profile?.reminder_evening_enabled ?? true
  );
  const [mvdThreshold, setMvdThreshold] = useState(
    String(profile?.mvd_threshold ?? 10)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const saveProfile = async (fields: Record<string, unknown>) => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(fields).eq("id", profile.id);
    await refresh();
    setSaving(false);
    if (error) showMsg(error.message);
    else showMsg("Saved");
  };

  const handleThemeChange = async (t: ThemeMode) => {
    setTheme(t);
    await saveProfile({ theme: t });
  };

  const handleRemindersSave = async () => {
    await saveProfile({
      timezone: "Asia/Beirut",
      reminder_morning_enabled: morningEnabled,
      reminder_morning_time: "07:30:00",
      reminder_evening_enabled: eveningEnabled,
      reminder_evening_time: "21:00:00",
    });
  };

  const handleMvdSave = async () => {
    const parsed = parseInt(mvdThreshold, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      showMsg("Enter a valid number (0 or higher)");
      return;
    }
    await saveProfile({ mvd_threshold: parsed });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {message && (
        <p className="mb-4 text-sm text-[var(--success)] bg-[var(--success)]/10 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <section className="card p-4 mb-4">
        <h2 className="text-sm font-bold mb-1">Edit habit names</h2>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Rename religious habits, change tiers, add or remove habits.
        </p>
        <Link
          href="/habits"
          className="inline-flex w-full justify-center rounded-xl bg-[var(--accent)] text-white py-3 text-sm font-semibold"
        >
          Open habit editor →
        </Link>
      </section>

      <section className="card p-4 mb-4">
        <h2 className="text-sm font-bold mb-1">Minimum viable day</h2>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          When your daily score reaches this value, Today shows &quot;Good enough for today&quot;.
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            value={mvdThreshold}
            onChange={(e) => setMvdThreshold(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleMvdSave}
            disabled={saving}
            className="rounded-xl bg-[var(--accent)] text-white px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </section>

      <section className="card p-4 mb-4">
        <h2 className="text-sm font-bold mb-1">In-app reminders</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Lebanon time (Asia/Beirut). Reminders appear while the app is open in your browser.
        </p>

        <label className="flex items-center gap-3 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={morningEnabled}
            onChange={(e) => setMorningEnabled(e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          <span className="text-sm">
            <strong>Morning</strong> — 7:30 AM · plan your day
          </span>
        </label>

        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={eveningEnabled}
            onChange={(e) => setEveningEnabled(e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          <span className="text-sm">
            <strong>Evening</strong> — 9:00 PM · log & reflect
          </span>
        </label>

        <button
          type="button"
          onClick={handleRemindersSave}
          disabled={saving}
          className="rounded-xl bg-[var(--accent)] text-white px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50"
        >
          Save reminders
        </button>
      </section>

      <section className="card p-4 mb-4">
        <h2 className="text-sm font-bold mb-3">Appearance</h2>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as ThemeMode[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleThemeChange(t)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-soft cursor-pointer ${
                theme === t
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-bold mb-3">Account</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">{profile?.email}</p>
        <button
          type="button"
          onClick={signOut}
          className="rounded-xl border border-[var(--danger)] text-[var(--danger)] px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-[var(--danger)]/10 transition-soft"
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
