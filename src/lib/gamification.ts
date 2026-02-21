import { getDayProgress } from "@/lib/dayProgress";
import { formatDateKey, parseDateKey } from "@/lib/dates";
import type { AppState } from "@/types/app.types";

export type StreakBadge = {
  id: "newbie" | "rhythm" | "stable" | "fire";
  title: string;
};

const STREAK_BADGES: Array<{
  minDays: number;
  badge: StreakBadge;
}> = [
  { minDays: 14, badge: { id: "fire", title: "Огонь" } },
  { minDays: 7, badge: { id: "stable", title: "Стабильно" } },
  { minDays: 3, badge: { id: "rhythm", title: "В ритме" } },
  { minDays: 0, badge: { id: "newbie", title: "Новичок" } },
];

function getDateDiffInDays(left: Date, right: Date): number {
  const leftUtc = Date.UTC(left.getFullYear(), left.getMonth(), left.getDate());
  const rightUtc = Date.UTC(right.getFullYear(), right.getMonth(), right.getDate());

  return Math.round((leftUtc - rightUtc) / (24 * 60 * 60 * 1000));
}

export function getStreakBadge(days: number): StreakBadge {
  return STREAK_BADGES.find((item) => days >= item.minDays)?.badge ?? STREAK_BADGES[STREAK_BADGES.length - 1].badge;
}

export function recalculateStreaks(state: AppState, referenceDate: Date = new Date()): AppState["streaks"] {
  const closedDates = new Set(
    Object.entries(state.metricsByDate)
      .filter(([, metrics]) => getDayProgress(metrics, state).dayClosed)
      .map(([dateKey]) => dateKey),
  );

  const sortedClosedDateKeys = Array.from(closedDates).sort();
  let bestDays = 0;
  let run = 0;
  let previousDate: Date | null = null;

  for (const dateKey of sortedClosedDateKeys) {
    const parsed = parseDateKey(dateKey);
    if (!parsed) {
      continue;
    }

    if (previousDate && getDateDiffInDays(parsed, previousDate) === 1) {
      run += 1;
    } else {
      run = 1;
    }

    if (run > bestDays) {
      bestDays = run;
    }

    previousDate = parsed;
  }

  let currentDays = 0;
  const cursor = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  while (closedDates.has(formatDateKey(cursor))) {
    currentDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    currentDays,
    bestDays: Math.max(bestDays, currentDays),
  };
}
