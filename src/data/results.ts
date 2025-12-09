// src/data/results.ts

/**
 * Final results for each market.
 *
 * Key = market.id from taperData.ts
 * Value = time string result, e.g. "42.74", "1:35.99", "4:02.50"
 *
 * undefined → no result yet
 */
export const results: Record<string, string | undefined> = {
  // Example NCAA Men's 2026 results
  "liendo-100fly-ncaa-m-2026": "42.74",
  "urlando-200fly-ncaa-m-2026": "1:35.99",
  "germonprez-100br-ncaa-m-2026": "49.90",
  "kos-200back-ncaa-m-2026": "1:33.88",

  // TODO: add real results as meets conclude
};