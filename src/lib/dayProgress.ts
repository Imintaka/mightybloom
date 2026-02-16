import type { AppState, DayMetrics } from "@/types/app.types";

export type DayProgress = {
  waterClosed: boolean;
  sleepClosed: boolean;
  stepsClosed: boolean;
  workoutClosed: boolean;
  coreClosedCount: number;
  closedCount: number;
  dayClosed: boolean;
};

export function getCompletedTrackersCount(metrics: DayMetrics, state: AppState): number {
  const waterClosed = (metrics.waterMl ?? 0) >= state.goals.waterMl;
  const sleepClosed = (metrics.sleepHours ?? 0) >= state.goals.sleepHours;
  const stepsClosed = (metrics.steps ?? 0) >= state.goals.steps;
  const workoutClosed = Boolean(metrics.workoutDone);

  return [waterClosed, sleepClosed, stepsClosed, workoutClosed].filter(Boolean).length;
}

export function getDayProgress(metrics: DayMetrics, state: AppState): DayProgress {
  const waterClosed = (metrics.waterMl ?? 0) >= state.goals.waterMl;
  const sleepClosed = (metrics.sleepHours ?? 0) >= state.goals.sleepHours;
  const stepsClosed = (metrics.steps ?? 0) >= state.goals.steps;
  const workoutClosed = Boolean(metrics.workoutDone);
  const coreClosedCount = [waterClosed, sleepClosed, stepsClosed].filter(Boolean).length;
  const closedCount = [waterClosed, sleepClosed, stepsClosed, workoutClosed].filter(Boolean).length;

  return {
    waterClosed,
    sleepClosed,
    stepsClosed,
    workoutClosed,
    coreClosedCount,
    closedCount,
    dayClosed: coreClosedCount >= 2,
  };
}
