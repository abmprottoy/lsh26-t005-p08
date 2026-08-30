import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleEqual,
  FlaskConical,
  Sigma,
  X,
} from "lucide-react";
import type { StudentEvaluation, SubjectEvaluation } from "../../domain/types";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

interface StudentTraceDialogProps {
  student: StudentEvaluation | null;
  onClose: () => void;
}

function SubjectRow({ subject }: { subject: SubjectEvaluation }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.85fr_0.65fr_1.8fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500">{subject.code}</span>
            {subject.isOptional && <Badge variant="warning">Optional</Badge>}
            {subject.isPractical && (
              <Badge variant="info">
                <FlaskConical className="size-3" />
                Practical
              </Badge>
            )}
          </div>
          <p className="mt-1 font-semibold text-slate-900">{subject.name}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Mark used</p>
          <p className={"mt-1 font-mono text-sm font-bold " + (subject.absent ? "text-rose-700 dark:text-rose-300" : "text-slate-700 dark:text-zinc-200")}>
            {subject.markDisplay}
          </p>
          {subject.isPractical && !subject.absent && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subject.componentChecks.theory && (
                <Badge variant={subject.componentChecks.theory.passed ? "success" : "danger"}>
                  T {subject.componentChecks.theory.actual}/75
                </Badge>
              )}
              {subject.componentChecks.practical && (
                <Badge variant={subject.componentChecks.practical.passed ? "success" : "danger"}>
                  P {subject.componentChecks.practical.actual}/25
                </Badge>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Grade point</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={"font-mono text-xl font-bold " + (subject.failed ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300")}>
              {subject.gradePoint.toFixed(1)}
            </span>
            <Badge variant={subject.failed ? "danger" : "success"}>{subject.letterGrade}</Badge>
          </div>
          {subject.failed && subject.normalBandGradePoint > 0 && (
            <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-300">
              Total alone: GP {subject.normalBandGradePoint.toFixed(1)}
            </p>
          )}
        </div>
        <div className={"rounded-lg border p-3 text-xs leading-relaxed " + (subject.failed ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200")}>
          <div className="mb-1.5 flex items-center gap-1.5 font-bold">
            {subject.failed ? <X className="size-3.5" /> : <Check className="size-3.5" />}
            Rule decision
          </div>
          {subject.explanation}
        </div>
      </div>
    </div>
  );
}

export function StudentTraceDialog({ student, onClose }: StudentTraceDialogProps) {
  return (
    <Dialog open={student !== null} onOpenChange={(open) => !open && onClose()}>
      {student && (
        <DialogContent closeLabel="Close calculation trace">
          <div className="sticky top-0 z-[1] border-b border-slate-200 bg-white/95 px-5 py-5 pr-16 backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/95 sm:px-8 sm:py-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="dark">{student.id}</Badge>
                  <Badge>{student.class}</Badge>
                </div>
                <DialogTitle className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                  {student.name}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-500">
                  Calculation trace · every mark, component check, grade band and override
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3 pr-2">
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">Final result</p>
                  <p className={"font-mono text-2xl font-bold " + (student.overrideApplied ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300")}>
                    {student.finalGpa.toFixed(2)}
                  </p>
                </div>
                <div className={"flex size-14 items-center justify-center rounded-lg text-xl font-black " + (student.overrideApplied ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300")}>
                  {student.finalLetterGrade}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-8">
            {student.overrideApplied && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-400/20 dark:bg-rose-400/10 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rose-900 dark:text-rose-200">Compulsory-failure override applied</h3>
                    <p className="mt-1 text-sm leading-relaxed text-rose-700 dark:text-rose-300">
                      The calculated average remains visible, but any failed compulsory subject forces the final GPA to 0.00 and the letter grade to F.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {student.compulsoryFailures.map((failure) => (
                        <Badge key={failure.subjectCode} variant="danger">
                          {failure.subjectCode} · {failure.subjectName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Subject decisions</h3>
                  <p className="mt-1 text-sm text-slate-500">Six compulsory subjects plus one optional fourth subject.</p>
                </div>
                <Badge>{student.subjects.length} subjects</Badge>
              </div>
              <div className="space-y-3">
                {student.subjects.map((subject) => (
                  <SubjectRow key={subject.code} subject={subject} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center gap-2">
                <Sigma className="size-5 text-emerald-400" />
                <h3 className="text-lg font-bold">GPA calculation</h3>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/55">Compulsory sum</p>
                  <p className="mt-1 font-mono text-2xl font-bold">{student.compulsoryGradePointSum.toFixed(1)}</p>
                  <p className="mt-1 text-xs text-white/60">Six subject grade points</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/55">Optional bonus</p>
                  <p className="mt-1 font-mono text-2xl font-bold">{student.optionalBonus.toFixed(1)}</p>
                  <p className="mt-1 text-xs text-white/60">
                    max(0, {student.optionalGradePoint.toFixed(1)} − 2)
                  </p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/55">Uncancelled GPA</p>
                  <p className="mt-1 font-mono text-2xl font-bold">{student.uncancelledGpa.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-white/60">Average divided by 6, capped at 5</p>
                </div>
                <div className={"rounded-lg p-4 " + (student.overrideApplied ? "bg-rose-600" : "bg-emerald-600")}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/65">Final GPA</p>
                  <p className="mt-1 font-mono text-2xl font-bold">{student.finalGpa.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-white/70">
                    {student.overrideApplied ? "Forced to 0.00 by compulsory fail" : "No compulsory failure"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 font-mono text-sm">
                <span>({student.compulsoryGradePointSum.toFixed(1)}</span>
                <span>+</span>
                <span>{student.optionalBonus.toFixed(1)})</span>
                <span>÷ 6</span>
                <CircleEqual className="size-4 text-emerald-400" />
                <span>{student.rawAverage.toFixed(4)}</span>
                {student.rawAverage > 5 && (
                  <>
                    <ArrowRight className="size-4 text-emerald-400" />
                    <span>cap 5.00</span>
                  </>
                )}
                {student.overrideApplied && (
                  <>
                    <ArrowRight className="size-4 text-emerald-400" />
                    <span className="font-bold text-rose-200">override 0.00 / F</span>
                  </>
                )}
              </div>
            </section>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
