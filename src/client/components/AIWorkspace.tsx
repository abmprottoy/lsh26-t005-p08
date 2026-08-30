import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, BrainCircuit, CheckCircle2, Database, Eraser, LoaderCircle, LockKeyhole, Send, Sparkles, Square, WandSparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { CaseEvaluation } from "../../domain/types";
import { buildAiResultContext, type AiContextMode } from "../../ai/context";
import { parseStoredChatMessages, sanitizeChatMessages } from "../lib/chat-storage";
import { Conversation, ConversationContent, ConversationEmptyState } from "./ai-elements/conversation";
import { Message } from "./ai-elements/message";
import { Suggestion, Suggestions } from "./ai-elements/suggestion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AIWorkspaceProps {
  evaluation: CaseEvaluation;
  sourceLabel: string;
  resultIsStale: boolean;
}

const MessageResponse = lazy(() => import("./ai-elements/response").then((module) => ({ default: module.MessageResponse })));

const contextOptions: Array<{ value: AiContextMode; label: string; description: string }> = [
  { value: "smart", label: "Smart context", description: "Includes the overall picture and automatically adds detailed traces for any student name or ID in the question." },
  { value: "summary", label: "Summary only", description: "Overall metrics, class comparison, grade distribution, and subject pressure." },
  { value: "students", label: "Student results", description: "Summary plus every student's final GPA, grade, status, and review flags." },
  { value: "reviews", label: "Checking lists", description: "Focuses on students needing optional, practical, absence, or compulsory-failure review." },
  { value: "full", label: "Full calculations", description: "Includes every student's subject marks, grade points, rule decisions, and final override details." },
];

const starterQuestions = [
  "Which class needs the most attention, and why?",
  "কারা compulsory subject-এ fail করেছে?",
  "Class 9 er weak subject konta?",
  "Explain why S004 received an F.",
  "Create a short briefing for the head teacher.",
  "Which students should I review first?",
];

function storageKey(caseId: string) {
  return `shikkhacheck-ai-chat:${caseId}`;
}

function loadMessages(caseId: string) {
  return parseStoredChatMessages(window.localStorage.getItem(storageKey(caseId)));
}

function messageText(message: UIMessage) {
  return message.parts.filter((part) => part.type === "text").map((part) => part.text).join("\n");
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <LoaderCircle className="size-4 animate-spin text-emerald-600 dark:text-emerald-400" />
      <span className="ai-thinking-shimmer text-sm font-medium">Thinking through the verified results…</span>
    </div>
  );
}

export function AIWorkspace({ evaluation, sourceLabel, resultIsStale }: AIWorkspaceProps) {
  const [input, setInput] = useState("");
  const [contextMode, setContextMode] = useState<AiContextMode>("smart");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const initialMessages = useMemo(() => loadMessages(evaluation.caseId), [evaluation.caseId]);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/ai/chat" }), []);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({
    id: `shikkhacheck-${evaluation.caseId}`,
    messages: initialMessages,
    transport,
  });
  const messagesRef = useRef(messages);
  const selectedContext = contextOptions.find((option) => option.value === contextMode)!;
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    void fetch("/api/ai/status")
      .then((response) => response.json() as Promise<{ configured?: boolean }>)
      .then((data) => setConfigured(data.configured === true))
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    window.localStorage.setItem(storageKey(evaluation.caseId), JSON.stringify(sanitizeChatMessages(messages).slice(-24)));
    if (messages.length > 24) setMessages((current) => current.slice(-24));
  }, [evaluation.caseId, messages, setMessages]);

  useEffect(() => () => {
    window.localStorage.setItem(
      storageKey(evaluation.caseId),
      JSON.stringify(sanitizeChatMessages(messagesRef.current).slice(-24)),
    );
  }, [evaluation.caseId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: status === "streaming" ? "auto" : "smooth", block: "end" });
  }, [messages, status]);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy || configured === false || resultIsStale) return;
    clearError();
    void sendMessage({ text: trimmed }, { body: { context: buildAiResultContext(evaluation, sourceLabel, contextMode, trimmed) } });
    setInput("");
  };

  const clearChat = () => {
    stop();
    setMessages([]);
    clearError();
    window.localStorage.removeItem(storageKey(evaluation.caseId));
  };

  return (
    <div className="grid min-h-[680px] gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="flex min-h-[680px] min-w-0 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-zinc-950"><BrainCircuit className="size-5" /></div>
            <div><div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-slate-950 dark:text-white">ShikkhaCheck AI</h2>{configured === true ? <Badge variant="success">Ready</Badge> : configured === false ? <Badge variant="warning">Setup needed</Badge> : <Badge>Checking…</Badge>}</div><p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">Ask naturally in বাংলা, Banglish, or English</p></div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}><Eraser className="size-3.5" /> Clear chat</Button>
        </div>

        {configured === false && (
          <div className="m-4 mb-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">
            <p className="font-semibold">Local AI setup is one step away</p><p className="mt-1 text-xs leading-5">Create <code className="font-mono">.env.local</code>, add <code className="font-mono">GEMINI_API_KEY</code>, then restart the development server. The key stays on the Worker side.</p>
          </div>
        )}

        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState icon={<Sparkles className="size-5" />} title="What would you like to understand?" description={`I can explain patterns, compare classes, find students who need attention, and trace individual results in ${evaluation.caseId}.`}>
                <Suggestions className="mt-5 max-w-3xl">
                  {starterQuestions.map((question) => <Suggestion key={question} onClick={() => ask(question)} disabled={configured !== true || resultIsStale}>{question}</Suggestion>)}
                </Suggestions>
              </ConversationEmptyState>
            ) : messages.map((message) => {
              const text = messageText(message);
              const waitingForVisibleText = message.role === "assistant"
                && status === "streaming"
                && message.id === messages.at(-1)?.id
                && text.trim().length === 0;
              return (
                <Message key={message.id} role={message.role === "assistant" ? "assistant" : "user"}>
                  {message.role === "assistant"
                    ? waitingForVisibleText
                      ? <ThinkingIndicator />
                      : <Suspense fallback={<p className="whitespace-pre-wrap">{text}</p>}><MessageResponse streaming={status === "streaming" && message.id === messages.at(-1)?.id}>{text}</MessageResponse></Suspense>
                    : <p className="whitespace-pre-wrap">{text}</p>}
                </Message>
              );
            })}
            {status === "submitted" && <Message role="assistant"><ThinkingIndicator /></Message>}
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-200">ShikkhaCheck AI could not complete that answer. Check the AI setup or try again in a moment.</div>}
            <div ref={endRef} />
          </ConversationContent>
        </Conversation>

        <div className="border-t border-slate-200 bg-slate-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
          <form className="mx-auto max-w-4xl" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-800">
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); ask(input); } }} rows={2} maxLength={4_000} placeholder="Ask about students, classes, results, or checking priorities…" className="min-h-14 w-full resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" disabled={configured !== true || resultIsStale} aria-label="Ask ShikkhaCheck AI" />
              <div className="flex items-center justify-between gap-3 px-1 pb-0.5"><div className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-400"><Database className="size-3" /><span className="truncate">{selectedContext.label} · {evaluation.caseId}</span></div>{busy ? <Button type="button" size="icon" variant="secondary" onClick={stop} aria-label="Stop response"><Square className="size-3.5 fill-current" /></Button> : <Button type="submit" size="icon" disabled={!input.trim() || configured !== true || resultIsStale} aria-label="Send message"><Send className="size-4" /></Button>}</div>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">AI insights can be imperfect. Verified results and calculation traces remain the source of truth.</p>
          </form>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-2"><WandSparkles className="size-4 text-emerald-600 dark:text-emerald-400" /><h3 className="text-sm font-semibold text-slate-950 dark:text-white">Choose result context</h3></div>
          <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-zinc-400">Control how much of the current result set accompanies your next question.</p>
          <span id="ai-context-label" className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Context for next question</span>
          <Select value={contextMode} onValueChange={(value) => setContextMode(value as AiContextMode)} disabled={busy}>
            <SelectTrigger className="mt-1.5" aria-labelledby="ai-context-label">
              <SelectValue placeholder="Choose context" />
            </SelectTrigger>
            <SelectContent>
              {contextOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-zinc-700/50 dark:text-zinc-300">{selectedContext.description}</div>
          {contextMode === "full" && <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-700 dark:text-amber-300"><BrainCircuit className="mt-0.5 size-3.5 shrink-0" />Full context gives the deepest answers but can take longer.</div>}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2"><LockKeyhole className="size-4 text-sky-600 dark:text-sky-400" /><h3 className="text-sm font-semibold text-slate-950 dark:text-white">Private workspace</h3></div>
          <div className="mt-4 space-y-3 text-xs leading-5 text-slate-600 dark:text-zinc-300">
            <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" /><span>Chat history is saved only in this browser for {evaluation.caseId}.</span></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" /><span>The AI service key remains inside the secure Worker environment.</span></div>
            <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" /><span>Only the context selected for a question is sent for analysis.</span></div>
          </div>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100"><Bot className="size-4" />Built for teachers</div>
          <p className="mt-2 text-xs leading-5 text-emerald-800/80 dark:text-emerald-200/80">Ask the way you normally speak. ShikkhaCheck AI will match বাংলা, Banglish, or English and keep the explanation grounded in verified results.</p>
        </Card>
      </div>
    </div>
  );
}
