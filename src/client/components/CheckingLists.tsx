import { ClipboardCheck, FlaskConical, UserRoundX } from "lucide-react";
import { useState } from "react";
import type {
  CaseEvaluation,
  CheckingListEntry,
  StudentEvaluation,
} from "../../domain/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { DataPagination } from "./ui/pagination";

interface CheckingListsProps {
  evaluation: CaseEvaluation;
  onSelectStudent: (student: StudentEvaluation) => void;
}

interface ListPanelProps {
  title: string;
  criterion: string;
  entries: CheckingListEntry[];
  icon: typeof ClipboardCheck;
  tone: "amber" | "coral" | "blue";
  onSelect: (studentId: string) => void;
}

const toneStyles = {
  amber: "bg-amber-50 text-amber-700",
  coral: "bg-rose-50 text-rose-700",
  blue: "bg-sky-50 text-sky-700",
};

function ListPanel({ title, criterion, entries, icon: Icon, tone, onSelect }: ListPanelProps) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleEntries = entries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="min-h-[100px] border-b border-slate-200 dark:border-zinc-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={"flex size-10 shrink-0 items-center justify-center rounded-lg " + toneStyles[tone]}>
              <Icon className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">{title}</h3>
              <p className="mt-1 min-h-10 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">{criterion}</p>
            </div>
          </div>
          <Badge variant={entries.length > 0 ? "warning" : "success"}>{entries.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        {visibleEntries.map((entry) => (
          <div
            key={entry.studentId}
            className="rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:bg-slate-50/70"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{entry.studentName}</p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                  {entry.studentId} · {entry.class}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onSelect(entry.studentId)}>
                Trace
              </Button>
            </div>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-500">
              {entry.reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="py-10 text-center">
            <ClipboardCheck className="mx-auto size-7 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No students on this list</p>
          </div>
        )}
      </CardContent>
      {entries.length > pageSize && (
        <DataPagination
          page={currentPage}
          pageCount={pageCount}
          total={entries.length}
          pageSize={pageSize}
          onPageChange={setPage}
          itemLabel="students"
          className="border-t border-slate-200 px-4 py-3 dark:border-zinc-700"
        />
      )}
    </Card>
  );
}

export function CheckingLists({ evaluation, onSelectStudent }: CheckingListsProps) {
  const selectById = (studentId: string) => {
    const student = evaluation.students.find((item) => item.id === studentId);
    if (student) onSelectStudent(student);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">Pre-publication checks</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lists are independent. A student can correctly appear in more than one.
          </p>
        </div>
        <Badge variant="dark">{evaluation.summary.checkRequired} unique students</Badge>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ListPanel
          key={`optional-${evaluation.caseId}`}
          title="Optional subject check"
          criterion="Every optional GP of 2.0 or below, including optional AB."
          entries={evaluation.checkingLists.optional}
          icon={ClipboardCheck}
          tone="amber"
          onSelect={selectById}
        />
        <ListPanel
          key={`practical-${evaluation.caseId}`}
          title="Practical component fail"
          criterion="Every practical component below 8/25 in any subject."
          entries={evaluation.checkingLists.practicalFail}
          icon={FlaskConical}
          tone="coral"
          onSelect={selectById}
        />
        <ListPanel
          key={`absent-${evaluation.caseId}`}
          title="Absent marks"
          criterion="Every student with AB in any compulsory or optional subject."
          entries={evaluation.checkingLists.absent}
          icon={UserRoundX}
          tone="blue"
          onSelect={selectById}
        />
      </div>
    </div>
  );
}
