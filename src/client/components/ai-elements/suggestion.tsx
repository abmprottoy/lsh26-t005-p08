import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Suggestions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap justify-center gap-2", className)} {...props} />;
}

export function Suggestion({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cn("rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-200", className)} {...props} />;
}
