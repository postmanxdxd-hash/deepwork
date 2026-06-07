"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchLogsForDates,
  fetchUserRubricData,
  upsertLog,
} from "@/lib/rubric/actions";
import { fetchJournalNotes } from "@/lib/notes/actions";
import type { DailyLog, Habit, JournalNote, Profile, Rubric, Tier, TierWithHabits } from "@/lib/types";
import { getHistoryWeekStarts, getWeekDates } from "@/lib/dates";
import type { ScoringContext } from "@/lib/scoring";

interface AppContextValue {
  profile: Profile | null;
  rubric: Rubric | null;
  tiers: Tier[];
  habits: Habit[];
  tiersWithHabits: TierWithHabits[];
  logs: DailyLog[];
  journalNotes: JournalNote[];
  loading: boolean;
  weekDates: string[];
  setWeekAnchor: (date: Date) => void;
  weekAnchor: Date;
  refresh: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  updateHabitStatus: (habitId: string, date: string, status: string | null) => Promise<void>;
  updateTextContent: (habitId: string, date: string, content: string) => Promise<void>;
  updateDeepWork: (habitId: string, date: string, blocks: number) => Promise<void>;
  updateGym: (habitId: string, date: string, sessions: number) => Promise<void>;
  scoringContext: ScoringContext;
  historyWeekStarts: string[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  userId,
  initialProfile,
}: {
  children: React.ReactNode;
  userId: string;
  initialProfile: Profile | null;
}) {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [journalNotes, setJournalNotes] = useState<JournalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekAnchor, setWeekAnchor] = useState(new Date());

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const historyWeekStarts = useMemo(() => getHistoryWeekStarts(8), []);

  const allDates = useMemo(() => {
    const dates = new Set<string>();
    weekDates.forEach((d) => dates.add(d));
    historyWeekStarts.forEach((start) => {
      getWeekDates(new Date(start + "T12:00:00")).forEach((d) => dates.add(d));
    });
    return [...dates].sort();
  }, [weekDates, historyWeekStarts]);

  const tiersWithHabits = useMemo(
    () =>
      tiers.map((tier) => ({
        ...tier,
        habits: habits.filter((h) => h.tier_id === tier.id),
      })),
    [tiers, habits]
  );

  const scoringContext: ScoringContext = useMemo(
    () => ({ tiers, habits, logs, weekDates }),
    [tiers, habits, logs, weekDates]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (prof) setProfile(prof as Profile);

      const data = await fetchUserRubricData(supabase, userId);
      if (data) {
        setRubric(data.rubric);
        setTiers(data.tiers as Tier[]);
        setHabits(data.habits as Habit[]);
      }

      const fetchedLogs = await fetchLogsForDates(supabase, userId, allDates);
      setLogs(fetchedLogs as DailyLog[]);

      const notes = await fetchJournalNotes(supabase, userId);
      setJournalNotes(notes);
    } finally {
      setLoading(false);
    }
  }, [supabase, userId, allDates]);

  const refreshNotes = useCallback(async () => {
    const notes = await fetchJournalNotes(supabase, userId);
    setJournalNotes(notes);
  }, [supabase, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateHabitStatus = async (
    habitId: string,
    date: string,
    status: string | null
  ) => {
    const data = await upsertLog(supabase, userId, habitId, date, { status });
    setLogs((prev) => {
      const rest = prev.filter(
        (l) => !(l.habit_id === habitId && l.log_date === date)
      );
      return [...rest, data as DailyLog];
    });
  };

  const updateTextContent = async (
    habitId: string,
    date: string,
    content: string
  ) => {
    const data = await upsertLog(supabase, userId, habitId, date, {
      content,
      status: content.trim() ? "done" : null,
    });
    setLogs((prev) => {
      const rest = prev.filter(
        (l) => !(l.habit_id === habitId && l.log_date === date)
      );
      return [...rest, data as DailyLog];
    });
  };

  const updateDeepWork = async (
    habitId: string,
    date: string,
    blocks: number
  ) => {
    const data = await upsertLog(supabase, userId, habitId, date, {
      deepwork_blocks: blocks,
      status: blocks > 0 ? "done" : null,
    });
    setLogs((prev) => {
      const rest = prev.filter(
        (l) => !(l.habit_id === habitId && l.log_date === date)
      );
      return [...rest, data as DailyLog];
    });
  };

  const updateGym = async (
    habitId: string,
    date: string,
    sessions: number
  ) => {
    const data = await upsertLog(supabase, userId, habitId, date, {
      gym_sessions: sessions,
    });
    setLogs((prev) => {
      const rest = prev.filter(
        (l) => !(l.habit_id === habitId && l.log_date === date)
      );
      return [...rest, data as DailyLog];
    });
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        rubric,
        tiers,
        habits,
        tiersWithHabits,
        logs,
        journalNotes,
        loading,
        weekDates,
        setWeekAnchor,
        weekAnchor,
        refresh,
        refreshNotes,
        updateHabitStatus,
        updateTextContent,
        updateDeepWork,
        updateGym,
        scoringContext,
        historyWeekStarts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
