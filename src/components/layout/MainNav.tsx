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
    <nav className="mx-auto flex w-full max-w-5xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);
        const classes = isActive
          ? "rounded-xl bg-rose-200/70 px-3 py-1.5 text-sm font-medium text-rose-900"
          : "rounded-xl px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-200/50";

        return (
          <Link key={item.href} href={item.href} className={classes} aria-current={isActive ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
