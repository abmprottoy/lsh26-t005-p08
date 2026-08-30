import { ChevronRight, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { CaseEvaluation, StudentEvaluation } from "../../domain/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { DataPagination } from "./ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ResultTableProps {
  evaluation: CaseEvaluation;
  onSelectStudent: (student: StudentEvaluation) => void;
}

function resultVariant(letter: string) {
  if (letter === "F") return "danger" as const;
  if (letter === "A+") return "success" as const;
  if (letter === "A" || letter === "A-") return "info" as const;
  return "neutral" as const;
}

export function ResultTable({ evaluation, onSelectStudent }: ResultTableProps) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const flagMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const add = (studentId: string, flag: string) => {
      map.set(studentId, [...(map.get(studentId) ?? []), flag]);
    };
    evaluation.checkingLists.optional.forEach((entry) => add(entry.studentId, "Optional check"));
    evaluation.checkingLists.practicalFail.forEach((entry) => add(entry.studentId, "Practical fail"));
    evaluation.checkingLists.absent.forEach((entry) => add(entry.studentId, "Absent"));
    return map;
  }, [evaluation]);

  const filteredStudents = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return evaluation.students.filter((student) => {
      const matchesSearch =
        needle.length === 0 ||
        student.name.toLowerCase().includes(needle) ||
        student.id.toLowerCase().includes(needle);
      const matchesClass = classFilter === "all" || student.class === classFilter;
      const matchesResult =
        resultFilter === "all" ||
        (resultFilter === "pass" && student.finalLetterGrade !== "F") ||
        (resultFilter === "fail" && student.finalLetterGrade === "F");
      return matchesSearch && matchesClass && matchesResult;
    });
  }, [classFilter, evaluation.students, resultFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <h2 className="text-base font-semibold tracking-[-0.02em] text-slate-950">Processed results</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Select a student to inspect every number and rule in the calculation.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(210px,1fr)_150px_130px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Search students</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name or ID"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
            />
          </label>
          <Select value={classFilter} onValueChange={(value) => { setClassFilter(value); setPage(1); }}>
            <SelectTrigger className="h-9" aria-label="Filter by class">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {evaluation.summary.classes.map((className) => (
                <SelectItem key={className} value={className}>{className}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resultFilter} onValueChange={(value) => { setResultFilter(value); setPage(1); }}>
            <SelectTrigger className="h-9" aria-label="Filter by result">
              <SelectValue placeholder="All results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="pass">Passed</SelectItem>
              <SelectItem value="fail">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <th className="px-5 py-3.5">Student</th>
              <th className="px-4 py-3.5">Class</th>
              <th className="px-4 py-3.5 text-right">Uncancelled</th>
              <th className="px-4 py-3.5 text-right">Final GPA</th>
              <th className="px-4 py-3.5">Grade</th>
              <th className="px-4 py-3.5">Review flags</th>
              <th className="px-5 py-3.5 text-right">Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleStudents.map((student) => {
              const flags = flagMap.get(student.id) ?? [];
              return (
                <tr key={student.id} className="group bg-white transition hover:bg-slate-50/80">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">{student.name}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-400">{student.id}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{student.class}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-slate-500">
                    {student.uncancelledGpa.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-950">
                    {student.finalGpa.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={resultVariant(student.finalLetterGrade)}>
                      {student.finalLetterGrade}
                    </Badge>
                  </td>
                  <td className="max-w-[250px] px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {student.overrideApplied && <Badge variant="danger">Compulsory fail</Badge>}
                      {flags.map((flag) => (
                        <Badge key={flag} variant={flag === "Absent" ? "warning" : "neutral"}>
                          {flag}
                        </Badge>
                      ))}
                      {!student.overrideApplied && flags.length === 0 && (
                        <span className="text-sm text-slate-400">No flags</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectStudent(student)}
                      aria-label={"Open calculation trace for " + student.name}
                    >
                      Inspect
                      <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredStudents.length === 0 && (
        <div className="px-5 py-14 text-center">
          <p className="font-semibold text-slate-700">No students match these filters.</p>
          <p className="mt-1 text-sm text-slate-500">Try a different name, class, or result status.</p>
        </div>
      )}
      <DataPagination
        page={currentPage}
        pageCount={pageCount}
        total={filteredStudents.length}
        pageSize={pageSize}
        onPageChange={setPage}
        itemLabel="students"
        className="border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-800/60"
      />
    </Card>
  );
}
