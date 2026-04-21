import { useEffect, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

const STORAGE_KEY = "mindbloom.messages.v1";
const MOOD_KEY = "mindbloom.mood.v1";

function safeParse(raw: string | null): ChatMessage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMessages(safeParse(localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, hydrated]);

  const reset = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MOOD_KEY);
  };

  return { messages, setMessages, hydrated, reset };
}

export function getStoredMood(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MOOD_KEY);
}

export function setStoredMood(mood: string | null) {
  if (typeof window === "undefined") return;
  if (mood) localStorage.setItem(MOOD_KEY, mood);
  else localStorage.removeItem(MOOD_KEY);
}
