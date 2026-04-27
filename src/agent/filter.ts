// Extracts relevant data results from raw MCP output for the LLM context.

import type { OutputOptions } from "../types";
import type { StepResult } from "../temp/mockMcpExecutor";

export function filterData(rawResults: unknown[], options: OutputOptions): Record<string, unknown> {
  const results = rawResults as StepResult[];

  const dataResults = results
    .filter(r => r.data !== null && !r.isLlmStep)
    .map(r => ({ description: r.description, data: r.data }));

  return {
    results: dataResults,
    scope: options.scope,
    wantReport: options.wantReport,
    wantDiagram: options.wantDiagram,
  };
}
