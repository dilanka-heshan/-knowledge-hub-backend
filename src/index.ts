// Express app, mounts routes

/**
 * agent/index.ts — Single LLM agent orchestrator
 *
 * Pipeline (all in one file so the flow is easy to follow):
 *
 *   1. INTENT       — classify what the user wants; ask for clarification if vague
 *   2. RAG LOOKUP   — retrieve relevant company knowledge base chunks
 *   3. PLAN         — LLM builds a step list: which tools/sources to call
 *   4. EXECUTE      — call MCP tools (SAP / BigQuery / WorkflowHistory) per plan
 *   5. FILTER       — strip irrelevant / sensitive fields before sending to LLM
 *   6. RESPOND      — stream the final answer back via SSE
 *
 * All LLM calls use claude-sonnet-4-6.
 * Streaming uses the Anthropic SDK's built-in stream() helper.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Response } from "express";
import type {
  AgentContext,
  ChatRequest,
  IntentType,
  PlanStep,
  SSEEvent,
} from "../src/types";
// import { ragRetriever } from "../src/rag/retriever";
// import { mcpExecutor } from "../src/mcp/executor";
// import { filterData } from "../src/filter";
// import { buildIntentPrompt } from "./prompts/intent";
// import { buildPlannerPrompt } from "./prompts/planner";
// import { buildResponderPrompt } from "./prompts/responder";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

// ─── SSE helper ──────────────────────────────────────────────────────────────

function sendSSE(res: Response, event: SSEEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function runAgent(req: ChatRequest, res: Response): Promise<void> {
  const ctx: AgentContext = { request: req };

  try {
    // ── Step 1: INTENT ──────────────────────────────────────────────────
    // Ask the LLM to classify the query and flag if clarification is needed.
    // Returns: { intent, needsClarification, clarificationQuestion }
    const intent = await classifyIntent(ctx);
    ctx.intent = intent.type;

    if (intent.needsClarification) {
      sendSSE(res, { type: "clarification", data: intent.clarificationQuestion });
      res.end();
      return;
    }

    // ── Step 2: RAG LOOKUP ──────────────────────────────────────────────
    // Pull relevant chunks from the company knowledge base (ChromaDB).
    // This gives the planner context about available data / policies.
    ctx.ragContext = await ragRetriever.query(req.query, req.companyId, 5);

    // ── Step 3: PLAN ────────────────────────────────────────────────────
    // LLM receives: user query + RAG context + available MCP tool list.
    // Returns: ordered list of PlanSteps (which tool to call with what params).
    ctx.plan = await buildPlan(ctx);

    // ── Step 4: EXECUTE ─────────────────────────────────────────────────
    // Run each plan step sequentially.
    // MCP calls go through mcpExecutor which routes to the right server.
    ctx.rawResults = await mcpExecutor.execute(ctx.plan, req.companyId);

    // ── Step 5: FILTER ──────────────────────────────────────────────────
    // Decide what data is safe / relevant to send to the LLM for answering.
    // Strips PII columns, applies scope filters (date range, wing, etc.).
    ctx.filteredData = filterData(ctx.rawResults, req.outputOptions);

    // ── Step 6: RESPOND (streaming) ─────────────────────────────────────
    // Stream answer tokens to the frontend via SSE.
    await streamAnswer(ctx, res);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    sendSSE(res, { type: "error", data: message });
    res.end();
  }
}

// ─── Step implementations ─────────────────────────────────────────────────────

async function classifyIntent(ctx: AgentContext): Promise<{
  type: IntentType;
  needsClarification: boolean;
  clarificationQuestion?: string;
}> {
  const prompt = buildIntentPrompt(ctx.request);

  // Non-streaming single call; response is small JSON blob
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  // TODO: parse JSON from response.content[0].text
  // Shape: { intent, needsClarification, clarificationQuestion? }
  const text = (response.content[0] as Anthropic.TextBlock).text;
  return JSON.parse(text);
}

async function buildPlan(ctx: AgentContext): Promise<PlanStep[]> {
  const prompt = buildPlannerPrompt(ctx);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  // TODO: parse JSON array of PlanStep from response
  const text = (response.content[0] as Anthropic.TextBlock).text;
  return JSON.parse(text);
}

async function streamAnswer(ctx: AgentContext, res: Response): Promise<void> {
  const prompt = buildResponderPrompt(ctx);

  // Anthropic streaming — yields text_delta events token by token
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      sendSSE(res, { type: "text_chunk", data: chunk.delta.text });
    }
  }

  // After streaming finishes, send metadata
  sendSSE(res, {
    type: "sources",
    data: ctx.sourceLabels ?? [],
  });

  if (ctx.visualizationHint) {
    sendSSE(res, { type: "visualization_hint", data: ctx.visualizationHint });
  }

  sendSSE(res, { type: "done", data: null });
  res.end();
}