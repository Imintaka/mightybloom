"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Сегодня" },
  { href: "/month", label: "Месяц" },
  { href: "/nutrition", label: "Питание" },
  { href: "/home", label: "Дом" },
  { href: "/workouts", label: "Тренировки" },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center gap-2.5 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8" aria-label="Основная навигация">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);
        const classes = isActive
          ? "inline-flex min-h-11 items-center rounded-2xl border border-rose-300/80 bg-gradient-to-br from-rose-200 to-pink-200 px-3.5 py-1.5 text-sm font-semibold text-rose-950 shadow-[0_10px_20px_-14px_rgba(190,24,93,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
          : "inline-flex min-h-11 items-center rounded-2xl border border-transparent px-3.5 py-1.5 text-sm font-semibold text-rose-800/90 transition hover:border-rose-200 hover:bg-rose-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50";

        return (
          <Link key={item.href} href={item.href} className={classes} aria-current={isActive ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
