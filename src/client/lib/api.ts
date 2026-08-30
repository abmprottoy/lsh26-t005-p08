import type { CaseEvaluation, CaseInput } from "../../domain/types";

export interface ApiIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly issues: ApiIssue[] = [],
    public readonly status = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json().catch(() => null)) as
    | { error?: string; issues?: ApiIssue[] }
    | T
    | null;
  if (!response.ok) {
    const errorBody = body as { error?: string; issues?: ApiIssue[] } | null;
    throw new ApiError(
      errorBody?.error ?? "Request failed with status " + response.status + ".",
      errorBody?.issues ?? [],
      response.status,
    );
  }
  return body as T;
}

export function evaluateCaseRequest(input: CaseInput) {
  return requestJson<CaseEvaluation>("/api/evaluate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function saveRunRequest(input: CaseInput) {
  return requestJson<{ id: string; createdAt: string; result: CaseEvaluation }>("/api/runs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export interface SavedRun {
  id: string;
  case_id: string;
  student_count: number;
  created_at: string;
}

export function listRunsRequest() {
  return requestJson<{ runs: SavedRun[] }>("/api/runs");
}

export function getRunRequest(id: string) {
  return requestJson<{
    id: string;
    caseId: string;
    studentCount: number;
    createdAt: string;
    source: CaseInput;
    result: CaseEvaluation;
  }>("/api/runs/" + encodeURIComponent(id));
}
