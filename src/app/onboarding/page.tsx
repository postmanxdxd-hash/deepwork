"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { seedRubricFromTemplate } from "@/lib/rubric/actions";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (template: "june2026" | "blank") => {
    setLoading(template);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await seedRubricFromTemplate(supabase, user.id, template);
      router.push("/today");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Choose your starting rubric
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center mb-8">
          You can customize tiers, habits, and points anytime in Settings
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => choose("june2026")}
            className="card p-6 text-left hover:ring-2 hover:ring-[var(--accent)] transition-soft cursor-pointer disabled:opacity-50"
          >
            <div className="text-3xl mb-3">📋</div>
            <h2 className="font-bold text-lg mb-1">June 2026</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Full rubric with Easy, Medium, Hard, Hard+, and Fajr tiers — including
              Highlight, MIT, and Weekly Review
            </p>
            {loading === "june2026" && (
              <p className="text-xs text-[var(--accent)] mt-3">Setting up...</p>
            )}
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => choose("blank")}
            className="card p-6 text-left hover:ring-2 hover:ring-[var(--accent)] transition-soft cursor-pointer disabled:opacity-50"
          >
            <div className="text-3xl mb-3">✨</div>
            <h2 className="font-bold text-lg mb-1">Start blank</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Empty Easy tier — build your rubric from scratch in Settings
            </p>
            {loading === "blank" && (
              <p className="text-xs text-[var(--accent)] mt-3">Setting up...</p>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-center text-sm text-[var(--danger)]">{error}</p>
        )}
      </div>
    </div>
  );
}
