"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatDateKey } from "@/lib/dates";
import { loadAppState, saveAppState } from "@/lib/storage";
import { getStickerById, getStickerByTrackers } from "@/lib/stickers";
import type { AppState, DayMetrics } from "@/types/app.types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";

const WEEKDAY_LABELS = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

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

function getTodayChoreIds(state: AppState, date: Date, dateKey: string): string[] {
  const dayIndex = date.getDay();
  const completedToday = new Set(state.choreLogByDate[dateKey] ?? []);

  return state.chores
    .filter((chore) => {
      if (!chore.isActive) {
        return false;
      }

      if (chore.schedule.type === "weekly") {
        return chore.schedule.weekdays.includes(dayIndex) || completedToday.has(chore.id);
      }

      return completedToday.has(chore.id);
    })
    .map((chore) => chore.id);
}

function getCompletedTrackersCount(metrics: DayMetrics, state: AppState): number {
  const waterDone = (metrics.waterMl ?? 0) >= state.goals.waterMl;
  const sleepDone = (metrics.sleepHours ?? 0) >= state.goals.sleepHours;
  const stepsDone = (metrics.steps ?? 0) >= state.goals.steps;
  const workoutDone = Boolean(metrics.workoutDone);

  return [waterDone, sleepDone, stepsDone, workoutDone].filter(Boolean).length;
}

export function TodayScreen() {
  const [today] = useState(() => new Date());
  const todayKey = useMemo(() => formatDateKey(today), [today]);

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
  const completedChores = appState.choreLogByDate[todayKey] ?? [];

  const waterClosed = (dayMetrics.waterMl ?? 0) >= appState.goals.waterMl;
  const sleepClosed = (dayMetrics.sleepHours ?? 0) >= appState.goals.sleepHours;
  const stepsClosed = (dayMetrics.steps ?? 0) >= appState.goals.steps;
  const workoutClosed = Boolean(dayMetrics.workoutDone);
  const coreClosedCount = [waterClosed, sleepClosed, stepsClosed].filter(Boolean).length;
  const closedCount = [waterClosed, sleepClosed, stepsClosed, workoutClosed].filter(Boolean).length;
  const dayClosed = coreClosedCount >= 2;

  const todaySticker = appState.stickersByDate[todayKey];

  const stickerConfig = getStickerById(todaySticker);
  const choresForToday = getTodayChoreIds(appState, today, todayKey);

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
    setAppState((prev) =>
      withTodayStickerByTrackers({
        ...prev,
        metricsByDate: {
          ...prev.metricsByDate,
          [todayKey]: {
            ...(prev.metricsByDate[todayKey] ?? {}),
            ...partial,
          },
        },
      }),
    );
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

  return (
    <Container className="space-y-4 pb-10">
      <Card className="bg-gradient-to-br from-rose-100/90 via-pink-50/90 to-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-rose-900">Сегодня</h1>
            <p className="mt-1 text-sm text-rose-800/80">
              {weekdayLabel} · {todayKey}
            </p>
          </div>
          {stickerConfig ? (
            <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white/80">
              <Image src={stickerConfig.imageSrc} alt={stickerConfig.alt} width={48} height={48} className="h-12 w-12 object-cover" />
            </div>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-rose-900">Метрики дня</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-rose-800">Вода (мл)</span>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={dayMetrics.waterMl ?? ""}
              onChange={(event) => updateTodayMetrics({ waterMl: parseNumericInput(event.target.value) })}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-rose-800">Сон (часы)</span>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={dayMetrics.sleepHours ?? ""}
              onChange={(event) => updateTodayMetrics({ sleepHours: parseNumericInput(event.target.value) })}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-rose-800">Шаги</span>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={dayMetrics.steps ?? ""}
              onChange={(event) => updateTodayMetrics({ steps: parseNumericInput(event.target.value) })}
            />
          </label>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3">
            <p className="text-sm text-rose-800">Тренировка</p>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant={dayMetrics.workoutDone ? "primary" : "secondary"}
                className="w-full"
                onClick={() => updateTodayMetrics({ workoutDone: !dayMetrics.workoutDone })}
              >
                {dayMetrics.workoutDone ? "Done" : "Not done"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-rose-900">Прогресс дня</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className={`rounded-2xl px-3 py-2 ${waterClosed ? "bg-rose-200 text-rose-900" : "bg-rose-50 text-rose-700"}`}>
            Вода
          </div>
          <div className={`rounded-2xl px-3 py-2 ${sleepClosed ? "bg-rose-200 text-rose-900" : "bg-rose-50 text-rose-700"}`}>
            Сон
          </div>
          <div className={`rounded-2xl px-3 py-2 ${stepsClosed ? "bg-rose-200 text-rose-900" : "bg-rose-50 text-rose-700"}`}>
            Шаги
          </div>
          <div className={`rounded-2xl px-3 py-2 ${workoutClosed ? "bg-rose-200 text-rose-900" : "bg-rose-50 text-rose-700"}`}>
            Тренировка
          </div>
        </div>
        <p className="mt-3 text-sm text-rose-800">
          Закрыто разделов: <span className="font-semibold text-rose-900">{closedCount}/4</span>. Статус дня:{" "}
          <span className="font-semibold text-rose-900">{dayClosed ? "день закрыт" : "в процессе"}</span>.
        </p>
        {dayClosed ? (
          <p className="mt-2 rounded-2xl bg-rose-100 px-3 py-2 text-sm text-rose-900">
            {stickerConfig?.phrase ?? getStickerByTrackers(closedCount).phrase}
          </p>
        ) : (
          <p className="mt-2 text-sm text-rose-700">Чтобы закрыть день, нужно выполнить минимум 2 из 3: вода, сон, шаги.</p>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-rose-900">Дела на сегодня</h2>
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-800">
            {completedChores.filter((id) => choresForToday.includes(id)).length}/{choresForToday.length || 0}
          </span>
        </div>

        {choresForToday.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {choresForToday.map((choreId) => {
              const chore = appState.chores.find((item) => item.id === choreId);
              if (!chore) {
                return null;
              }

              const done = completedChores.includes(chore.id);
              return (
                <li
                  key={chore.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-rose-200 bg-white/70 px-3 py-2"
                >
                  <p className={`text-sm ${done ? "text-rose-500 line-through" : "text-rose-900"}`}>{chore.title}</p>
                  <Button variant={done ? "primary" : "secondary"} className="h-9 px-3" onClick={() => toggleChoreDone(chore.id)}>
                    {done ? "Сделано" : "Отметить"}
                  </Button>
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
