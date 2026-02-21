import { recalculateStreaks } from "@/lib/gamification";
import type { AppState } from "@/types/app.types";

export const STORAGE_KEY = "notepad-app-state-v1";

const DEFAULT_GOALS: AppState["goals"] = {
  waterMl: 2000,
  steps: 10000,
  sleepHours: 7,
};

const DEFAULT_STREAKS: AppState["streaks"] = {
  currentDays: 0,
  bestDays: 0,
};

const DEFAULT_MONTH_TRACKERS: AppState["monthTrackers"] = [
  {
    id: "tracker-stress-free",
    title: "День без стресса",
    color: "green",
  },
];

export function createDefaultAppState(): AppState {
  return {
    version: 1,
    goals: { ...DEFAULT_GOALS },
    metricsByDate: {},
    foodItems: [],
    foodLogByDate: {},
    chores: [],
    choreLogByDate: {},
    workoutLogByDate: {},
    monthTrackers: DEFAULT_MONTH_TRACKERS.map((tracker) => ({ ...tracker })),
    monthTrackerLogByDate: {},
    stickersByDate: {},
    streaks: { ...DEFAULT_STREAKS },
  };
}

export function loadAppState(): AppState {
  const defaultState = createDefaultAppState();

  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState> & { workDaysByMonth?: unknown };
    if (parsed.version !== 1) {
      return defaultState;
    }

    const restParsed: Partial<AppState> = { ...parsed };
    delete (restParsed as { workDaysByMonth?: unknown }).workDaysByMonth;

    const mergedState: AppState = {
      ...defaultState,
      ...restParsed,
      goals: {
        ...defaultState.goals,
        ...(restParsed.goals ?? {}),
      },
      streaks: {
        ...defaultState.streaks,
        ...(restParsed.streaks ?? {}),
      },
    };

    return {
      ...mergedState,
      streaks: recalculateStreaks(mergedState),
    };
  } catch {
    return defaultState;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors to keep UI responsive.
  }
}
