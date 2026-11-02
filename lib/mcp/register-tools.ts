import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/server";
import { componentNames, compositionGuidance, GENUI_LIBRARY_VERSION } from "@/lib/genui";
import { composeToolInputShape, runComposeTool } from "@/lib/genui/compose-tool";
import { z } from "zod";

import { GENUI_PREVIEW_RESOURCE_URI } from "./genui-preview-resource";
import { asToolResult } from "./tool-result";

const previewToolMeta = {
  _meta: { ui: { resourceUri: GENUI_PREVIEW_RESOURCE_URI } },
};

const plainToolMeta = { _meta: {} };

export const registerStarterMcpTools = (server: McpServer) => {
  registerAppTool(
    server,
    "health",
    {
      ...plainToolMeta,
      description: "Liveness check for the MCP server.",
      inputSchema: { ping: z.boolean().optional() },
    },
    () => asToolResult({ ok: true, service: "flow-next-mcp" }),
  );

  registerAppTool(
    server,
    "list_component_catalog",
    {
      ...plainToolMeta,
      description: "List registered GenUI root components and composition guidance.",
      inputSchema: { detail: z.boolean().optional() },
    },
    () =>
      asToolResult({
        components: componentNames,
        guidance: compositionGuidance,
      }),
  );

  registerAppTool(
    server,
    "compose_ui",
    {
      description:
        "Generate a validated OpenUI composition from a natural-language UI request using synthetic data.",
      inputSchema: composeToolInputShape(z.literal(GENUI_LIBRARY_VERSION)),
      ...previewToolMeta,
    },
    async (args) => asToolResult(await runComposeTool("mcp", args)),
  );
};
