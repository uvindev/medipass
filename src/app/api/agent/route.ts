/**
 * MediPass — Agent API Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/agent
 * Streams MediAgent responses to the doctor UI.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { streamText, type CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { type NextRequest } from "next/server";
import { ownershipHeaders } from "@/lib/watermark";
import { MEDIAGENT_SYSTEM_PROMPT, mediagentTools } from "@/lib/agent/mediagent";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return new Response("Invalid request body", {
      status: 400,
      headers: ownershipHeaders,
    });
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: MEDIAGENT_SYSTEM_PROMPT,
    messages: parsed.data.messages as CoreMessage[],
    tools: mediagentTools,
    maxSteps: 10, // allows full 4-tool chain + retries
    temperature: 0, // deterministic — medical context demands this
    maxTokens: 1024,
  });

  return result.toDataStreamResponse({
    headers: ownershipHeaders,
  });
}
