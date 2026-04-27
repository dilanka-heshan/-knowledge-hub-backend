// Routes each PlanStep to the appropriate MCP client.
// TEMPORARY: uses mock executor. Swap executeMockStep with real MCP clients when ready.

import type { PlanStep } from "../types";
import { executeMockStep, type StepResult } from "../temp/mockMcpExecutor";

export const mcpExecutor = {
  async execute(plan: PlanStep[], _companyId: string): Promise<StepResult[]> {
    const results: StepResult[] = [];
    for (const step of plan) {
      const result = await executeMockStep(step);
      results.push(result);
    }
    return results;
  },
};
