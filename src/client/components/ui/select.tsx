import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectGroup(props: ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group {...props} />;
}

export function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition-colors data-[placeholder]:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-slate-400" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, position = "popper", ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
          position === "popper" && "w-[var(--radix-select-trigger-width)] translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-7 cursor-default items-center justify-center bg-white dark:bg-zinc-800">
          <ChevronUp className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-7 cursor-default items-center justify-center bg-white dark:bg-zinc-800">
          <ChevronDown className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn("px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400", className)} {...props} />;
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-950 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-zinc-700 dark:focus:text-white",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center text-emerald-600 dark:text-emerald-400">
        <SelectPrimitive.ItemIndicator><Check className="size-4" /></SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-slate-100 dark:bg-zinc-700", className)} {...props} />;
}
