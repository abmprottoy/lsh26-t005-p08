import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { parseStoredChatMessages, sanitizeChatMessages } from "./chat-storage";

describe("AI chat local storage", () => {
  it("persists only visible text while retaining assistant replies", () => {
    const messages = [
      { id: "user-1", role: "user", parts: [{ type: "text", text: "Class 9 er weak subject konta?" }] },
      { id: "assistant-1", role: "assistant", parts: [
        { type: "reasoning", text: "hidden reasoning" },
        { type: "text", text: "Biology ebong Physics." },
      ] },
    ] as UIMessage[];

    expect(sanitizeChatMessages(messages)).toEqual([
      { id: "user-1", role: "user", parts: [{ type: "text", text: "Class 9 er weak subject konta?" }] },
      { id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "Biology ebong Physics." }] },
    ]);
  });

  it("loads valid saved messages and ignores malformed browser data", () => {
    const valid = JSON.stringify([{ id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "Saved answer" }] }]);
    expect(parseStoredChatMessages(valid)).toHaveLength(1);
    expect(parseStoredChatMessages("not-json")).toEqual([]);
  });
});
