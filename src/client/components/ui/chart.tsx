import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { TooltipValueType } from "recharts";
import { cn } from "../../lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = Record<
  string,
  { label?: React.ReactNode; icon?: React.ComponentType } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a ChartContainer");
  return context;
}

export function ChartContainer({ id, className, children, config, ...props }: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-slate-500 dark:[&_.recharts-cartesian-axis-tick_text]:fill-zinc-400 [&_.recharts-cartesian-grid_line]:stroke-slate-200 dark:[&_.recharts-cartesian-grid_line]:stroke-zinc-700 [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.theme ?? item.color);
  if (colorConfig.length === 0) return null;
  return <style dangerouslySetInnerHTML={{ __html: Object.entries(THEMES).map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, item]) => {
  const color = item.theme?.[theme as keyof typeof item.theme] ?? item.color;
  return color ? `  --color-${key}: ${color};` : null;
}).join("\n")}
}`).join("\n") }} />;
}

export function ChartTooltip(props: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return <RechartsPrimitive.Tooltip {...props} />;
}
type TooltipName = number | string;

export function ChartTooltipContent({ active, payload, label, className, hideLabel = false }: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & React.ComponentProps<"div"> & {
  hideLabel?: boolean;
} & Omit<RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipName>, "accessibilityLayer">) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;
  return (
    <div className={cn("grid min-w-32 gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl dark:border-zinc-700 dark:bg-zinc-800", className)}>
      {!hideLabel && label != null && <div className="font-semibold text-slate-900 dark:text-white">{String(label)}</div>}
      {payload.filter((item) => item.type !== "none").map((item, index) => {
        const key = String(item.dataKey ?? item.name ?? "value");
        const itemConfig = config[key];
        return (
          <div key={`${key}-${index}`} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: item.color ?? item.payload?.fill }} />
            <span className="flex-1 text-slate-500 dark:text-zinc-400">{itemConfig?.label ?? item.name}</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">{typeof item.value === "number" ? item.value.toLocaleString() : String(item.value ?? "")}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ChartLegend(props: React.ComponentProps<typeof RechartsPrimitive.Legend>) {
  return <RechartsPrimitive.Legend {...props} />;
}

export function ChartLegendContent({ payload, className }: RechartsPrimitive.DefaultLegendContentProps & { className?: string }) {
  const { config } = useChart();
  if (!payload?.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4 pt-3 text-xs text-slate-500 dark:text-zinc-400", className)}>
      {payload.filter((item) => item.type !== "none").map((item, index) => {
        const itemConfig = config[String(item.dataKey ?? item.value)];
        return <div key={`${item.value}-${index}`} className="flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ backgroundColor: item.color }} />{itemConfig?.label ?? item.value}</div>;
      })}
    </div>
  );
}
