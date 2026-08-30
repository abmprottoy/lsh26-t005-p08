import type { CheckingListEntry, StudentEvaluation } from "./types";

function toEntry(student: StudentEvaluation, reasons: string[]): CheckingListEntry {
  return {
    studentId: student.id,
    studentName: student.name,
    class: student.class,
    reasons,
  };
}

export function buildCheckingLists(students: StudentEvaluation[]) {
  const optional: CheckingListEntry[] = [];
  const practicalFail: CheckingListEntry[] = [];
  const absent: CheckingListEntry[] = [];

  students.forEach((student) => {
    const optionalResult = student.subjects.find((subject) => subject.isOptional);
    if (optionalResult && optionalResult.gradePoint <= 2) {
      optional.push(
        toEntry(student, [
          `${optionalResult.code} optional GP is ${optionalResult.gradePoint.toFixed(1)} (manual check threshold: 2.0 or below).`,
        ]),
      );
    }

    const practicalFailures = student.subjects
      .filter(
        (subject) =>
          subject.isPractical &&
          subject.componentChecks.practical !== undefined &&
          !subject.componentChecks.practical.passed,
      )
      .map(
        (subject) =>
          `${subject.code} practical ${subject.componentChecks.practical?.actual}/25 is below 8/25.`,
      );
    if (practicalFailures.length > 0) {
      practicalFail.push(toEntry(student, practicalFailures));
    }

    const absences = student.subjects
      .filter((subject) => subject.absent)
      .map((subject) => `${subject.code} is marked AB${subject.isOptional ? " (optional)" : " (compulsory)"}.`);
    if (absences.length > 0) {
      absent.push(toEntry(student, absences));
    }
  });

  return { optional, practicalFail, absent };
}
