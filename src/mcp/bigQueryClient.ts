// BigQuery MCP client — calls https://bigquery.googleapis.com/mcp
// using a Google service account key file for OAuth authentication.
//
// Required .env vars:
//   GOOGLE_SA_KEY_FILE  — path to the service account JSON key file
//                          e.g. ./credentials/bigquery-sa.json
//   BIGQUERY_PROJECT_ID — Google Cloud project ID  (e.g. mapnew-427517)

import path from "path";
import fs from "fs";
import { GoogleAuth } from "google-auth-library";

const BQ_MCP_URL = "https://bigquery.googleapis.com/mcp";
const BIGQUERY_SCOPES = ["https://www.googleapis.com/auth/bigquery"];

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const keyFile = process.env.GOOGLE_SA_KEY_FILE;
  if (!keyFile) throw new Error("GOOGLE_SA_KEY_FILE not set in .env");
  const resolved = path.resolve(process.cwd(), keyFile);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Service account key file not found: ${resolved}`);
  }

  const auth = new GoogleAuth({ keyFile: resolved, scopes: BIGQUERY_SCOPES });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Google auth returned empty access token");
  return token;
}

// ── JSON-RPC transport ────────────────────────────────────────────────────────

async function callBqMcp(
  method: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const token = await getAccessToken();

  const resp = await fetch(BQ_MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`BigQuery MCP HTTP ${resp.status}: ${text}`);
  }

  const json = await resp.json() as { result?: unknown; error?: { message: string } };
  if (json.error) throw new Error(`BigQuery MCP error: ${json.error.message}`);
  return json.result;
}

// ── Public helpers ────────────────────────────────────────────────────────────

export async function listBigQueryTools(): Promise<string[]> {
  const result = await callBqMcp("tools/list", {}) as { tools: Array<{ name: string }> };
  return result.tools.map(t => t.name);
}

export async function callBigQueryTool(
  toolName: string,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  const projectId = process.env.BIGQUERY_PROJECT_ID;
  if (!projectId) throw new Error("BIGQUERY_PROJECT_ID not set in .env");

  // Inject projectId automatically if the tool schema requires it
  const args = params.projectId ? params : { projectId, ...params };

  const result = await callBqMcp("tools/call", {
    name:      toolName,
    arguments: args,
  }) as { content: Array<{ text: string; type: string }>; isError?: boolean };

  if (result.isError) {
    const msg = result.content.map(c => c.text).join(" ");
    throw new Error(`BigQuery tool error: ${msg}`);
  }

  // Parse JSON result if the text is JSON, otherwise return raw text
  const text = result.content.map(c => c.text).join("\n");
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export async function listDatasets(projectId?: string): Promise<unknown> {
  return callBigQueryTool("list_dataset_ids", projectId ? { projectId } : {});
}

export async function listTables(datasetId: string, projectId?: string): Promise<unknown> {
  return callBigQueryTool("list_table_ids", { datasetId, ...(projectId ? { projectId } : {}) });
}

export async function getTableInfo(datasetId: string, tableId: string, projectId?: string): Promise<unknown> {
  return callBigQueryTool("get_table_info", { datasetId, tableId, ...(projectId ? { projectId } : {}) });
}

export async function executeReadonlyQuery(sql: string, projectId?: string): Promise<unknown> {
  return callBigQueryTool("execute_sql_readonly", { query: sql, ...(projectId ? { projectId } : {}) });
}

// Write function — use carefully; executes DML/DDL against BigQuery
export async function executeWriteQuery(sql: string, projectId?: string): Promise<unknown> {
  return callBigQueryTool("execute_sql", { query: sql, ...(projectId ? { projectId } : {}) });
}
