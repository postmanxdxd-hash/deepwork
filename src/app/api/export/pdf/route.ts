import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRubricData, fetchLogsForDates } from "@/lib/rubric/actions";
import { getWeekDates } from "@/lib/dates";
import {
  calcDayScore,
  calcWeekScore,
  getWeekQualityLabel,
  calcTopHabitStreak,
} from "@/lib/scoring";
import { WEEK_BENCHMARKS } from "@/lib/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart =
    request.nextUrl.searchParams.get("weekStart") ??
    getWeekDates()[0];
  const weekDates = getWeekDates(new Date(weekStart + "T12:00:00"));

  const rubricData = await fetchUserRubricData(supabase, user.id);
  if (!rubricData) {
    return NextResponse.json({ error: "No rubric" }, { status: 404 });
  }

  const logs = await fetchLogsForDates(supabase, user.id, weekDates);
  const ctx = {
    tiers: rubricData.tiers,
    habits: rubricData.habits,
    logs,
    weekDates,
  };

  const weekScore = calcWeekScore(ctx, weekDates);
  const label = getWeekQualityLabel(weekScore);
  const topStreak = calcTopHabitStreak(ctx, weekDates[6]);

  const habitRows = rubricData.habits
    .filter((h) => h.type !== "gym")
    .map((h) => {
      let completed = 0;
      for (const d of weekDates) {
        const log = logs.find(
          (l) => l.habit_id === h.id && l.log_date === d
        );
        if (h.type === "text" && log?.content?.trim()) completed++;
        else if (h.type === "deepwork" && (log?.deepwork_blocks ?? 0) > 0)
          completed++;
        else if (log?.status === "done") completed++;
      }
      return `${h.name}: ${completed}/7 days`;
    })
    .join("\n");

  const dailyScores = weekDates
    .map((d) => {
      const s = calcDayScore(ctx, d);
      return `${d}: ${s > 0 ? "+" : ""}${s}`;
    })
    .join("\n");

  const text = `
HABIT TRACKER — WEEKLY REPORT
Week of ${weekStart}
Generated ${new Date().toLocaleDateString()}

WEEK SCORE: ${weekScore > 0 ? "+" : ""}${weekScore}
QUALITY: ${label}
TOP STREAK: ${topStreak ? `${topStreak.streak} days (${topStreak.name})` : "None"}

DAILY SCORES:
${dailyScores}

HABIT COMPLETION:
${habitRows}

BENCHMARKS:
${WEEK_BENCHMARKS.map((b) => `${b.label}: ${b.quality === "bad" ? "Negative → 0" : `+${b.min} to +${b.max}`}`).join("\n")}
`.trim();

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="habit-report-${weekStart}.txt"`,
    },
  });
}
