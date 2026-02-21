const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function parseDateKey(dateKey: string): Date | null {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getDateKeysOfMonth(date: Date): string[] {
  const daysInMonth = getDaysInMonth(date);
  const year = date.getFullYear();
  const month = date.getMonth();

  return Array.from({ length: daysInMonth }, (_, dayIndex) =>
    formatDateKey(new Date(year, month, dayIndex + 1)),
  );
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export type WeekDate = {
  key: string;
  dayOfMonth: number;
  jsDayIndex: number;
};

export function getWeekStartDate(referenceDate: Date): Date {
  const normalized = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const mondayOffset = (normalized.getDay() + 6) % 7;
  normalized.setDate(normalized.getDate() - mondayOffset);
  return normalized;
}

export function getWeekStartKey(referenceDate: Date): string {
  return formatDateKey(getWeekStartDate(referenceDate));
}

export function getWeekDates(referenceDate: Date): WeekDate[] {
  const weekStart = getWeekStartDate(referenceDate);

  return Array.from({ length: 7 }, (_, dayOffset) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayOffset);

    return {
      key: formatDateKey(date),
      dayOfMonth: date.getDate(),
      jsDayIndex: date.getDay(),
    };
  });
}

export function shiftDateKeyByDays(dateKey: string, days: number): string {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return formatDateKey(new Date());
  }

  parsed.setDate(parsed.getDate() + days);
  return formatDateKey(parsed);
}
