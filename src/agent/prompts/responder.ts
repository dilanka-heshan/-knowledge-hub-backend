// Builds the final LLM prompt with retrieved data and conversation history.

import type { AgentContext } from "../../types";
import type { StepResult } from "../../temp/mockMcpExecutor";

export function buildResponderPrompt(ctx: AgentContext): string {
  const history = buildHistoryContext(ctx);
  const data = buildDataContext(ctx);

  return `
You are Atlato-One, an intelligent business assistant for the Atlato platform.
Answer the user's question clearly and helpfully.

${history}
User question: "${ctx.request.query}"

${data}
Instructions:
- Be concise and professional
- Summarize key insights from any retrieved data
- Format numbers clearly (e.g., "65 km/h", "78% fuel level")
- If no data is available, answer from your own knowledge
- Do not mention internal system steps or agent names in your response
`.trim();
}

function buildHistoryContext(ctx: AgentContext): string {
  const recent = ctx.request.history.slice(-4);
  if (recent.length === 0) return "";

  const lines = recent
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
  return `Recent conversation:\n${lines}\n`;
}

function buildDataContext(ctx: AgentContext): string {
  if (!ctx.rawResults || ctx.rawResults.length === 0) return "";

  const parts: string[] = [];
  for (const r of ctx.rawResults as StepResult[]) {
    if (r.data !== null && !r.isLlmStep) {
      parts.push(`[${r.description}]\n${JSON.stringify(r.data, null, 2)}`);
    }
  }

  return parts.length > 0 ? `Retrieved data:\n${parts.join("\n\n")}` : "";
}
