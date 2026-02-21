import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  const classes = [
    "h-11 w-full rounded-2xl border border-rose-200/90 bg-white/90 px-3.5 text-sm text-rose-950 shadow-[0_8px_16px_-14px_rgba(190,24,93,0.45)] placeholder:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} {...props} />;
}
