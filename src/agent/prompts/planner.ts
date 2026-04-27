// Converts QA pair steps into a PlanStep array.
// TEMPORARY: uses hardcoded QA pairs from Dev 1. Remove qaData import when Dev 1 is integrated.

import type { AgentContext, PlanStep } from "../../types";
import { findMatchingSteps } from "../../temp/qaData";

export function buildPlan(ctx: AgentContext): PlanStep[] {
  // TEMPORARY: look up hardcoded steps; replace with Dev 1 API call when ready
  const steps = findMatchingSteps(ctx.request.query);

  return steps.map((description, i) => ({
    step: i + 1,
    description,
    source: inferSource(description),
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
