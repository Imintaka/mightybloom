import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  const classes = ["surface-card rounded-[1.75rem] p-5 transition-shadow duration-200 md:p-6", className]
    .filter(Boolean)
    .join(" ");

  return <section className={classes}>{children}</section>;
}
