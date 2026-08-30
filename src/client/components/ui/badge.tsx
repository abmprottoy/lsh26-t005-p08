import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-[0.01em]",
  {
    variants: {
      variant: {
        neutral: "border-slate-200 bg-slate-50 text-slate-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300",
        warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300",
        danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-300",
        info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300",
        dark: "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
