import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  const classes = [
    "rounded-3xl border border-rose-200/80 bg-white/80 p-5 shadow-sm backdrop-blur",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <section className={classes}>{children}</section>;
}
