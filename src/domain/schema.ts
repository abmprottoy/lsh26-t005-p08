import { z } from "zod";

const codeSchema = z.string().trim().min(1).max(12);

export const practicalMarkSchema = z.object({
  theory: z.number().int().min(0).max(75),
  practical: z.number().int().min(0).max(25),
});

export const markSchema = z.union([
  z.literal("AB"),
  z.number().int().min(0).max(100),
  practicalMarkSchema,
]);

export const subjectSchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(1).max(100),
  practical: z.boolean(),
});

export const studentSchema = z.object({
  id: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(120),
  class: z.string().trim().min(1).max(80),
  optional: codeSchema,
  marks: z.record(codeSchema, markSchema),
});

export const caseSchema = z
  .object({
    case_id: z.string().trim().min(1).max(100),
    subjects: z.array(subjectSchema).min(7),
    compulsory: z.array(codeSchema).length(6),
    students: z.array(studentSchema).min(1),
  })
  .superRefine((input, context) => {
    const subjectByCode = new Map(input.subjects.map((subject) => [subject.code, subject]));
    if (subjectByCode.size !== input.subjects.length) {
      context.addIssue({
        code: "custom",
        path: ["subjects"],
        message: "Subject codes must be unique.",
      });
    }

    if (new Set(input.compulsory).size !== 6) {
      context.addIssue({
        code: "custom",
        path: ["compulsory"],
        message: "The six compulsory subject codes must be unique.",
      });
    }

    input.compulsory.forEach((code, index) => {
      if (!subjectByCode.has(code)) {
        context.addIssue({
          code: "custom",
          path: ["compulsory", index],
          message: `Unknown subject code: ${code}.`,
        });
      }
    });

    const seenStudentIds = new Set<string>();
    input.students.forEach((student, studentIndex) => {
      if (seenStudentIds.has(student.id)) {
        context.addIssue({
          code: "custom",
          path: ["students", studentIndex, "id"],
          message: `Duplicate student id: ${student.id}.`,
        });
      }
      seenStudentIds.add(student.id);

      if (!subjectByCode.has(student.optional)) {
        context.addIssue({
          code: "custom",
          path: ["students", studentIndex, "optional"],
          message: `Unknown optional subject code: ${student.optional}.`,
        });
      }
      if (input.compulsory.includes(student.optional)) {
        context.addIssue({
          code: "custom",
          path: ["students", studentIndex, "optional"],
          message: "The optional subject cannot also be compulsory.",
        });
      }

      const expectedCodes = [...input.compulsory, student.optional];
      const markCodes = Object.keys(student.marks);
      if (
        markCodes.length !== 7 ||
        expectedCodes.some((code) => !Object.hasOwn(student.marks, code))
      ) {
        context.addIssue({
          code: "custom",
          path: ["students", studentIndex, "marks"],
          message: "Marks must contain exactly the six compulsory subjects and the student's optional subject.",
        });
      }

      markCodes.forEach((code) => {
        const subject = subjectByCode.get(code);
        const mark = student.marks[code];
        if (!subject || mark === undefined || mark === "AB") return;

        if (subject.practical && typeof mark === "number") {
          context.addIssue({
            code: "custom",
            path: ["students", studentIndex, "marks", code],
            message: `${code} requires separate theory and practical marks.`,
          });
        }
        if (!subject.practical && typeof mark === "object") {
          context.addIssue({
            code: "custom",
            path: ["students", studentIndex, "marks", code],
            message: `${code} requires one whole mark out of 100.`,
          });
        }
      });
    });
  });

export const fixtureSchema = z.object({
  problem_id: z.literal("P08").optional(),
  schema_version: z.union([z.string(), z.number()]).optional(),
  format_note: z.string().optional(),
  cases: z.array(caseSchema).min(1),
});

export type ParsedCase = z.infer<typeof caseSchema>;
