import { McpServer } from "@modelcontextprotocol/server";

import { registerGenuiPreviewResource } from "./genui-preview-resource";
import { registerOperatorMcpTools } from "./register-operator-tools";
import { registerStarterMcpTools } from "./register-tools";
import { starterMcpServerInfo } from "./tool-catalog";

export const createOperatorMcpServer = () => {
  const server = new McpServer({
    name: `${starterMcpServerInfo.name}-operator`,
    version: starterMcpServerInfo.version,
  });
  registerGenuiPreviewResource(server, "GenUI Preview (Operator)");
  registerStarterMcpTools(server);
  registerOperatorMcpTools(server);
  return server;
};
