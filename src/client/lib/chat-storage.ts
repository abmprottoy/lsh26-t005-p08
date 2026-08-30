import type { UIMessage } from "ai";

function isStoredMessage(value: unknown): value is UIMessage {
  if (!value || typeof value !== "object") return false;
  const item = value as { id?: unknown; role?: unknown; parts?: unknown };
  return typeof item.id === "string"
    && (item.role === "user" || item.role === "assistant")
    && Array.isArray(item.parts)
    && item.parts.every((part) => Boolean(part)
      && typeof part === "object"
      && (part as { type?: unknown }).type === "text"
      && typeof (part as { text?: unknown }).text === "string");
}

export function sanitizeChatMessages(messages: UIMessage[]): UIMessage[] {
  return messages.flatMap((message) => {
    if (message.role !== "user" && message.role !== "assistant") return [];
    const parts = message.parts.flatMap((part) => part.type === "text" && part.text.trim().length > 0
      ? [{ type: "text" as const, text: part.text }]
      : []);
    return parts.length > 0 ? [{ id: message.id, role: message.role, parts }] : [];
  });
}

export function parseStoredChatMessages(value: string | null): UIMessage[] {
  try {
    const parsed: unknown = JSON.parse(value ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isStoredMessage).slice(-24) : [];
  } catch {
    return [];
  }
}
