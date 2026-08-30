import writeExcelFile from "write-excel-file/node";
import { describe, expect, it } from "vitest";
import publishedFixture from "../../../public/P08_school_results_public.json";
import { evaluateCase } from "../../domain/evaluate-case";
import { fixtureSchema } from "../../domain/schema";
import { buildExportBaseName, buildExportPayload, buildWorkbookSheets, createJsonBlob, createPdfBlob } from "./export-results";

const fixture = fixtureSchema.parse(publishedFixture);
const evaluation = evaluateCase(fixture.cases[0]!);
const exportedAt = "2026-08-30T12:00:00.000Z";

describe("result exports", () => {
  it("builds a complete, versioned JSON package", async () => {
    const blob = createJsonBlob(evaluation, "Built-in sample", exportedAt);
    const decoded = JSON.parse(await blob.text()) as ReturnType<typeof buildExportPayload>;

    expect(decoded.schemaVersion).toBe("1.0");
    expect(decoded.exportedAt).toBe(exportedAt);
    expect(decoded.resultSet.caseId).toBe(evaluation.caseId);
    expect(decoded.resultSet.students).toHaveLength(evaluation.students.length);
  });

  it("creates a real multi-sheet Excel workbook", async () => {
    const sheets = buildWorkbookSheets(evaluation, "Built-in sample", exportedAt);
    const buffer = await writeExcelFile(sheets, { fontFamily: "Arial", fontSize: 10 }).toBuffer();

    expect(sheets.map((sheet) => sheet.sheet)).toEqual(["Overview", "Students", "Subject results", "Review list"]);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
    expect(buffer.byteLength).toBeGreaterThan(5_000);
  });

  it("creates a valid multi-page PDF report", async () => {
    const blob = await createPdfBlob(evaluation, "Built-in sample", exportedAt);
    const signature = new TextDecoder().decode((await blob.arrayBuffer()).slice(0, 4));

    expect(signature).toBe("%PDF");
    expect(blob.size).toBeGreaterThan(5_000);
  });

  it("uses a portable result-set and date based file name", () => {
    expect(buildExportBaseName(evaluation, new Date(exportedAt))).toBe("shikkhacheck-pub-01-2026-08-30");
  });
});
