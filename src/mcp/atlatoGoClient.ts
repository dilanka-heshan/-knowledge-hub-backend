// Lazy singleton that connects to the Atlato Go MCP server.
// Tools are fetched once and cached for the process lifetime.
// Call callAtlatoGoTool() to invoke any tool on the server.

import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTool = any;

let toolsCache: AnyTool[] | null = null;

async function getMcpTools(): Promise<AnyTool[]> {
  if (toolsCache) return toolsCache;

  const url   = process.env.MCP_ATLATO_GO_URL;
  const token = process.env.MCP_ATLATO_GO_TOKEN;
  if (!url || !token) {
    throw new Error("MCP_ATLATO_GO_URL and MCP_ATLATO_GO_TOKEN must be set in .env");
  }

  const client = new MultiServerMCPClient({
    "atlato-go": {
      transport: "http",
      url,
      headers: {
        "userip":        "127.0.0.0",
        "Authorization": `Bearer ${token}`,
        "core":          "1",
      },
      defaultToolTimeout: 30 * 60 * 1000,
    } as any,  // MultiServerMCPClient accepts custom transport shapes at runtime
  });

  toolsCache = await client.getTools();
  return toolsCache;
}

export async function callAtlatoGoTool(
  toolName: string,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  const tools = await getMcpTools();
  const tool  = tools.find((t: AnyTool) => t.name === toolName);
  if (!tool) throw new Error(`MCP tool "${toolName}" not found on Atlato Go server`);
  return tool.invoke(params);
}

export async function listAtlatoGoTools(): Promise<string[]> {
  const tools = await getMcpTools();
  return tools.map((t: AnyTool) => t.name as string);
}
