import type { CaseEvaluation, StudentEvaluation } from "../../domain/types";
import type { Cell, SheetData } from "write-excel-file/browser";

export type ResultExportFormat = "pdf" | "excel" | "json";

export interface ResultExportPayload {
  schemaVersion: "1.0";
  exportedAt: string;
  source: string;
  resultSet: CaseEvaluation;
}

const headerCell = (value: string): Cell => ({
  value,
  fontWeight: "bold",
  backgroundColor: "#D1FAE5",
  textColor: "#065F46",
  align: "center",
  wrap: true,
});

const titleCell = (value: string, span: number): Cell => ({
  value,
  columnSpan: span,
  fontWeight: "bold",
  fontSize: 16,
  textColor: "#111827",
  height: 28,
});

const labelCell = (value: string): Cell => ({ value, fontWeight: "bold", textColor: "#475569" });

function reviewFlags(student: StudentEvaluation) {
  const flags: string[] = [];
  if (student.compulsoryFailures.length > 0) flags.push("Compulsory fail");
  if (student.optionalGradePoint <= 2) flags.push("Optional check");
  if (student.subjects.some((subject) => subject.isPractical && subject.failed)) flags.push("Practical fail");
  if (student.subjects.some((subject) => subject.absent)) flags.push("Absent mark");
  return flags.length > 0 ? flags.join(", ") : "No flags";
}

export function buildExportPayload(evaluation: CaseEvaluation, source: string, exportedAt = new Date().toISOString()): ResultExportPayload {
  return { schemaVersion: "1.0", exportedAt, source, resultSet: evaluation };
}

export function buildExportBaseName(evaluation: CaseEvaluation, date = new Date()) {
  const datePart = date.toISOString().slice(0, 10);
  const casePart = evaluation.caseId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `shikkhacheck-${casePart || "results"}-${datePart}`;
}

export function createJsonBlob(evaluation: CaseEvaluation, source: string, exportedAt?: string) {
  return new Blob([JSON.stringify(buildExportPayload(evaluation, source, exportedAt), null, 2)], {
    type: "application/json;charset=utf-8",
  });
}

export function buildWorkbookSheets(evaluation: CaseEvaluation, source: string, exportedAt = new Date().toISOString()) {
  const summary: SheetData = [
    [titleCell("ShikkhaCheck verified results", 4)],
    [labelCell("Result set"), evaluation.caseId, labelCell("Exported"), new Date(exportedAt)],
    [labelCell("Source"), { value: source, columnSpan: 3 }],
    [],
    [headerCell("Measure"), headerCell("Value"), headerCell("Measure"), headerCell("Value")],
    ["Students", evaluation.summary.studentCount, "Classes", evaluation.summary.classCount],
    ["Passed", evaluation.summary.passed, "Failed", evaluation.summary.failed],
    ["Pass rate", { value: evaluation.summary.passRate / 100, format: "0.0%" }, "Average GPA", { value: evaluation.summary.averageGpa, format: "0.00" }],
    ["Needs review", evaluation.summary.checkRequired, "Verified result set", evaluation.caseId],
    [],
    [headerCell("Class"), headerCell("Students"), headerCell("Passed"), headerCell("Pass rate")],
    ...evaluation.summary.classSummaries.map((item) => [
      item.className,
      item.studentCount,
      item.passed,
      { value: item.passRate / 100, format: "0.0%" },
    ] as Cell[]),
  ];

  const students: SheetData = [
    [headerCell("Student ID"), headerCell("Student name"), headerCell("Class"), headerCell("Uncancelled GPA"), headerCell("Final GPA"), headerCell("Grade"), headerCell("Status"), headerCell("Review flags")],
    ...evaluation.students.map((student) => [
      student.id,
      student.name,
      student.class,
      { value: student.uncancelledGpa, format: "0.00" },
      { value: student.finalGpa, format: "0.00" },
      student.finalLetterGrade,
      student.overrideApplied ? "Failed" : "Passed",
      reviewFlags(student),
    ] as Cell[]),
  ];

  const subjectResults: SheetData = [
    [headerCell("Student ID"), headerCell("Student name"), headerCell("Class"), headerCell("Subject code"), headerCell("Subject"), headerCell("Role"), headerCell("Mark used"), headerCell("Grade point"), headerCell("Grade"), headerCell("Decision")],
    ...evaluation.students.flatMap((student) => student.subjects.map((subject) => [
      student.id,
      student.name,
      student.class,
      subject.code,
      subject.name,
      subject.isOptional ? "Optional" : "Compulsory",
      subject.markDisplay,
      { value: subject.gradePoint, format: "0.0" },
      subject.letterGrade,
      subject.explanation,
    ] as Cell[])),
  ];

  const reviewList: SheetData = [
    [headerCell("Student ID"), headerCell("Student name"), headerCell("Class"), headerCell("Review reason")],
    ...evaluation.students
      .filter((student) => reviewFlags(student) !== "No flags")
      .map((student) => [student.id, student.name, student.class, reviewFlags(student)] as Cell[]),
  ];

  return [
    { data: summary, sheet: "Overview", columns: [{ width: 22 }, { width: 24 }, { width: 22 }, { width: 24 }], stickyRowsCount: 1, showGridLines: false },
    { data: students, sheet: "Students", columns: [{ width: 14 }, { width: 24 }, { width: 14 }, { width: 18 }, { width: 14 }, { width: 10 }, { width: 12 }, { width: 34 }], stickyRowsCount: 1 },
    { data: subjectResults, sheet: "Subject results", columns: [{ width: 14 }, { width: 24 }, { width: 14 }, { width: 14 }, { width: 22 }, { width: 14 }, { width: 18 }, { width: 14 }, { width: 10 }, { width: 70 }], stickyRowsCount: 1, orientation: "landscape" as const },
    { data: reviewList, sheet: "Review list", columns: [{ width: 14 }, { width: 24 }, { width: 14 }, { width: 48 }], stickyRowsCount: 1 },
  ];
}

export async function createExcelBlob(evaluation: CaseEvaluation, source: string, exportedAt?: string) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  return writeExcelFile(buildWorkbookSheets(evaluation, source, exportedAt), {
    fontFamily: "Arial",
    fontSize: 10,
  }).toBlob();
}

export async function createPdfBlob(evaluation: CaseEvaluation, source: string, exportedAt = new Date().toISOString()) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const document = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const width = document.internal.pageSize.getWidth();

  document.setFillColor(15, 23, 42);
  document.rect(0, 0, width, 78, "F");
  document.setTextColor(255, 255, 255);
  document.setFont("helvetica", "bold");
  document.setFontSize(19);
  document.text("ShikkhaCheck verified results", 36, 36);
  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  document.setTextColor(203, 213, 225);
  document.text(`${evaluation.caseId}  |  ${evaluation.summary.studentCount} students  |  ${evaluation.summary.classCount} classes`, 36, 55);
  document.text(`Source: ${source}`, width - 36, 55, { align: "right", maxWidth: 300 });

  document.setTextColor(15, 23, 42);
  document.setFont("helvetica", "bold");
  document.setFontSize(10);
  const measures = [
    ["Passed", String(evaluation.summary.passed)],
    ["Failed", String(evaluation.summary.failed)],
    ["Pass rate", `${evaluation.summary.passRate.toFixed(1)}%`],
    ["Average GPA", evaluation.summary.averageGpa.toFixed(2)],
    ["Needs review", String(evaluation.summary.checkRequired)],
  ];
  const metricWidth = (width - 72) / measures.length;
  measures.forEach(([label, value], index) => {
    const x = 36 + index * metricWidth;
    document.setFillColor(248, 250, 252);
    document.roundedRect(x, 94, metricWidth - 8, 46, 4, 4, "F");
    document.setTextColor(100, 116, 139);
    document.setFontSize(7.5);
    document.text(label!.toUpperCase(), x + 10, 110);
    document.setTextColor(15, 23, 42);
    document.setFontSize(15);
    document.text(value!, x + 10, 130);
  });

  autoTable(document, {
    startY: 158,
    head: [["Student ID", "Student", "Class", "Uncancelled GPA", "Final GPA", "Grade", "Status", "Review flags"]],
    body: evaluation.students.map((student) => [
      student.id,
      student.name,
      student.class,
      student.uncancelledGpa.toFixed(2),
      student.finalGpa.toFixed(2),
      student.finalLetterGrade,
      student.overrideApplied ? "Failed" : "Passed",
      reviewFlags(student),
    ]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 7.5, cellPadding: 4, textColor: [30, 41, 59], lineColor: [226, 232, 240], lineWidth: 0.5 },
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 58 }, 2: { cellWidth: 60 }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "center" }, 6: { halign: "center" } },
    margin: { left: 36, right: 36 },
  });

  const pageCount = document.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    document.setFont("helvetica", "normal");
    document.setFontSize(7.5);
    document.setTextColor(100, 116, 139);
    document.text(`Exported ${new Date(exportedAt).toLocaleString()}  ·  Page ${page} of ${pageCount}`, width - 36, document.internal.pageSize.getHeight() - 18, { align: "right" });
  }

  return document.output("blob");
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function downloadResults(format: ResultExportFormat, evaluation: CaseEvaluation, source: string) {
  const baseName = buildExportBaseName(evaluation);
  if (format === "json") {
    triggerDownload(createJsonBlob(evaluation, source), `${baseName}.json`);
    return;
  }
  if (format === "excel") {
    triggerDownload(await createExcelBlob(evaluation, source), `${baseName}.xlsx`);
    return;
  }
  triggerDownload(await createPdfBlob(evaluation, source), `${baseName}.pdf`);
}
