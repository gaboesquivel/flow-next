import { generateDemoData, generateDemoDataInputSchema } from "@/lib/demo/generate-demo-data";
import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";

export default defineTool({
  approval: once(),
  description:
    "Generate deterministic synthetic demo records for allowed schemas (users, support_tickets, orders).",
  execute(input) {
    return generateDemoData(input);
  },
  inputSchema: generateDemoDataInputSchema,
});
