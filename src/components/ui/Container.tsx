import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  const classes = ["screen-enter mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 md:pt-8 lg:px-8", className]
    .filter(Boolean)
    .join(" ");

  return <main className={classes}>{children}</main>;
}
