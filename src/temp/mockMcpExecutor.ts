// TEMPORARY — mock MCP step executor.
// Replace executeMockStep with real MCP tool calls when integration is ready.

import type { PlanStep } from "../types";
import {
  MOCK_FLEET_DATA,
  MOCK_WEATHER_DATA,
  MOCK_HISTORY_DATA,
  MOCK_AGRICULTURE_DATA,
} from "./mockMcpData";

export interface StepResult {
  step: number;
  description: string;
  data: unknown;
  isLlmStep: boolean;        // true = no data here; handled by final LLM call
  visualizationHint?: string;
}

export async function executeMockStep(step: PlanStep): Promise<StepResult> {
  const desc = step.description.toLowerCase();

  // Language Generation Agent steps are handled by the final LLM call — no data to fetch
  if (desc.includes("language generation agent")) {
    return { step: step.step, description: step.description, data: null, isLlmStep: true };
  }

  // Visualization Agent — extract chart type hint, no raw data
  if (desc.includes("visualization agent")) {
    return {
      step: step.step,
      description: step.description,
      data: null,
      isLlmStep: false,
      visualizationHint: extractVisualizationHint(step.description),
    };
  }

  // Fleet / vehicle data
  if (
    desc.includes("fleet") ||
    desc.includes("vehicle") ||
    desc.includes("speed") ||
    desc.includes("fuel") ||
    desc.includes("maintenance status")
  ) {
    return { step: step.step, description: step.description, data: MOCK_FLEET_DATA, isLlmStep: false };
  }

  // Weather / internet / rain forecast
  if (
    desc.includes("weather") ||
    desc.includes("rain") ||
    desc.includes("internet accessing") ||
    desc.includes("forecast") ||
    desc.includes("climate")
  ) {
    const city = extractCity(step.description);
    const weather = MOCK_WEATHER_DATA[city] ?? MOCK_WEATHER_DATA["colombo"];
    return {
      step: step.step,
      description: step.description,
      data: { city, ...weather },
      isLlmStep: false,
    };
  }

  // Current date
  if (desc.includes("current date") || desc.includes("today") || desc.includes("date")) {
    const now = new Date();
    return {
      step: step.step,
      description: step.description,
      data: {
        date: now.toISOString(),
        readable: now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      isLlmStep: false,
    };
  }

  // History Agent
  if (
    desc.includes("history agent") ||
    desc.includes("previous conversation") ||
    desc.includes("chat history") ||
    desc.includes("last session") ||
    desc.includes("last user query") ||
    desc.includes("yesterday")
  ) {
    return { step: step.step, description: step.description, data: MOCK_HISTORY_DATA, isLlmStep: false };
  }

  // Agriculture
  if (
    desc.includes("agriculture") ||
    desc.includes("crop") ||
    desc.includes("soil") ||
    desc.includes("farm")
  ) {
    return { step: step.step, description: step.description, data: MOCK_AGRICULTURE_DATA, isLlmStep: false };
  }

  // Default: no data; LLM will answer from its own knowledge
  return { step: step.step, description: step.description, data: null, isLlmStep: true };
}

function extractCity(text: string): string {
  const cities = ["colombo", "kandy", "galle", "negombo", "jaffna"];
  const lower = text.toLowerCase();
  return cities.find(c => lower.includes(c)) ?? "colombo";
}

function extractVisualizationHint(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("pie chart"))    return "pie_chart";
  if (lower.includes("line chart"))   return "line_chart";
  if (lower.includes("bar chart"))    return "bar_chart";
  if (lower.includes("scatter"))      return "scatter_plot";
  if (lower.includes("table"))        return "table";
  return "bar_chart";
}
