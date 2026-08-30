import { BarChart3, GraduationCap, ShieldAlert, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import type { CaseEvaluation } from "../../domain/types";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";

interface AnalyticsProps {
  evaluation: CaseEvaluation;
}

const gradeOrder = ["A+", "A", "A-", "B", "C", "D", "F"];
const gradeColors = ["#059669", "#10b981", "#34d399", "#0ea5e9", "#f59e0b", "#fb7185", "#e11d48"];

const resultConfig = {
  passed: { label: "Passed", color: "var(--chart-1)" },
  failed: { label: "Failed", color: "var(--chart-5)" },
} satisfies ChartConfig;

const classConfig = {
  passed: { label: "Passed", color: "var(--chart-1)" },
  failed: { label: "Failed", color: "var(--chart-5)" },
} satisfies ChartConfig;

const pressureConfig = {
  failures: { label: "Failed students", color: "var(--chart-5)" },
} satisfies ChartConfig;

const gradeConfig = {
  count: { label: "Students", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function Analytics({ evaluation }: AnalyticsProps) {
  const gradeData = gradeOrder.map((grade, index) => ({ grade, count: evaluation.summary.gradeDistribution[grade] ?? 0, fill: gradeColors[index] }));
  const resultData = [
    { name: "Passed", value: evaluation.summary.passed, fill: "var(--color-passed)" },
    { name: "Failed", value: evaluation.summary.failed, fill: "var(--color-failed)" },
  ];
  const classData = evaluation.summary.classSummaries.map((summary) => ({ class: summary.className, passed: summary.passed, failed: summary.failed }));
  const pressureData = evaluation.summary.subjectFailureCounts.slice(0, 6).map((subject) => ({ subject: subject.subjectCode, failures: subject.failures }));
  const highestFailureSubject = evaluation.summary.subjectFailureCounts[0];
  const strongestClass = [...evaluation.summary.classSummaries].sort((a, b) => b.passRate - a.passRate)[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div><div className="flex items-center gap-2"><BarChart3 className="size-5 text-sky-600 dark:text-sky-400" /><h2 className="text-base font-semibold text-slate-950 dark:text-white">Grade distribution</h2></div><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">How final grades are distributed after all compulsory-failure rules.</p></div>
            <Badge>{evaluation.summary.studentCount} students</Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={gradeConfig} className="h-[290px] w-full aspect-auto">
              <BarChart accessibilityLayer data={gradeData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="grade" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={{ fill: "rgba(148, 163, 184, 0.10)" }} content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 2, 2]} maxBarSize={54}>
                  {gradeData.map((entry) => <Cell key={entry.grade} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><GraduationCap className="size-5 text-emerald-600 dark:text-emerald-400" /><h2 className="text-base font-semibold text-slate-950 dark:text-white">Publication picture</h2></div><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">The final pass and fail split for this result set.</p></CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={resultConfig} className="mx-auto h-[236px] w-full max-w-[300px] aspect-square">
              <PieChart accessibilityLayer>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={resultData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={92} strokeWidth={4} stroke="transparent">
                  <Label content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) return <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle"><tspan x={viewBox.cx} y={viewBox.cy} className="fill-slate-950 text-3xl font-bold dark:fill-white">{Math.round(evaluation.summary.passRate)}%</tspan><tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 22} className="fill-slate-500 text-[11px] dark:fill-zinc-400">pass rate</tspan></text>;
                    return null;
                  }} />
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div><div className="flex items-center gap-2"><TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" /><h2 className="text-base font-semibold text-slate-950 dark:text-white">Class performance</h2></div><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Passed and failed students compared across classes.</p></div>
            {strongestClass && <Badge variant="success">{strongestClass.className} leads</Badge>}
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={classConfig} className="h-[260px] w-full aspect-auto">
              <BarChart accessibilityLayer data={classData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="class" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={{ fill: "rgba(148, 163, 184, 0.10)" }} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="passed" stackId="results" fill="var(--color-passed)" radius={[0, 0, 4, 4]} maxBarSize={58} />
                <Bar dataKey="failed" stackId="results" fill="var(--color-failed)" radius={[4, 4, 0, 0]} maxBarSize={58} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div><div className="flex items-center gap-2"><ShieldAlert className="size-5 text-rose-600 dark:text-rose-400" /><h2 className="text-base font-semibold text-slate-950 dark:text-white">Subject pressure</h2></div><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Where zero grade points occur most often.</p></div>
            {highestFailureSubject && <Badge variant="danger">{highestFailureSubject.subjectCode} needs attention</Badge>}
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={pressureConfig} className="h-[260px] w-full aspect-auto">
              <BarChart accessibilityLayer data={pressureData} layout="vertical" margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis dataKey="subject" type="category" tickLine={false} axisLine={false} width={42} />
                <ChartTooltip cursor={{ fill: "rgba(148, 163, 184, 0.10)" }} content={<ChartTooltipContent />} />
                <Bar dataKey="failures" fill="var(--color-failures)" radius={[0, 6, 6, 0]} maxBarSize={26} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
