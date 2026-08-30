import { describe, expect, it } from "vitest";
import publishedFixture from "../../../public/P08_school_results_public.json";
import { buildCheckingLists } from "../checking-lists";
import { evaluateCase } from "../evaluate-case";
import { evaluateStudent } from "../evaluate-student";
import { evaluateSubject } from "../evaluate-subject";
import { getGradeBand } from "../grade-band";
import { caseSchema, fixtureSchema } from "../schema";
import type { CaseInput, MarkInput, StudentInput, SubjectInput } from "../types";

const subjects: SubjectInput[] = [
  { code: "BAN", name: "Bangla", practical: false },
  { code: "ENG", name: "English", practical: false },
  { code: "MAT", name: "Mathematics", practical: false },
  { code: "PHY", name: "Physics", practical: true },
  { code: "CHE", name: "Chemistry", practical: true },
  { code: "BIO", name: "Biology", practical: true },
  { code: "REL", name: "Religion", practical: false },
  { code: "HMT", name: "Higher Mathematics", practical: true },
];

const compulsory = ["BAN", "ENG", "MAT", "PHY", "CHE", "BIO"];

function studentWith(overrides: Partial<Record<string, MarkInput>> = {}): StudentInput {
  return {
    id: "S001",
    name: "Boundary Student",
    class: "Class 9",
    optional: "REL",
    marks: {
      BAN: 80,
      ENG: 80,
      MAT: 80,
      PHY: { theory: 60, practical: 20 },
      CHE: { theory: 60, practical: 20 },
      BIO: { theory: 60, practical: 20 },
      REL: 80,
      ...overrides,
    },
  };
}

function caseWith(students: StudentInput[]): CaseInput {
  return {
    case_id: "TEST-01",
    subjects,
    compulsory,
    students,
  };
}

describe("grade bands", () => {
  it.each([
    [0, 0],
    [32, 0],
    [33, 1],
    [39, 1],
    [40, 2],
    [49, 2],
    [50, 3],
    [59, 3],
    [60, 3.5],
    [69, 3.5],
    [70, 4],
    [79, 4],
    [80, 5],
    [100, 5],
  ])("maps %i to GP %s", (mark, gradePoint) => {
    expect(getGradeBand(mark).gradePoint).toBe(gradePoint);
  });
});

describe("subject evaluation", () => {
  const physics = subjects.find((subject) => subject.code === "PHY")!;

  it("fails theory 24 even when practical passes", () => {
    const result = evaluateSubject(physics, { theory: 24, practical: 25 }, false);
    expect(result.total).toBe(49);
    expect(result.normalBandGradePoint).toBe(2);
    expect(result.gradePoint).toBe(0);
    expect(result.componentChecks.theory?.passed).toBe(false);
    expect(result.componentChecks.practical?.passed).toBe(true);
  });

  it("fails practical 7 even when theory passes", () => {
    const result = evaluateSubject(physics, { theory: 60, practical: 7 }, false);
    expect(result.total).toBe(67);
    expect(result.normalBandGradePoint).toBe(3.5);
    expect(result.gradePoint).toBe(0);
    expect(result.componentChecks.practical?.passed).toBe(false);
  });

  it("passes at the exact 25 theory and 8 practical minimums", () => {
    const result = evaluateSubject(physics, { theory: 25, practical: 8 }, false);
    expect(result.total).toBe(33);
    expect(result.gradePoint).toBe(1);
    expect(result.failed).toBe(false);
  });

  it("records both failed components instead of stopping at the first", () => {
    const result = evaluateSubject(physics, { theory: 24, practical: 7 }, false);
    expect(result.rules.filter((rule) => !rule.passed)).toHaveLength(3);
    expect(result.explanation).toContain("Theory 24/75");
    expect(result.explanation).toContain("Practical 7/25");
  });

  it("keeps absence distinct from a numeric zero", () => {
    const bangla = subjects[0]!;
    const absent = evaluateSubject(bangla, "AB", false);
    const zero = evaluateSubject(bangla, 0, false);
    expect(absent.absent).toBe(true);
    expect(absent.markDisplay).toBe("AB");
    expect(zero.absent).toBe(false);
    expect(zero.markDisplay).toBe("0");
    expect(absent.explanation).not.toBe(zero.explanation);
  });
});

describe("student GPA", () => {
  it("adds only optional GP above 2 and keeps the divisor at 6", () => {
    const student = studentWith({
      BAN: 70,
      ENG: 70,
      MAT: 70,
      PHY: { theory: 50, practical: 20 },
      CHE: { theory: 50, practical: 20 },
      BIO: { theory: 50, practical: 20 },
      REL: 80,
    });
    const result = evaluateStudent(student, subjects, compulsory);
    expect(result.compulsoryGradePointSum).toBe(24);
    expect(result.optionalGradePoint).toBe(5);
    expect(result.optionalBonus).toBe(3);
    expect(result.divisor).toBe(6);
    expect(result.finalGpa).toBe(4.5);
  });

  it.each([
    [32, 0, 0],
    [40, 2, 0],
    [50, 3, 1],
    [80, 5, 3],
  ])("turns optional mark %i into GP %s and bonus %s", (mark, gradePoint, bonus) => {
    const result = evaluateStudent(studentWith({ REL: mark }), subjects, compulsory);
    expect(result.optionalGradePoint).toBe(gradePoint);
    expect(result.optionalBonus).toBe(bonus);
  });

  it("caps an otherwise higher GPA at 5.00", () => {
    const result = evaluateStudent(studentWith(), subjects, compulsory);
    expect(result.rawAverage).toBe(5.5);
    expect(result.cappedGpa).toBe(5);
    expect(result.finalGpa).toBe(5);
    expect(result.finalLetterGrade).toBe("A+");
  });

  it("preserves a 4.67 uncancelled average while a compulsory fail forces 0.00/F", () => {
    const result = evaluateStudent(studentWith({ MAT: 32 }), subjects, compulsory);
    expect(result.uncancelledGpa).toBe(4.67);
    expect(result.compulsoryFailures.map((failure) => failure.subjectCode)).toEqual(["MAT"]);
    expect(result.overrideApplied).toBe(true);
    expect(result.finalGpa).toBe(0);
    expect(result.finalLetterGrade).toBe("F");
  });

  it("does not let an absent optional subject fail the overall result", () => {
    const result = evaluateStudent(studentWith({ REL: "AB" }), subjects, compulsory);
    expect(result.optionalGradePoint).toBe(0);
    expect(result.optionalBonus).toBe(0);
    expect(result.overrideApplied).toBe(false);
    expect(result.finalLetterGrade).toBe("A+");
  });
});

describe("checking lists and case summary", () => {
  it("allows one student to appear on all three clarified checking lists", () => {
    const student = studentWith({
      BIO: "AB",
      PHY: { theory: 60, practical: 7 },
      REL: "AB",
    });
    const evaluated = evaluateStudent(student, subjects, compulsory);
    const lists = buildCheckingLists([evaluated]);
    expect(lists.optional.map((entry) => entry.studentId)).toEqual(["S001"]);
    expect(lists.practicalFail.map((entry) => entry.studentId)).toEqual(["S001"]);
    expect(lists.absent.map((entry) => entry.studentId)).toEqual(["S001"]);
  });

  it("does not put a theory-only failure on the practical-fail list", () => {
    const evaluated = evaluateStudent(
      studentWith({ PHY: { theory: 20, practical: 15 } }),
      subjects,
      compulsory,
    );
    expect(buildCheckingLists([evaluated]).practicalFail).toHaveLength(0);
  });

  it("counts unique students requiring checks rather than list memberships", () => {
    const first = studentWith({ BIO: "AB", REL: "AB" });
    const second = { ...studentWith({ REL: 40 }), id: "S002", name: "Second Student" };
    const result = evaluateCase(caseWith([first, second]));
    expect(result.checkingLists.optional).toHaveLength(2);
    expect(result.checkingLists.absent).toHaveLength(1);
    expect(result.summary.checkRequired).toBe(2);
  });
});

describe("fixture validation", () => {
  it("rejects a practical subject supplied as one whole mark", () => {
    const invalid = caseWith([studentWith({ PHY: 70 })]);
    const result = caseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("separate theory"))).toBe(true);
    }
  });

  it("validates and evaluates all 25 published cases", () => {
    const fixture = fixtureSchema.parse(publishedFixture);
    expect(fixture.cases).toHaveLength(25);
    for (const input of fixture.cases) {
      const result = evaluateCase(input);
      expect(result.students).toHaveLength(input.students.length);
      expect(result.summary.classCount).toBe(2);
      expect(result.students.every((student) => Number.isFinite(student.finalGpa))).toBe(true);
    }
  });
});
