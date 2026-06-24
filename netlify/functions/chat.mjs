import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { messages, system } = body;
  if (!messages || !Array.isArray(messages)) {
    return new Response("Missing messages", { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system,
    messages,
  });

  const reply = message.content?.map((b) => b.text || "").join("") || "";
  return Response.json({ reply });
};

export const config = {
  path: "/api/chat",
};
