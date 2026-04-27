// Agent entry point — builds and runs the LangGraph pipeline.
//
// Flow: plannerNode → executorNode → filterNode → responderNode
// Each node updates shared GraphState; responderNode streams SSE to the client.

import type { Response } from "express";
import type { ChatRequest, SSEEvent } from "../types";
import type { GraphStateType } from "../graph/state";
import { buildAgentGraph } from "../graph/builder";
import { saveHistory } from "../history/fileStore";

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export async function runAgent(req: ChatRequest, res: Response): Promise<void> {
  try {
    const graph = buildAgentGraph(res);

    // LangGraph's invoke() input uses internal ValueType/OverwriteValue generics
    // that TypeScript 6 cannot automatically satisfy. Values are correct at runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (graph as any).invoke({
      sessionId:     req.sessionId,
      companyId:     req.companyId,
      query:         req.query,
      history:       req.history,
      outputOptions: req.outputOptions,
      mcpServerIds:  req.mcpServerIds,
    }) as GraphStateType;

    // Persist the full conversation turn to a local file.
    // TEMPORARY: replace saveHistory with a MongoDB call when ready.
    if (result.fullResponse) {
      saveHistory(req.sessionId, [
        ...req.history,
        { role: "user",      content: req.query },
        { role: "assistant", content: result.fullResponse },
      ]);
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    sendSSE(res, { type: "error", data: message });
    res.end();
  }
}
