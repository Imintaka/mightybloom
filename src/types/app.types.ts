export type DayMetrics = {
  waterMl?: number;
  steps?: number;
  sleepHours?: number;
  workoutDone?: boolean;
};

export type Chore = {
  id: string;
  title: string;
  schedule: { type: "weekly"; weekdays: number[] } | { type: "none" };
  isActive: boolean;
};

export type FoodItem = {
  id: string;
  title: string;
  kcalPerServing: number;
  color: string;
};

export type FoodLogByDate = Record<string, string[]>;

export type StickersByDate = Record<string, string>;

export type WorkoutType = "gym" | "fullBody" | "legs" | "cardio" | "rest";

export type WorkoutLogByDate = Record<string, WorkoutType>;

export type MonthTrackerColor = "green" | "mint" | "sky" | "amber" | "rose";

export type MonthTracker = {
  id: string;
  title: string;
  color: MonthTrackerColor;
};

export type MonthTrackerLogByDate = Record<string, string[]>;

export type AppState = {
  version: 1;
  goals: {
    waterMl: number;
    steps: number;
    sleepHours: number;
  };
  metricsByDate: Record<string, DayMetrics>;
  foodItems: FoodItem[];
  foodLogByDate: FoodLogByDate;
  chores: Chore[];
  choreLogByDate: Record<string, string[]>;
  workoutLogByDate: WorkoutLogByDate;
  monthTrackers: MonthTracker[];
  monthTrackerLogByDate: MonthTrackerLogByDate;
  stickersByDate: StickersByDate;
  streaks: {
    currentDays: number;
    bestDays: number;
  };
};
