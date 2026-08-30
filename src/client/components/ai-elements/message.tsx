import { Bot, UserRound } from "lucide-react";
import type { ReactNode } from "react";

export function Message({ role, children }: { role: "user" | "assistant"; children: ReactNode }) {
  const assistant = role === "assistant";
  return (
    <article className={`flex items-start gap-3 ${assistant ? "" : "flex-row-reverse"}`} aria-label={assistant ? "ShikkhaCheck AI response" : "Your message"}>
      <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${assistant ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950" : "bg-slate-950 text-white dark:bg-zinc-100 dark:text-zinc-950"}`}>
        {assistant ? <Bot className="size-4" /> : <UserRound className="size-4" />}
      </div>
      <div className={`min-w-0 max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${assistant ? "overflow-hidden border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" : "bg-slate-950 text-white dark:bg-zinc-100 dark:text-zinc-950"}`}>{children}</div>
    </article>
  );
}
