"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { formatDateKey } from "@/lib/dates";
import { loadAppState, saveAppState } from "@/lib/storage";
import type { AppState, Chore } from "@/types/app.types";

const WEEKDAY_SHORT_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const WEEKDAY_LONG_LABELS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];
const WEEKDAY_TO_JS_DAY = [1, 2, 3, 4, 5, 6, 0];

type WeekDate = {
  key: string;
  dayOfMonth: number;
  jsDayIndex: number;
};

function createChoreId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `chore-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getWeekDates(referenceDate: Date): WeekDate[] {
  const normalized = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const mondayOffset = (normalized.getDay() + 6) % 7;
  normalized.setDate(normalized.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, dayOffset) => {
    const date = new Date(normalized);
    date.setDate(normalized.getDate() + dayOffset);

    return {
      key: formatDateKey(date),
      dayOfMonth: date.getDate(),
      jsDayIndex: WEEKDAY_TO_JS_DAY[dayOffset],
    };
  });
}

function toSchedule(weekdays: number[]): Chore["schedule"] {
  if (weekdays.length === 0) {
    return { type: "none" };
  }

  const uniqueSorted = Array.from(new Set(weekdays)).sort((left, right) => left - right);
  return { type: "weekly", weekdays: uniqueSorted };
}

function removeChoreFromLog(choreLogByDate: AppState["choreLogByDate"], choreId: string): AppState["choreLogByDate"] {
  const nextEntries = Object.entries(choreLogByDate).map(([dateKey, choreIds]) => [
    dateKey,
    choreIds.filter((id) => id !== choreId),
  ] as const);

  return Object.fromEntries(nextEntries);
}

function getScheduleText(schedule: Chore["schedule"]): string {
  if (schedule.type === "none") {
    return "Без расписания";
  }

  return schedule.weekdays
    .map((weekday) => {
      const mondayIndex = WEEKDAY_TO_JS_DAY.indexOf(weekday);
      return WEEKDAY_LONG_LABELS[mondayIndex];
    })
    .join(", ");
}

export function HomeChoresScreen() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));

  const [titleInput, setTitleInput] = useState("");
  const [scheduleDaysInput, setScheduleDaysInput] = useState<number[]>([]);
  const [editingChoreId, setEditingChoreId] = useState<string | null>(null);

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const chores = appState.chores;

  const selectedDateObj = useMemo(() => {
    const parsed = new Date(`${selectedDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
  }, [selectedDate]);

  const weekDates = useMemo(() => getWeekDates(selectedDateObj), [selectedDateObj]);

  const completedChoreSetByDate = useMemo(
    () => new Map(Object.entries(appState.choreLogByDate).map(([dateKey, choreIds]) => [dateKey, new Set(choreIds)])),
    [appState.choreLogByDate],
  );

  const doneCountForSelectedDay = useMemo(() => {
    const doneSet = completedChoreSetByDate.get(selectedDate) ?? new Set<string>();
    return chores.filter((chore) => doneSet.has(chore.id)).length;
  }, [chores, completedChoreSetByDate, selectedDate]);

  const resetForm = () => {
    setTitleInput("");
    setScheduleDaysInput([]);
    setEditingChoreId(null);
  };

  const toggleScheduleDayInput = (weekday: number) => {
    setScheduleDaysInput((prev) =>
      prev.includes(weekday) ? prev.filter((day) => day !== weekday) : [...prev, weekday],
    );
  };

  const submitChore = () => {
    const normalizedTitle = titleInput.trim();
    if (!normalizedTitle) {
      return;
    }

    const nextSchedule = toSchedule(scheduleDaysInput);

    if (editingChoreId) {
      setAppState((prev) => ({
        ...prev,
        chores: prev.chores.map((chore) =>
          chore.id === editingChoreId
            ? {
                ...chore,
                title: normalizedTitle,
                schedule: nextSchedule,
              }
            : chore,
        ),
      }));
      resetForm();
      return;
    }

    const nextChore: Chore = {
      id: createChoreId(),
      title: normalizedTitle,
      schedule: nextSchedule,
      isActive: true,
    };

    setAppState((prev) => ({
      ...prev,
      chores: [...prev.chores, nextChore],
    }));
    resetForm();
  };

  const startEditChore = (chore: Chore) => {
    setEditingChoreId(chore.id);
    setTitleInput(chore.title);
    setScheduleDaysInput(chore.schedule.type === "weekly" ? chore.schedule.weekdays : []);
  };

  const deleteChore = (choreId: string) => {
    setAppState((prev) => ({
      ...prev,
      chores: prev.chores.filter((chore) => chore.id !== choreId),
      choreLogByDate: removeChoreFromLog(prev.choreLogByDate, choreId),
    }));

    if (editingChoreId === choreId) {
      resetForm();
    }
  };

  const toggleChoreMark = (dateKey: string, choreId: string) => {
    setAppState((prev) => {
      const current = new Set(prev.choreLogByDate[dateKey] ?? []);

      if (current.has(choreId)) {
        current.delete(choreId);
      } else {
        current.add(choreId);
      }

      return {
        ...prev,
        choreLogByDate: {
          ...prev.choreLogByDate,
          [dateKey]: Array.from(current),
        },
      };
    });
  };

  return (
    <Container className="space-y-4 pb-10">
      <Card className="bg-gradient-to-br from-rose-100/90 via-pink-50/90 to-white">
        <h1 className="text-2xl font-semibold text-rose-900">Дом</h1>
        <p className="mt-2 text-sm text-rose-800/80">
          Всё управление задачами в одной форме: дата недели, создание и редактирование расписания.
        </p>
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <label className="space-y-1">
            <span className="text-sm text-rose-800">Дата недели</span>
            <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-rose-800">Задача</span>
            <Input
              placeholder="Название задачи"
              value={titleInput}
              onChange={(event) => setTitleInput(event.target.value)}
            />
          </label>

          <Button onClick={submitChore} className="sm:min-w-32">
            {editingChoreId ? "Сохранить" : "Добавить"}
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          <p className="text-sm text-rose-700">Дни недели для задачи</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_SHORT_LABELS.map((label, index) => {
              const jsDay = WEEKDAY_TO_JS_DAY[index];
              const selected = scheduleDaysInput.includes(jsDay);

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleScheduleDayInput(jsDay)}
                  className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                    selected
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-rose-700">
          <span>
            Выполнено за выбранный день: <span className="font-semibold text-rose-900">{doneCountForSelectedDay}</span>
          </span>
          <span>из</span>
          <span className="font-semibold text-rose-900">{chores.length}</span>
        </div>

        {editingChoreId ? (
          <Button variant="secondary" className="mt-3" onClick={resetForm}>
            Отменить редактирование
          </Button>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-rose-900">Weekly-матрица выполнения</h2>
        <p className="mt-1 text-sm text-rose-700">Редактирование и удаление задач находятся в первой колонке таблицы.</p>

        {chores.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[760px] w-full border-separate border-spacing-2 text-sm">
              <thead>
                <tr>
                  <th className="rounded-2xl bg-rose-100 px-3 py-2 text-left font-semibold text-rose-900">Задача</th>
                  {weekDates.map((day, index) => {
                    const isSelected = day.key === selectedDate;
                    return (
                      <th
                        key={day.key}
                        className={`rounded-2xl px-3 py-2 text-center font-semibold ${
                          isSelected ? "bg-rose-300 text-rose-900" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        <button type="button" onClick={() => setSelectedDate(day.key)} className="w-full cursor-pointer">
                          <span className="block">{WEEKDAY_SHORT_LABELS[index]}</span>
                          <span className="block text-xs font-normal">{day.dayOfMonth}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {chores.map((chore) => (
                  <tr key={chore.id}>
                    <td className="rounded-2xl border border-rose-200 bg-white/80 px-3 py-2 text-rose-900 align-top">
                      <p className="truncate font-medium">{chore.title}</p>
                      <p className="mt-1 text-xs text-rose-600">{getScheduleText(chore.schedule)}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <Button variant="secondary" className="h-8 px-2 text-xs" onClick={() => startEditChore(chore)}>
                          Ред.
                        </Button>
                        <Button variant="secondary" className="h-8 px-2 text-xs" onClick={() => deleteChore(chore.id)}>
                          Удалить
                        </Button>
                      </div>
                    </td>

                    {weekDates.map((day) => {
                      const marked = completedChoreSetByDate.get(day.key)?.has(chore.id) ?? false;
                      const isSelected = day.key === selectedDate;
                      const plannedBySchedule =
                        chore.schedule.type === "weekly" && chore.schedule.weekdays.includes(day.jsDayIndex);

                      return (
                        <td key={`${chore.id}-${day.key}`} className="rounded-2xl border border-rose-200 bg-white/80 px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggleChoreMark(day.key, chore.id)}
                            className={`h-9 w-9 rounded-xl border text-sm font-semibold transition-colors ${
                              marked
                                ? "border-rose-500 bg-rose-500 text-white"
                                : plannedBySchedule
                                  ? "border-rose-300 bg-rose-100 text-rose-800"
                                  : isSelected
                                    ? "border-rose-300 bg-rose-50 text-rose-700"
                                    : "border-rose-200 bg-white text-rose-500"
                            }`}
                            aria-label={`${chore.title}: ${day.key}`}
                          >
                            {marked ? "✓" : plannedBySchedule ? "○" : "·"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-rose-700">Матрица появится после добавления первой задачи.</p>
        )}
      </Card>
    </Container>
  );
}
