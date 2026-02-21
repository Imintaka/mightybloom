"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { formatDateKey } from "@/lib/dates";
import { loadAppState, saveAppState } from "@/lib/storage";
import type { AppState, FoodItem } from "@/types/app.types";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DEFAULT_COLOR = "#f9a8d4";

type WeekDate = {
  key: string;
  dayOfMonth: number;
};

function createFoodId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `food-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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

function removeFoodFromLog(foodLogByDate: AppState["foodLogByDate"], foodId: string): AppState["foodLogByDate"] {
  const cleanedEntries = Object.entries(foodLogByDate).map(([dateKey, foodIds]) => [
    dateKey,
    foodIds.filter((id) => id !== foodId),
  ] as const);

  return Object.fromEntries(cleanedEntries);
}

export function NutritionScreen() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));

  const [titleInput, setTitleInput] = useState("");
  const [colorInput, setColorInput] = useState(DEFAULT_COLOR);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

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

  const selectedFoodSetByDate = useMemo(
    () => new Map(Object.entries(appState.foodLogByDate).map(([dateKey, foodIds]) => [dateKey, new Set(foodIds)])),
    [appState.foodLogByDate],
  );

  const weeklyCountByFoodId = useMemo(() => {
    const weekKeys = new Set(weekDates.map((day) => day.key));
    const counts = new Map<string, number>();

    for (const [dateKey, foodIds] of Object.entries(appState.foodLogByDate)) {
      if (!weekKeys.has(dateKey)) {
        continue;
      }

      for (const foodId of foodIds) {
        counts.set(foodId, (counts.get(foodId) ?? 0) + 1);
      }
    }

    return counts;
  }, [appState.foodLogByDate, weekDates]);

  const resetForm = () => {
    setTitleInput("");
    setColorInput(DEFAULT_COLOR);
    setEditingFoodId(null);
  };

  const submitFoodItem = () => {
    const normalizedTitle = titleInput.trim();

    if (!normalizedTitle) {
      return;
    }

    if (editingFoodId) {
      setAppState((prev) => ({
        ...prev,
        foodItems: prev.foodItems.map((item) =>
          item.id === editingFoodId ? { ...item, title: normalizedTitle, color: colorInput } : item,
        ),
      }));
      resetForm();
      return;
    }

    const nextFoodItem: FoodItem = {
      id: createFoodId(),
      title: normalizedTitle,
      kcalPerServing: 0,
      color: colorInput,
    };

    setAppState((prev) => ({
      ...prev,
      foodItems: [...prev.foodItems, nextFoodItem],
    }));
    resetForm();
  };

  const startEditFoodItem = (foodItem: FoodItem) => {
    setEditingFoodId(foodItem.id);
    setTitleInput(foodItem.title);
    setColorInput(foodItem.color);
  };

  const deleteFoodItem = (foodId: string) => {
    setAppState((prev) => ({
      ...prev,
      foodItems: prev.foodItems.filter((item) => item.id !== foodId),
      foodLogByDate: removeFoodFromLog(prev.foodLogByDate, foodId),
    }));

    if (editingFoodId === foodId) {
      resetForm();
    }
  };

  const toggleFoodMark = (dateKey: string, foodId: string) => {
    setAppState((prev) => {
      const currentFoodIds = prev.foodLogByDate[dateKey] ?? [];
      const currentSet = new Set(currentFoodIds);

      if (currentSet.has(foodId)) {
        currentSet.delete(foodId);
      } else {
        currentSet.add(foodId);
      }

      return {
        ...prev,
        foodLogByDate: {
          ...prev.foodLogByDate,
          [dateKey]: Array.from(currentSet),
        },
      };
    });
  };

  return (
    <Container className="space-y-5 pb-12">
      <Card className="paper-grid relative overflow-hidden bg-gradient-to-br from-rose-100/80 via-pink-50/90 to-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-pink-200/60 blur-2xl" />
        <h1 className="text-2xl font-bold tracking-tight text-rose-950 sm:text-[1.75rem]">Питание</h1>
        <p className="mt-2 text-sm font-medium text-rose-800/85">
          Добавляй еду, отмечай по дням недели и следи, сколько раз за неделю ты ее ела.
        </p>
      </Card>

      <div className="h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-rose-950">Матрица недели</h2>
          <Input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="max-w-44"
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_70px_auto]">
          <Input placeholder="Название еды" value={titleInput} onChange={(event) => setTitleInput(event.target.value)} />
          <Input
            type="color"
            value={colorInput}
            onChange={(event) => setColorInput(event.target.value)}
            className="h-10 cursor-pointer p-1"
            aria-label="Цвет еды"
          />
          <Button onClick={submitFoodItem}>{editingFoodId ? "Сохранить" : "Добавить"}</Button>
        </div>
        {editingFoodId ? (
          <Button variant="secondary" className="mt-2" onClick={resetForm}>
            Отменить редактирование
          </Button>
        ) : null}
        <p className="mt-3 text-sm text-rose-700">Столбцы: дни недели. В строке видно, сколько раз еда была отмечена за неделю.</p>

        {appState.foodItems.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-rose-100/85 bg-rose-50/35 p-2">
            <table className="min-w-[720px] w-full border-separate border-spacing-2 text-sm">
              <thead>
                <tr>
                  <th className="rounded-2xl border border-rose-200/80 bg-rose-100/80 px-3 py-2 text-left font-semibold text-rose-900">Еда</th>
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
                {appState.foodItems.map((foodItem) => (
                  <tr key={foodItem.id}>
                    <td className="rounded-2xl border border-rose-200/85 bg-white/82 px-3 py-2 text-rose-900">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-4 w-4 shrink-0 rounded-full border border-rose-200"
                            style={{ backgroundColor: foodItem.color }}
                            aria-hidden
                          />
                          <span className="truncate">{foodItem.title}</span>
                          <span className="shrink-0 text-xs text-rose-700">
                            {weeklyCountByFoodId.get(foodItem.id) ?? 0} раз/нед
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="secondary" className="h-10 px-3 text-sm" onClick={() => startEditFoodItem(foodItem)}>
                            Ред.
                          </Button>
                          <Button variant="secondary" className="h-10 px-3 text-sm" onClick={() => deleteFoodItem(foodItem.id)}>
                            Уд.
                          </Button>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((day) => {
                      const isMarked = selectedFoodSetByDate.get(day.key)?.has(foodItem.id) ?? false;
                      const isSelected = day.key === selectedDate;

                      return (
                        <td
                          key={`${foodItem.id}-${day.key}`}
                          className="rounded-2xl border border-rose-200/85 bg-white/82 px-2 py-2 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => toggleFoodMark(day.key, foodItem.id)}
                            className={`h-10 w-10 rounded-xl border text-sm font-semibold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50 ${
                              isMarked
                                ? "border-rose-500 bg-rose-500 text-white"
                                : isSelected
                                  ? "border-rose-300 bg-rose-100 text-rose-800"
                                  : "border-rose-200 bg-white text-rose-500"
                            }`}
                            aria-label={`${foodItem.title}: ${day.key}`}
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
        ) : (
          <p className="mt-3 text-sm text-rose-700">Добавь первую еду, и здесь появится недельная таблица отметок.</p>
        )}
      </Card>
    </Container>
  );
}
