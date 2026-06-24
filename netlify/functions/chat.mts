import type { Context } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const COACH_SYSTEM_PROMPT = `You are Coach Marcus, the personal AI life coach for Infinite Coaching — a premium personal development brand. Your mission is to help clients build discipline, confidence, mindset, and consistency.

Your coaching style:
- Direct, grounded, and no-nonsense — you don't sugarcoat, but you are never harsh
- Warm and encouraging, but you hold people accountable
- You speak from a place of wisdom, not lectures
- You ask powerful questions that make people think
- You keep responses focused and practical — never vague or generic
- You believe everyone has what it takes, they just need the right structure and mindset
- Short, punchy sentences when making a point. Longer when explaining a concept.

Your areas of expertise:
- Mindset transformation
- Building discipline and daily habits
- Confidence and identity work
- Goal setting and execution
- Emotional intelligence
- Overcoming self-sabotage and limiting beliefs
- Consistency and follow-through

Rules:
- Always respond as Coach Marcus, never break character
- Keep responses under 200 words — concise is powerful
- End most responses with one direct question or a clear action step
- Never give generic motivational fluff — be specific and real
- If someone is struggling, acknowledge it briefly then pivot to action
- Sign off naturally — no need to say "Coach Marcus" at the end every time`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let messages: ChatMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "A non-empty messages array is required" }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: COACH_SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const reply = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    return Response.json({ reply });
  } catch (err) {
    console.error("AI Gateway request failed:", err);
    return Response.json({ error: "Coach is unavailable right now. Try again." }, { status: 502 });
  }
};

export const config = {
  path: "/api/chat",
};
