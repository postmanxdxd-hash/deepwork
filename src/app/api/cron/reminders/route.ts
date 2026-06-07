import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  matchesTimeSlot,
  formatTimeHHMM,
  getTimePartsInTimezone,
} from "@/lib/reminders/timezone";
import { sendPushNotification } from "@/lib/push/send";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = adminClient();
  const { data: profiles } = await supabase.from("profiles").select("*");

  let sent = 0;

  for (const profile of profiles ?? []) {
    const tz = profile.timezone ?? "Asia/Beirut";
    const { dateKey } = getTimePartsInTimezone(new Date(), tz);

    const slots: {
      type: "morning" | "evening";
      enabled: boolean;
      time: string;
      title: string;
      body: string;
    }[] = [
      {
        type: "morning",
        enabled: profile.reminder_morning_enabled ?? false,
        time: formatTimeHHMM(profile.reminder_morning_time ?? "07:30:00"),
        title: "Good morning ☀️",
        body: "Set your MIT and plan your habits for today.",
      },
      {
        type: "evening",
        enabled: profile.reminder_evening_enabled ?? false,
        time: formatTimeHHMM(profile.reminder_evening_time ?? "21:00:00"),
        title: "Evening check-in 🌙",
        body: "Log your habits and reflect on the day.",
      },
    ];

    for (const slot of slots) {
      if (!slot.enabled) continue;
      if (!matchesTimeSlot(slot.time, tz, 2)) continue;

      const { data: existing } = await supabase
        .from("reminder_sent_log")
        .select("id")
        .eq("user_id", profile.id)
        .eq("reminder_type", slot.type)
        .eq("sent_date", dateKey)
        .maybeSingle();

      if (existing) continue;

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", profile.id);

      for (const sub of subs ?? []) {
        try {
          await sendPushNotification(sub, {
            title: slot.title,
            body: slot.body,
            url: "/today",
          });
          sent++;
        } catch {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }

      await supabase.from("reminder_sent_log").insert({
        user_id: profile.id,
        reminder_type: slot.type,
        sent_date: dateKey,
      });
    }
  }

  return NextResponse.json({ ok: true, sent });
}
