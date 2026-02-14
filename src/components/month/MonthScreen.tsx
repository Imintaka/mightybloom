"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { formatDateKey, formatMonthKey, getDateKeysOfMonth, getMonthStart } from "@/lib/dates";
import { loadAppState, saveAppState } from "@/lib/storage";
import { getStickerById, getStickerByTrackers } from "@/lib/stickers";
import type { AppState, DayMetrics } from "@/types/app.types";

const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function parseMetricValue(raw: string): number | undefined {
  if (!raw.trim()) {
    return undefined;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function shiftMonth(monthDate: Date, offset: number): Date {
  return new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1);
}

function createMonthGrid(monthDate: Date): Array<string | null> {
  const monthStart = getMonthStart(monthDate);
  const leadingEmpty = monthStart.getDay();
  const dateKeys = getDateKeysOfMonth(monthDate);
  const cells = [...Array<string | null>(leadingEmpty).fill(null), ...dateKeys];
  const trailingEmpty = (7 - (cells.length % 7)) % 7;

  return [...cells, ...Array<string | null>(trailingEmpty).fill(null)];
}

function getSleepState(metrics: DayMetrics | undefined): "none" | "low" | "medium" | "high" {
  const value = metrics?.sleepHours ?? 0;
  if (value >= 9) {
    return "high";
  }
  if (value >= 6 && value <= 8) {
    return "medium";
  }
  if (value >= 3 && value <= 5) {
    return "low";
  }

  return "none";
}

function getCompletedTrackersCount(metrics: DayMetrics, state: AppState): number {
  const waterDone = (metrics.waterMl ?? 0) >= state.goals.waterMl;
  const sleepDone = (metrics.sleepHours ?? 0) >= state.goals.sleepHours;
  const stepsDone = (metrics.steps ?? 0) >= state.goals.steps;
  const workoutDone = Boolean(metrics.workoutDone);

  return [waterDone, sleepDone, stepsDone, workoutDone].filter(Boolean).length;
}

function CircleDayNode({
  dateKey,
  day,
  index,
  total,
  selected,
  sleepState,
  stickerImageSrc,
  isWorkDay,
  onClick,
}: {
  dateKey: string;
  day: number;
  index: number;
  total: number;
  selected: boolean;
  sleepState: "none" | "low" | "medium" | "high";
  stickerImageSrc: string | null;
  isWorkDay: boolean;
  onClick: () => void;
}) {
  const angle = (360 / total) * index;
  const daySizeClass = total > 30 ? "h-9 w-9 text-[11px]" : "h-10 w-10 text-xs";
  const ringRadius = total > 30 ? 150 : 146;
  const sleepClass =
    sleepState === "high"
      ? "border-emerald-400 bg-emerald-200 text-emerald-900"
      : sleepState === "medium"
        ? "border-amber-400 bg-amber-200 text-amber-900"
        : sleepState === "low"
          ? "border-red-400 bg-red-200 text-red-900"
          : "border-rose-200 bg-white/90 text-rose-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute left-1/2 top-1/2 flex items-center justify-center rounded-2xl border font-semibold shadow-sm transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${daySizeClass} ${sleepClass} ${
        selected ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-rose-50" : ""
      }`}
      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${ringRadius}px) rotate(${-angle}deg)` }}
      aria-label={`День ${day}`}
      title={dateKey}
    >
      {day}
      {stickerImageSrc ? (
        <span className="absolute -right-1 -top-1 overflow-hidden rounded-full border border-rose-200 bg-white shadow-sm">
          <Image src={stickerImageSrc} alt="" width={14} height={14} className="h-3.5 w-3.5 object-cover" />
        </span>
      ) : null}
      {isWorkDay ? <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-blue-400" /> : null}
    </button>
  );
}

export function MonthScreen() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(new Date()));

  const monthKey = useMemo(() => formatMonthKey(monthDate), [monthDate]);
  const dateKeys = useMemo(() => getDateKeysOfMonth(monthDate), [monthDate]);
  const monthGrid = useMemo(() => createMonthGrid(monthDate), [monthDate]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(monthDate),
    [monthDate],
  );

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const selectedMetrics = appState.metricsByDate[selectedDateKey] ?? {};
  const workDays = appState.workDaysByMonth[monthKey] ?? [];
  const selectedIsWorkDay = workDays.includes(selectedDateKey);
  const selectedStickerId = appState.stickersByDate[selectedDateKey];
  const selectedSticker = getStickerById(selectedStickerId);

  const goToMonth = (offset: number) => {
    const nextMonthDate = shiftMonth(monthDate, offset);
    const nextDateKey = formatDateKey(new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 1));
    setMonthDate(nextMonthDate);
    setSelectedDateKey(nextDateKey);
  };

  const selectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
  };

  const updateSelectedMetrics = (partial: Partial<DayMetrics>) => {
    setAppState((prev) => {
      const nextMetrics = {
        ...(prev.metricsByDate[selectedDateKey] ?? {}),
        ...partial,
      };
      const completedTrackers = getCompletedTrackersCount(nextMetrics, prev);
      const sticker = getStickerByTrackers(completedTrackers);

      return {
        ...prev,
        metricsByDate: {
          ...prev.metricsByDate,
          [selectedDateKey]: nextMetrics,
        },
        stickersByDate: {
          ...prev.stickersByDate,
          [selectedDateKey]: sticker.id,
        },
      };
    });
  };

  const toggleWorkDayForSelected = () => {
    setAppState((prev) => {
      const monthWorkDays = new Set(prev.workDaysByMonth[monthKey] ?? []);
      if (monthWorkDays.has(selectedDateKey)) {
        monthWorkDays.delete(selectedDateKey);
      } else {
        monthWorkDays.add(selectedDateKey);
      }

      return {
        ...prev,
        workDaysByMonth: {
          ...prev.workDaysByMonth,
          [monthKey]: Array.from(monthWorkDays).sort(),
        },
      };
    });
  };

  return (
    <Container className="space-y-4 pb-10">
      <Card className="bg-gradient-to-br from-rose-100/90 via-pink-50/95 to-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-rose-900">Месяц</h1>
            <p className="mt-1 text-sm text-rose-800/80">Круговой трекер сна и редактирование дня</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="h-9 px-3" onClick={() => goToMonth(-1)}>
              Назад
            </Button>
            <Button variant="secondary" className="h-9 px-3" onClick={() => goToMonth(1)}>
              Вперед
            </Button>
          </div>
        </div>
        <p className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-sm font-medium capitalize text-rose-900">{monthLabel}</p>
      </Card>

      <Card>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold text-rose-900">Круговой трекер сна</h2>
          <p className="mt-1 text-center text-sm text-rose-700">
            Нажми на день, чтобы открыть редактирование. Цвет ячейки зависит от часов сна.
          </p>

          <div className="relative mt-6 h-[360px] w-[360px] rounded-full border-2 border-rose-200 bg-rose-50/60">
            <div className="absolute inset-[58px] rounded-full border border-rose-200 bg-white/90 p-4 text-center">
              <p className="mt-5 text-sm font-medium text-rose-700">Трекер сна</p>
              <p className="mt-2 text-xl font-semibold text-rose-900">{monthLabel}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-rose-800">
                <span className="rounded-full bg-red-200 px-2 py-1 text-red-900">сон 3-5 ч</span>
                <span className="rounded-full bg-amber-200 px-2 py-1 text-amber-900">сон 6-8 ч</span>
                <span className="rounded-full bg-emerald-200 px-2 py-1 text-emerald-900">сон 9+ ч</span>
                <span className="rounded-full bg-blue-100 px-2 py-1">рабочий день</span>
              </div>
            </div>

            {dateKeys.map((dateKey, index) => {
              const day = Number(dateKey.slice(-2));
              const metrics = appState.metricsByDate[dateKey];
              const sleepState = getSleepState(metrics);
              const sticker = getStickerById(appState.stickersByDate[dateKey]);
              const isWorkDay = workDays.includes(dateKey);

              return (
                <CircleDayNode
                  key={dateKey}
                  dateKey={dateKey}
                  day={day}
                  index={index}
                  total={dateKeys.length}
                  selected={selectedDateKey === dateKey}
                  sleepState={sleepState}
                  stickerImageSrc={sticker?.imageSrc ?? null}
                  isWorkDay={isWorkDay}
                  onClick={() => selectDate(dateKey)}
                />
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-rose-900">Резервный вид: сетка месяца</h2>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {WEEKDAY_SHORT.map((weekday) => (
            <p key={weekday} className="text-center text-xs font-semibold text-rose-700">
              {weekday}
            </p>
          ))}

          {monthGrid.map((dateKey, index) => {
            if (!dateKey) {
              return <div key={`empty-${index}`} className="h-14 rounded-xl bg-rose-50/40" />;
            }

            const metrics = appState.metricsByDate[dateKey];
            const sleepState = getSleepState(metrics);
            const isWorkDay = workDays.includes(dateKey);
            const day = Number(dateKey.slice(-2));
            const bg =
              sleepState === "high"
                ? "bg-emerald-200"
                : sleepState === "medium"
                  ? "bg-amber-200"
                  : sleepState === "low"
                    ? "bg-red-200"
                    : "bg-white/80";

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => selectDate(dateKey)}
                className={`h-14 rounded-xl border border-rose-200 p-1 text-left transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${bg} ${
                  selectedDateKey === dateKey ? "ring-2 ring-rose-500" : ""
                }`}
              >
                <p className="text-xs font-semibold text-rose-900">{day}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      sleepState === "high"
                        ? "bg-emerald-500"
                        : sleepState === "medium"
                          ? "bg-amber-500"
                          : sleepState === "low"
                            ? "bg-red-500"
                            : "bg-rose-200"
                    }`}
                  />
                  {isWorkDay ? <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> : null}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-rose-900">Редактирование дня: {selectedDateKey}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-rose-800">Сон (часы)</span>
            <Input
              type="number"
              min={0}
              step="0.5"
              value={selectedMetrics.sleepHours ?? ""}
              onChange={(event) => updateSelectedMetrics({ sleepHours: parseMetricValue(event.target.value) })}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-rose-800">Вода (мл)</span>
            <Input
              type="number"
              min={0}
              value={selectedMetrics.waterMl ?? ""}
              onChange={(event) => updateSelectedMetrics({ waterMl: parseMetricValue(event.target.value) })}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-rose-800">Шаги</span>
            <Input
              type="number"
              min={0}
              value={selectedMetrics.steps ?? ""}
              onChange={(event) => updateSelectedMetrics({ steps: parseMetricValue(event.target.value) })}
            />
          </label>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3">
            <p className="text-sm text-rose-800">Тренировка</p>
            <Button
              variant={selectedMetrics.workoutDone ? "primary" : "secondary"}
              className="mt-2 w-full"
              onClick={() => updateSelectedMetrics({ workoutDone: !selectedMetrics.workoutDone })}
            >
              {selectedMetrics.workoutDone ? "Done" : "Not done"}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant={selectedIsWorkDay ? "primary" : "secondary"} onClick={toggleWorkDayForSelected}>
            {selectedIsWorkDay ? "Рабочий день отмечен" : "Отметить как рабочий день"}
          </Button>
          <span className="flex items-center gap-2 rounded-2xl bg-rose-100 px-3 py-2 text-sm text-rose-800">
            {selectedSticker ? (
              <Image src={selectedSticker.imageSrc} alt={selectedSticker.alt} width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
            ) : (
              "нет"
            )}
          </span>
        </div>
      </Card>
    </Container>
  );
}
