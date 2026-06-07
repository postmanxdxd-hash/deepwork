import { SupabaseClient } from "@supabase/supabase-js";
import type { JournalNote } from "@/lib/types";

export async function fetchJournalNotes(
  supabase: SupabaseClient,
  userId: string,
  limit = 200
): Promise<JournalNote[]> {
  const { data, error } = await supabase
    .from("journal_notes")
    .select("*")
    .eq("user_id", userId)
    .order("note_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as JournalNote[];
}

export async function createJournalNote(
  supabase: SupabaseClient,
  userId: string,
  content: string,
  noteDate?: string
): Promise<JournalNote> {
  const { data, error } = await supabase
    .from("journal_notes")
    .insert({
      user_id: userId,
      content: content.trim(),
      note_date: noteDate ?? new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data as JournalNote;
}

export async function deleteJournalNote(
  supabase: SupabaseClient,
  noteId: string
) {
  const { error } = await supabase.from("journal_notes").delete().eq("id", noteId);
  if (error) throw error;
}
