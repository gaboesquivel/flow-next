import { streamChat } from "@/lib/api/stream-chat";
import { operatorAccessDeniedResponse, verifyOperatorRequest } from "@/lib/auth/operator-access";

const systemPrompt = `You are the Operator assistant for this Flow Next deployment.

You may discuss protected diagnostics, configuration status, and GenUI/MCP capabilities.
You must not expose secret values (API keys, tokens). When Operator access is misconfigured, explain fail-closed behavior.

Keep answers concise and actionable.`;

export const POST = (request: Request) => {
  const access = verifyOperatorRequest(request);
  if (!access.ok) return operatorAccessDeniedResponse({ reason: access.reason });

  return streamChat(request, {
    invalidRequestResolution: "POST JSON with a messages array.",
    system: systemPrompt,
  });
};
