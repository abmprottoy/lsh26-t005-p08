import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Sheet(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

export function SheetTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

export function SheetTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title {...props} />;
}

export function SheetDescription(props: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description {...props} />;
}

export function SheetContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[286px] border-r border-slate-200 bg-white shadow-2xl outline-none dark:border-zinc-700 dark:bg-zinc-900",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white">
          <X className="size-4" />
          <span className="sr-only">Close navigation</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
