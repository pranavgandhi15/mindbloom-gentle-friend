import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Wind, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChatHistory, getStoredMood, setStoredMood } from "@/lib/chat-storage";
import { MoodCheckIn, MOODS, type MoodLabel } from "./MoodCheckIn";
import { BreathingExercise } from "./BreathingExercise";
import { cn } from "@/lib/utils";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STARTER_GREETING =
  "Hi, I'm MindBloom 🌿 Take a breath — I'm here to listen, whenever you're ready.";

export function ChatWindow() {
  const { messages, setMessages, hydrated, reset } = useChatHistory();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setMood(getStoredMood());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleMood = (m: MoodLabel) => {
    setMood(m);
    setStoredMood(m);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setError(null);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = { id: uid(), role: "user" as const, content: text, createdAt: Date.now() };
    const assistantId = uid();
    const placeholder = {
      id: assistantId,
      role: "assistant" as const,
      content: "",
      createdAt: Date.now(),
    };

    const baseMessages = [...messages, userMsg];
    setMessages([...baseMessages, placeholder]);
    setIsStreaming(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? SUPABASE_KEY;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/mindbloom-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({
          mood,
          messages: baseMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        let errMsg = "Something went gently wrong. Please try again in a moment.";
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMsg = parsed.error;
        } catch {
          /* ignore */
        }
        throw new Error(errMsg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json?.choices?.[0]?.delta?.content;
            if (typeof delta === "string") {
              accumulated += delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulated } : m,
                ),
              );
            }
          } catch {
            /* ignore partial chunks */
          }
        }
      }

      if (!accumulated) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "I'm here. Whenever you're ready, share what's on your mind." }
              : m,
          ),
        );
      }
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showStarter = hydrated && messages.length === 0;
  const moodMeta = MOODS.find((m) => m.label === mood);

  return (
    <>
      <div
        className="flex h-[calc(100vh-2rem)] max-h-[900px] w-full flex-col overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 backdrop-blur-md"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ background: "var(--gradient-warmth)" }}
            >
              🌿
            </div>
            <div className="leading-tight">
              <p className="font-serif text-xl text-foreground">MindBloom</p>
              <p className="text-xs text-muted-foreground">
                {moodMeta ? `Feeling ${moodMeta.label.toLowerCase()} ${moodMeta.emoji}` : "Here for you"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowBreathing(true)}
              className="flex items-center gap-1.5 rounded-full bg-accent/60 px-3 py-1.5 text-xs font-medium text-accent-foreground transition hover:bg-accent"
              aria-label="Start breathing exercise"
            >
              <Wind className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Breathe</span>
            </button>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Start a new conversation"
                title="Start a new conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {showStarter && (
            <div className="mx-auto flex max-w-md flex-col items-center gap-5 pt-4 text-center animate-fade-up">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-3xl animate-float-soft"
                style={{ background: "var(--gradient-warmth)", boxShadow: "var(--shadow-glow)" }}
              >
                🌸
              </div>
              <p className="font-serif text-2xl text-foreground/90 text-balance">
                {STARTER_GREETING}
              </p>
              {!mood && (
                <div className="w-full">
                  <MoodCheckIn selected={mood} onSelect={handleMood} />
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  "I feel overwhelmed",
                  "I had a hard day",
                  "I just want to talk",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs text-foreground/80 transition hover:bg-accent/60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex animate-fade-up",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed sm:text-[15px]",
                    m.role === "user"
                      ? "rounded-br-lg bg-primary text-primary-foreground"
                      : "rounded-bl-lg bg-secondary text-secondary-foreground",
                  )}
                  style={
                    m.role === "assistant"
                      ? { background: "var(--gradient-warmth)", color: "var(--foreground)" }
                      : undefined
                  }
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed">
                      {m.content ? (
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      ) : (
                        <span className="inline-flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50" />
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {error && (
            <div className="mx-auto mt-4 max-w-md rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border/50 bg-background/40 px-3 py-3 sm:px-5 sm:py-4">
          {messages.length > 0 && !mood && (
            <div className="mb-3">
              <MoodCheckIn selected={mood} onSelect={handleMood} compact />
            </div>
          )}
          <div className="flex items-end gap-2 rounded-3xl border border-border/70 bg-card/80 p-2 pl-4 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={handleKey}
              placeholder="Share what's on your mind…"
              rows={1}
              className="flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-[15px]"
              disabled={isStreaming}
              aria-label="Message MindBloom"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={isStreaming || !input.trim()}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition",
                "hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40",
              )}
              aria-label="Send message"
            >
              {isStreaming ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="mt-2 space-y-1 text-center text-[10px] text-muted-foreground">
            <p>
              MindBloom isn't a substitute for professional care. If you're in crisis, please reach out.
            </p>
            <p className="text-foreground/70">
              🇮🇳 India helplines —{" "}
              <a href="tel:9152987821" className="underline hover:text-primary">iCall 9152987821</a>
              {" · "}
              <a href="tel:18602662345" className="underline hover:text-primary">Vandrevala 1860-2662-345</a>
              {" · "}
              <a href="tel:9820466726" className="underline hover:text-primary">AASRA 9820466726</a>
              {" · "}
              <a href="tel:18005990019" className="underline hover:text-primary">KIRAN 1800-599-0019</a>
            </p>
          </div>
        </div>
      </div>

      <BreathingExercise open={showBreathing} onClose={() => setShowBreathing(false)} />
    </>
  );
}
