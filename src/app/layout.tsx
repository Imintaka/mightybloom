import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Трекер привычек",
  description: "MVP трекер привычек и дел",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-white text-rose-900 antialiased">
        <header className="sticky top-0 z-10 border-b border-rose-200/70 bg-rose-50/90 backdrop-blur">
          <nav className="mx-auto flex w-full max-w-5xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="rounded-xl bg-rose-200/70 px-3 py-1.5 text-sm font-medium text-rose-900">
              Сегодня
            </Link>
            <Link href="/month" className="rounded-xl px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-200/50">
              Месяц
            </Link>
            <Link
              href="/nutrition"
              className="rounded-xl px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-200/50"
            >
              Питание
            </Link>
            <Link href="/home" className="rounded-xl px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-200/50">
              Дом
            </Link>
            <Link
              href="/workouts"
              className="rounded-xl px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-200/50"
            >
              Тренировки
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
