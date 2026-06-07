import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppProvider } from "@/components/providers/AppProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppNav } from "@/components/layout/AppNav";
import { ReminderChecker } from "@/components/reminders/ReminderChecker";
import { DailyPrompts } from "@/components/prompts/DailyPrompts";
import type { Profile } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_complete) {
    redirect("/onboarding");
  }

  const { data: rubric } = await supabase
    .from("rubrics")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!rubric) {
    redirect("/onboarding");
  }

  return (
    <ThemeProvider initialTheme={(profile as Profile)?.theme ?? "system"}>
      <AppProvider userId={user.id} initialProfile={profile as Profile | null}>
        <ReminderChecker />
        <DailyPrompts />
        <div className="min-h-dvh flex flex-col md:flex-row">
          <AppNav />
          <main className="flex-1 pb-24 md:pb-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}
