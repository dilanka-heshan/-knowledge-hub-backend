//  classify intent → JSON

/**
 * prompts/intent.ts — Prompt for intent classification
 *
 * LLM is asked to return a small JSON object:
 * {
 *   "intent": "data_query" | "report_request" | "general_qa" | "clarification_needed",
 *   "needsClarification": boolean,
 *   "clarificationQuestion": string | null
 * }
 *
 * needsClarification = true when the query is too vague to build a reliable plan.
 * Example: "show me the report" → unclear which report, which period.
 */

import type { ChatRequest } from "../../types";

export function buildIntentPrompt(req: ChatRequest): string {
  return `
You are an intent classifier for a business intelligence assistant.

Classify the user's query and respond ONLY with valid JSON matching this shape:
{
  "intent": "data_query" | "report_request" | "general_qa" | "clarification_needed",
  "needsClarification": boolean,
  "clarificationQuestion": string | null
}

Rules:
- "data_query"         → user wants to fetch or analyse data from SAP / BigQuery / workflow history
- "report_request"     → user explicitly wants a downloadable document
- "general_qa"         → answerable from the knowledge base without live data
- "clarification_needed" → the query is too vague to proceed (set needsClarification: true)

User query: "${req.query}"

Recent conversation context (last 2 turns):
${req.history.slice(-2).map((m) => `${m.role}: ${m.content}`).join("\n")}

Respond with JSON only. No explanation.
`.trim();
}