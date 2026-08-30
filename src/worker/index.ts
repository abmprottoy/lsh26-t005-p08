import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, createUIMessageStreamResponse, safeValidateUIMessages, streamText, toUIMessageStream, type UIMessage } from "ai";
import { Hono } from "hono";
import { aiResultContextSchema } from "../ai/context";
import { buildShikkhaCheckInstructions } from "../ai/system-prompt";
import { evaluateCase } from "../domain/evaluate-case";
import { caseSchema } from "../domain/schema";

const app = new Hono<{ Bindings: Env }>();
const maxJsonBytes = 2_000_000;
const maxAiRequestBytes = 900_000;
const maxAiMessages = 24;
const maxAiTextCharacters = 60_000;

interface RunListRow {
  id: string;
  case_id: string;
  student_count: number;
  created_at: string;
}

interface RunDetailRow extends RunListRow {
  source_json: string;
  result_json: string;
}

function parseContentLength(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function readBoundedJson(request: Request, maxBytes: number) {
  const contentLength = parseContentLength(request.headers.get("content-length") ?? undefined);
  if (contentLength !== null && contentLength > maxBytes) {
    return { success: false as const, status: 413 as const, error: "Request payload is too large." };
  }

  if (!request.body) return { success: false as const, status: 400 as const, error: "Request body must be valid JSON." };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      return { success: false as const, status: 413 as const, error: "Request payload is too large." };
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { success: true as const, data: JSON.parse(new TextDecoder().decode(combined)) as unknown };
  } catch {
    return { success: false as const, status: 400 as const, error: "Request body must be valid JSON." };
  }
}

function uiMessageTextLength(messages: UIMessage[]) {
  return messages.reduce((total, message) => total + message.parts.reduce((messageTotal, part) => messageTotal + (part.type === "text" ? part.text.length : 0), 0), 0);
}

function hasOnlyTextMessages(messages: UIMessage[]) {
  return messages.every((message) => (message.role === "user" || message.role === "assistant") && message.parts.every((part) => part.type === "text"));
}

async function readValidatedCase(request: Request) {
  const body = await readBoundedJson(request, maxJsonBytes);
  if (!body.success) {
    return {
      success: false as const,
      status: body.status,
      error: body.status === 413 ? "The JSON payload exceeds the 2 MB limit." : body.error,
      issues: [],
    };
  }

  const parsed = caseSchema.safeParse(body.data);
  if (!parsed.success) {
    return {
      success: false as const,
      status: 422 as const,
      error: "The case does not match the P08 fixture format.",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join(" / "),
        message: issue.message,
      })),
    };
  }
  return { success: true as const, data: parsed.data };
}

app.get("/api/health", (context) =>
  context.json({ status: "ok", service: "ShikkhaCheck Result Engine" }),
);

app.get("/api/ai/status", (context) => context.json({
  configured: Boolean(context.env.GEMINI_API_KEY),
  assistant: "ShikkhaCheck AI",
}));

app.post("/api/ai/chat", async (context) => {
  if (!context.env.GEMINI_API_KEY) {
    return context.json({ error: "ShikkhaCheck AI is not configured yet. Add the local AI key or ask the administrator to finish setup." }, 503);
  }

  const requestBody = await readBoundedJson(context.req.raw, maxAiRequestBytes);
  if (!requestBody.success) return context.json({ error: requestBody.status === 413 ? "The selected result context is too large. Choose a smaller context option and try again." : "The chat request must be valid JSON." }, requestBody.status);
  const payload = requestBody.data;

  if (!payload || typeof payload !== "object") return context.json({ error: "The chat request is incomplete." }, 422);
  const body = payload as Record<string, unknown>;
  const parsedContext = aiResultContextSchema.safeParse(body.context);
  if (!parsedContext.success) return context.json({ error: "The selected result context is invalid or incomplete." }, 422);

  const validatedMessages = await safeValidateUIMessages({ messages: body.messages });
  if (!validatedMessages.success) return context.json({ error: "The conversation format is invalid." }, 422);
  if (validatedMessages.data.length === 0 || validatedMessages.data.length > maxAiMessages) {
    return context.json({ error: `A conversation must contain between 1 and ${maxAiMessages} messages.` }, 422);
  }
  if (!hasOnlyTextMessages(validatedMessages.data) || uiMessageTextLength(validatedMessages.data) > maxAiTextCharacters) {
    return context.json({ error: "This conversation contains unsupported content or is too long. Start a new chat and try again." }, 422);
  }

  const provider = createGoogleGenerativeAI({ apiKey: context.env.GEMINI_API_KEY });
  const result = streamText({
    model: provider(context.env.AI_MODEL),
    instructions: buildShikkhaCheckInstructions(parsedContext.data),
    messages: await convertToModelMessages(validatedMessages.data),
    maxOutputTokens: 2_500,
    temperature: 0.2,
    abortSignal: context.req.raw.signal,
    providerOptions: {
      google: {
        thinkingConfig: { thinkingLevel: "high", includeThoughts: false },
      },
    },
    onError: ({ error }) => {
      console.error(JSON.stringify({ level: "error", message: "ai_generation_failed", error: error instanceof Error ? error.message : String(error) }));
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
});

app.post("/api/evaluate", async (context) => {
  const parsed = await readValidatedCase(context.req.raw);
  if (!parsed.success) {
    return context.json(
      { error: parsed.error, issues: parsed.issues },
      parsed.status,
    );
  }
  return context.json(evaluateCase(parsed.data));
});

app.post("/api/runs", async (context) => {
  const parsed = await readValidatedCase(context.req.raw);
  if (!parsed.success) {
    return context.json(
      { error: parsed.error, issues: parsed.issues },
      parsed.status,
    );
  }

  const result = evaluateCase(parsed.data);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await context.env.DB.prepare(
    `INSERT INTO runs (id, case_id, source_json, result_json, student_count, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
  )
    .bind(
      id,
      parsed.data.case_id,
      JSON.stringify(parsed.data),
      JSON.stringify(result),
      parsed.data.students.length,
      createdAt,
    )
    .run();

  return context.json({ id, createdAt, result }, 201);
});

app.get("/api/runs", async (context) => {
  const rows = await context.env.DB.prepare(
    `SELECT id, case_id, student_count, created_at
     FROM runs
     ORDER BY created_at DESC
     LIMIT 20`,
  ).all<RunListRow>();
  return context.json({ runs: rows.results });
});

app.get("/api/runs/:id", async (context) => {
  const row = await context.env.DB.prepare(
    `SELECT id, case_id, source_json, result_json, student_count, created_at
     FROM runs
     WHERE id = ?1`,
  )
    .bind(context.req.param("id"))
    .first<RunDetailRow>();
  if (!row) return context.json({ error: "Saved run not found." }, 404);

  return context.json({
    id: row.id,
    caseId: row.case_id,
    studentCount: row.student_count,
    createdAt: row.created_at,
    source: JSON.parse(row.source_json) as unknown,
    result: JSON.parse(row.result_json) as unknown,
  });
});

app.notFound((context) => context.json({ error: "API route not found." }, 404));

app.onError((error, context) => {
  console.error(JSON.stringify({
    level: "error",
    message: error.message,
    path: context.req.path,
  }));
  return context.json({ error: "The result service could not complete the request." }, 500);
});

export default app;
