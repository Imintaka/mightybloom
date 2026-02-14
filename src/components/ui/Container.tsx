import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  const classes = ["mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8", className]
    .filter(Boolean)
    .join(" ");

  return <main className={classes}>{children}</main>;
}
