import { SupabaseClient } from "@supabase/supabase-js";
import {
  BLANK_TEMPLATE,
  JUNE_2026_TEMPLATE,
  TemplateTier,
} from "@/lib/rubric/templates";

export async function seedRubricFromTemplate(
  supabase: SupabaseClient,
  userId: string,
  template: "june2026" | "blank"
) {
  const tiers: TemplateTier[] =
    template === "june2026" ? JUNE_2026_TEMPLATE : BLANK_TEMPLATE;

  const { data: rubric, error: rubricError } = await supabase
    .from("rubrics")
    .insert({
      user_id: userId,
      name: template === "june2026" ? "June 2026" : "My Rubric",
      template_source: template,
    })
    .select()
    .single();

  if (rubricError || !rubric) throw rubricError ?? new Error("Failed to create rubric");

  for (let ti = 0; ti < tiers.length; ti++) {
    const t = tiers[ti];
    const { data: tier, error: tierError } = await supabase
      .from("tiers")
      .insert({
        rubric_id: rubric.id,
        label: t.label,
        done_pts: t.done_pts,
        attempted_pts: t.attempted_pts,
        blank_pts: t.blank_pts,
        sort_order: ti,
        color_bg: t.color_bg,
        color_accent: t.color_accent,
        color_text: t.color_text,
      })
      .select()
      .single();

    if (tierError || !tier) throw tierError ?? new Error("Failed to create tier");

    for (let hi = 0; hi < t.habits.length; hi++) {
      const h = t.habits[hi];
      const { error: habitError } = await supabase.from("habits").insert({
        tier_id: tier.id,
        name: h.name,
        icon: h.icon,
        type: h.type,
        cadence: h.cadence,
        sort_order: hi,
        special_config: h.role ? { role: h.role } : {},
      });
      if (habitError) throw habitError;
    }
  }

  await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", userId);

  return rubric;
}

export async function fetchUserRubricData(supabase: SupabaseClient, userId: string) {
  const { data: rubrics } = await supabase
    .from("rubrics")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  const rubric = rubrics?.[0];
  if (!rubric) return null;

  const { data: tiers } = await supabase
    .from("tiers")
    .select("*")
    .eq("rubric_id", rubric.id)
    .order("sort_order");

  const tierIds = tiers?.map((t) => t.id) ?? [];
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .in("tier_id", tierIds.length ? tierIds : ["none"])
    .order("sort_order");

  return { rubric, tiers: tiers ?? [], habits: habits ?? [] };
}

export async function fetchLogsForDates(
  supabase: SupabaseClient,
  userId: string,
  dates: string[]
) {
  if (!dates.length) return [];
  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", dates[0])
    .lte("log_date", dates[dates.length - 1]);
  return data ?? [];
}

export async function upsertLog(
  supabase: SupabaseClient,
  userId: string,
  habitId: string,
  logDate: string,
  fields: {
    status?: string | null;
    content?: string | null;
    deepwork_blocks?: number;
    gym_sessions?: number | null;
  }
) {
  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: userId,
        habit_id: habitId,
        log_date: logDate,
        updated_at: new Date().toISOString(),
        ...fields,
      },
      { onConflict: "user_id,habit_id,log_date" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
