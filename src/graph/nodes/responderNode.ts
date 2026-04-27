// Responder node factory — streams the final Claude answer via SSE.
// Takes Express Response as a closure so SSE events can be written during streaming.

import type { Response } from "express";
import type { AgentContext, SSEEvent } from "../../types";
import { buildResponderPrompt } from "../../agent/prompts/responder";
import { streamChatCompletion } from "../../llm/openRouter";
import type { GraphStateType } from "../state";

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function createResponderNode(res: Response) {
  return async (state: GraphStateType) => {
    // Build the AgentContext that responder prompts expect
    const ctx: AgentContext = {
      request: {
        sessionId:     state.sessionId,
        companyId:     state.companyId,
        query:         state.query,
        history:       state.history,
        outputOptions: state.outputOptions,
        mcpServerIds:  state.mcpServerIds,
      },
      rawResults:   state.rawResults,
      filteredData: state.filteredData,
      sourceLabels: state.sourceLabels,
    };

    // Attach visualization hint if present
    if (state.visualizationHint) {
      type VizHint = "bar_chart" | "line_chart" | "table" | "pie_chart";
      ctx.visualizationHint = state.visualizationHint as VizHint;
      sendSSE(res, { type: "visualization_hint", data: state.visualizationHint });
    }

    // Stream answer and collect the full text for history persistence
    const prompt = buildResponderPrompt(ctx);
    let fullResponse = "";

    for await (const chunk of streamChatCompletion([{ role: "user", content: prompt }], 2000)) {
      sendSSE(res, { type: "text_chunk", data: chunk });
      fullResponse += chunk;
    }

    sendSSE(res, { type: "sources", data: state.sourceLabels });

    if (state.outputOptions.wantReport) {
      sendSSE(res, {
        type: "report_ready",
        data: { downloadUrl: `/api/reports/download?sessionId=${state.sessionId}` },
      });
    }

    sendSSE(res, { type: "done", data: null });
    res.end();

    return { fullResponse };
  };
}
