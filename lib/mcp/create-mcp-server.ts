import { McpServer } from "@modelcontextprotocol/server";

import { registerGenuiPreviewResource } from "./genui-preview-resource";
import { registerStarterMcpTools } from "./register-tools";
import { starterMcpServerInfo } from "./tool-catalog";

export const createStarterMcpServer = () => {
  const server = new McpServer({ ...starterMcpServerInfo });
  registerGenuiPreviewResource(server, "GenUI Preview");
  registerStarterMcpTools(server);
  return server;
};
