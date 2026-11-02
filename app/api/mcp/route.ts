import { createStarterMcpServer } from "@/lib/mcp/create-mcp-server";
import { handleMcpRequest } from "@/lib/mcp/handle-mcp-request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handleMcp = (request: Request) =>
  handleMcpRequest({ createServer: createStarterMcpServer, request });

export const POST = handleMcp;
export const GET = handleMcp;
export const DELETE = handleMcp;
export { handleMcpOptions as OPTIONS } from "@/lib/mcp/handle-mcp-request";
