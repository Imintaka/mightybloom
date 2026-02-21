# AGENTS.md

## Контекст проекта
Проект: трекер дел и привычек в розовом стиле со стикерами.
Цель MVP: рабочий фронтенд без бэкенда, данные в `localStorage`, удобный mobile-first UI.

## Технологии (фикс)
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- ESLint + Prettier

Ограничения:
- Без Redux и сложных state-библиотек.
- Без бэкенда/авторизации на этапе MVP.
- Архитектура простая и расширяемая.

## Факты и решения по продукту
- Визуальный стиль: pastel pink/rose + стикеры.
- Приоритет: красота и настроение выше сухой утилитарности.
- Геймификация: легкая (стрики/уровни/награды), без перегруза.
- Стартовые разделы: сон, вода, питание, тренировки, шаги.
- Домашние дела: добавление/удаление пользователем + weekly-рутины.
- История: базовый экран календаря месяца.
- Хранение: `localStorage` (с прицелом на будущую миграцию к базе).
- Ключевой визуальный паттерн: круговой трекер сна по дням месяца.
- Ключевой формат данных на экране: таблицы/матрицы по неделе (столбцы: дни недели, строки: категории/дела).
- Тренировки отображать недельными блоками внутри месяца (список дней + тип тренировки/пометка).

## Текущий факт по репозиторию
- В корне есть конфиги Next/TS/ESLint/Prettier и `package.json`.
- Рабочую структуру нужно вести в `src/` (не в корневом `app/`).
- При создании новых экранов и компонентов использовать путь `src/app/...`, `src/components/...`, `src/lib/...`, `src/types/...`.
- В корне ведутся проектные инструкции: `AGENTS.md`, `TASKS.md`, `SKILL.md`.

## Навык агента (актуально)
- Основной skill для React-задач: `SKILL.md` (`React Best Practices`).
- Алиас навыка: `$vercel-react-best-practices`.
- При React/Next.js изменениях ориентироваться на этот skill в первую очередь.

## Skills (подключение и триггеры)
- `$vercel-react-best-practices`:
  использовать для любых задач по React/Next.js (страницы `src/app/*`, компоненты `src/components/*`, состояние, рендеринг, производительность, архитектура компонентов).
- `$tailwindcss-development`:
  использовать для задач по стилям и UI на Tailwind (дизайн-система, классы Tailwind, адаптивность, визуальные паттерны, переиспользуемые UI-компоненты).
- Если задача одновременно про React/Next.js и Tailwind UI:
  сначала применить `$vercel-react-best-practices` для структуры и производительности, затем `$tailwindcss-development` для финальной стилизации.
- При прямом упоминании навыка пользователем (`$...`) подключать его обязательно в текущем ходе.

## Дизайн-референсы (важно)
- В проекте есть 2 фото с ручным эскизом интерфейса:
- `public/images/photo_2026-02-12_13-42-51.jpg`
- `public/images/photo_2026-02-12_13-42-56.jpg`
- При реализации UI ориентироваться на эти эскизы в первую очередь (композиция, блоки, визуальный вайб).

## Целевая структура проекта
```txt
src/
  app/
    layout.tsx
    page.tsx                # Today
    month/page.tsx
    nutrition/page.tsx
    home/page.tsx
    workouts/page.tsx
  components/
    layout/
    month/
    today/
    nutrition/
    chores/
    workouts/
    ui/
  lib/
    storage.ts
    dates.ts
    calories.ts
  types/
    app.types.ts
```

## Доменные модели (MVP)
```ts
type DayMetrics = {
  waterMl?: number;
  steps?: number;
  sleepHours?: number;
  workoutDone?: boolean;
};

type Chore = {
  id: string;
  title: string;
  schedule: { type: "weekly"; weekdays: number[] } | { type: "none" };
  isActive: boolean;
};

type FoodItem = {
  id: string;
  title: string;
  kcalPerServing: number;
  color: string;
};

type FoodLogByDate = Record<string, string[]>; // YYYY-MM-DD -> foodItemIds

type StickersByDate = Record<string, string>; // YYYY-MM-DD -> stickerId

type WorkoutType = "gym" | "fullBody" | "legs" | "cardio" | "rest";

type WorkoutLogByDate = Record<string, WorkoutType>; // YYYY-MM-DD -> workoutType

type AppState = {
  version: 1;
  goals: {
    waterMl: number;      // default 2000
    steps: number;        // default 10000
    sleepHours: number;   // default 7
  };
  metricsByDate: Record<string, DayMetrics>;
  foodItems: FoodItem[];
  foodLogByDate: FoodLogByDate;
  chores: Chore[];
  choreLogByDate: Record<string, string[]>;
  workoutLogByDate: WorkoutLogByDate;
  stickersByDate: StickersByDate;
  streaks: {
    currentDays: number;
    bestDays: number;
  };
};
```

## Экранный MVP (порядок)
1. `Today`: метрики дня (вода/сон/шаги/тренировка), блок дел, питание за день, прогресс дня.
2. `Month`: круговой календарь сна (дни месяца), индикаторы сна/стикера и открытие дня для редактирования.
3. `Nutrition`: CRUD блюд, отметки блюд по дням, сумма калорий за выбранный день.
4. `Home`: CRUD домашних задач + weekly-расписание + weekly-матрица отметок.
5. `Workouts`: недельные блоки тренировок в рамках месяца (как в референсе).

## Правила трекинга (MVP)
- Вода: ручной ввод мл.
- Сон: часы сна на день + визуализация статуса в круговом трекере месяца.
- Шаги: ручной ввод числа, цель по умолчанию `10000`.
- Тренировка: базово `done/not done`.
- Питание/дом: основной вид отметок в формате таблицы по дням недели.

## Логика закрытия дня (простая)
- Сон закрыт: `sleepHours >= 7`
- Вода закрыта: `waterMl >= goalWaterMl` (дефолт 2000)
- Шаги закрыты: `steps >= 10000`
- День закрыт: минимум 2 закрытых раздела
- При закрытии дня: выдавать стикер и мотивирующую фразу

## UX/UI-направление
- Стиль: pastel pink/rose, крупные карточки, много воздуха.
- Mobile-first + корректный desktop.
- Анимации легкие и осмысленные (без перегруза).
- Стикеры показываются на днях календаря.
- Мотивирующие фразы: короткие, дружелюбные, позитивные.

## Как агент должен работать в проекте
1. Сначала проверять существующие файлы, не ломать текущие решения.
2. Делать маленькие законченные итерации: экран/фича + типы + сохранение + базовая проверка.
3. При каждом изменении:
- сохранить strict TypeScript совместимость;
- не тащить лишние зависимости;
- соблюдать единый стиль и нейминг.
4. Если задача неочевидна, выбирать самое простое решение для MVP.
5. При поиске и обзоре кода по умолчанию не сканировать служебные/сгенерированные директории: `.next`, `node_modules`, `dist`, `coverage`, `out`.

## Команды
- Dev: `npm run dev`
- Lint: `npm run lint`
- Format: `npm run format`
- Build: `npm run build`

## Definition of Done для каждой фичи
- Работает в `npm run dev` без runtime ошибок.
- Нет TypeScript/ESLint ошибок в измененных файлах.
- Данные корректно читаются/пишутся в `localStorage`.
- UI адаптируется под мобильный и десктоп.

## Не делать без отдельной просьбы
- Бэкенд, БД, авторизацию.
- Тяжелые зависимости «на будущее».
- Переусложненную архитектуру.
