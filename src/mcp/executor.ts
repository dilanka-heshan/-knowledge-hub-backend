// Routes each PlanStep to the appropriate MCP client.
//   source "mcp"      + toolName  → Atlato Go MCP server
//   source "bigquery" + toolName  → Google BigQuery MCP server
//   everything else               → mock executor

import type { PlanStep } from "../types";
import { executeMockStep, type StepResult } from "../temp/mockMcpExecutor";
import { callAtlatoGoTool }  from "./atlatoGoClient";
import { callBigQueryTool }  from "./bigQueryClient";
import { chatCompletion }    from "../llm/openRouter";

const BQ_PROJECT = process.env.BIGQUERY_PROJECT_ID ?? "mapnew-427517";
const BQ_TABLES   = ["patients", "encounters", "diagnoses", "lab_results", "medications", "vitals"];

// Cached real column names fetched from BigQuery once per process lifetime.
let schemaCache: string | null = null;

async function getTableSchemas(): Promise<string> {
  if (schemaCache) return schemaCache;

  const lines: string[] = [];
  for (const tableId of BQ_TABLES) {
    try {
      const info = await callBigQueryTool("get_table_info", { datasetId: "medical_data", tableId }) as any;
      const fields: Array<{ name: string; type: string }> =
        info?.schema?.fields ?? info?.fields ?? [];
      const cols = Array.isArray(fields) && fields.length > 0
        ? fields.map(f => `${f.name}(${f.type})`).join(", ")
        : JSON.stringify(info).substring(0, 300);
      lines.push(`${tableId}: ${cols}`);
    } catch {
      lines.push(`${tableId}: (unavailable)`);
    }
  }

  schemaCache = lines.join("\n");
  console.log(`\n[BigQuery MCP] ✦ real table schemas cached:\n${schemaCache}\n`);
  return schemaCache;
}

// Uses LLM to generate BigQuery SQL from a natural-language description.
async function generateBigQuerySQL(description: string): Promise<string> {
  const schemas = await getTableSchemas();

  const prompt = `You are a BigQuery SQL expert. Generate a single valid BigQuery SQL query.

BigQuery project: ${BQ_PROJECT}
Dataset: medical_data
Real table schemas (use ONLY these column names):
${schemas}

Request: ${description}

Rules:
- Return ONLY the raw SQL — no markdown, no code fences, no explanation
- Use backtick-quoted full table paths: \`${BQ_PROJECT}.medical_data.tablename\`
- Only reference column names listed in the schemas above
- Use SAFE_CAST when casting result_value or similar text fields to FLOAT64
- Only add a LIMIT if the request explicitly mentions one`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], 800 /* old: 800 */);
  return raw.replace(/```sql\n?/gi, "").replace(/```\n?/g, "").trim();
}

export const mcpExecutor = {
  async execute(plan: PlanStep[], _companyId: string): Promise<StepResult[]> {
    const results: StepResult[] = [];

    console.log(`\n[Executor] Received ${plan.length} plan step(s):`);
    for (const s of plan) {
      console.log(`  Step ${s.step}: source="${s.source}" toolName="${s.toolName ?? "none"}" | ${s.description.substring(0, 80)}`);
    }

    for (const step of plan) {
      if (step.source === "mcp" && step.toolName) {
        try {
          console.log(`\n[Atlato MCP] ▶ calling tool: ${step.toolName}`, step.params ?? {});
          const data = await callAtlatoGoTool(step.toolName, step.params ?? {});
          console.log(`[Atlato MCP] ◀ response:\n`, JSON.stringify(data, null, 2));
          results.push({ step: step.step, description: step.description, data, isLlmStep: false });
        } catch (err) {
          console.error(`[Atlato MCP] tool "${step.toolName}" failed:`, err instanceof Error ? err.message : err);
          results.push({ step: step.step, description: step.description, data: null, isLlmStep: true });
        }

      } else if (step.source === "bigquery" && step.toolName) {
        try {
          let params: Record<string, unknown> = step.params ?? {};

          // If no query provided, generate SQL from the step description using LLM
          const needsSql =
            (step.toolName === "execute_sql_readonly" || step.toolName === "execute_sql") &&
            !params.query;

          if (needsSql) {
            console.log(`\n[BigQuery MCP] ✦ generating SQL for: "${step.description}"`);
            const sql = await generateBigQuerySQL(step.description);
            console.log(`[BigQuery MCP] ✦ generated SQL:\n${sql}\n`);
            params = { ...params, query: sql };
          }

          console.log(`\n[BigQuery MCP] ▶ calling tool: ${step.toolName}`, params);
          const data = await callBigQueryTool(step.toolName, params);
          console.log(`[BigQuery MCP] ◀ response:\n`, JSON.stringify(data, null, 2));
          results.push({ step: step.step, description: step.description, data, isLlmStep: false });
        } catch (err) {
          console.error(`[BigQuery MCP] tool "${step.toolName}" failed:`, err instanceof Error ? err.message : err);
          results.push({ step: step.step, description: step.description, data: null, isLlmStep: true });
        }

      } else {
        const result = await executeMockStep(step);
        if (!result.isLlmStep && result.data !== null) {
          console.log(`\n[Mock MCP] ▶ step ${step.step}: ${step.description}`);
          console.log(`[Mock MCP] ◀ data:\n`, JSON.stringify(result.data, null, 2));
        }
        results.push(result);
      }
    }

    return results;
  },
};
