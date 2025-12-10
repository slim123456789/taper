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
  /* --- NCAA Men's 2026 (All settled) --- */
  "liendo-100fly-ncaa-m-2026": "42.74",        // Beat the line (Under)
  "kos-200back-ncaa-m-2026": "1:33.88",         // Beat the barrier (Under)

  /* --- NCAA Women's 2026 (Mixed) --- */
  "douglas-200im-ncaa-w-2026": "1:48.37",       // Beat 1:49.00 (Under)
  // "curzan-100back-ncaa-w-2026": undefined,   // Still upcoming

  /* --- Olympics 2024 (All settled) --- */
  "marchand-400im-oly-2024": "4:01.95",         // New WR (Under)
  "mckeon-100free-oly-2024": "52.15",           // Missed 52.00 barrier (Over)

  /* --- Pan Pacs 2026 (Mixed) --- */
  "titmus-400free-panpacs-2026": "3:55.55",     // Missed 3:55.00 barrier (Over)
  // "dressel-50free-panpacs-2026": undefined,  // Still upcoming
};