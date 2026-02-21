"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { formatDateKey } from "@/lib/dates";
import { getCompletedTrackersCount, getDayProgress } from "@/lib/dayProgress";
import { getStreakBadge, recalculateStreaks } from "@/lib/gamification";
import { loadAppState, saveAppState } from "@/lib/storage";
import { getStickerById, getStickerByTrackers } from "@/lib/stickers";
import type { AppState, Chore, DayMetrics } from "@/types/app.types";

const WEEKDAY_LABELS = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const MOTIVATION_PHRASES = {
  waterClosed: "Вода закрыта. Ты в отличном ритме.",
  sleepClosed: "Сон закрыт. Тело скажет спасибо.",
  dayClosed: "День закрыт. Забирай стикер и гордись собой.",
} as const;
const STREAK_BADGE_CLASSES: Record<ReturnType<typeof getStreakBadge>["id"], string> = {
  newbie: "border-rose-200 bg-rose-100 text-rose-900",
  rhythm: "border-pink-200 bg-pink-100 text-pink-900",
  stable: "border-amber-200 bg-amber-100 text-amber-900",
  fire: "border-orange-200 bg-orange-100 text-orange-900",
};

function parseNumericInput(rawValue: string): number | undefined {
  if (!rawValue.trim()) {
    return undefined;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return Math.round(parsed);
}

function createChoreId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `chore-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTodayChoreIds(chores: AppState["chores"], choreLogByDate: AppState["choreLogByDate"], date: Date, dateKey: string): string[] {
  const dayIndex = date.getDay();
  const completedToday = new Set(choreLogByDate[dateKey] ?? []);
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (normalized.getDay() + 6) % 7;
  normalized.setDate(normalized.getDate() - mondayOffset);
  const currentWeekStartKey = formatDateKey(normalized);

  return chores
    .filter((chore) => {
      if (!chore.isActive) {
        return false;
      }

      if (chore.schedule.type === "weekly") {
        const isScheduledWeek = !chore.startsOn || chore.startsOn === currentWeekStartKey;
        return (isScheduledWeek && chore.schedule.weekdays.includes(dayIndex)) || completedToday.has(chore.id);
      }

      return true;
    })
    .map((chore) => chore.id);
}

export function TodayScreen() {
  const [today] = useState(() => new Date());
  const todayKey = useMemo(() => formatDateKey(today), [today]);
  const [waterToAdd, setWaterToAdd] = useState("");
  const [sleepToAdd, setSleepToAdd] = useState("");
  const [stepsToAdd, setStepsToAdd] = useState("");
  const [todayChoreInput, setTodayChoreInput] = useState("");
  const [motivationText, setMotivationText] = useState<string | null>(null);

  const [appState, setAppState] = useState<AppState>(() => {
    const initial = loadAppState();
    const dayMetrics = initial.metricsByDate[todayKey] ?? {};
    const completedTrackers = getCompletedTrackersCount(dayMetrics, initial);
    const sticker = getStickerByTrackers(completedTrackers);

    if (initial.stickersByDate[todayKey] === sticker.id) {
      return initial;
    }

    return {
      ...initial,
      stickersByDate: {
        ...initial.stickersByDate,
        [todayKey]: sticker.id,
      },
    };
  });

  const weekdayLabel = WEEKDAY_LABELS[today.getDay()];

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const dayMetrics: DayMetrics = appState.metricsByDate[todayKey] ?? {};
  const completedChores = useMemo(() => appState.choreLogByDate[todayKey] ?? [], [appState.choreLogByDate, todayKey]);
  const dayProgress = getDayProgress(dayMetrics, appState);
  const waterGoalMl = Math.max(appState.goals.waterMl, 1);
  const waterCurrentMl = dayMetrics.waterMl ?? 0;
  const waterProgressPercent = Math.min((waterCurrentMl / waterGoalMl) * 100, 100);
  const sleepGoalHours = Math.max(appState.goals.sleepHours, 1);
  const sleepCurrentHours = dayMetrics.sleepHours ?? 0;
  const sleepProgressPercent = Math.min((sleepCurrentHours / sleepGoalHours) * 100, 100);
  const stepsGoal = Math.max(appState.goals.steps, 1);
  const stepsCurrent = dayMetrics.steps ?? 0;
  const stepsProgressPercent = Math.min((stepsCurrent / stepsGoal) * 100, 100);

  const todaySticker = appState.stickersByDate[todayKey];
  const stickerConfig = getStickerById(todaySticker);
  const choresForToday = useMemo(
    () => getTodayChoreIds(appState.chores, appState.choreLogByDate, today, todayKey),
    [appState.chores, appState.choreLogByDate, today, todayKey],
  );
  const choreById = useMemo(() => new Map(appState.chores.map((chore) => [chore.id, chore])), [appState.chores]);
  const completedChoresSet = useMemo(() => new Set(completedChores), [completedChores]);
  const completedChoresForTodayCount = useMemo(
    () => choresForToday.filter((id) => completedChoresSet.has(id)).length,
    [choresForToday, completedChoresSet],
  );
  const streakBadge = useMemo(() => getStreakBadge(appState.streaks.currentDays), [appState.streaks.currentDays]);

  const withTodayStickerByTrackers = (nextState: AppState): AppState => {
    const metrics = nextState.metricsByDate[todayKey] ?? {};
    const completedTrackers = getCompletedTrackersCount(metrics, nextState);
    const sticker = getStickerByTrackers(completedTrackers);

    if (nextState.stickersByDate[todayKey] === sticker.id) {
      return nextState;
    }

    return {
      ...nextState,
      stickersByDate: {
        ...nextState.stickersByDate,
        [todayKey]: sticker.id,
      },
    };
  };

  const updateTodayMetrics = (partial: Partial<DayMetrics>) => {
    let nextMotivationText: string | null = null;

    setAppState((prev) => {
      const previousMetrics = prev.metricsByDate[todayKey] ?? {};
      const previousProgress = getDayProgress(previousMetrics, prev);
      const nextMetricsByDate = {
        ...prev.metricsByDate,
        [todayKey]: {
          ...previousMetrics,
          ...partial,
        },
      };
      const nextStateWithMetrics = withTodayStickerByTrackers({
        ...prev,
        metricsByDate: nextMetricsByDate,
      });
      const nextMetrics = nextStateWithMetrics.metricsByDate[todayKey] ?? {};
      const nextProgress = getDayProgress(nextMetrics, nextStateWithMetrics);

      if (!previousProgress.waterClosed && nextProgress.waterClosed) {
        nextMotivationText = MOTIVATION_PHRASES.waterClosed;
      }
      if (!previousProgress.sleepClosed && nextProgress.sleepClosed) {
        nextMotivationText = MOTIVATION_PHRASES.sleepClosed;
      }
      if (!previousProgress.dayClosed && nextProgress.dayClosed) {
        nextMotivationText = MOTIVATION_PHRASES.dayClosed;
      }

      return {
        ...nextStateWithMetrics,
        streaks: recalculateStreaks(nextStateWithMetrics, today),
      };
    });

    if (nextMotivationText) {
      setMotivationText(nextMotivationText);
    }
  };

  const addWaterIntake = () => {
    const portion = parseNumericInput(waterToAdd);
    if (!portion || portion <= 0) {
      return;
    }

    const currentWater = dayMetrics.waterMl ?? 0;
    updateTodayMetrics({ waterMl: currentWater + portion });
    setWaterToAdd("");
  };

  const addSleepIntake = () => {
    const portion = parseNumericInput(sleepToAdd);
    if (!portion || portion <= 0) {
      return;
    }

    const currentSleep = dayMetrics.sleepHours ?? 0;
    updateTodayMetrics({ sleepHours: currentSleep + portion });
    setSleepToAdd("");
  };

  const addStepsIntake = () => {
    const portion = parseNumericInput(stepsToAdd);
    if (!portion || portion <= 0) {
      return;
    }

    const currentSteps = dayMetrics.steps ?? 0;
    updateTodayMetrics({ steps: currentSteps + portion });
    setStepsToAdd("");
  };

  const toggleChoreDone = (choreId: string) => {
    setAppState((prev) => {
      const done = new Set(prev.choreLogByDate[todayKey] ?? []);
      if (done.has(choreId)) {
        done.delete(choreId);
      } else {
        done.add(choreId);
      }

      return {
        ...prev,
        choreLogByDate: {
          ...prev.choreLogByDate,
          [todayKey]: Array.from(done),
        },
      };
    });
  };

  const addTodayChore = () => {
    const normalizedTitle = todayChoreInput.trim();
    if (!normalizedTitle) {
      return;
    }

    const nextChore: Chore = {
      id: createChoreId(),
      title: normalizedTitle,
      schedule: { type: "none" },
      isActive: true,
    };

    setAppState((prev) => ({
      ...prev,
      chores: [...prev.chores, nextChore],
    }));
    setTodayChoreInput("");
  };

  return (
    <Container className="space-y-5 pb-12">
      <Card className="paper-grid relative overflow-hidden border border-rose-200/80 bg-gradient-to-br from-rose-100/80 via-pink-50/90 to-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-rose-200/55 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-pink-200/40 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-rose-950 sm:text-[1.75rem]">Сегодня</h1>
            <p className="mt-1 text-sm font-medium text-rose-800/85">
              {weekdayLabel} · {todayKey}
            </p>
          </div>
          {stickerConfig ? (
            <div className="soft-float overflow-hidden rounded-2xl border border-rose-200/70 bg-white/85 shadow-sm">
              <Image src={stickerConfig.imageSrc} alt={stickerConfig.alt} width={64} height={64} className="h-[64px] w-[64px] object-cover" />
            </div>
          ) : null}
        </div>
      </Card>

      <div className="h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />

      <Card>
        <h2 className="text-lg font-semibold text-rose-950">Метрики дня</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5">
            <p className="text-sm font-medium text-rose-800">Вода за день: {dayMetrics.waterMl ?? 0} мл</p>
            <div className="mt-2 overflow-hidden rounded-full border border-rose-200/85 bg-white/75">
              <div className="h-3 w-full">
                <div
                  className="water-fill relative h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-rose-300 transition-[width] duration-500 ease-out"
                  style={{ width: `${waterProgressPercent}%` }}
                >
                  <div className="water-wave absolute inset-0 opacity-70" />
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-rose-700">
              Цель: {waterGoalMl} мл. Прогресс {Math.min(waterCurrentMl, waterGoalMl)} / {waterGoalMl}.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="number"
                min={0}
                placeholder="Сколько добавить"
                value={waterToAdd}
                onChange={(event) => setWaterToAdd(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addWaterIntake();
                  }
                }}
              />
              <Button className="h-11 min-w-28 px-4" onClick={addWaterIntake}>
                Добавить
              </Button>
            </div>
          </div>

          <label className="rounded-2xl border border-rose-200/80 bg-white/70 p-3.5">
            <span className="text-sm font-medium text-rose-800">Сон (часы)</span>
            <div className="mt-2 overflow-hidden rounded-full border border-zinc-300/80 bg-white/85">
              <div className="h-3 w-full">
                <div
                  className="sleep-fill relative h-full rounded-full bg-gradient-to-r from-zinc-700 via-zinc-900 to-black transition-[width] duration-500 ease-out"
                  style={{ width: `${sleepProgressPercent}%` }}
                >
                  <div className="sleep-stars absolute inset-0" />
                  <div className="sleep-stars sleep-stars-2 absolute inset-0" />
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-700/90">
              Цель: {sleepGoalHours} ч. Прогресс {Math.min(sleepCurrentHours, sleepGoalHours)} / {sleepGoalHours}.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="number"
                min={0}
                placeholder="Сколько добавить"
                value={sleepToAdd}
                onChange={(event) => setSleepToAdd(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSleepIntake();
                  }
                }}
              />
              <Button className="h-11 min-w-28 px-4" onClick={addSleepIntake}>
                Добавить
              </Button>
            </div>
          </label>

          <label className="rounded-2xl border border-rose-200/80 bg-white/70 p-3.5">
            <span className="text-sm font-medium text-rose-800">Шаги</span>
            <div className="mt-2 overflow-hidden rounded-full border border-amber-200/80 bg-white/85">
              <div className="h-3 w-full">
                <div
                  className="steps-fill relative h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 transition-[width] duration-500 ease-out"
                  style={{ width: `${stepsProgressPercent}%` }}
                >
                  <div className="steps-tracks absolute inset-0" />
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-amber-800/90">Цель: {stepsGoal}. Прогресс {Math.min(stepsCurrent, stepsGoal)} / {stepsGoal}.</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="number"
                min={0}
                placeholder="Сколько добавить"
                value={stepsToAdd}
                onChange={(event) => setStepsToAdd(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addStepsIntake();
                  }
                }}
              />
              <Button className="h-11 min-w-28 px-4" onClick={addStepsIntake}>
                Добавить
              </Button>
            </div>
          </label>

          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5">
            <p className="text-sm font-medium text-rose-800">Тренировка</p>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant={dayMetrics.workoutDone ? "primary" : "secondary"}
                className="w-full"
                onClick={() => updateTodayMetrics({ workoutDone: !dayMetrics.workoutDone })}
              >
                {dayMetrics.workoutDone ? "Сделано" : "Не отмечено"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />

      <Card>
        <h2 className="text-lg font-semibold text-rose-950">Стрики и бейдж</h2>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-rose-200/85 bg-white/80 px-3 py-2">
            <p className="text-xs text-rose-700">Текущий стрик</p>
            <p className="text-base font-semibold text-rose-950">{appState.streaks.currentDays} дн.</p>
          </div>
          <div className="rounded-2xl border border-rose-200/85 bg-white/80 px-3 py-2">
            <p className="text-xs text-rose-700">Лучший стрик</p>
            <p className="text-base font-semibold text-rose-950">{appState.streaks.bestDays} дн.</p>
          </div>
          <div className="rounded-2xl border border-rose-200/85 bg-white/80 px-3 py-2">
            <p className="text-xs text-rose-700">Бейдж уровня</p>
            <p className="mt-1">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STREAK_BADGE_CLASSES[streakBadge.id]}`}>
                {streakBadge.title}
              </span>
            </p>
          </div>
        </div>

        {motivationText ? (
          <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-100/80 px-3 py-2 text-sm font-medium text-rose-900">
            {motivationText}
          </p>
        ) : null}
      </Card>

      <div className="h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />

      <Card>
        <h2 className="text-lg font-semibold text-rose-950">Прогресс дня</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div
            className={`rounded-2xl px-3 py-2 font-medium ${
              dayProgress.waterClosed ? "sparkle-girl bg-rose-300/80 text-rose-950" : "bg-rose-50 text-rose-700"
            }`}
          >
            Вода
          </div>
          <div
            className={`rounded-2xl px-3 py-2 font-medium ${
              dayProgress.sleepClosed ? "sparkle-girl bg-rose-300/80 text-rose-950" : "bg-rose-50 text-rose-700"
            }`}
          >
            Сон
          </div>
          <div
            className={`rounded-2xl px-3 py-2 font-medium ${
              dayProgress.stepsClosed ? "sparkle-girl bg-rose-300/80 text-rose-950" : "bg-rose-50 text-rose-700"
            }`}
          >
            Шаги
          </div>
          <div
            className={`rounded-2xl px-3 py-2 font-medium ${
              dayProgress.workoutClosed ? "sparkle-girl bg-rose-300/80 text-rose-950" : "bg-rose-50 text-rose-700"
            }`}
          >
            Тренировка
          </div>
        </div>
        <p className="mt-3 text-sm text-rose-800">
          Закрыто разделов: <span className="font-semibold text-rose-950">{dayProgress.closedCount}/4</span>. Статус дня:{" "}
          <span className="font-semibold text-rose-950">{dayProgress.dayClosed ? "день закрыт" : "в процессе"}</span>.
        </p>
        {dayProgress.dayClosed ? (
          <p className="sparkle-girl-soft mt-2 rounded-2xl bg-rose-100/80 px-3 py-2 text-sm font-medium text-rose-900">
            {stickerConfig?.phrase ?? getStickerByTrackers(dayProgress.closedCount).phrase}
          </p>
        ) : (
          <p className="mt-2 text-sm text-rose-700">Чтобы закрыть день, нужно выполнить минимум 2 раздела.</p>
        )}
      </Card>

      <div className="h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-rose-950">Дела на сегодня</h2>
          <span className="rounded-full border border-rose-200 bg-rose-100/80 px-2.5 py-1 text-xs font-semibold text-rose-800">
            {completedChoresForTodayCount}/{choresForToday.length || 0}
          </span>
        </div>

        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            addTodayChore();
          }}
        >
          <Input placeholder="Новое дело на сегодня" value={todayChoreInput} onChange={(event) => setTodayChoreInput(event.target.value)} />
          <Button type="submit" className="h-11 min-w-28 px-4">
            Добавить
          </Button>
        </form>

        {choresForToday.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {choresForToday.map((choreId) => {
              const chore = choreById.get(choreId);
              if (!chore) {
                return null;
              }

              const done = completedChoresSet.has(chore.id);
              return (
                <li
                  key={chore.id}
                  className="rounded-2xl border border-rose-200/80 bg-white/75 px-3 py-2.5 shadow-[0_10px_20px_-16px_rgba(190,24,93,0.45)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${done ? "text-rose-500 line-through" : "text-rose-950"}`}>{chore.title}</p>
                    <Button variant={done ? "primary" : "secondary"} className="h-9 px-3" onClick={() => toggleChoreDone(chore.id)}>
                      {done ? "Сделано" : "Отметить"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-rose-700">
            На сегодня пока нет дел. Добавь задачи и weekly-расписание на экране «Дом».
          </p>
        )}
      </Card>
    </Container>
  );
}
