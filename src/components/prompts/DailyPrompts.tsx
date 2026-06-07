"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { PromptModal } from "@/components/prompts/PromptModal";
import { findHabitByRole } from "@/lib/habits/identify";
import { formatDateKey } from "@/lib/dates";
import { getTimePartsInTimezone } from "@/lib/reminders/timezone";

const EVENING_HOUR = 17;

export function DailyPrompts() {
  const { habits, logs, loading, updateTextContent, profile } = useApp();
  const today = formatDateKey(new Date());
  const tz = profile?.timezone ?? "Asia/Beirut";

  const mitHabit = useMemo(() => findHabitByRole(habits, "mit"), [habits]);
  const highlightHabit = useMemo(
    () => findHabitByRole(habits, "highlight"),
    [habits]
  );

  const mitContent = logs.find(
    (l) => l.habit_id === mitHabit?.id && l.log_date === today
  )?.content;
  const highlightContent = logs.find(
    (l) => l.habit_id === highlightHabit?.id && l.log_date === today
  )?.content;

  const [showMit, setShowMit] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [mitDraft, setMitDraft] = useState("");
  const [highlightDraft, setHighlightDraft] = useState("");

  const isEvening = useMemo(() => {
    const { hour } = getTimePartsInTimezone(new Date(), tz);
    return hour >= EVENING_HOUR;
  }, [tz]);

  useEffect(() => {
    if (loading) return;
    const filled = Boolean(mitContent?.trim());
    const snoozed = sessionStorage.getItem(`mit-snooze-${today}`);
    if (mitHabit && !filled && !snoozed) {
      setMitDraft(mitContent ?? "");
      setShowMit(true);
    } else {
      setShowMit(false);
    }
  }, [loading, mitHabit, mitContent, today]);

  useEffect(() => {
    if (loading || showMit) {
      setShowHighlight(false);
      return;
    }
    const filled = Boolean(highlightContent?.trim());
    const skipped = localStorage.getItem(`highlight-skip-${today}`);
    if (highlightHabit && isEvening && !filled && !skipped) {
      setHighlightDraft(highlightContent ?? "");
      setShowHighlight(true);
    } else {
      setShowHighlight(false);
    }
  }, [loading, showMit, highlightHabit, highlightContent, isEvening, today]);

  const saveMit = async () => {
    if (!mitHabit || !mitDraft.trim()) return;
    await updateTextContent(mitHabit.id, today, mitDraft.trim());
    sessionStorage.removeItem(`mit-snooze-${today}`);
    setShowMit(false);
  };

  const snoozeMit = () => {
    sessionStorage.setItem(`mit-snooze-${today}`, "1");
    setShowMit(false);
  };

  const saveHighlight = async () => {
    if (!highlightHabit || !highlightDraft.trim()) return;
    await updateTextContent(highlightHabit.id, today, highlightDraft.trim());
    setShowHighlight(false);
  };

  const skipHighlight = () => {
    localStorage.setItem(`highlight-skip-${today}`, "1");
    setShowHighlight(false);
  };

  return (
    <>
      <PromptModal
        open={showMit}
        title="🎯 Most Important Task"
        subtitle="What's the one thing that matters most today?"
        placeholder="Write your MIT for today..."
        value={mitDraft}
        onChange={setMitDraft}
        onSubmit={saveMit}
        onSnooze={snoozeMit}
        snoozeLabel="Snooze for now"
        submitLabel="Set my MIT"
        required
      />
      <PromptModal
        open={showHighlight}
        title="✨ Highlight of the Day"
        subtitle="What was the best part of your day?"
        placeholder="A win, a moment, something you're grateful for..."
        value={highlightDraft}
        onChange={setHighlightDraft}
        onSubmit={saveHighlight}
        onSkip={skipHighlight}
        skipLabel="Skip for today"
        submitLabel="Save highlight"
      />
    </>
  );
}
