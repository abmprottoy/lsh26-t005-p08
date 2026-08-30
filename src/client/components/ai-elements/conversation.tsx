import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Conversation({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="log" aria-live="polite" className={cn("min-h-0 flex-1 overflow-y-auto", className)} {...props} />;
}

export function ConversationContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6", className)} {...props} />;
}

export function ConversationEmptyState({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-zinc-400">{description}</p>
      {children}
    </div>
  );
}
