import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function TooltipProvider({ delayDuration = 250, ...props }: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger(props: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props} />;
}

export function TooltipContent({ className, sideOffset = 7, ...props }: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-[80] rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg data-[state=closed]:animate-out data-[state=delayed-open]:animate-in dark:bg-white dark:text-slate-950",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
