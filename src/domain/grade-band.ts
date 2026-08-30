export interface GradeBand {
  minimum: number;
  maximum: number;
  gradePoint: number;
  letterGrade: string;
}

const gradeBands: GradeBand[] = [
  { minimum: 80, maximum: 100, gradePoint: 5, letterGrade: "A+" },
  { minimum: 70, maximum: 79, gradePoint: 4, letterGrade: "A" },
  { minimum: 60, maximum: 69, gradePoint: 3.5, letterGrade: "A-" },
  { minimum: 50, maximum: 59, gradePoint: 3, letterGrade: "B" },
  { minimum: 40, maximum: 49, gradePoint: 2, letterGrade: "C" },
  { minimum: 33, maximum: 39, gradePoint: 1, letterGrade: "D" },
  { minimum: 0, maximum: 32, gradePoint: 0, letterGrade: "F" },
];

export function getGradeBand(mark: number): GradeBand {
  const band = gradeBands.find(({ minimum, maximum }) => mark >= minimum && mark <= maximum);
  if (!band) throw new RangeError(`Mark ${mark} is outside the supported range 0-100.`);
  return band;
}

export function getFinalLetterGrade(gpa: number, failed: boolean): string {
  if (failed) return "F";
  if (gpa === 5) return "A+";
  if (gpa >= 4) return "A";
  if (gpa >= 3.5) return "A-";
  if (gpa >= 3) return "B";
  if (gpa >= 2) return "C";
  return "D";
}
