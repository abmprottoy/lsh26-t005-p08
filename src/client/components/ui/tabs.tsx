import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root {...props} />;
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex min-h-11 w-full items-center gap-1 overflow-x-auto rounded-2xl border border-[#daddd5] bg-[#edf1eb] p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-[#637068] transition data-[state=active]:bg-white data-[state=active]:text-[#173a2e] data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c48b2c]/35",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-5 outline-none focus-visible:ring-2 focus-visible:ring-[#c48b2c]/35", className)}
      {...props}
    />
  );
}
