import { composeToolInputShape, runComposeTool } from "@/lib/genui/compose-tool";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description:
    "Generate a validated OpenUI composition from a natural-language UI request (synthetic demo data).",
  execute: (args) => runComposeTool("eve", args),
  // The Eve tool accepts any numeric libraryVersion on priorEnvelope (MCP and HTTP require the current one).
  inputSchema: z.object(composeToolInputShape(z.number())),
});
