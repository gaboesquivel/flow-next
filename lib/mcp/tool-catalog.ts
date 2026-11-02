import { RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";

import { GENUI_PREVIEW_RESOURCE_URI } from "./genui-preview-resource";

/** Public MCP server identity, shared by the server factory and discovery documents. */
export const starterMcpServerInfo = { name: "flow-next", version: "1.0.0" } as const;

export interface StarterMcpToolCard {
  description: string;
  name: string;
}

export const starterMcpToolCatalog: StarterMcpToolCard[] = [
  {
    description: "Liveness check for the MCP server.",
    name: "health",
  },
  {
    description: "List registered GenUI root components.",
    name: "list_component_catalog",
  },
  {
    description: "Generate a validated OpenUI composition from a natural-language UI request.",
    name: "compose_ui",
  },
];

export const buildMcpServerCard = (origin: string) => ({
  authentication: { required: false },
  description: "Agentic UI starter — compose OpenUI layouts with synthetic data over MCP.",
  resources: [
    {
      description: "GenUI Preview MCP App",
      mimeType: RESOURCE_MIME_TYPE,
      uri: GENUI_PREVIEW_RESOURCE_URI,
    },
  ],
  serverInfo: {
    name: starterMcpServerInfo.name,
    title: "Flow Next MCP",
    version: starterMcpServerInfo.version,
  },
  tools: starterMcpToolCatalog,
  transport: {
    endpoint: `${origin}/api/mcp`,
    type: "streamable-http",
  },
  version: "1.0",
});

export const buildMcpRegistryManifest = (origin: string) => ({
  mcpServers: {
    [starterMcpServerInfo.name]: {
      transport: {
        type: "http",
        url: `${origin}/api/mcp`,
      },
    },
  },
  serverCard: `${origin}/.well-known/mcp/server-card.json`,
});

export const buildAiCatalog = (origin: string) => ({
  servers: [
    {
      description: "Flow Next MCP — GenUI compose and catalog tools.",
      name: starterMcpServerInfo.name,
      transport: {
        type: "streamable-http",
        url: `${origin}/api/mcp`,
      },
      url: `${origin}/.well-known/mcp/server-card.json`,
    },
  ],
  version: "1.0",
});
