import { SupabaseClient } from "@supabase/supabase-js";
import type { Cadence, HabitType } from "@/lib/types";

export async function updateTier(
  supabase: SupabaseClient,
  tierId: string,
  fields: {
    label?: string;
    done_pts?: number;
    attempted_pts?: number;
    blank_pts?: number;
    color_bg?: string;
    color_accent?: string;
    color_text?: string;
  }
) {
  const { error } = await supabase.from("tiers").update(fields).eq("id", tierId);
  if (error) throw error;
}

export async function deleteTier(supabase: SupabaseClient, tierId: string) {
  const { error } = await supabase.from("tiers").delete().eq("id", tierId);
  if (error) throw error;
}

export async function addTier(
  supabase: SupabaseClient,
  rubricId: string,
  sortOrder: number
) {
  const { data, error } = await supabase
    .from("tiers")
    .insert({
      rubric_id: rubricId,
      label: "NEW TIER",
      done_pts: 1,
      attempted_pts: 0,
      blank_pts: 0,
      sort_order: sortOrder,
      color_bg: "#eef2f7",
      color_accent: "#6b9bd1",
      color_text: "#4a6a8a",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHabit(
  supabase: SupabaseClient,
  habitId: string,
  fields: {
    name?: string;
    icon?: string;
    type?: HabitType;
    cadence?: Cadence;
    tier_id?: string;
    sort_order?: number;
  }
) {
  const { error } = await supabase.from("habits").update(fields).eq("id", habitId);
  if (error) throw error;
}

export async function deleteHabit(supabase: SupabaseClient, habitId: string) {
  const { error } = await supabase.from("habits").delete().eq("id", habitId);
  if (error) throw error;
}

export async function addHabit(
  supabase: SupabaseClient,
  tierId: string,
  sortOrder: number
) {
  const { data, error } = await supabase
    .from("habits")
    .insert({
      tier_id: tierId,
      name: "New Habit",
      icon: "✦",
      type: "standard",
      cadence: "daily",
      sort_order: sortOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRubricName(
  supabase: SupabaseClient,
  rubricId: string,
  name: string
) {
  const { error } = await supabase
    .from("rubrics")
    .update({ name })
    .eq("id", rubricId);
  if (error) throw error;
}
