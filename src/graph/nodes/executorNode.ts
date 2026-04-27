// Executor node — runs each plan step through the MCP executor.
// TEMPORARY: uses mock MCP data. Replace with real MCP calls when ready.

import { mcpExecutor } from "../../mcp/executor";
import type { StepResult } from "../../temp/mockMcpExecutor";
import type { GraphStateType } from "../state";

export async function executorNode(state: GraphStateType) {
  const rawResults = await mcpExecutor.execute(state.plan, state.companyId) as StepResult[];
  return { rawResults };
}
