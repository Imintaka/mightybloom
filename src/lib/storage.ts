import type { AppState } from "@/types/app.types";

export const STORAGE_KEY = "notepad-app-state-v1";

export function createDefaultAppState(): AppState {
  return {
    version: 1,
    goals: {
      waterMl: 2000,
      steps: 10000,
      sleepHours: 7,
    },
    metricsByDate: {},
    foodItems: [],
    foodLogByDate: {},
    chores: [],
    choreLogByDate: {},
    workoutLogByDate: {},
    workDaysByMonth: {},
    stickersByDate: {},
    streaks: {
      currentDays: 0,
      bestDays: 0,
    },
  };
}

export function loadAppState(): AppState {
  if (typeof window === "undefined") {
    return createDefaultAppState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultAppState();
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== 1) {
      return createDefaultAppState();
    }

    return {
      ...createDefaultAppState(),
      ...parsed,
      goals: {
        ...createDefaultAppState().goals,
        ...(parsed.goals ?? {}),
      },
      streaks: {
        ...createDefaultAppState().streaks,
        ...(parsed.streaks ?? {}),
      },
    };
  } catch {
    return createDefaultAppState();
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
