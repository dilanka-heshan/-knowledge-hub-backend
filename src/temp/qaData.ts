// TEMPORARY — hardcoded QA pairs from Dev 1 pipeline.
// Replace with real Dev 1 API integration when ready.

export interface QaStep {
  description: string;
  toolName?: string;   // set for real MCP tool calls; omit for mock/LLM steps
  source?: string;     // override source (e.g. "bigquery"); inferred from description if omitted
  params?: Record<string, unknown>;  // fixed params to pass to the tool
}

export interface QaPair {
  question: string;
  steps: QaStep[];
}

export const QA_PAIRS: QaPair[] = [
  // ── Greetings ───────────────────────────────────────────────────────────────
  {
    question: "hi",
    steps: [{ description: "Generate a friendly greeting as Atlato-One using Language Generation Agent" }]
  },
  {
    question: "hello",
    steps: [{ description: "Generate a friendly greeting as Atlato-One using Language Generation Agent" }]
  },
  {
    question: "who are you",
    steps: [{ description: "Generate an introduction as Atlato-One using Language Generation Agent" }]
  },
  {
    question: "what can you do",
    steps: [{ description: "Generate a capabilities overview of Atlato-One using Language Generation Agent" }]
  },
  {
    question: "how are you",
    steps: [{ description: "Generate a friendly status response as Atlato-One using Language Generation Agent" }]
  },

  // ── Fleet & Vehicle ─────────────────────────────────────────────────────────
  {
    question: "what is the current speed of all vehicles",
    steps: [
      { description: "Retrieve current vehicle speed data from Fleet MCP Server" },
      { description: "Generate a speed summary using Language Generation Agent" },
    ]
  },
  {
    question: "show me fleet status",
    steps: [
      { description: "Retrieve fleet status including speed, fuel, and location from Fleet MCP Server" },
      { description: "Generate a fleet status report using Language Generation Agent" },
    ]
  },
  {
    question: "show fuel levels of all vehicles",
    steps: [
      { description: "Retrieve fuel level data for all vehicles from Fleet MCP Server" },
      { description: "Generate a fuel status report using Language Generation Agent" },
    ]
  },
  {
    question: "which vehicles are idle",
    steps: [
      { description: "Retrieve vehicle activity status from Fleet MCP Server" },
      { description: "List idle vehicles using Language Generation Agent" },
    ]
  },
  {
    question: "show vehicle locations",
    steps: [
      { description: "Retrieve current vehicle locations from Fleet MCP Server" },
      { description: "Generate a location summary using Language Generation Agent" },
    ]
  },
  {
    question: "generate fleet report",
    steps: [
      { description: "Retrieve all fleet data from Fleet MCP Server" },
      { description: "Generate visualizations using Visualization Agent: bar chart for fuel levels, line chart for speed trends, table for vehicle details" },
      { description: "Generate a comprehensive fleet report using Language Generation Agent" },
    ]
  },
  {
    question: "generate a vehicle report with charts",
    steps: [
      { description: "Retrieve vehicle speeds, fuel levels, and maintenance status from Fleet MCP Server" },
      { description: "Generate visualizations using Visualization Agent: line chart for speed trends, bar chart for fuel levels, pie chart for vehicle status distribution, table for vehicle details" },
      { description: "Generate a comprehensive vehicle report using Language Generation Agent" },
    ]
  },

  // ── Maintenance History (Atlato Go MCP) ─────────────────────────────────────
  {
    question: "show maintenance history",
    steps: [
      { description: "Execute tool in Atlato Go MCP, want to fetch data mock data maintenance history record"},
      { description: "Generate a maintenance history summary using Language Generation Agent" },
    ]
  },
  {
    question: "show vehicle maintenance records",
    steps: [
      { description: "Fetch vehicle maintenance history records from Atlato Go MCP", toolName: "get-mock-data-maintenance-history-record" },
      { description: "Generate a maintenance records report using Language Generation Agent" },
    ]
  },
  {
    question: "which vehicles need maintenance",
    steps: [
      { description: "Fetch vehicle maintenance history records from Atlato Go MCP", toolName: "get-mock-data-maintenance-history-record" },
      { description: "Identify overdue vehicles and generate maintenance alert using Language Generation Agent" },
    ]
  },
  {
    question: "maintenance status",
    steps: [
      { description: "Fetch vehicle maintenance history records from Atlato Go MCP", toolName: "get-mock-data-maintenance-history-record" },
      { description: "Generate maintenance status overview using Language Generation Agent" },
    ]
  },
  {
    question: "show maintenance due vehicles",
    steps: [
      { description: "Fetch vehicle maintenance history records from Atlato Go MCP", toolName: "get-mock-data-maintenance-history-record" },
      { description: "List vehicles due for maintenance using Language Generation Agent" },
    ]
  },

  // ── Weather & Internet ──────────────────────────────────────────────────────
  {
    question: "what is the weather in colombo",
    steps: [
      { description: "Fetch current weather data for Colombo from Internet Accessing Agent" },
      { description: "Generate a weather summary using Language Generation Agent" },
    ]
  },
  {
    question: "is it going to rain today in colombo",
    steps: [
      { description: "Fetch rain forecast for Colombo from Internet Accessing Agent" },
      { description: "Generate a rain forecast response using Language Generation Agent" },
    ]
  },
  {
    question: "what is today's date",
    steps: [
      { description: "Get current date from Internet Accessing Agent" },
      { description: "Return the date using Language Generation Agent" },
    ]
  },
  {
    question: "what is the weather in kandy",
    steps: [
      { description: "Fetch current weather data for Kandy from Internet Accessing Agent" },
      { description: "Generate a weather summary using Language Generation Agent" },
    ]
  },

  // ── History & Conversation ──────────────────────────────────────────────────
  {
    question: "summarize our previous discussion",
    steps: [
      { description: "Retrieve previous conversation data from History Agent" },
      { description: "Generate a summary using Language Generation Agent" },
    ]
  },
  {
    question: "what was the last question i asked",
    steps: [
      { description: "Retrieve last user query from History Agent" },
      { description: "Generate a response using Language Generation Agent" },
    ]
  },
  {
    question: "what were the key points we discussed",
    steps: [
      { description: "Retrieve recent conversation history from History Agent" },
      { description: "Generate key points summary using Language Generation Agent" },
    ]
  },
  {
    question: "create a pdf report of our earlier chat about fleet data",
    steps: [
      { description: "Retrieve chat history related to fleet data from History Agent" },
      { description: "Generate visualizations using Visualization Agent: bar chart for fuel levels, table for fleet data" },
      { description: "Generate a PDF report using Language Generation Agent" },
    ]
  },
  {
    question: "what did we talk about yesterday",
    steps: [
      { description: "Retrieve yesterday's conversation history from History Agent" },
      { description: "Generate a summary using Language Generation Agent" },
    ]
  },

  // ── Agriculture ─────────────────────────────────────────────────────────────
  {
    question: "show crop monitoring data",
    steps: [
      { description: "Retrieve crop and soil data from Agriculture MCP Server" },
      { description: "Generate a crop health summary using Language Generation Agent" },
    ]
  },
  {
    question: "what is the soil moisture level",
    steps: [
      { description: "Retrieve soil moisture data from Agriculture MCP Server" },
      { description: "Generate a soil health report using Language Generation Agent" },
    ]
  },
  {
    question: "which crops need attention",
    steps: [
      { description: "Retrieve crop status and alerts from Agriculture MCP Server" },
      { description: "List crops requiring attention using Language Generation Agent" },
    ]
  },
  {
    question: "generate agriculture report",
    steps: [
      { description: "Retrieve all crop and soil data from Agriculture MCP Server" },
      { description: "Generate visualizations using Visualization Agent: bar chart for soil moisture, pie chart for crop status distribution, table for zone details" },
      { description: "Generate a comprehensive agriculture report using Language Generation Agent" },
    ]
  },

  // ── BigQuery ─────────────────────────────────────────────────────────────────
  {
    question: "show bigquery datasets",
    steps: [
      { description: "List all BigQuery datasets in the project", toolName: "list_dataset_ids", source: "bigquery" },
      { description: "Generate a dataset overview using Language Generation Agent" },
    ]
  },
  {
    question: "list bigquery tables",
    steps: [
      { description: "List all BigQuery datasets in the project", toolName: "list_dataset_ids", source: "bigquery" },
      { description: "Generate a tables overview using Language Generation Agent" },
    ]
  },
  {
    question: "run bigquery sql query",
    steps: [
      { description: "Execute a read-only SQL query in BigQuery", toolName: "execute_sql_readonly", source: "bigquery", params: { query: "SELECT 1 AS test" } },
      { description: "Generate a query result summary using Language Generation Agent" },
    ]
  },
  {
    question: "write bigquery test",
    steps: [
      { description: "Execute a write SQL query in BigQuery to test the write connection", toolName: "execute_sql", source: "bigquery", params: { query: "SELECT CURRENT_TIMESTAMP() AS test_time, 'write_test' AS label" } },
      { description: "Confirm write query result using Language Generation Agent" },
    ]
  },

  // ── Medical Data (BigQuery) — LLM generates SQL from description ─────────────
  {
    question: "give me a summary of all patients",
    steps: [
      { description: "Query BigQuery: give me a summary of all patients in mapnew-427517.medical_data — total count, gender breakdown, blood type distribution, and top 3 insurance providers", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a comprehensive patient summary report using Language Generation Agent" },
    ]
  },
  {
    question: "patient overview",
    steps: [
      { description: "Query BigQuery: give me a summary of all patients in mapnew-427517.medical_data — total count, gender breakdown, blood type distribution, and top 3 insurance providers", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a comprehensive patient summary report using Language Generation Agent" },
    ]
  },
  {
    question: "show all patients",
    steps: [
      { description: "Query BigQuery: list ALL patient records from mapnew-427517.medical_data.patients — show patient_id, first_name, last_name, gender, age, blood_type, insurance_provider. No limit, return all rows", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Present the patient list using Language Generation Agent" },
    ]
  },
  {
    question: "show patient list",
    steps: [
      { description: "Query BigQuery: list ALL patient records from mapnew-427517.medical_data.patients — show patient_id, first_name, last_name, gender, age, blood_type, insurance_provider. No limit, return all rows", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Present the patient list using Language Generation Agent" },
    ]
  },
  {
    question: "show patient age distribution",
    steps: [
      { description: "Query BigQuery: show patient age distribution by decade (0-9, 10-19, 20-29, etc.) from mapnew-427517.medical_data.patients — count of patients per age group", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate an age distribution report using Language Generation Agent" },
    ]
  },
  {
    question: "show department activity",
    steps: [
      { description: "Query BigQuery: show total encounters per department and encounter type, and which department has the highest average total charges in mapnew-427517.medical_data.encounters", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a department activity report highlighting the highest-charge departments using Language Generation Agent" },
    ]
  },
  {
    question: "what are the top diagnoses",
    steps: [
      { description: "Query BigQuery: what are the top 10 most common diagnoses in mapnew-427517.medical_data.diagnoses — ICD-10 code, description, count, and severity breakdown (mild, moderate, severe)", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a top diagnoses report with severity breakdown using Language Generation Agent" },
    ]
  },
  {
    question: "check lab results schema",
    steps: [
      { description: "Inspect the lab_results table schema to see all column names and types from BigQuery medical_data", toolName: "get_table_info", source: "bigquery", params: { datasetId: "medical_data", tableId: "lab_results" } },
      { description: "List the lab_results table columns and their data types using Language Generation Agent" },
    ]
  },
  {
    question: "show abnormal lab results",
    steps: [
      { description: "Query BigQuery: in mapnew-427517.medical_data.lab_results, which tests have the most abnormal results? Show test name, total count, abnormal count, abnormal percentage, and average result value", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate an abnormal lab results analysis report using Language Generation Agent" },
    ]
  },
  {
    question: "show vital signs statistics",
    steps: [
      { description: "Query BigQuery: from mapnew-427517.medical_data.vitals, show average systolic BP, diastolic BP, heart rate, SpO2, BMI and temperature. Also count how many readings show hypertension (systolic > 140), tachycardia (heart rate > 100), and low oxygen (SpO2 < 94)", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a population vital signs summary with clinical alerts using Language Generation Agent" },
    ]
  },
  {
    question: "show most prescribed medications",
    steps: [
      { description: "Query BigQuery: show the top 10 most prescribed medications in mapnew-427517.medical_data.medications with their most common route, frequency, and count of active vs inactive prescriptions", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a top medications report with prescribing patterns using Language Generation Agent" },
    ]
  },
  {
    question: "show financial summary",
    steps: [
      { description: "Query BigQuery: run a billing analysis on mapnew-427517.medical_data.encounters — total charges, average charges per encounter type, average insurance coverage percentage, and total patient out-of-pocket cost", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a financial and billing summary report using Language Generation Agent" },
    ]
  },
  {
    question: "find diabetes patients with abnormal hba1c",
    steps: [
      { description: "Query BigQuery: in mapnew-427517.medical_data, find patients diagnosed with Type 2 Diabetes (ICD-10 code E11.9) who also have abnormal HbA1c lab results. Show patient_id, number of encounters, average HbA1c value, and most recent diagnosis status. Limit 20", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a diabetes patient HbA1c analysis report using Language Generation Agent" },
    ]
  },
  {
    question: "show recent encounters",
    steps: [
      { description: "Query BigQuery: show the most recent 50 patient encounters from mapnew-427517.medical_data.encounters — encounter_id, patient_id, department, encounter_type, admission_date, total_charges, ordered by admission_date descending", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Present the recent encounters using Language Generation Agent" },
    ]
  },
  {
    question: "show high risk patients",
    steps: [
      { description: "Query BigQuery: identify high-risk patients in mapnew-427517.medical_data — patients who have 3 or more diagnoses AND have vitals showing hypertension (systolic_bp > 140) or low oxygen (spo2 < 94). Show patient_id, diagnosis count, and concerning vital signs", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Generate a high-risk patient alert report using Language Generation Agent" },
    ]
  },
  {
    question: "show patient medications",
    steps: [
      { description: "Query BigQuery: list all active medication prescriptions from mapnew-427517.medical_data.medications — patient_id, medication_name, route, frequency, start_date. Limit 100", toolName: "execute_sql_readonly", source: "bigquery" },
      { description: "Present the medication list using Language Generation Agent" },
    ]
  },
];

// Find the best matching steps for a given question using exact then keyword matching.
export function findMatchingSteps(question: string): QaStep[] {
  const q = question.toLowerCase().trim().replace(/[?!.,]/g, "");

  // Exact match
  const exact = QA_PAIRS.find(p => p.question.toLowerCase() === q);
  if (exact) return exact.steps;

  // Keyword overlap — find QA pair with the most word overlap
  const qWords = new Set(q.split(" ").filter(w => w.length > 2));
  let best: QaPair | null = null;
  let bestScore = 0;

  for (const pair of QA_PAIRS) {
    const pWords = pair.question.toLowerCase().split(" ");
    const score = pWords.filter(w => qWords.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = pair;
    }
  }

  if (best !== null && bestScore >= 2) return best.steps;

  // Default: let the LLM answer from its own knowledge
  return [{ description: "Answer the user's question using Language Generation Agent" }];
}
