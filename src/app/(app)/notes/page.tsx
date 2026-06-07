"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/providers/AppProvider";
import { createJournalNote, deleteJournalNote } from "@/lib/notes/actions";
import { formatDisplayDate } from "@/lib/dates";
import type { JournalNote } from "@/lib/types";

export default function NotesPage() {
  const supabase = createClient();
  const { journalNotes, refreshNotes, loading } = useApp();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const grouped = journalNotes.reduce<Record<string, JournalNote[]>>((acc, note) => {
    if (!acc[note.note_date]) acc[note.note_date] = [];
    acc[note.note_date].push(note);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await createJournalNote(supabase, user.id, draft.trim());
      setDraft("");
      await refreshNotes();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await deleteJournalNote(supabase, id);
    await refreshNotes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold mb-1">Notes & Quotes</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Things to remember — quotes, ideas, reminders. Collected by day.
      </p>

      <section className="card p-4 mb-6">
        <textarea
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note, quote, or thing to remember..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-3"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !draft.trim()}
          className="rounded-xl bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add to collection"}
        </button>
      </section>

      {sortedDates.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-muted)] py-12">
          No notes yet. Start collecting things worth remembering.
        </p>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <section key={date}>
              <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                {formatDisplayDate(date)}
              </h2>
              <div className="space-y-2">
                {grouped[date].map((note) => (
                  <div key={note.id} className="card p-4 group relative">
                    <p className="text-sm whitespace-pre-wrap pr-8">{note.content}</p>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)] text-xs cursor-pointer md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Delete note"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
