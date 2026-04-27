// Agent pipeline: Plan → Execute → Stream answer
//
// Pipeline (simplified for temp mode without Dev 1 integration):
//   1. PLAN    — look up steps from hardcoded QA pairs (TEMPORARY)
//   2. EXECUTE — run each step using mock MCP (TEMPORARY)
//   3. RESPOND — stream final answer via Claude (through OpenRouter)

import type { Response } from "express";
import type { AgentContext, ChatRequest, SSEEvent } from "../types";
import { buildPlan } from "./prompts/planner";
import { buildResponderPrompt } from "./prompts/responder";
import { filterData } from "./filter";
import { mcpExecutor } from "../mcp/executor";
import { streamChatCompletion } from "../llm/openRouter";
import type { StepResult } from "../temp/mockMcpExecutor";

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export async function runAgent(req: ChatRequest, res: Response): Promise<void> {
  const ctx: AgentContext = { request: req };

  try {
    // Step 1: Plan — get ordered steps from QA pairs (TEMPORARY: replace with Dev 1 call)
    ctx.plan = buildPlan(ctx);

    // Step 2: Execute — fetch data for each step using mock MCP (TEMPORARY)
    ctx.rawResults = await mcpExecutor.execute(ctx.plan, req.companyId);

    // Step 3: Extract visualization hint (from Visualization Agent steps)
    type VizHint = "bar_chart" | "line_chart" | "table" | "pie_chart";
    const vizHint = (ctx.rawResults as StepResult[]).find(r => r.visualizationHint)?.visualizationHint;
    if (vizHint) {
      ctx.visualizationHint = vizHint as VizHint;
      sendSSE(res, { type: "visualization_hint", data: ctx.visualizationHint });
    }

    // Step 4: Filter data for LLM context
    ctx.filteredData = filterData(ctx.rawResults, req.outputOptions);

    // Step 5: Collect source labels for attribution
    ctx.sourceLabels = (ctx.rawResults as StepResult[])
      .filter(r => r.data !== null && !r.isLlmStep)
      .map(r => r.description);

    // Step 6: Stream the answer via Claude (OpenRouter)
    await streamAnswer(ctx, res);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    sendSSE(res, { type: "error", data: message });
    res.end();
  }
}

async function streamAnswer(ctx: AgentContext, res: Response): Promise<void> {
  const prompt = buildResponderPrompt(ctx);

  const stream = streamChatCompletion(
    [{ role: "user", content: prompt }],
    2000
  );

  for await (const text of stream) {
    sendSSE(res, { type: "text_chunk", data: text });
  }

  sendSSE(res, { type: "sources", data: ctx.sourceLabels ?? [] });

  if (ctx.visualizationHint) {
    sendSSE(res, { type: "visualization_hint", data: ctx.visualizationHint });
  }

  if (ctx.request.outputOptions.wantReport) {
    sendSSE(res, {
      type: "report_ready",
      data: { downloadUrl: `/api/reports/download?sessionId=${ctx.request.sessionId}` },
    });
  }

  sendSSE(res, { type: "done", data: null });
  res.end();
}
