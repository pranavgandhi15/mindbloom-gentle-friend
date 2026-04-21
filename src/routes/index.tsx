import { createFileRoute } from "@tanstack/react-router";
import { ChatWindow } from "@/components/ChatWindow";
import { getAffirmationForToday } from "@/lib/affirmations";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MindBloom — A gentle space to breathe & talk" },
      {
        name: "description",
        content:
          "MindBloom is a calm, judgment-free AI companion for your mental wellbeing. Take a breath, share what's on your mind.",
      },
    ],
  }),
});

function Index() {
  const affirmation = getAffirmationForToday();

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Decorative ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--bloom-soft)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--sage)" }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-4 sm:py-6">
        {/* Daily affirmation */}
        <header className="mb-4 flex flex-col items-center gap-1 text-center animate-fade-up">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            A gentle reminder for today
          </p>
          <h1 className="font-serif text-xl text-foreground/90 text-balance sm:text-2xl">
            “{affirmation}”
          </h1>
        </header>

        {/* Chat */}
        <div className="flex-1">
          <ChatWindow />
        </div>
      </div>
    </main>
  );
}
