// Planner node — converts the user query into an ordered list of PlanSteps.
// TEMPORARY: uses hardcoded QA pairs. Replace with Dev 1 integration when ready.

import type { AgentContext } from "../../types";
import { buildPlan } from "../../agent/prompts/planner";
import type { GraphStateType } from "../state";

export async function plannerNode(state: GraphStateType) {
  const ctx: AgentContext = {
    request: {
      sessionId:     state.sessionId,
      companyId:     state.companyId,
      query:         state.query,
      history:       state.history,
      outputOptions: state.outputOptions,
      mcpServerIds:  state.mcpServerIds,
    },
  };

  return { plan: buildPlan(ctx) };
}
