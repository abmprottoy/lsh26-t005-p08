import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CloudUpload,
  FileDown,
  FileSearch,
  ListChecks,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface WalkthroughDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
}

const steps = [
  {
    title: "Choose the result set",
    description: "Use the built-in sample or import your school’s JSON result file. ShikkhaCheck validates the format before processing anything.",
    icon: PlayCircle,
  },
  {
    title: "Verify every result",
    description: "Select Verify results to apply the grade bands, optional-subject bonus, practical minimums, and compulsory-failure rule.",
    icon: ListChecks,
  },
  {
    title: "Review students who need attention",
    description: "Checking lists separate optional-subject concerns, practical failures, and absences so teachers know exactly what to review.",
    icon: FileSearch,
  },
  {
    title: "Ask in your own language",
    description: "Ask ShikkhaCheck about a student, class, weak subject, or review priority in বাংলা, Banglish, or English. Choose how much verified data to include as context.",
    icon: Bot,
  },
  {
    title: "Save a trusted copy",
    description: "Save to cloud keeps the source data and verified result together, so the school can reopen the same calculation later.",
    icon: CloudUpload,
  },
  {
    title: "Share the reviewed results",
    description: "Export a presentation-ready PDF, an editable Excel workbook, or a complete JSON copy after the review is finished.",
    icon: FileDown,
  },
] as const;

export function WalkthroughDialog({ open, onOpenChange, onStart }: WalkthroughDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="modal" closeLabel="Close walkthrough">
        <DialogHeader className="border-b border-slate-200 px-6 py-5 pr-16 dark:border-zinc-700">
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <Sparkles className="size-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white">
            How ShikkhaCheck works
          </DialogTitle>
          <DialogDescription className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            A quick guide for teachers, school administrators, and judges—from raw marks to an explainable, publication-ready result.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(60vh,560px)] overflow-y-auto px-6 py-5">
          <ol className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="grid grid-cols-[40px_1fr] gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-700/45">
                  <div className="relative flex size-10 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-emerald-300 dark:ring-zinc-600">
                    <Icon className="size-[18px]" />
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-white dark:bg-white dark:text-slate-950">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{step.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <p className="text-xs leading-5">
              Every final GPA remains explainable. Select any student’s <strong>Inspect</strong> action to see the marks, grade bands, bonus calculation, and any override that changed the final result.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-900/40">
          <DialogClose asChild><Button variant="ghost">Maybe later</Button></DialogClose>
          <DialogClose asChild>
            <Button onClick={onStart}>Start with the dashboard <ArrowRight className="size-4" /></Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
