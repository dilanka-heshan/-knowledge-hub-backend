// Local-file chat history store.
// Saves one JSON file per sessionId under data/history/.
// TEMPORARY: swap saveHistory / loadHistory for MongoDB calls when ready.

import fs from "fs";
import path from "path";
import type { Message } from "../types";

const HISTORY_DIR = path.join(__dirname, "../../data/history");

export function saveHistory(sessionId: string, messages: Message[]): void {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(HISTORY_DIR, `${sessionId}.json`),
    JSON.stringify(messages, null, 2),
    "utf-8"
  );
}

export function loadHistory(sessionId: string): Message[] {
  const file = path.join(HISTORY_DIR, `${sessionId}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as Message[];
  } catch {
    return [];
  }
}
