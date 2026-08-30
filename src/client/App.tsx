import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Cloud,
  FileCheck2,
  FileDown,
  Gauge,
  GraduationCap,
  History,
  LoaderCircle,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  School,
  ShieldAlert,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { caseSchema, fixtureSchema } from "../domain/schema";
import type { CaseEvaluation, CaseInput, StudentEvaluation } from "../domain/types";
import { AppSidebar, SidebarFrame, type DashboardView } from "./components/AppSidebar";
import { CheckingLists } from "./components/CheckingLists";
import { DashboardOverview } from "./components/DashboardOverview";
import { ExportWorkspace } from "./components/ExportWorkspace";
import { ModeToggle } from "./components/ModeToggle";
import { ResultTable } from "./components/ResultTable";
import { RunHistory } from "./components/RunHistory";
import { StudentTraceDialog } from "./components/StudentTraceDialog";
import { WalkthroughDialog } from "./components/WalkthroughDialog";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "./components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "./components/ui/tooltip";
import { ApiError, evaluateCaseRequest, saveRunRequest, type ApiIssue } from "./lib/api";

const Analytics = lazy(() => import("./components/Analytics").then((module) => ({ default: module.Analytics })));
const AIWorkspace = lazy(() => import("./components/AIWorkspace").then((module) => ({ default: module.AIWorkspace })));

interface Notice {
  kind: "success" | "error";
  message: string;
}

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: typeof UsersRound;
  tone: "emerald" | "amber" | "rose" | "sky";
}

const metricTone = {
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
};

const viewCopy: Record<DashboardView, { eyebrow: string; title: string; description: string; icon: typeof Gauge }> = {
  overview: { eyebrow: "Result verification", title: "Dashboard", description: "Run, review, and publish with confidence.", icon: Gauge },
  results: { eyebrow: "Processed output", title: "Student results", description: "Filter results and inspect every calculation trace.", icon: FileCheck2 },
  checks: { eyebrow: "Manual review", title: "Checking lists", description: "Resolve optional, practical, and absence exceptions.", icon: ClipboardList },
  analytics: { eyebrow: "Performance view", title: "Analytics", description: "Understand grade distribution and subject pressure.", icon: BarChart3 },
  ai: { eyebrow: "Grounded result assistant", title: "Ask ShikkhaCheck", description: "Explore verified results naturally in বাংলা, Banglish, or English.", icon: Sparkles },
  export: { eyebrow: "Share verified results", title: "Export results", description: "Download a clear report, editable workbook, or complete data copy.", icon: FileDown },
  history: { eyebrow: "Cloud storage", title: "Cloud saves", description: "Reopen trusted copies of earlier result verifications.", icon: History },
};

function MetricCard({ label, value, detail, icon: Icon, tone }: MetricCardProps) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${metricTone[tone]}`}><Icon className="size-[18px]" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <p className="metric-number font-mono text-xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
      </div>
    </Card>
  );
}

function formatLoadError(caught: unknown) {
  if (caught instanceof ApiError) return { message: caught.message, issues: caught.issues };
  if (caught instanceof Error) return { message: caught.message, issues: [] };
  return { message: "An unexpected error occurred.", issues: [] };
}

export function App() {
  const [cases, setCases] = useState<CaseInput[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [evaluation, setEvaluation] = useState<CaseEvaluation | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentEvaluation | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem("shikkhacheck-sidebar") === "collapsed");
  const [sourceLabel, setSourceLabel] = useState("Built-in sample");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<ApiIssue[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCase = useMemo(() => cases.find((item) => item.case_id === selectedCaseId) ?? null, [cases, selectedCaseId]);
  const resultIsStale = evaluation !== null && evaluation.caseId !== selectedCaseId;
  const page = viewCopy[activeView];
  const PageIcon = page.icon;

  const showNotice = useCallback((nextNotice: Notice) => {
    setNotice(nextNotice);
    window.setTimeout(() => setNotice(null), 3500);
  }, []);

  const processCase = useCallback(async (input: CaseInput) => {
    setLoading(true);
    setError(null);
    setIssues([]);
    try {
      setEvaluation(await evaluateCaseRequest(input));
    } catch (caught) {
      const formatted = formatLoadError(caught);
      setError(formatted.message);
      setIssues(formatted.issues);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPublishedFixture = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIssues([]);
    try {
      const response = await fetch("/P08_school_results_public.json");
      if (!response.ok) throw new Error("The built-in P08 result data could not be loaded.");
      const payload: unknown = await response.json();
      const parsed = fixtureSchema.safeParse(payload);
      if (!parsed.success) throw new Error("The built-in result data does not match the expected P08 format.");
      setCases(parsed.data.cases);
      setSelectedCaseId(parsed.data.cases[0]!.case_id);
      setSourceLabel("Built-in sample · 25 result sets");
      await processCase(parsed.data.cases[0]!);
    } catch (caught) {
      const formatted = formatLoadError(caught);
      setError(formatted.message);
      setIssues(formatted.issues);
      setLoading(false);
    }
  }, [processCase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPublishedFixture(), 0);
    return () => window.clearTimeout(timer);
  }, [loadPublishedFixture]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setIssues([]);
    try {
      const payload: unknown = JSON.parse(await file.text());
      const fixture = fixtureSchema.safeParse(payload);
      const singleCase = fixture.success ? null : caseSchema.safeParse(payload);
      let nextCases: CaseInput[];
      if (fixture.success) nextCases = fixture.data.cases;
      else if (singleCase?.success) nextCases = [singleCase.data];
      else {
        const validationError = singleCase && !singleCase.success ? singleCase.error : fixture.error;
        setError("This result file does not match the expected P08 format.");
        setIssues(validationError.issues.slice(0, 12).map((issue) => ({ path: issue.path.join(" / "), message: issue.message })));
        return;
      }
      setCases(nextCases);
      setSelectedCaseId(nextCases[0]!.case_id);
      setSourceLabel(`${file.name} · ${nextCases.length} ${nextCases.length === 1 ? "result set" : "result sets"}`);
      await processCase(nextCases[0]!);
      showNotice({ kind: "success", message: "Result file validated and verified." });
    } catch (caught) {
      setError(caught instanceof SyntaxError ? "The uploaded file is not valid JSON." : formatLoadError(caught).message);
    }
  };

  const handleSave = async () => {
    if (!selectedCase || !evaluation || resultIsStale) return;
    setSaving(true);
    try {
      const saved = await saveRunRequest(selectedCase);
      setEvaluation(saved.result);
      setHistoryRefreshToken((token) => token + 1);
      showNotice({ kind: "success", message: "Verified results saved securely to the cloud." });
    } catch (caught) {
      showNotice({ kind: "error", message: caught instanceof ApiError && caught.status === 500 ? "Cloud saving is not ready yet. Ask the administrator to finish setup." : formatLoadError(caught).message });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSavedRun = (input: CaseInput, result: CaseEvaluation) => {
    setCases([input]);
    setSelectedCaseId(input.case_id);
    setEvaluation(result);
    setSourceLabel("Saved cloud copy");
    setActiveView("overview");
    showNotice({ kind: "success", message: "Cloud copy opened with its original result data." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeView = (view: DashboardView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("shikkhacheck-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  };

  const sidebarProps = {
    activeView,
    onViewChange: changeView,
    checkCount: evaluation?.summary.checkRequired ?? 0,
    sourceLabel,
    onOpenWalkthrough: () => setWalkthroughOpen(true),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-zinc-900 dark:text-zinc-100">
      <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={(event) => void handleUpload(event)} />
      <SidebarFrame collapsed={sidebarCollapsed}><AppSidebar {...sidebarProps} collapsed={sidebarCollapsed} /></SidebarFrame>

      <div className={`transition-[padding] duration-200 ${sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-[264px]"}`}>
        <header className="no-print sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 sm:px-6">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="mr-2 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
              <SheetDescription className="sr-only">Navigate between result verification views.</SheetDescription>
              <AppSidebar {...sidebarProps} onNavigate={() => setMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="mr-2 hidden lg:inline-flex"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="hidden size-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300 sm:flex"><PageIcon className="size-4" /></div>
            <div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{page.eyebrow}</p><p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{page.title}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="hidden md:inline-flex"><Cloud className="size-3" /> Cloud ready</Badge>
            <ModeToggle />
            {evaluation && activeView !== "history" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="sm" onClick={() => void handleSave()} disabled={saving || resultIsStale} aria-label="Save this verified result set to the cloud">
                    {saving ? <LoaderCircle className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}<span className="hidden sm:inline">Save results to cloud</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-64 text-center leading-5">
                  Save this verified result set to the cloud. Your AI chat is not included.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div><h1 className="text-2xl font-bold tracking-[-0.035em] text-slate-950 dark:text-white">{page.title}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{page.description}</p></div>
            {evaluation && <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="size-1.5 rounded-full bg-emerald-500" /><span>{evaluation.caseId}</span><span>·</span><span>{evaluation.summary.studentCount} students</span></div>}
          </div>

          {notice && (
            <div className={`toast-enter fixed right-4 top-20 z-[70] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-xl ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`} role="status">
              {notice.kind === "success" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}<span className="text-sm font-medium">{notice.message}</span><button type="button" onClick={() => setNotice(null)} className="ml-1 opacity-60 hover:opacity-100" aria-label="Dismiss notification"><X className="size-4" /></button>
            </div>
          )}

          {error && (
            <section className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">
              <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-600" /><div className="min-w-0"><h2 className="font-semibold text-rose-900">{error}</h2>{issues.length > 0 && <ul className="mt-3 space-y-1.5 text-sm text-rose-700">{issues.map((issue, index) => <li key={issue.path + String(index)}><span className="font-mono text-xs font-bold">{issue.path || "root"}</span> — {issue.message}</li>)}</ul>}</div></div>
            </section>
          )}

          {loading && !evaluation ? (
            <section className="flex min-h-[520px] items-center justify-center"><div className="text-center"><LoaderCircle className="mx-auto size-7 animate-spin text-emerald-600" /><p className="mt-3 text-sm font-medium text-slate-600">Validating and verifying the result data…</p></div></section>
          ) : evaluation ? (
            <>
              {resultIsStale && <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300"><AlertCircle className="size-4 shrink-0" />The result set changed. Choose “Verify selected results” to refresh the dashboard.</div>}
              {activeView !== "history" && (
                <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Students" value={String(evaluation.summary.studentCount)} detail={`${evaluation.summary.classCount} classes`} icon={UsersRound} tone="emerald" />
                  <MetricCard label="Average GPA" value={evaluation.summary.averageGpa.toFixed(2)} detail={`${evaluation.summary.passRate.toFixed(1)}% pass`} icon={GraduationCap} tone="amber" />
                  <MetricCard label="Failed" value={String(evaluation.summary.failed)} detail={`${evaluation.summary.passed} passed`} icon={ShieldAlert} tone="rose" />
                  <MetricCard label="Needs review" value={String(evaluation.summary.checkRequired)} detail="unique students" icon={ClipboardList} tone="sky" />
                </section>
              )}

              {activeView === "overview" && <DashboardOverview cases={cases} selectedCaseId={selectedCaseId} onSelectedCaseChange={setSelectedCaseId} evaluation={evaluation} loading={loading} resultIsStale={resultIsStale} onProcess={() => selectedCase && void processCase(selectedCase)} onUpload={() => fileInputRef.current?.click()} onReset={() => void loadPublishedFixture()} onSelectStudent={setSelectedStudent} onViewResults={() => changeView("results")} onViewChecks={() => changeView("checks")} />}
              {activeView === "results" && <ResultTable evaluation={evaluation} onSelectStudent={setSelectedStudent} />}
              {activeView === "checks" && <CheckingLists evaluation={evaluation} onSelectStudent={setSelectedStudent} />}
              {activeView === "analytics" && <Suspense fallback={<section className="flex min-h-[420px] items-center justify-center"><div className="text-center"><LoaderCircle className="mx-auto size-6 animate-spin text-emerald-600" /><p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">Preparing visual insights…</p></div></section>}><Analytics evaluation={evaluation} /></Suspense>}
              {activeView === "ai" && <Suspense fallback={<section className="flex min-h-[520px] items-center justify-center"><div className="text-center"><LoaderCircle className="mx-auto size-6 animate-spin text-emerald-600" /><p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">Opening ShikkhaCheck AI…</p></div></section>}><AIWorkspace key={evaluation.caseId} evaluation={evaluation} sourceLabel={sourceLabel} resultIsStale={resultIsStale} /></Suspense>}
              {activeView === "export" && <ExportWorkspace evaluation={evaluation} sourceLabel={sourceLabel} disabled={resultIsStale} onExported={(format) => showNotice({ kind: "success", message: `${format === "pdf" ? "PDF report" : format === "excel" ? "Excel workbook" : "JSON data"} downloaded successfully.` })} onExportError={(message) => showNotice({ kind: "error", message })} />}
              {activeView === "history" && <RunHistory refreshToken={historyRefreshToken} onLoadRun={handleLoadSavedRun} />}

              <footer className="no-print mt-8 flex flex-col justify-between gap-3 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2"><School className="size-4" /><span>Team Automagic · LSH26-T005 · P08 Result Processing Engine</span></div>
                <div className="flex flex-wrap items-center gap-2"><Badge>React + Vite</Badge><Badge>Hono</Badge><Badge>Cloudflare D1</Badge><Badge>TypeScript engine</Badge></div>
              </footer>
            </>
          ) : null}
        </main>
      </div>
      <WalkthroughDialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen} onStart={() => changeView("overview")} />
      <StudentTraceDialog student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </div>
  );
}
