import { createParser } from "@openuidev/lang-core";

import { GENUI_LIBRARY_VERSION } from "../core/envelope";
import type { GroundedRecord } from "../core/envelope";
import type { CompileResult } from "../core/errors";
import { GENUI_MAX_DOCUMENT_BYTES, GENUI_MAX_STATEMENT_COUNT } from "../core/limits";
import { supportedComponentSet } from "./catalog";
import { flowGenuiContractLibrary, flowGenuiLibraryJsonSchema } from "./library";
import { validateComponentSubtree, validatePublicRecords } from "./validation";

const parser = createParser(
  flowGenuiLibraryJsonSchema(),
  flowGenuiContractLibrary.root ?? "Answer",
);

const rootAssignmentPattern = /^\s*root\s*=\s*/u;

/** Callers check `rootAssignmentPattern` first. */
const trailingContentAfterRoot = (document: string) => {
  const trimmed = document.trim();
  const lines = trimmed.split("\n");
  if (lines.length > 1) {
    const afterFirst = lines.slice(1).join("\n").trim();
    if (afterFirst.length > 0) return true;
  }
  if (/\broot\s*=\s*[\s\S]+\broot\s*=/u.test(trimmed)) return true;
  return false;
};

const mapParserError = (code: string): CompileResult | null => {
  if (code === "unknown-component") {
    return { code: "unknown_component", ok: false };
  }
  if (code === "missing-required" || code === "null-required") {
    return { code: "missing_required_property", ok: false };
  }
  if (code === "type-mismatch") {
    return { code: "invalid_property_type", ok: false };
  }
  if (code === "excess-args") {
    return { code: "unknown_property", ok: false };
  }
  return null;
};

const validateParsedRoot = ({
  byId,
  component,
  props,
}: {
  byId: ReadonlyMap<string, GroundedRecord>;
  component: string;
  props: Record<string, unknown>;
}): CompileResult => {
  if (!supportedComponentSet.has(component)) {
    return { code: "unsupported_component", ok: false };
  }

  const subtree = validateComponentSubtree({ byId, component, props });
  if (!subtree.ok) {
    return { code: subtree.code, ok: false };
  }

  return {
    component,
    composite: subtree.composite,
    ok: true,
    props,
    referencedRecordIds: subtree.referencedRecordIds,
  };
};

const parseDocument = (text: string) => {
  if (!text.trim()) {
    return { code: "empty_document" as const, ok: false as const };
  }
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > GENUI_MAX_DOCUMENT_BYTES) {
    return { code: "oversized_document" as const, ok: false as const };
  }
  if (!rootAssignmentPattern.test(text.trim())) {
    return { code: "invalid_root" as const, ok: false as const };
  }
  if (trailingContentAfterRoot(text)) {
    return { code: "unexpected_trailing_content" as const, ok: false as const };
  }

  const parsed = parser.parse(text);
  if (parsed.meta.incomplete) {
    return { code: "truncated_document" as const, ok: false as const };
  }
  if (parsed.meta.statementCount > GENUI_MAX_STATEMENT_COUNT) {
    return { code: "excessive_complexity" as const, ok: false as const };
  }
  if (parsed.meta.orphaned.length > 0) {
    return { code: "unexpected_trailing_content" as const, ok: false as const };
  }
  if (parsed.mutationStatements.length > 0 || parsed.queryStatements.length > 0) {
    return { code: "unauthorized_executable" as const, ok: false as const };
  }
  if (parsed.rootExpression) {
    return { code: "unauthorized_executable" as const, ok: false as const };
  }
  return { ok: true as const, parsed };
};

export const compileExperience = ({
  document,
  libraryVersion,
  records,
}: {
  document: unknown;
  libraryVersion: number;
  records: GroundedRecord[];
}): CompileResult => {
  if (typeof document !== "string") {
    return { code: "malformed_grammar", ok: false };
  }
  if (libraryVersion !== GENUI_LIBRARY_VERSION) {
    return { code: "unsupported_library_version", ok: false };
  }

  const recordCatalog = validatePublicRecords({ records });
  if (!recordCatalog.ok) {
    return { code: recordCatalog.code, ok: false };
  }

  const parsedResult = parseDocument(document);
  if (!parsedResult.ok) {
    return { code: parsedResult.code, ok: false };
  }
  const { parsed } = parsedResult;
  const [firstError] = parsed.meta.errors;
  const mapped = firstError ? mapParserError(firstError.code ?? "") : null;
  if (mapped) return mapped;
  if (!parsed.root) {
    return { code: "malformed_grammar", ok: false };
  }
  if (firstError) {
    return { code: "parse", detail: firstError.message, ok: false };
  }

  return validateParsedRoot({
    byId: recordCatalog.byId,
    component: parsed.root.typeName,
    props: parsed.root.props,
  });
};

export const compileCompositionEnvelope = ({
  envelope,
}: {
  envelope: {
    libraryVersion: number;
    openuiText: string;
    records: GroundedRecord[];
  };
}) =>
  compileExperience({
    document: envelope.openuiText,
    libraryVersion: envelope.libraryVersion,
    records: envelope.records,
  });

export const validateCompositionEnvelope = ({
  envelope,
}: {
  envelope: {
    libraryVersion: number;
    openuiText: string;
    records: GroundedRecord[];
  };
}) => {
  const result = compileCompositionEnvelope({ envelope });
  if (!result.ok) {
    return { ok: false as const, reason: result.code };
  }
  return { compiled: result, ok: true as const };
};
