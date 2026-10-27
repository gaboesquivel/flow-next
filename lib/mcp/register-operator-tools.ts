import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { getOperatorAccessToken, isOperatorAccessConfigured } from "@/lib/auth/operator-access";

import { asToolResult } from "./tool-result";

export const operatorMcpToolNames = ["get_diagnostics", "get_config_status"] as const;

export const registerOperatorMcpTools = (server: McpServer) => {
  registerAppTool(
    server,
    "get_diagnostics",
    {
      _meta: {},
      description: "Protected diagnostics for the Operator surface (runtime and deployment hints).",
      inputSchema: { detail: z.boolean().optional() },
    },
    () =>
      asToolResult({
        nodeVersion: process.version,
        operatorConfigured: isOperatorAccessConfigured(),
        platform: process.platform,
        timestamp: new Date().toISOString(),
      }),
  );

  registerAppTool(
    server,
    "get_config_status",
    {
      _meta: {},
      description: "Protected configuration status (feature flags only — never secrets).",
      inputSchema: {},
    },
    () =>
      asToolResult({
        chat: {
          anthropicDirect: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
          gateway: Boolean(process.env.AI_GATEWAY_API_KEY?.trim()),
        },
        genui: {
          gateway: Boolean(process.env.AI_GATEWAY_API_KEY?.trim()),
          typesafeRouting: Boolean(process.env.TYPESAFE_API_KEY?.trim()),
        },
        operator: {
          accessConfigured: isOperatorAccessConfigured(),
          tokenLength: getOperatorAccessToken().length,
        },
      }),
  );
};
