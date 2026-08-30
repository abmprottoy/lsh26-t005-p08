import { buildCheckingLists } from "./checking-lists";
import { evaluateStudent } from "./evaluate-student";
import type { CaseEvaluation, CaseInput, ClassSummary } from "./types";

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function evaluateCase(input: CaseInput): CaseEvaluation {
  const students = input.students.map((student) =>
    evaluateStudent(student, input.subjects, input.compulsory),
  );
  const checkingLists = buildCheckingLists(students);
  const passed = students.filter((student) => !student.overrideApplied).length;
  const failed = students.length - passed;
  const classes = [...new Set(students.map((student) => student.class))].sort();

  const checkRequiredIds = new Set(
    Object.values(checkingLists).flatMap((list) => list.map((entry) => entry.studentId)),
  );
  const gradeDistribution = students.reduce<Record<string, number>>((distribution, student) => {
    distribution[student.finalLetterGrade] = (distribution[student.finalLetterGrade] ?? 0) + 1;
    return distribution;
  }, { "A+": 0, A: 0, "A-": 0, B: 0, C: 0, D: 0, F: 0 });

  const classSummaries: ClassSummary[] = classes.map((className) => {
    const classStudents = students.filter((student) => student.class === className);
    const classPassed = classStudents.filter((student) => !student.overrideApplied).length;
    return {
      className,
      studentCount: classStudents.length,
      passed: classPassed,
      failed: classStudents.length - classPassed,
      passRate: round2((classPassed / classStudents.length) * 100),
      averageGpa: round2(
        classStudents.reduce((sum, student) => sum + student.finalGpa, 0) / classStudents.length,
      ),
    };
  });

  const subjectFailureCounts = input.subjects
    .map((subject) => ({
      subjectCode: subject.code,
      subjectName: subject.name,
      failures: students.reduce(
        (count, student) =>
          count + (student.subjects.some((result) => result.code === subject.code && result.failed) ? 1 : 0),
        0,
      ),
    }))
    .filter((subject) => subject.failures > 0)
    .sort((a, b) => b.failures - a.failures || a.subjectCode.localeCompare(b.subjectCode));

  return {
    caseId: input.case_id,
    students,
    checkingLists,
    summary: {
      studentCount: students.length,
      classCount: classes.length,
      classes,
      passed,
      failed,
      passRate: round2((passed / students.length) * 100),
      averageGpa: round2(students.reduce((sum, student) => sum + student.finalGpa, 0) / students.length),
      checkRequired: checkRequiredIds.size,
      gradeDistribution,
      classSummaries,
      subjectFailureCounts,
    },
  };
}
