import { Check, Download, FileJson2, FileSpreadsheet, FileText, Layers3, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { CaseEvaluation } from "../../domain/types";
import { buildExportBaseName, downloadResults, type ResultExportFormat } from "../lib/export-results";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ExportWorkspaceProps {
  evaluation: CaseEvaluation;
  sourceLabel: string;
  disabled?: boolean;
  onExported: (format: ResultExportFormat) => void;
  onExportError: (message: string) => void;
}

const formats = [
  {
    id: "pdf",
    title: "PDF report",
    description: "A polished, print-ready summary for school leaders, reviewers, and judges.",
    detail: "Summary metrics and every student's final result",
    action: "Download PDF",
    icon: FileText,
    tone: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  },
  {
    id: "excel",
    title: "Excel workbook",
    description: "An editable workbook for sorting, filtering, and continuing the review in Excel.",
    detail: "4 sheets: overview, students, subjects, review list",
    action: "Download Excel",
    icon: FileSpreadsheet,
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  },
  {
    id: "json",
    title: "JSON data",
    description: "The complete verified dataset for archiving or connecting to another system.",
    detail: "Full calculation traces and summary data",
    action: "Download JSON",
    icon: FileJson2,
    tone: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
  },
] satisfies Array<{ id: ResultExportFormat; title: string; description: string; detail: string; action: string; icon: typeof FileText; tone: string }>;

export function ExportWorkspace({ evaluation, sourceLabel, disabled, onExported, onExportError }: ExportWorkspaceProps) {
  const [exporting, setExporting] = useState<ResultExportFormat | null>(null);
  const baseName = buildExportBaseName(evaluation);

  const exportFile = async (format: ResultExportFormat) => {
    setExporting(format);
    try {
      await downloadResults(format, evaluation, sourceLabel);
      onExported(format);
    } catch (error) {
      onExportError(error instanceof Error ? error.message : "The export could not be created.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_320px]">
          <div className="p-6 sm:p-7">
            <Badge variant="success"><ShieldCheck className="size-3" /> Verified and ready</Badge>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-[-0.035em] text-slate-950 dark:text-white">Share results in the format your audience needs.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Each download is created from the current verified result set. Nothing is changed, and every student remains traceable to the rules that produced the final grade.
            </p>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-zinc-700 dark:bg-zinc-800 lg:border-l lg:border-t-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Exporting now</p>
            <p className="mt-2 font-mono text-sm font-bold text-slate-950 dark:text-white">{evaluation.caseId}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-slate-400">Students</p><p className="mt-1 font-semibold text-slate-800 dark:text-zinc-100">{evaluation.summary.studentCount}</p></div>
              <div><p className="text-slate-400">Classes</p><p className="mt-1 font-semibold text-slate-800 dark:text-zinc-100">{evaluation.summary.classCount}</p></div>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-3 dark:border-zinc-700"><p className="truncate text-[11px] text-slate-500 dark:text-zinc-400" title={sourceLabel}>{sourceLabel}</p></div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Export formats">
        {formats.map((format) => {
          const Icon = format.icon;
          const isExporting = exporting === format.id;
          return (
            <Card key={format.id} className="flex min-h-[260px] flex-col p-5">
              <div className={`flex size-11 items-center justify-center rounded-xl ${format.tone}`}><Icon className="size-5" /></div>
              <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{format.title}</h3>
              <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-zinc-400">{format.description}</p>
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-zinc-300"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" /><span>{format.detail}</span></div>
              <Button className="mt-auto w-full" onClick={() => void exportFile(format.id)} disabled={disabled || exporting !== null}>
                {isExporting ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}{isExporting ? "Preparing download…" : format.action}
              </Button>
            </Card>
          );
        })}
      </section>

      <Card className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300"><Layers3 className="size-4" /></div>
          <div><h3 className="text-sm font-semibold text-slate-950 dark:text-white">Clear, consistent file names</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">Downloads include the result-set ID and today's date, making them easy to identify later.</p></div>
        </div>
        <code className="max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{baseName}.pdf</code>
      </Card>
    </div>
  );
}
