// TEMPORARY — hardcoded QA pairs from Dev 1 pipeline.
// Replace with real Dev 1 API integration when ready.

export interface QaPair {
  question: string;
  steps: string[];
}

export const QA_PAIRS: QaPair[] = [
  // ── Greetings ───────────────────────────────────────────────────────────────
  {
    question: "hi",
    steps: ["Generate a friendly greeting as Atlato-One using Language Generation Agent"]
  },
  {
    question: "hello",
    steps: ["Generate a friendly greeting as Atlato-One using Language Generation Agent"]
  },
  {
    question: "who are you",
    steps: ["Generate an introduction as Atlato-One using Language Generation Agent"]
  },
  {
    question: "what can you do",
    steps: ["Generate a capabilities overview of Atlato-One using Language Generation Agent"]
  },
  {
    question: "how are you",
    steps: ["Generate a friendly status response as Atlato-One using Language Generation Agent"]
  },

  // ── Fleet & Vehicle ─────────────────────────────────────────────────────────
  {
    question: "what is the current speed of all vehicles",
    steps: [
      "Retrieve current vehicle speed data from Fleet MCP Server",
      "Generate a speed summary using Language Generation Agent"
    ]
  },
  {
    question: "show me fleet status",
    steps: [
      "Retrieve fleet status including speed, fuel, and location from Fleet MCP Server",
      "Generate a fleet status report using Language Generation Agent"
    ]
  },
  {
    question: "show fuel levels of all vehicles",
    steps: [
      "Retrieve fuel level data for all vehicles from Fleet MCP Server",
      "Generate a fuel status report using Language Generation Agent"
    ]
  },
  {
    question: "which vehicles are idle",
    steps: [
      "Retrieve vehicle activity status from Fleet MCP Server",
      "List idle vehicles using Language Generation Agent"
    ]
  },
  {
    question: "show vehicle locations",
    steps: [
      "Retrieve current vehicle locations from Fleet MCP Server",
      "Generate a location summary using Language Generation Agent"
    ]
  },
  {
    question: "generate fleet report",
    steps: [
      "Retrieve all fleet data from Fleet MCP Server",
      "Generate visualizations using Visualization Agent: bar chart for fuel levels, line chart for speed trends, table for vehicle details",
      "Generate a comprehensive fleet report using Language Generation Agent"
    ]
  },
  {
    question: "generate a vehicle report with charts",
    steps: [
      "Retrieve vehicle speeds, fuel levels, and maintenance status from Fleet MCP Server",
      "Generate visualizations using Visualization Agent: line chart for speed trends, bar chart for fuel levels, pie chart for vehicle status distribution, table for vehicle details",
      "Generate a comprehensive vehicle report using Language Generation Agent"
    ]
  },

  // ── Weather & Internet ──────────────────────────────────────────────────────
  {
    question: "what is the weather in colombo",
    steps: [
      "Fetch current weather data for Colombo from Internet Accessing Agent",
      "Generate a weather summary using Language Generation Agent"
    ]
  },
  {
    question: "is it going to rain today in colombo",
    steps: [
      "Fetch rain forecast for Colombo from Internet Accessing Agent",
      "Generate a rain forecast response using Language Generation Agent"
    ]
  },
  {
    question: "what is today's date",
    steps: [
      "Get current date from Internet Accessing Agent",
      "Return the date using Language Generation Agent"
    ]
  },
  {
    question: "what is the weather in kandy",
    steps: [
      "Fetch current weather data for Kandy from Internet Accessing Agent",
      "Generate a weather summary using Language Generation Agent"
    ]
  },

  // ── History & Conversation ──────────────────────────────────────────────────
  {
    question: "summarize our previous discussion",
    steps: [
      "Retrieve previous conversation data from History Agent",
      "Generate a summary using Language Generation Agent"
    ]
  },
  {
    question: "what was the last question i asked",
    steps: [
      "Retrieve last user query from History Agent",
      "Generate a response using Language Generation Agent"
    ]
  },
  {
    question: "what were the key points we discussed",
    steps: [
      "Retrieve recent conversation history from History Agent",
      "Generate key points summary using Language Generation Agent"
    ]
  },
  {
    question: "create a pdf report of our earlier chat about fleet data",
    steps: [
      "Retrieve chat history related to fleet data from History Agent",
      "Generate visualizations using Visualization Agent: bar chart for fuel levels, table for fleet data",
      "Generate a PDF report using Language Generation Agent"
    ]
  },
  {
    question: "what did we talk about yesterday",
    steps: [
      "Retrieve yesterday's conversation history from History Agent",
      "Generate a summary using Language Generation Agent"
    ]
  },

  // ── Agriculture ─────────────────────────────────────────────────────────────
  {
    question: "show crop monitoring data",
    steps: [
      "Retrieve crop and soil data from Agriculture MCP Server",
      "Generate a crop health summary using Language Generation Agent"
    ]
  },
  {
    question: "what is the soil moisture level",
    steps: [
      "Retrieve soil moisture data from Agriculture MCP Server",
      "Generate a soil health report using Language Generation Agent"
    ]
  },
  {
    question: "which crops need attention",
    steps: [
      "Retrieve crop status and alerts from Agriculture MCP Server",
      "List crops requiring attention using Language Generation Agent"
    ]
  },
  {
    question: "generate agriculture report",
    steps: [
      "Retrieve all crop and soil data from Agriculture MCP Server",
      "Generate visualizations using Visualization Agent: bar chart for soil moisture, pie chart for crop status distribution, table for zone details",
      "Generate a comprehensive agriculture report using Language Generation Agent"
    ]
  }
];

// Find the best matching steps for a given question using exact then keyword matching.
export function findMatchingSteps(question: string): string[] {
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
  return ["Answer the user's question using Language Generation Agent"];
}
