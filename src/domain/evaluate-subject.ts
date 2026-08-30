import { getGradeBand } from "./grade-band";
import type { MarkInput, SubjectEvaluation, SubjectInput } from "./types";

export function evaluateSubject(
  subject: SubjectInput,
  input: MarkInput,
  isOptional: boolean,
): SubjectEvaluation {
  if (input === "AB") {
    return {
      code: subject.code,
      name: subject.name,
      isOptional,
      isPractical: subject.practical,
      input,
      markDisplay: "AB",
      total: null,
      normalBandGradePoint: 0,
      gradePoint: 0,
      letterGrade: "F",
      failed: true,
      absent: true,
      componentChecks: {},
      rules: [
        {
          rule: "absence",
          label: "Absent mark",
          actual: "AB",
          required: "A submitted mark",
          passed: false,
        },
      ],
      explanation: `${subject.code} is marked AB, so its grade point is 0.${
        isOptional
          ? " Because it is optional, the absence does not fail the overall result."
          : " Because it is compulsory, the overall result is F."
      }`,
    };
  }

  if (subject.practical) {
    if (typeof input === "number") {
      throw new TypeError(`${subject.code} requires separate theory and practical marks.`);
    }
    const total = input.theory + input.practical;
    const band = getGradeBand(total);
    const theoryPassed = input.theory >= 25;
    const practicalPassed = input.practical >= 8;
    const failed = !theoryPassed || !practicalPassed;
    const failureReasons = [
      !theoryPassed ? `Theory ${input.theory}/75 is below the required 25/75.` : null,
      !practicalPassed ? `Practical ${input.practical}/25 is below the required 8/25.` : null,
    ].filter((reason): reason is string => reason !== null);

    return {
      code: subject.code,
      name: subject.name,
      isOptional,
      isPractical: true,
      input,
      markDisplay: `${input.theory} + ${input.practical} = ${total}`,
      total,
      normalBandGradePoint: band.gradePoint,
      gradePoint: failed ? 0 : band.gradePoint,
      letterGrade: failed ? "F" : band.letterGrade,
      failed,
      absent: false,
      componentChecks: {
        theory: { actual: input.theory, required: 25, passed: theoryPassed },
        practical: { actual: input.practical, required: 8, passed: practicalPassed },
      },
      rules: [
        {
          rule: "theory_minimum",
          label: "Theory component minimum",
          actual: input.theory,
          required: "At least 25 out of 75",
          passed: theoryPassed,
        },
        {
          rule: "practical_minimum",
          label: "Practical component minimum",
          actual: input.practical,
          required: "At least 8 out of 25",
          passed: practicalPassed,
        },
        {
          rule: "grade_band",
          label: "Total mark grade band",
          actual: total,
          required: `${band.minimum}-${band.maximum} produces GP ${band.gradePoint.toFixed(1)}`,
          passed: !failed,
        },
      ],
      explanation: failed
        ? `${failureReasons.join(" ")} The subject grade point is therefore 0, even though total ${total} would normally produce GP ${band.gradePoint.toFixed(1)}.`
        : `Theory ${input.theory}/75 and practical ${input.practical}/25 both pass. Total ${total} falls in the ${band.minimum}-${band.maximum} band, producing GP ${band.gradePoint.toFixed(1)}.`,
    };
  }

  if (typeof input !== "number") {
    throw new TypeError(`${subject.code} requires one whole mark out of 100.`);
  }
  const band = getGradeBand(input);
  const failed = band.gradePoint === 0;
  return {
    code: subject.code,
    name: subject.name,
    isOptional,
    isPractical: false,
    input,
    markDisplay: String(input),
    total: input,
    normalBandGradePoint: band.gradePoint,
    gradePoint: band.gradePoint,
    letterGrade: band.letterGrade,
    failed,
    absent: false,
    componentChecks: {},
    rules: [
      {
        rule: "grade_band",
        label: "Whole-mark grade band",
        actual: input,
        required: `${band.minimum}-${band.maximum} produces GP ${band.gradePoint.toFixed(1)}`,
        passed: !failed,
      },
    ],
    explanation: failed
      ? `Mark ${input}/100 is below the pass mark of 33, so the subject grade point is 0.`
      : `Mark ${input}/100 falls in the ${band.minimum}-${band.maximum} band, producing GP ${band.gradePoint.toFixed(1)}.`,
  };
}
