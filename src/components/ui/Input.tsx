import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  const classes = [
    "h-10 w-full rounded-2xl border border-rose-200 bg-white px-3 text-sm text-rose-900 placeholder:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} {...props} />;
}
