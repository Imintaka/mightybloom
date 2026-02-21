import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-rose-400/70 bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500 text-white shadow-[0_10px_18px_-10px_rgba(190,24,93,0.7)] hover:from-rose-500 hover:to-pink-500",
  secondary:
    "border border-rose-200 bg-white/90 text-rose-800 shadow-[0_8px_16px_-12px_rgba(190,24,93,0.45)] hover:bg-rose-50",
};

export function Button({ children, className, variant = "primary", type = "button", ...props }: ButtonProps) {
  const classes = [
    "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold tracking-[0.01em] transition duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
