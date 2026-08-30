import { z } from "zod";
import type { CaseEvaluation, StudentEvaluation } from "../domain/types";

export const aiContextModeSchema = z.enum(["smart", "summary", "students", "reviews", "full"]);
export type AiContextMode = z.infer<typeof aiContextModeSchema>;

const compactStudentSchema = z.object({
  id: z.string().max(50),
  name: z.string().max(120),
  class: z.string().max(80),
  finalGpa: z.number(),
  uncancelledGpa: z.number(),
  grade: z.string().max(10),
  status: z.enum(["passed", "failed"]),
  reviewFlags: z.array(z.string().max(60)).max(5),
});

const detailedStudentSchema = compactStudentSchema.extend({
  optionalSubjectCode: z.string().max(12),
  compulsoryFailures: z.array(z.object({ subjectCode: z.string().max(12), subjectName: z.string().max(100), reason: z.string().max(300) })).max(7),
  subjects: z.array(z.object({
    code: z.string().max(12),
    name: z.string().max(100),
    role: z.enum(["compulsory", "optional"]),
    markUsed: z.string().max(60),
    gradePoint: z.number(),
    grade: z.string().max(10),
    failed: z.boolean(),
    absent: z.boolean(),
    explanation: z.string().max(500),
  })).max(10),
});

const checkingEntrySchema = z.object({
  studentId: z.string().max(50),
  studentName: z.string().max(120),
  class: z.string().max(80),
  reasons: z.array(z.string().max(300)).max(10),
});

export const aiResultContextSchema = z.object({
  mode: aiContextModeSchema,
  source: z.string().max(240),
  resultSet: z.string().max(100),
  summary: z.object({
    studentCount: z.number().int().nonnegative(),
    classCount: z.number().int().nonnegative(),
    passed: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    passRate: z.number(),
    averageGpa: z.number(),
    needsReview: z.number().int().nonnegative(),
    gradeDistribution: z.record(z.string(), z.number().int().nonnegative()),
  }),
  classes: z.array(z.object({
    className: z.string().max(80),
    studentCount: z.number().int().nonnegative(),
    passed: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    passRate: z.number(),
    averageGpa: z.number(),
  })).max(20),
  subjectPressure: z.array(z.object({ subjectCode: z.string().max(12), subjectName: z.string().max(100), failures: z.number().int().nonnegative() })).max(30),
  students: z.array(compactStudentSchema).max(250).optional(),
  checkingLists: z.object({
    optional: z.array(checkingEntrySchema).max(250),
    practicalFail: z.array(checkingEntrySchema).max(250),
    absent: z.array(checkingEntrySchema).max(250),
  }).optional(),
  detailedStudents: z.array(detailedStudentSchema).max(250).optional(),
}).strict();

export type AiResultContext = z.infer<typeof aiResultContextSchema>;

function flagsFor(student: StudentEvaluation) {
  const flags: string[] = [];
  if (student.compulsoryFailures.length > 0) flags.push("Compulsory subject failed");
  if (student.optionalGradePoint <= 2) flags.push("Optional subject needs review");
  if (student.subjects.some((subject) => subject.isPractical && subject.failed)) flags.push("Practical component failed");
  if (student.subjects.some((subject) => subject.absent)) flags.push("Absent mark present");
  return flags;
}

function compactStudent(student: StudentEvaluation) {
  return {
    id: student.id,
    name: student.name,
    class: student.class,
    finalGpa: student.finalGpa,
    uncancelledGpa: student.uncancelledGpa,
    grade: student.finalLetterGrade,
    status: student.overrideApplied ? "failed" as const : "passed" as const,
    reviewFlags: flagsFor(student),
  };
}

function detailedStudent(student: StudentEvaluation) {
  return {
    ...compactStudent(student),
    optionalSubjectCode: student.optionalSubjectCode,
    compulsoryFailures: student.compulsoryFailures,
    subjects: student.subjects.map((subject) => ({
      code: subject.code,
      name: subject.name,
      role: subject.isOptional ? "optional" as const : "compulsory" as const,
      markUsed: subject.markDisplay,
      gradePoint: subject.gradePoint,
      grade: subject.letterGrade,
      failed: subject.failed,
      absent: subject.absent,
      explanation: subject.explanation,
    })),
  };
}

function queryMatchesStudent(query: string, student: StudentEvaluation) {
  const normalized = query.toLocaleLowerCase();
  return normalized.includes(student.id.toLocaleLowerCase()) || normalized.includes(student.name.toLocaleLowerCase());
}

export function buildAiResultContext(evaluation: CaseEvaluation, source: string, mode: AiContextMode, query: string): AiResultContext {
  const base: AiResultContext = {
    mode,
    source,
    resultSet: evaluation.caseId,
    summary: {
      studentCount: evaluation.summary.studentCount,
      classCount: evaluation.summary.classCount,
      passed: evaluation.summary.passed,
      failed: evaluation.summary.failed,
      passRate: evaluation.summary.passRate,
      averageGpa: evaluation.summary.averageGpa,
      needsReview: evaluation.summary.checkRequired,
      gradeDistribution: evaluation.summary.gradeDistribution,
    },
    classes: evaluation.summary.classSummaries,
    subjectPressure: evaluation.summary.subjectFailureCounts,
  };

  if (mode === "summary") return base;

  if (mode === "students") return { ...base, students: evaluation.students.map(compactStudent) };

  if (mode === "reviews") {
    return {
      ...base,
      students: evaluation.students.filter((student) => flagsFor(student).length > 0).map(compactStudent),
      checkingLists: evaluation.checkingLists,
    };
  }

  if (mode === "full") {
    return {
      ...base,
      students: evaluation.students.map(compactStudent),
      checkingLists: evaluation.checkingLists,
      detailedStudents: evaluation.students.map(detailedStudent),
    };
  }

  const focusedStudents = evaluation.students.filter((student) => queryMatchesStudent(query, student)).slice(0, 8);
  return {
    ...base,
    students: evaluation.students.map(compactStudent),
    checkingLists: evaluation.checkingLists,
    detailedStudents: focusedStudents.map(detailedStudent),
  };
}
