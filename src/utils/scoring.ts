// src/utils/scoring.ts

import { timeToSeconds } from "./time";
import type { PickSide } from "@/data/taperData";

export type PickOutcome = "correct" | "incorrect" | "pending";

/**
 * Extracts a time string (e.g. "42.80" or "1:36.00") from a label (e.g. "Dressel's 42.80").
 * Returns null if no valid time is found.
 */
function parseTimeFromLabel(label: string): string | null {
  // Regex looks for: optional (1-2 digits + colon) + 1-2 digits + dot + 2 digits
  // e.g. matches "42.80", "1:36.00", "4:02.50" inside any text
  const match = label.match(/(\d{1,2}:)?\d{1,2}\.\d{2}/);
  return match ? match[0] : null;
}

export function getPickOutcome(
  lineLabel: string,
  resultTime: string | undefined,
  pick: PickSide | undefined
): PickOutcome {
  if (!pick) return "pending";
  if (!resultTime) return "pending";

  // FIX: Clean the label to find the actual time
  const cleanLine = parseTimeFromLabel(lineLabel);
  
  // If we can't find a time in the label (e.g. "World Record Line"), we can't score it yet.
  if (!cleanLine) return "pending";

  const lineSec = timeToSeconds(cleanLine);
  const resSec = timeToSeconds(resultTime);

  // Safety check for bad parsing
  if (isNaN(lineSec) || isNaN(resSec)) return "pending";

  if (resSec === lineSec) return "pending"; // Push

  // "Beat the line" means the swimmer was FASTER (Lower Time)
  const beatLine = resSec < lineSec; 

  // LOGIC:
  // If swimmer is FASTER (beatLine = true), the result is UNDER.
  if (beatLine && pick === "under") return "correct";
  
  // If swimmer is SLOWER (beatLine = false), the result is OVER.
  if (!beatLine && pick === "over") return "correct";

  return "incorrect";
}