"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/login` }
    );
    if (resetError) setError(resetError.message);
    else setSent(true);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold mb-1">Reset password</h1>
        {sent ? (
          <p className="text-[var(--success)] text-sm mt-4">
            Check your email for a reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--accent)] py-3 font-semibold text-white cursor-pointer"
            >
              Send reset link
            </button>
          </form>
        )}
        <Link
          href="/login"
          className="block mt-6 text-center text-sm text-[var(--accent)]"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
