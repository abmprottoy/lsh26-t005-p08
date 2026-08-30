import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

export function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

export function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title {...props} />;
}

export function DialogDescription(props: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description {...props} />;
}

export function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  variant?: "trace" | "modal";
  closeLabel?: string;
}

export function DialogContent({ className, children, variant = "trace", closeLabel = "Close dialog", ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          variant === "trace"
            ? "fixed inset-x-3 bottom-3 top-3 z-50 mx-auto max-w-5xl overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 shadow-2xl outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:inset-x-6 sm:bottom-6 sm:top-6"
            : "fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl outline-none dark:border-zinc-700 dark:bg-zinc-800",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "z-10 inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 dark:hover:text-white",
            variant === "trace" ? "fixed right-7 top-7 sm:right-10 sm:top-10" : "absolute right-4 top-4",
          )}
        >
          <X className="size-4" />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
