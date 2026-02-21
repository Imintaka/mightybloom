"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { formatDateKey } from "@/lib/dates";
import { loadAppState, saveAppState } from "@/lib/storage";
import type { AppState, WorkoutType } from "@/types/app.types";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const WORKOUT_TYPES: Array<{
  value: WorkoutType;
  label: string;
}> = [
  { value: "gym", label: "Зал" },
  { value: "fullBody", label: "Всё тело" },
  { value: "legs", label: "Ноги" },
  { value: "cardio", label: "Кардио" },
  { value: "rest", label: "Отдых" },
];

type WeekDate = {
  key: string;
  dayOfMonth: number;
};

function getWeekDates(referenceDate: Date): WeekDate[] {
  const normalized = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const mondayOffset = (normalized.getDay() + 6) % 7;
  normalized.setDate(normalized.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, dayOffset) => {
    const weekDate = new Date(normalized);
    weekDate.setDate(normalized.getDate() + dayOffset);

    return {
      key: formatDateKey(weekDate),
      dayOfMonth: weekDate.getDate(),
    };
  });
}

function shiftDateKeyByDays(dateKey: string, days: number): string {
  const parsed = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return formatDateKey(new Date());
  }

  parsed.setDate(parsed.getDate() + days);
  return formatDateKey(parsed);
}

function getWorkoutLabelByType(type: WorkoutType | undefined): string {
  if (!type) {
    return "Не выбрано";
  }

  return WORKOUT_TYPES.find((item) => item.value === type)?.label ?? "Не выбрано";
}

export function WorkoutsScreen() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const selectedDateObj = useMemo(() => {
    const parsed = new Date(`${selectedDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
  }, [selectedDate]);

  const weekDates = useMemo(() => getWeekDates(selectedDateObj), [selectedDateObj]);
  const selectedWorkoutType = appState.workoutLogByDate[selectedDate];

  const weeklyCountByType = useMemo(() => {
    const weekKeys = new Set(weekDates.map((day) => day.key));
    const counts: Record<WorkoutType, number> = {
      gym: 0,
      fullBody: 0,
      legs: 0,
      cardio: 0,
      rest: 0,
    };

    for (const [dateKey, type] of Object.entries(appState.workoutLogByDate)) {
      if (!weekKeys.has(dateKey)) {
        continue;
      }

      counts[type] += 1;
    }

    return counts;
  }, [appState.workoutLogByDate, weekDates]);

  const toggleWorkoutMark = (dateKey: string, workoutType: WorkoutType) => {
    setAppState((prev) => {
      const currentType = prev.workoutLogByDate[dateKey];
      const nextWorkoutLog = { ...prev.workoutLogByDate };

      if (currentType === workoutType) {
        delete nextWorkoutLog[dateKey];
      } else {
        nextWorkoutLog[dateKey] = workoutType;
      }

      return {
        ...prev,
        workoutLogByDate: nextWorkoutLog,
      };
    });
  };

  const clearSelectedDay = () => {
    setAppState((prev) => {
      const nextWorkoutLog = { ...prev.workoutLogByDate };
      delete nextWorkoutLog[selectedDate];

      return {
        ...prev,
        workoutLogByDate: nextWorkoutLog,
      };
    });
  };

  return (
    <Container className="space-y-5 pb-12">
      <Card className="paper-grid relative overflow-hidden bg-gradient-to-br from-rose-100/80 via-pink-50/90 to-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-rose-200/60 blur-2xl" />
        <h1 className="text-2xl font-bold tracking-tight text-rose-950 sm:text-[1.75rem]">Тренировки</h1>
        <p className="mt-2 text-sm font-medium text-rose-800/85">
          Недельная таблица: по дням отмечай, какую тренировку сделала.
        </p>
      </Card>

      <div className="h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-rose-950">Матрица недели</h2>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="h-10 px-3 text-sm" onClick={() => setSelectedDate((prev) => shiftDateKeyByDays(prev, -7))}>
              Пред.
            </Button>
            <Button variant="secondary" className="h-10 px-3 text-sm" onClick={() => setSelectedDate(formatDateKey(new Date()))}>
              Текущая
            </Button>
            <Button variant="secondary" className="h-10 px-3 text-sm" onClick={() => setSelectedDate((prev) => shiftDateKeyByDays(prev, 7))}>
              След.
            </Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-[220px_auto]">
          <label className="space-y-1">
            <span className="text-sm text-rose-800">Дата недели</span>
            <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>
          <div className="rounded-2xl border border-rose-200/85 bg-rose-50/65 p-3">
            <p className="text-sm text-rose-800">
              Выбранный день: <span className="font-semibold text-rose-950">{selectedDate}</span>
            </p>
            <p className="mt-1 text-sm text-rose-800">
              Отмечено:{" "}
              <span className="font-semibold text-rose-950">{getWorkoutLabelByType(selectedWorkoutType)}</span>
            </p>
            <Button
              variant="secondary"
              className="mt-2 h-10 px-3 text-sm"
              onClick={clearSelectedDay}
              disabled={!selectedWorkoutType}
            >
              Снять отметку дня
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-rose-100/85 bg-rose-50/35 p-2">
          <table className="min-w-[760px] w-full border-separate border-spacing-2 text-sm">
            <thead>
              <tr>
                <th className="rounded-2xl border border-rose-200/80 bg-rose-100/80 px-3 py-2 text-left font-semibold text-rose-900">
                  Тип тренировки
                </th>
                {weekDates.map((day, index) => {
                  const isSelected = day.key === selectedDate;

                  return (
                    <th
                      key={day.key}
                      className={`rounded-2xl border border-rose-200/80 px-3 py-2 text-center font-semibold ${
                        isSelected ? "bg-rose-300/90 text-rose-950" : "bg-rose-100/80 text-rose-800"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedDate(day.key)}
                        className="w-full rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
                      >
                        <span className="block">{WEEKDAY_LABELS[index]}</span>
                        <span className="block text-xs font-normal">{day.dayOfMonth}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {WORKOUT_TYPES.map((workoutType) => (
                <tr key={workoutType.value}>
                  <td className="rounded-2xl border border-rose-200/85 bg-white/82 px-3 py-2 text-rose-900">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{workoutType.label}</span>
                      <span className="text-xs text-rose-700">{weeklyCountByType[workoutType.value]} раз/нед</span>
                    </div>
                  </td>
                  {weekDates.map((day) => {
                    const isMarked = appState.workoutLogByDate[day.key] === workoutType.value;
                    const isSelected = day.key === selectedDate;

                    return (
                      <td key={`${workoutType.value}-${day.key}`} className="rounded-2xl border border-rose-200/85 bg-white/82 px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleWorkoutMark(day.key, workoutType.value)}
                          className={`h-10 w-10 rounded-xl border text-sm font-semibold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50 ${
                            isMarked
                              ? "border-rose-500 bg-rose-500 text-white"
                              : isSelected
                                ? "border-rose-300 bg-rose-100 text-rose-800"
                                : "border-rose-200 bg-white text-rose-500"
                          }`}
                          aria-label={`${workoutType.label}: ${day.key}`}
                        >
                          {isMarked ? "✓" : "·"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
}
