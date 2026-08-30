import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileUp,
  FileJson,
  FlaskConical,
  LoaderCircle,
  Play,
  RotateCcw,
  SearchCheck,
  UserRoundX,
} from "lucide-react";
import type { CaseEvaluation, CaseInput, StudentEvaluation } from "../../domain/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface DashboardOverviewProps {
  cases: CaseInput[];
  selectedCaseId: string;
  onSelectedCaseChange: (caseId: string) => void;
  evaluation: CaseEvaluation;
  loading: boolean;
  resultIsStale: boolean;
  onProcess: () => void;
  onUpload: () => void;
  onReset: () => void;
  onSelectStudent: (student: StudentEvaluation) => void;
  onViewResults: () => void;
  onViewChecks: () => void;
}

const reviewCards = [
  { key: "optional", label: "Optional subject", description: "GP 2.0 or below", icon: ClipboardCheck, tone: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" },
  { key: "practicalFail", label: "Practical component", description: "Below the 8/25 minimum", icon: FlaskConical, tone: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" },
  { key: "absent", label: "Absent marks", description: "AB in any subject", icon: UserRoundX, tone: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300" },
] as const;

export function DashboardOverview({
  cases,
  selectedCaseId,
  onSelectedCaseChange,
  evaluation,
  loading,
  resultIsStale,
  onProcess,
  onUpload,
  onReset,
  onSelectStudent,
  onViewResults,
  onViewChecks,
}: DashboardOverviewProps) {
  const reviewStudent =
    evaluation.students.find((student) => student.overrideApplied) ?? evaluation.students[0];
  const passRate = Math.max(0, Math.min(100, evaluation.summary.passRate));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <Card className="overflow-hidden">
          <div className="grid min-h-[260px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col justify-between p-5 sm:p-6">
              <div>
                <Badge variant="success"><CheckCircle2 className="size-3" /> Verification checks ready</Badge>
                <h2 className="mt-4 max-w-xl text-2xl font-bold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-3xl">
                  Verify school results before they are published.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Check raw marks against every GPA rule, find results that need attention, and explain each final grade before publication.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">Current result set:</span>
                <span>{evaluation.caseId}</span>
                <span aria-hidden="true">•</span>
                <span>{evaluation.summary.studentCount} students</span>
                <span aria-hidden="true">•</span>
                <span>{evaluation.summary.classCount} classes</span>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-zinc-700 dark:bg-zinc-700/35 lg:border-l lg:border-t-0">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Verify a result set</p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Choose prepared data or import a school result file.</p>
              <div className="mt-4">
                <span id="result-set-label" className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-300">Result set</span>
                <Select value={selectedCaseId} onValueChange={onSelectedCaseChange} disabled={cases.length === 0}>
                  <SelectTrigger aria-labelledby="result-set-label">
                    <SelectValue placeholder="Choose a result set" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((item, index) => (
                      <SelectItem key={item.case_id} value={item.case_id}>Sample {String(index + 1).padStart(2, "0")} · {item.students.length} students</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-3 space-y-2">
                <Button className="w-full" onClick={onProcess} disabled={loading || cases.length === 0}>
                  {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Play className="size-4" />}
                  {resultIsStale ? "Verify selected results" : "Verify results"}
                </Button>
                <Button variant="secondary" className="w-full" onClick={onUpload}><FileUp className="size-4" /> Import result file</Button>
                <Button variant="ghost" size="sm" className="w-full text-slate-500" onClick={onReset}><RotateCcw className="size-3.5" /> Restore built-in sample</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Publication readiness</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A clear summary before results are released</p>
            </div>
            <Badge variant={evaluation.summary.checkRequired > 0 ? "warning" : "success"}>
              {evaluation.summary.checkRequired > 0 ? "Review needed" : "Ready"}
            </Badge>
          </div>
          <div className="mt-6 flex items-center gap-5">
            <div
              className="relative flex size-28 shrink-0 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(#10b981 0 ${passRate}%, #e2e8f0 ${passRate}% 100%)` }}
              role="img"
              aria-label={`${passRate.toFixed(2)} percent pass rate`}
            >
              <div className="flex size-[78px] flex-col items-center justify-center rounded-full bg-white dark:bg-zinc-800">
                <span className="text-xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{passRate.toFixed(0)}%</span>
                <span className="text-[10px] font-medium text-slate-400">pass rate</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400">Passed</span><span className="font-semibold text-slate-900 dark:text-white">{evaluation.summary.passed}</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${passRate}%` }} /></div>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-xs dark:border-zinc-700"><span className="text-slate-500 dark:text-slate-400">Failed</span><span className="font-semibold text-rose-700 dark:text-rose-300">{evaluation.summary.failed}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500 dark:text-slate-400">Average GPA</span><span className="font-semibold text-slate-900 dark:text-white">{evaluation.summary.averageGpa.toFixed(2)}</span></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(310px,0.55fr)]">
        <Card className="flex h-full flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-zinc-700">
            <div>
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Review before publishing</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Students grouped by the reason a teacher should check them</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onViewChecks}>Open lists <ArrowRight className="size-3.5" /></Button>
          </div>
          <div className="grid flex-1 divide-y divide-slate-200 dark:divide-zinc-700 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {reviewCards.map((item) => {
              const entries = evaluation.checkingLists[item.key];
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={onViewChecks}
                  className="flex h-full items-center gap-3 p-5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 dark:hover:bg-zinc-700/50"
                >
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.tone}`}><Icon className="size-[18px]" /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p><p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{item.description}</p></div>
                  <span className="font-mono text-xl font-bold text-slate-950 dark:text-white">{entries.length}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-zinc-700">
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Why did this result change?</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A real example of an important GPA rule</p>
          </div>
          {reviewStudent ? (
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{reviewStudent.name}</p><p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">{reviewStudent.id} · {reviewStudent.class}</p></div>
                <Badge variant={reviewStudent.overrideApplied ? "danger" : "success"}>{reviewStudent.finalGpa.toFixed(2)} · {reviewStudent.finalLetterGrade}</Badge>
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-zinc-700/50 dark:text-zinc-300">
                {reviewStudent.overrideApplied ? (
                  <span className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-rose-600" /> Compulsory failure overrides the calculated GPA and forces the final result to 0.00 / F.</span>
                ) : (
                  <span className="flex items-start gap-2"><SearchCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" /> No compulsory-failure override was applied to this result.</span>
                )}
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => onSelectStudent(reviewStudent)}>See how this was calculated <ArrowRight className="size-3.5" /></Button>
            </div>
          ) : null}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-zinc-700">
          <div className="flex items-center gap-2"><FileJson className="size-4 text-emerald-600" /><h2 className="text-sm font-semibold text-slate-950 dark:text-white">Results preview</h2></div>
          <Button variant="ghost" size="sm" onClick={onViewResults}>View all {evaluation.students.length} <ArrowRight className="size-3.5" /></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:border-zinc-700 dark:bg-zinc-700/35 dark:text-zinc-400"><th className="px-5 py-3">Student</th><th className="px-4 py-3">Class</th><th className="px-4 py-3 text-right">Final GPA</th><th className="px-4 py-3">Grade</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {evaluation.students.slice(0, 5).map((student) => (
                <tr key={student.id} className="transition hover:bg-slate-50/80 dark:hover:bg-zinc-700/40">
                  <td className="px-5 py-3"><p className="font-medium text-slate-900 dark:text-white">{student.name}</p><p className="font-mono text-[10px] text-slate-400">{student.id}</p></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{student.class}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-white">{student.finalGpa.toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={student.finalLetterGrade === "F" ? "danger" : "success"}>{student.finalLetterGrade}</Badge></td>
                  <td className="px-5 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => onSelectStudent(student)}>Inspect</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
