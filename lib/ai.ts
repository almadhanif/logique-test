// AI backend — OpenRouter (OpenAI-compatible Chat Completions API).
//
// All AI features route through OpenRouter instead of a vendor SDK. The model
// is configurable via OPENROUTER_MODEL (defaults to a fast/cheap general model);
// swap it for any model id listed at https://openrouter.ai/models .

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Whether an OpenRouter API key is configured (and not still the placeholder). */
export function isAiConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY;
  return Boolean(key && !key.startsWith("sk-or-v1-REPLACE_ME"));
}

/** OpenRouter model id, overridable via OPENROUTER_MODEL. */
export const AI_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

type AiChatOptions = {
  system?: string;
  user: string;
  maxTokens?: number;
};

/**
 * Send a single-turn chat completion to OpenRouter and return the text content.
 * Throws an Error with a descriptive message (including upstream status/body)
 * on any failure so route handlers can surface it.
 */
export async function aiChat({ system, user, maxTokens }: AiChatOptions): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      // Optional but recommended by OpenRouter for attribution/ranking.
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "AutoListing",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenRouter returned no message content");
  }
  return content.trim();
}
