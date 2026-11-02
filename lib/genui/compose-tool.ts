import { z } from "zod";

import type { CompositionEnvelope } from "./core/envelope";
import { MAX_QUERY_CODE_POINTS } from "./core/limits";
import type { ComposeMode, ComposeResult } from "./orchestration/compose";
import { composeQueryToEnvelope } from "./orchestration/compose-query-to-envelope";
import type { ComposeTurn } from "./orchestration/generate-openui";

export const composeModeSchema = z.enum(["create", "refine"]);

export const composeQuerySchema = z.string().min(1).max(MAX_QUERY_CODE_POINTS);

export const composeTurnsSchema = z
  .array(
    z.object({
      content: z.string(),
      role: z.enum(["assistant", "user"]),
    }),
  )
  .max(12);

/** Loose record shape the MCP and Eve tools accept for `priorEnvelope.records`. */
export const looseRecordSchema = z.record(z.string(), z.unknown());

/**
 * Prior envelope schema. Surfaces differ on purpose: the HTTP route requires the
 * current library version and grounded records, MCP requires the current version
 * with loose records, and the Eve tool accepts any numeric version.
 */
export const priorEnvelopeSchema = <Version extends z.ZodType, Record extends z.ZodType>({
  libraryVersion,
  record,
}: {
  libraryVersion: Version;
  record: Record;
}) =>
  z.object({
    fallbackText: z.string(),
    libraryVersion,
    openuiText: z.string(),
    records: z.array(record),
    requestId: z.string(),
  });

/** Input shape shared by the MCP and Eve `compose_ui` tools. */
export const composeToolInputShape = <Version extends z.ZodType>(libraryVersion: Version) => ({
  mode: composeModeSchema.optional(),
  priorEnvelope: priorEnvelopeSchema({ libraryVersion, record: looseRecordSchema }).optional(),
  query: composeQuerySchema,
  turns: composeTurnsSchema.optional(),
});

export interface ComposeToolArgs {
  mode?: ComposeMode;
  priorEnvelope?: unknown;
  query: string;
  turns?: ComposeTurn[];
}

export type ComposeToolOutput =
  | {
      error: "composition_failed";
      failureCode: ComposeResult["metadata"]["failureCode"];
      validationOk: boolean;
    }
  | { envelope: CompositionEnvelope; metadata: ComposeResult["metadata"] };

export const runComposeTool = async (
  prefix: string,
  { mode, priorEnvelope, query, turns }: ComposeToolArgs,
): Promise<ComposeToolOutput> => {
  const { envelope, result } = await composeQueryToEnvelope({
    input: {
      clientRequestId: `${prefix}-${Date.now()}`,
      mode,
      priorEnvelope: priorEnvelope as CompositionEnvelope | undefined,
      query,
      turns,
      version: 1,
    },
  });
  if (!envelope || result.metadata.outcome !== "success")
    return {
      error: "composition_failed",
      failureCode: result.metadata.failureCode,
      validationOk: result.metadata.validationOk,
    };
  return { envelope, metadata: result.metadata };
};
