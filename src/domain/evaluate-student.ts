import { getFinalLetterGrade } from "./grade-band";
import { evaluateSubject } from "./evaluate-subject";
import type {
  CompulsoryFailure,
  StudentEvaluation,
  StudentInput,
  SubjectInput,
} from "./types";

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function evaluateStudent(
  student: StudentInput,
  subjects: SubjectInput[],
  compulsory: string[],
): StudentEvaluation {
  const subjectByCode = new Map(subjects.map((subject) => [subject.code, subject]));
  const evaluatedSubjects = [...compulsory, student.optional].map((code) => {
    const subject = subjectByCode.get(code);
    const mark = student.marks[code];
    if (!subject || mark === undefined) {
      throw new Error(`Missing subject or mark for ${student.id} / ${code}.`);
    }
    return evaluateSubject(subject, mark, code === student.optional);
  });

  const compulsoryResults = evaluatedSubjects.filter((result) => !result.isOptional);
  const optionalResult = evaluatedSubjects.find((result) => result.isOptional);
  if (!optionalResult) throw new Error(`Missing optional subject result for ${student.id}.`);

  const compulsoryGradePointSum = compulsoryResults.reduce(
    (sum, result) => sum + result.gradePoint,
    0,
  );
  const optionalBonus = Math.max(0, optionalResult.gradePoint - 2);
  const rawAverage = (compulsoryGradePointSum + optionalBonus) / 6;
  const cappedGpa = Math.min(5, rawAverage);

  const compulsoryFailures: CompulsoryFailure[] = compulsoryResults
    .filter((result) => result.failed)
    .map((result) => ({
      subjectCode: result.code,
      subjectName: result.name,
      reason: result.explanation,
    }));
  const overrideApplied = compulsoryFailures.length > 0;
  const finalGpa = overrideApplied ? 0 : round(cappedGpa, 2);

  return {
    id: student.id,
    name: student.name,
    class: student.class,
    optionalSubjectCode: student.optional,
    subjects: evaluatedSubjects,
    compulsoryGradePointSum,
    optionalGradePoint: optionalResult.gradePoint,
    optionalBonus,
    divisor: 6,
    rawAverage: round(rawAverage, 4),
    cappedGpa: round(cappedGpa, 2),
    uncancelledGpa: round(cappedGpa, 2),
    compulsoryFailures,
    overrideApplied,
    finalGpa,
    finalLetterGrade: getFinalLetterGrade(finalGpa, overrideApplied),
  };
}
