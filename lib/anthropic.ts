import Anthropic from "@anthropic-ai/sdk";

// Anthropic client singleton.
// `new Anthropic()` reads ANTHROPIC_API_KEY from the environment automatically.
// Callers should check isAnthropicConfigured() before using the client so they
// can return a friendly message when no key is present (e.g. a fresh checkout).
let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export function isAnthropicConfigured(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return Boolean(key && !key.startsWith("sk-ant-REPLACE_ME"));
}

// Model used for the ad-copy feature. The task asked for Haiku ("claude-haiku-3")
// for speed/cost; the current Haiku model id is `claude-haiku-4-5`.
// https://docs.claude.com/en/docs/about-claude/models/overview
export const AD_COPY_MODEL = "claude-haiku-4-5";
