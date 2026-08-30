export type AbsentMark = "AB";

export interface PracticalMark {
  theory: number;
  practical: number;
}

export type MarkInput = number | PracticalMark | AbsentMark;

export interface SubjectInput {
  code: string;
  name: string;
  practical: boolean;
}

export interface StudentInput {
  id: string;
  name: string;
  class: string;
  optional: string;
  marks: Record<string, MarkInput>;
}

export interface CaseInput {
  case_id: string;
  subjects: SubjectInput[];
  compulsory: string[];
  students: StudentInput[];
}

export interface RuleResult {
  rule: "absence" | "theory_minimum" | "practical_minimum" | "grade_band";
  label: string;
  actual: number | "AB";
  required: string;
  passed: boolean;
}

export interface ComponentCheck {
  actual: number;
  required: number;
  passed: boolean;
}

export interface SubjectEvaluation {
  code: string;
  name: string;
  isOptional: boolean;
  isPractical: boolean;
  input: MarkInput;
  markDisplay: string;
  total: number | null;
  normalBandGradePoint: number;
  gradePoint: number;
  letterGrade: string;
  failed: boolean;
  absent: boolean;
  componentChecks: {
    theory?: ComponentCheck;
    practical?: ComponentCheck;
  };
  rules: RuleResult[];
  explanation: string;
}

export interface CompulsoryFailure {
  subjectCode: string;
  subjectName: string;
  reason: string;
}

export interface StudentEvaluation {
  id: string;
  name: string;
  class: string;
  optionalSubjectCode: string;
  subjects: SubjectEvaluation[];
  compulsoryGradePointSum: number;
  optionalGradePoint: number;
  optionalBonus: number;
  divisor: 6;
  rawAverage: number;
  cappedGpa: number;
  uncancelledGpa: number;
  compulsoryFailures: CompulsoryFailure[];
  overrideApplied: boolean;
  finalGpa: number;
  finalLetterGrade: string;
}

export interface CheckingListEntry {
  studentId: string;
  studentName: string;
  class: string;
  reasons: string[];
}

export interface ClassSummary {
  className: string;
  studentCount: number;
  passed: number;
  failed: number;
  passRate: number;
  averageGpa: number;
}

export interface CaseEvaluation {
  caseId: string;
  students: StudentEvaluation[];
  checkingLists: {
    optional: CheckingListEntry[];
    practicalFail: CheckingListEntry[];
    absent: CheckingListEntry[];
  };
  summary: {
    studentCount: number;
    classCount: number;
    classes: string[];
    passed: number;
    failed: number;
    passRate: number;
    averageGpa: number;
    checkRequired: number;
    gradeDistribution: Record<string, number>;
    classSummaries: ClassSummary[];
    subjectFailureCounts: Array<{
      subjectCode: string;
      subjectName: string;
      failures: number;
    }>;
  };
}
