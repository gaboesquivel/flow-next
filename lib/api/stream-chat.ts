import { streamText } from "ai";

import { chatUnavailableResolution, resolveChatModel } from "@/lib/ai/resolve-chat-model";
import { jsonError } from "@/lib/api/json-error";

interface ChatMessage {
  content: string;
  role: "user" | "assistant";
}

/** Shared POST handler for the sidebar and Operator chat routes (UI message stream). */
export const streamChat = async (
  request: Request,
  {
    invalidRequestResolution,
    system,
  }: {
    /** `resolution` text for the empty-messages 400. */
    invalidRequestResolution: string;
    system: string;
  },
) => {
  const model = resolveChatModel();
  if (!model)
    return jsonError({
      code: "chat_unavailable",
      message: "Chat model credentials are not configured.",
      resolution: chatUnavailableResolution(),
      status: 503,
    });

  let messages: ChatMessage[];
  try {
    const { messages: parsed } = (await request.json()) as { messages?: ChatMessage[] };
    if (!parsed?.length)
      return jsonError({
        code: "invalid_request",
        message: "Request body must include a non-empty messages array.",
        resolution: invalidRequestResolution,
        status: 400,
      });
    messages = parsed;
  } catch {
    return jsonError({
      code: "invalid_json",
      message: "Request body must be valid JSON.",
      resolution: "Send Content-Type application/json.",
      status: 400,
    });
  }

  return streamText({ messages, model, system }).toUIMessageStreamResponse();
};
