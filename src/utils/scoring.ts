// src/utils/scoring.ts
import { timeToSeconds } from "./time";
import type { PickSide } from "@/data/taperData";

export type PickOutcome = "correct" | "incorrect" | "pending";

function parseTimeFromLabel(label: string): string | null {
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

  const cleanLine = parseTimeFromLabel(lineLabel);
  if (!cleanLine) return "pending";

  const lineSec = timeToSeconds(cleanLine);
  const resSec = timeToSeconds(resultTime);

  if (isNaN(lineSec) || isNaN(resSec)) return "pending";
  if (resSec === lineSec) return "pending"; 

  const beatLine = resSec < lineSec; 

  if (beatLine && pick === "under") return "correct";
  if (!beatLine && pick === "over") return "correct";

  return "incorrect";
}