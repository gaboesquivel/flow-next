import { composeQuery, GENUI_LIBRARY_VERSION, groundedRecordSchema } from "@/lib/genui";
import type { ComposeInput } from "@/lib/genui";
import {
  composeModeSchema,
  composeQuerySchema,
  composeTurnsSchema,
  priorEnvelopeSchema,
} from "@/lib/genui/compose-tool";
import { z } from "zod";

const bodySchema = z.object({
  clientRequestId: z.string().min(1),
  mode: composeModeSchema.optional(),
  priorEnvelope: priorEnvelopeSchema({
    libraryVersion: z.literal(GENUI_LIBRARY_VERSION),
    record: groundedRecordSchema,
  }).optional(),
  query: composeQuerySchema,
  turns: composeTurnsSchema.optional(),
  version: z.number().int().positive(),
});

export const POST = async (request: Request) => {
  let input: ComposeInput;
  try {
    const json = await request.json();
    input = bodySchema.parse(json);
  } catch {
    return Response.json({ error: "invalid-body" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      void composeQuery({
        input,
        onEvent: (event) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        },
        signal: request.signal,
      })
        .then(() => controller.close())
        .catch(() => {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                message: "Compose failed.",
                requestId: input.clientRequestId,
                sequence: 0,
                type: "error",
              })}\n`,
            ),
          );
          controller.close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
    },
  });
};
