// src/utils/time.ts

/**
 * Converts a swim time like "42.74" or "1:35.99" or "4:02.50" into seconds.
 */
export function timeToSeconds(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.length === 1) {
    return parts[0]; // "42.74"
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // "1:35.99"
  }
  throw new Error("Invalid time format: " + time);
}