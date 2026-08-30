import {
  BarChart3,
  BookOpenCheck,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  Database,
  Download,
  FileCheck2,
  Gauge,
  HelpCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export type DashboardView = "overview" | "results" | "checks" | "analytics" | "ai" | "export" | "history";

interface AppSidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  checkCount: number;
  sourceLabel: string;
  collapsed?: boolean;
  onOpenWalkthrough: () => void;
  onNavigate?: () => void;
}

const navigation = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "results", label: "Student results", icon: FileCheck2 },
  { id: "checks", label: "Checking lists", icon: ClipboardCheck },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ai", label: "Ask ShikkhaCheck", icon: Sparkles },
  { id: "export", label: "Export results", icon: Download },
  { id: "history", label: "Cloud saves", icon: Database },
] satisfies Array<{ id: DashboardView; label: string; icon: typeof Gauge }>;

interface SidebarActionProps {
  label: string;
  collapsed: boolean;
  children: ReactNode;
}

function SidebarAction({ label, collapsed, children }: SidebarActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className={collapsed ? "" : "hidden"}>{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({
  activeView,
  onViewChange,
  checkCount,
  sourceLabel,
  collapsed = false,
  onOpenWalkthrough,
  onNavigate,
}: AppSidebarProps) {
  const navigate = (view: DashboardView) => {
    onViewChange(view);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      <div className={`flex h-16 items-center border-b border-slate-200 dark:border-zinc-700 ${collapsed ? "justify-center px-2" : "gap-3 px-4"}`}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm dark:bg-emerald-500 dark:text-zinc-950">
          <BookOpenCheck className="size-[18px]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-[-0.02em] text-slate-950 dark:text-white">ShikkhaCheck</p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">by Team Automagic</p>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
        {!collapsed && <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</p>}
        <nav className={`${collapsed ? "" : "mt-2"} space-y-1`} aria-label="Dashboard navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <SidebarAction key={item.id} label={item.label} collapsed={collapsed}>
                <button
                  type="button"
                  onClick={() => navigate(item.id)}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  className={
                    `group relative flex h-10 w-full items-center rounded-lg text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${collapsed ? "justify-center px-0" : "gap-3 px-3"} ` +
                    (active
                      ? "bg-slate-950 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white")
                  }
                >
                  <Icon className={`size-4 shrink-0 ${active ? "text-emerald-400 dark:text-emerald-600" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`} />
                  {!collapsed && <span className="min-w-0 flex-1 truncate whitespace-nowrap">{item.label}</span>}
                  {item.id === "checks" && checkCount > 0 ? (
                    collapsed ? (
                      <span className="absolute right-1 top-1 size-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-950" />
                    ) : (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/15 text-white dark:bg-slate-950/10 dark:text-slate-950" : "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"}`}>{checkCount}</span>
                    )
                  ) : !collapsed && active ? <ChevronRight className="size-3.5 text-slate-500" /> : null}
                </button>
              </SidebarAction>
            );
          })}
        </nav>

        <div className={`mt-6 border-t border-slate-200 pt-4 dark:border-zinc-700 ${collapsed ? "" : "px-0"}`}>
          {!collapsed && <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Help</p>}
          <SidebarAction label="Quick walkthrough" collapsed={collapsed}>
            <button
              type="button"
              onClick={onOpenWalkthrough}
              aria-label="Open quick walkthrough"
              className={`mt-1 flex h-10 w-full items-center rounded-lg text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}
            >
              <HelpCircle className="size-4 shrink-0 text-slate-400" />
              {!collapsed && <span className="min-w-0 flex-1 truncate whitespace-nowrap text-left">Quick walkthrough</span>}
            </button>
          </SidebarAction>
        </div>

        {!collapsed && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              Explainable verification
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Every final grade links back to its marks and the exact rule applied.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5"><Badge>P08</Badge><Badge variant="success">25 verified scenarios</Badge></div>
          </div>
        )}
      </div>

      <div className={`border-t border-slate-200 dark:border-zinc-700 ${collapsed ? "p-2" : "p-3"}`}>
        {collapsed ? (
          <SidebarAction label={sourceLabel} collapsed><div className="flex h-10 items-center justify-center text-emerald-600 dark:text-emerald-400"><Cloud className="size-4" /><span className="sr-only">{sourceLabel}</span></div></SidebarAction>
        ) : (
          <div className="rounded-lg px-2 py-2"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Current data</p><p className="mt-1 truncate text-xs font-medium text-slate-700 dark:text-slate-300" title={sourceLabel}>{sourceLabel}</p></div>
        )}
      </div>
    </div>
  );
}

export function SidebarFrame({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  return (
    <aside className={`no-print fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 transition-[width] duration-200 dark:border-zinc-700 lg:block ${collapsed ? "w-[68px]" : "w-[264px]"}`}>
      {children}
    </aside>
  );
}
