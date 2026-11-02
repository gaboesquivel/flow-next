import { jsonError } from "@/lib/api/json-error";
import { discoveryRateLimitHeaders } from "@/lib/api/rate-limit-headers";
import { streamChat } from "@/lib/api/stream-chat";

const systemPrompt = `You assist users building agentic application UIs in this starter.

You can explain GenUI, MCP compose_ui, and Eve tools. You do not mutate remote systems.
When users want a new screen, suggest they use the GenUI playground at /genui or compose_ui with a clear UI description.

Keep answers concise. Use bullets for next steps when helpful.`;

export const GET = () =>
  jsonError({
    code: "method_not_allowed",
    extraHeaders: discoveryRateLimitHeaders(),
    message: "Use POST with a messages array.",
    resolution: "POST /api/chat with Content-Type application/json.",
    status: 405,
  });

export const POST = (request: Request) =>
  streamChat(request, { invalidRequestResolution: "See /openapi.json.", system: systemPrompt });
