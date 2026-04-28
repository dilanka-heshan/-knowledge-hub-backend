// Converts QA pair steps into a PlanStep array.
// TEMPORARY: uses hardcoded QA pairs from Dev 1. Remove qaData import when Dev 1 is integrated.

import type { AgentContext, PlanStep } from "../../types";
import { findMatchingSteps } from "../../temp/qaData";

export function buildPlan(ctx: AgentContext): PlanStep[] {
  const steps = findMatchingSteps(ctx.request.query);

  console.log(`\n[Planner] query="${ctx.request.query}" → matched ${steps.length} step(s):`);
  steps.forEach((s, i) => console.log(`  [${i}] source="${s.source ?? "?"}" toolName="${s.toolName ?? "none"}" | ${s.description.substring(0, 70)}`));

  return steps.map((step, i) => ({
    step:        i + 1,
    description: step.description,
    // Step can override source explicitly; otherwise infer from description or toolName
    source:      (step.source as PlanStep["source"]) ?? (step.toolName ? "mcp" : inferSource(step.description)),
    ...(step.toolName ? { toolName: step.toolName } : {}),
    ...(step.params   ? { params:   step.params   } : {}),
  }));
}

function inferSource(description: string): PlanStep["source"] {
  const d = description.toLowerCase();
  if (d.includes("history agent") || d.includes("conversation")) return "workflow_history";
  if (d.includes("fleet") || d.includes("vehicle"))              return "sap";
  if (d.includes("bigquery") || d.includes("database"))          return "bigquery";
  if (d.includes("rag") || d.includes("knowledge base"))         return "rag";
  return "dummy";
}
