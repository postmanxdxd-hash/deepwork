"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { WeekStrip } from "@/components/layout/WeekStrip";
import { ScoreCards } from "@/components/layout/ScoreCards";
import { StreakBadge } from "@/components/layout/StreakBadge";
import { TierSection } from "@/components/habits/TierSection";
import { HabitRenameModal } from "@/components/habits/HabitRenameModal";
import { MitInlineField } from "@/components/habits/MitInlineField";
import { FajrShortcut } from "@/components/habits/FajrShortcut";
import { WeeklyLogSection } from "@/components/habits/WeeklyLogSection";
import type { Habit } from "@/lib/types";
import { formatDisplayDate, formatMonthYear, getWeekDates } from "@/lib/dates";
import {
  calcDayScore,
  calcWeekScore,
  calcTopHabitStreak,
  calcWeeklyQualityStreak,
  countDoneToday,
  cycleBinaryStatus,
  cycleStatus,
  wasYesterdayMissed,
} from "@/lib/scoring";
import { WEEK_BENCHMARKS } from "@/lib/types";
import {
  findFajrHabit,
  findHabitByRole,
  isFajrHabit,
} from "@/lib/habits/identify";
import { getTodayTierSections } from "@/lib/habits/todayDisplay";
import { getTimePartsInTimezone } from "@/lib/reminders/timezone";

export default function TodayPage() {
  const {
    tiers,
    tiersWithHabits,
    habits,
    logs,
    weekDates,
    scoringContext,
    historyWeekStarts,
    profile,
    updateHabitStatus,
    updateTextContent,
    updateDeepWork,
    updateGym,
    loading,
  } = useApp();

  const timezone = profile?.timezone ?? "Asia/Beirut";
  const todayStr = getTimePartsInTimezone(new Date(), timezone).dateKey;
  const todayIdx = weekDates.indexOf(todayStr);
  const [selectedDay, setSelectedDay] = useState(todayIdx >= 0 ? todayIdx : 0);
  const [renameHabit, setRenameHabit] = useState<Habit | null>(null);

  const dateKey = weekDates[selectedDay];
  const gymLogDate = weekDates[weekDates.length - 1];

  const mitHabit = useMemo(() => findHabitByRole(habits, "mit"), [habits]);
  const fajrHabit = useMemo(() => findFajrHabit(habits, tiers), [habits, tiers]);

  const mitContent =
    logs.find((l) => l.habit_id === mitHabit?.id && l.log_date === dateKey)
      ?.content ?? "";

  const fajrLog = fajrHabit
    ? logs.find((l) => l.habit_id === fajrHabit.id && l.log_date === dateKey)
    : undefined;
  const fajrLogged = fajrLog?.status === "done";
  const hideFajrInList =
    Boolean(fajrHabit) && dateKey === todayStr && !fajrLogged;

  const tiersForDisplay = useMemo(
    () =>
      getTodayTierSections(tiersWithHabits, {
        hideMit: true,
        hideFajr: hideFajrInList,
        fajrHabitId: fajrHabit?.id,
      }),
    [tiersWithHabits, hideFajrInList, fajrHabit?.id]
  );

  const gymHabit = useMemo(() => habits.find((h) => h.type === "gym"), [habits]);
  const weeklyReviewHabit = useMemo(
    () => habits.find((h) => h.type === "text" && h.cadence === "weekly"),
    [habits]
  );
  const weeklyReviewTier = useMemo(
    () =>
      weeklyReviewHabit
        ? tiers.find((t) => t.id === weeklyReviewHabit.tier_id)
        : undefined,
    [weeklyReviewHabit, tiers]
  );

  const dayScores = useMemo(
    () => weekDates.map((d) => calcDayScore(scoringContext, d)),
    [weekDates, scoringContext]
  );

  const dayScore = calcDayScore(scoringContext, dateKey);
  const weekScore = calcWeekScore(scoringContext, weekDates);
  const { done, total } = countDoneToday(scoringContext, dateKey);

  const topStreak = calcTopHabitStreak(scoringContext, dateKey);
  const weeklyStreak = calcWeeklyQualityStreak(
    historyWeekStarts,
    (weekStart) => ({
      ...scoringContext,
      weekDates: getWeekDates(new Date(weekStart + "T12:00:00")),
      logs,
    }),
    weekDates[0]
  );

  const showNeverMissTwice =
    dateKey === todayStr && wasYesterdayMissed(scoringContext, todayStr);
  const mvdThreshold = profile?.mvd_threshold ?? 10;

  const handleCycle = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    const log = logs.find(
      (l) => l.habit_id === habitId && l.log_date === dateKey
    );
    const next =
      habit && isFajrHabit(habit, tiers)
        ? cycleBinaryStatus(log?.status ?? null)
        : cycleStatus(log?.status ?? null);
    await updateHabitStatus(habitId, dateKey, next);
  };

  const handleTextChange = async (habitId: string, content: string) => {
    await updateTextContent(habitId, dateKey, content);
  };

  const handleFajrDone = async (habitId: string) => {
    await updateHabitStatus(habitId, dateKey, "done");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="px-5 pt-6 pb-5 text-white rounded-b-3xl shadow-lg mb-5"
        style={{ background: "var(--bg-header)" }}
      >
        <div className="text-[11px] text-white/50 tracking-widest mb-1">
          {formatMonthYear()}
        </div>
        <h1 className="text-2xl font-bold mb-4">Today</h1>
        <WeekStrip
          weekDates={weekDates}
          selectedIndex={selectedDay}
          onSelect={setSelectedDay}
          dayScores={dayScores}
        />
        <div className="mt-4">
          <ScoreCards
            dayScore={dayScore}
            weekScore={weekScore}
            doneCount={done}
            totalCount={total}
            mvdThreshold={mvdThreshold}
            showMvd={dateKey === todayStr}
          />
        </div>
        <div className="mt-3">
          <StreakBadge
            habitStreak={topStreak?.streak ?? 0}
            habitName={topStreak?.name ?? ""}
            weeklyStreak={weeklyStreak}
            showNeverMissTwice={showNeverMissTwice}
          />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-white/60 mb-1">
            <span>Progress</span>
            <span>
              {done}/{total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--success)] transition-soft"
              style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        {fajrHabit && (
          <FajrShortcut
            habit={fajrHabit}
            isLogged={fajrLogged}
            dateKey={dateKey}
            todayKey={todayStr}
            onMarkDone={handleFajrDone}
          />
        )}

        {mitHabit && (
          <MitInlineField
            habit={mitHabit}
            content={mitContent}
            dateKey={dateKey}
            todayKey={todayStr}
            onSave={handleTextChange}
          />
        )}

        <p className="text-sm text-[var(--text-muted)] italic mb-4">
          {formatDisplayDate(dateKey)}
        </p>

        {tiersForDisplay.map(({ habits: tierHabits, ...tier }) => (
          <TierSection
            key={tier.id}
            tier={tier}
            habits={tierHabits}
            tiers={tiers}
            dateKey={dateKey}
            logs={logs}
            onCycle={handleCycle}
            onTextChange={handleTextChange}
            onDeepWork={(id, b) => updateDeepWork(id, dateKey, b)}
            onEditHabit={setRenameHabit}
            timezone={timezone}
          />
        ))}

        <WeeklyLogSection
          gymHabit={gymHabit}
          weeklyReviewHabit={weeklyReviewHabit}
          weeklyReviewTier={weeklyReviewTier}
          weekDates={weekDates}
          dateKey={dateKey}
          gymLogDate={gymLogDate}
          logs={logs}
          timezone={timezone}
          onGym={(id, s) => updateGym(id, gymLogDate, s)}
          onTextChange={handleTextChange}
        />

        <HabitRenameModal
          habit={renameHabit}
          open={Boolean(renameHabit)}
          onClose={() => setRenameHabit(null)}
        />

        <div className="card p-4 mt-2">
          <h3 className="text-xs font-bold text-[var(--text)] mb-3">
            Weekly Benchmarks
          </h3>
          {WEEK_BENCHMARKS.map((b) => (
            <div
              key={b.label}
              className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0"
            >
              <span
                className="text-xs font-bold"
                style={{
                  color:
                    b.quality === "excellent"
                      ? "var(--success)"
                      : b.quality === "solid"
                        ? "var(--warning)"
                        : b.quality === "rough"
                          ? "var(--warning)"
                          : "var(--danger)",
                }}
              >
                {b.label}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {b.quality === "bad"
                  ? "Negative → reset to 0"
                  : `+${b.min} to +${b.max}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
