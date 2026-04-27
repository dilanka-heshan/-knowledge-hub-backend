// Assembles the LangGraph StateGraph for the agent pipeline.

import { StateGraph, START, END } from "@langchain/langgraph";
import type { Response } from "express";
import { GraphState } from "./state";
import { plannerNode }          from "./nodes/plannerNode";
import { executorNode }         from "./nodes/executorNode";
import { filterNode }           from "./nodes/filterNode";
import { createResponderNode }  from "./nodes/responderNode";

export function buildAgentGraph(res: Response) {
  return new StateGraph(GraphState)
    .addNode("planner",   plannerNode)
    .addNode("executor",  executorNode)
    .addNode("filter",    filterNode)
    .addNode("responder", createResponderNode(res))
    .addEdge(START,       "planner")
    .addEdge("planner",   "executor")
    .addEdge("executor",  "filter")
    .addEdge("filter",    "responder")
    .addEdge("responder", END)
    .compile();
}
