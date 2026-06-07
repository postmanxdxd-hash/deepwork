import type { Habit, Tier } from "@/lib/types";

export interface TemplateTier {
  label: string;
  done_pts: number;
  attempted_pts: number;
  blank_pts: number;
  color_bg: string;
  color_accent: string;
  color_text: string;
  habits: TemplateHabit[];
}

export interface TemplateHabit {
  name: string;
  icon: string;
  type: Habit["type"];
  cadence: Habit["cadence"];
  role?: "mit" | "highlight";
}

export const JUNE_2026_TEMPLATE: TemplateTier[] = [
  {
    label: "EASY",
    done_pts: 1,
    attempted_pts: 0,
    blank_pts: -1,
    color_bg: "#e8faf0",
    color_accent: "#27ae60",
    color_text: "#1e8449",
    habits: [
      { name: "Religious Habit 1", icon: "🕌", type: "standard", cadence: "daily" },
      { name: "Religious Habit 2", icon: "📿", type: "standard", cadence: "daily" },
      { name: "Religious Habit 3", icon: "🤲", type: "standard", cadence: "daily" },
      { name: "Highlight of the Day", icon: "✨", type: "text", cadence: "daily", role: "highlight" },
    ],
  },
  {
    label: "MEDIUM",
    done_pts: 2,
    attempted_pts: 0,
    blank_pts: -2,
    color_bg: "#fff8e8",
    color_accent: "#e67e22",
    color_text: "#d35400",
    habits: [
      { name: "Read 10 pages", icon: "📖", type: "standard", cadence: "daily" },
      { name: "Articles 20 mins", icon: "📰", type: "standard", cadence: "daily" },
      { name: "Journal 10 mins", icon: "📝", type: "standard", cadence: "daily" },
      { name: "Quran 5 pages", icon: "📗", type: "standard", cadence: "daily" },
      { name: "Wake before 7:50AM", icon: "⏰", type: "standard", cadence: "daily" },
      { name: "Single Most Important Task", icon: "🎯", type: "text", cadence: "daily", role: "mit" },
    ],
  },
  {
    label: "HARD",
    done_pts: 3,
    attempted_pts: 1,
    blank_pts: -3,
    color_bg: "#fdecea",
    color_accent: "#e74c3c",
    color_text: "#c0392b",
    habits: [
      { name: "Deep Work", icon: "🧠", type: "deepwork", cadence: "daily" },
      { name: "Gym", icon: "💪", type: "gym", cadence: "weekly" },
    ],
  },
  {
    label: "HARD+",
    done_pts: 4,
    attempted_pts: 1,
    blank_pts: -4,
    color_bg: "#fce8f0",
    color_accent: "#c0392b",
    color_text: "#922b21",
    habits: [
      { name: "Weekly Review", icon: "📋", type: "text", cadence: "weekly" },
    ],
  },
  {
    label: "FAJR ★",
    done_pts: 4,
    attempted_pts: 1,
    blank_pts: -4,
    color_bg: "#f3e8fd",
    color_accent: "#8e44ad",
    color_text: "#7d3c98",
    habits: [
      { name: "Fajr Prayer", icon: "🌅", type: "standard", cadence: "daily" },
    ],
  },
];

export const BLANK_TEMPLATE: TemplateTier[] = [
  {
    label: "EASY",
    done_pts: 1,
    attempted_pts: 0,
    blank_pts: -1,
    color_bg: "#e8faf0",
    color_accent: "#27ae60",
    color_text: "#1e8449",
    habits: [],
  },
];

export function tierPointsLabel(tier: Pick<Tier, "done_pts" | "attempted_pts" | "blank_pts">): string {
  const a = tier.attempted_pts >= 0 ? `+${tier.attempted_pts}` : String(tier.attempted_pts);
  const d = tier.done_pts >= 0 ? `+${tier.done_pts}` : String(tier.done_pts);
  const b = tier.blank_pts >= 0 ? `+${tier.blank_pts}` : String(tier.blank_pts);
  return `${d}/${a}/${b}`;
}
