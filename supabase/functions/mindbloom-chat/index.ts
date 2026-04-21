// MindBloom chat edge function
// Calls Lovable AI Gateway with the gentle MindBloom system prompt and streams reply.

const SYSTEM_PROMPT = `You are MindBloom, a calm, supportive mental health companion.

Your role:
- Listen without judgment
- Respond with empathy and kindness
- Encourage positive thinking gently
- Never give medical or professional advice
- Avoid negativity or harsh language

Rules:
- Keep responses short (2–3 sentences)
- Use simple, comforting language
- Validate feelings before suggesting anything
- If the user seems very distressed (mentions self-harm, suicide, hopelessness, or crisis), warmly encourage them to reach out to a trusted person or a local helpline. Do not diagnose.

Tone: Warm, soft, and understanding — like a caring friend.

Example:
User: I feel useless
You: I'm really sorry you're feeling this way. You matter more than you think, even on hard days. Want to talk about what's been bothering you?`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mood } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemContent = mood
      ? `${SYSTEM_PROMPT}\n\nThe user just shared their current mood: "${mood}". Gently acknowledge it.`
      : SYSTEM_PROMPT;

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: systemContent }, ...messages],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: text }), {
        status: upstream.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
