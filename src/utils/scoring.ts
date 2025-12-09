// src/utils/scoring.ts

import { timeToSeconds } from "./time";
import type { PickSide } from "@/data/taperData";

export type PickOutcome = "correct" | "incorrect" | "pending";

export function getPickOutcome(
  lineTime: string,
  resultTime: string | undefined,
  pick: PickSide | undefined
): PickOutcome {
  if (!pick) return "pending";
  if (!resultTime) return "pending";

  const lineSec = timeToSeconds(lineTime);
  const resSec = timeToSeconds(resultTime);

  if (resSec === lineSec) return "pending"; // push

  const beatLine = resSec < lineSec; // swimmer went faster

  if (beatLine && pick === "over") return "correct";
  if (!beatLine && pick === "under") return "correct";

  return "incorrect";
}