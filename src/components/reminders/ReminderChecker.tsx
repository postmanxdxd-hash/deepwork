"use client";

import { useEffect } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { formatTimeHHMM, getTimePartsInTimezone, matchesTimeSlot } from "@/lib/reminders/timezone";

const MESSAGES = {
  morning: {
    title: "Good morning ☀️",
    body: "Set your MIT and plan your habits for today.",
  },
  evening: {
    title: "Evening check-in 🌙",
    body: "Log your habits and reflect on the day.",
  },
};

export function ReminderChecker() {
  const { profile } = useApp();

  useEffect(() => {
    if (!profile) return;
    if (!("Notification" in window)) return;

    const tz = profile.timezone ?? "Asia/Beirut";

    const slots = [
      {
        type: "morning" as const,
        enabled: profile.reminder_morning_enabled,
        time: formatTimeHHMM(profile.reminder_morning_time ?? "07:30:00"),
      },
      {
        type: "evening" as const,
        enabled: profile.reminder_evening_enabled,
        time: formatTimeHHMM(profile.reminder_evening_time ?? "21:00:00"),
      },
    ];

    const check = () => {
      if (Notification.permission !== "granted") return;
      const { dateKey } = getTimePartsInTimezone(new Date(), tz);

      for (const slot of slots) {
        if (!slot.enabled) continue;
        if (!matchesTimeSlot(slot.time, tz, 1)) continue;

        const key = `reminder-${slot.type}-${dateKey}`;
        if (sessionStorage.getItem(key)) continue;

        sessionStorage.setItem(key, "1");
        const msg = MESSAGES[slot.type];
        new Notification(msg.title, {
          body: msg.body,
          icon: "/icon.svg",
        });
      }
    };

    navigator.serviceWorker?.register("/sw.js").catch(() => {});

    const id = setInterval(check, 30000);
    check();
    return () => clearInterval(id);
  }, [profile]);

  return null;
}
