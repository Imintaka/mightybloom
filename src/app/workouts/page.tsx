import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

const WEEKDAY_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type WeekCell = {
  key: string;
  day: number | null;
};

function getWeeksOfMonth(baseDate: Date): WeekCell[][] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayJs = new Date(year, month, 1).getDay();
  const firstDayMondayIndex = (firstDayJs + 6) % 7;
  const cells: WeekCell[] = [];

  for (let index = 0; index < firstDayMondayIndex; index += 1) {
    cells.push({ key: `empty-start-${index}`, day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ key: `day-${day}`, day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, day: null });
  }

  const weeks: WeekCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
}

export default function WorkoutsPage() {
  const now = new Date();
  const monthLabel = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(now);
  const weeks = getWeeksOfMonth(now);

  return (
    <Container className="space-y-5 pb-12">
      <Card className="paper-grid relative overflow-hidden bg-gradient-to-br from-rose-100/80 via-pink-50/90 to-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-rose-200/60 blur-2xl" />
        <h1 className="text-2xl font-bold tracking-tight text-rose-950 sm:text-[1.75rem]">Тренировки</h1>
        <p className="mt-2 text-sm font-medium text-rose-800/85">
          Недельные блоки внутри месяца: можно сразу видеть структуру, как в бумажном трекере.
        </p>
        <p className="mt-3 inline-flex rounded-2xl border border-rose-200 bg-white/80 px-3 py-1.5 text-sm font-semibold capitalize text-rose-900">
          {monthLabel}
        </p>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="rounded-full border border-rose-200 bg-rose-100/80 px-3 py-1 font-semibold text-rose-900">зал</span>
          <span className="rounded-full border border-rose-200 bg-pink-100/85 px-3 py-1 font-semibold text-pink-900">всё тело</span>
          <span className="rounded-full border border-rose-200 bg-amber-100/90 px-3 py-1 font-semibold text-amber-900">ноги</span>
          <span className="rounded-full border border-rose-200 bg-sky-100/90 px-3 py-1 font-semibold text-sky-900">кардио</span>
          <span className="rounded-full border border-rose-200 bg-slate-100/90 px-3 py-1 font-semibold text-slate-700">отдых</span>
        </div>

        <div className="mt-4 space-y-3">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="rounded-2xl border border-rose-200/85 bg-white/75 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Неделя {weekIndex + 1}</p>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {week.map((cell, dayIndex) => {
                  if (!cell.day) {
                    return <div key={cell.key} className="h-[76px] rounded-xl bg-rose-50/60" />;
                  }

                  return (
                    <div
                      key={cell.key}
                      className="h-[76px] rounded-xl border border-rose-200/85 bg-rose-50/45 p-2 text-left transition hover:bg-rose-100/60"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">{WEEKDAY_SHORT[dayIndex]}</p>
                      <p className="mt-0.5 text-sm font-semibold text-rose-900">{cell.day}</p>
                      <p className="mt-2 rounded-lg border border-dashed border-rose-300/80 bg-white/85 px-1.5 py-1 text-[11px] text-rose-600">
                        выбрать тип
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Container>
  );
}
