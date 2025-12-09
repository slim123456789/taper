// src/data/taperData.ts

export type MeetCategory = "NCAA" | "International" | "Olympics";
export type Gender = "Men" | "Women";
export type PickSide = "over" | "under";

export type Meet = {
  id: string;                 // unique, sluggy id, e.g. "ncaa-m-2026"
  name: string;               // display name, e.g. "NCAA Men's Championships"
  category: MeetCategory;     // NCAA / International / Olympics
  leagueTag: string;          // short tag, e.g. "NCAA", "SEC", "OLY"
  year: number;               // e.g. 2026
  genders: Gender[];          // which genders this meet has
  lockTime?: string;          // ISO string, when slate locks (optional for now)
};

export type Market = {
  id: string;                 // unique, e.g. "liendo-100fly-ncaa-m-2026"
  meetId: string;             // must match a Meet.id
  gender: Gender;             // Men / Women
  swimmer: string;            // e.g. "Josh Liendo"
  event: string;              // e.g. "100 Yard Butterfly"
  timeLabel: string;          // line / record label, e.g. "Dressel's 42.80"
  pb?: string;                // optional personal best
  seed?: string;              // optional seed time
  votesOver?: number;         // pseudo community sentiment
  votesUnder?: number;        // pseudo community sentiment
};

/* -------------------- MEETS -------------------- */

export const meets: Meet[] = [
  {
    id: "ncaa-m-2026",
    name: "NCAA Men's Championships",
    category: "NCAA",
    leagueTag: "NCAA",
    year: 2026,
    genders: ["Men"],
    // optional for now; you can set real lock times later
    // lockTime: "2026-03-20T16:00:00Z",
  },
  {
    id: "ncaa-w-2026",
    name: "NCAA Women's Championships",
    category: "NCAA",
    leagueTag: "NCAA",
    year: 2026,
    genders: ["Women"],
  },
  {
    id: "oly-paris-2024",
    name: "Paris 2024 Olympic Games",
    category: "Olympics",
    leagueTag: "OLY",
    year: 2024,
    genders: ["Men", "Women"],
  },
  {
    id: "panpacs-2026",
    name: "Pan Pacific Championships",
    category: "International",
    leagueTag: "PAN PACS",
    year: 2026,
    genders: ["Men", "Women"],
  },
];

/* -------------------- MARKETS (CARDS) -------------------- */
/**
 * All cards must:
 *  - reference a valid meetId (one of meets[].id)
 *  - set gender to match one of meet.genders
 */

export const markets: Market[] = [
  // NCAA Men’s 2026
  {
    id: "liendo-100fly-ncaa-m-2026",
    meetId: "ncaa-m-2026",
    gender: "Men",
    swimmer: "Josh Liendo",
    event: "100 Yard Butterfly",
    timeLabel: "Dressel's 42.80",
    pb: "43.15",
    seed: "43.30",
    votesOver: 42,
    votesUnder: 58,
  },
  {
    id: "urlando-200fly-ncaa-m-2026",
    meetId: "ncaa-m-2026",
    gender: "Men",
    swimmer: "Luca Urlando",
    event: "200 Yard Butterfly",
    timeLabel: "1:36.00 Barrier",
    pb: "1:37.20",
    seed: "1:37.80",
    votesOver: 34,
    votesUnder: 66,
  },
  {
    id: "germonprez-100br-ncaa-m-2026",
    meetId: "ncaa-m-2026",
    gender: "Men",
    swimmer: "Nate Germonprez",
    event: "100 Yard Breast",
    timeLabel: "Smith's 49.51",
    pb: "50.15",
    seed: "50.30",
    votesOver: 51,
    votesUnder: 49,
  },
  {
    id: "kos-200back-ncaa-m-2026",
    meetId: "ncaa-m-2026",
    gender: "Men",
    swimmer: "Hubert Kos",
    event: "200 Yard Back",
    timeLabel: "1:34.00 Barrier",
    pb: "1:34.76",
    seed: "1:35.10",
    votesOver: 39,
    votesUnder: 61,
  },

  // NCAA Women’s 2026
  {
    id: "douglas-200im-ncaa-w-2026",
    meetId: "ncaa-w-2026",
    gender: "Women",
    swimmer: "Kate Douglass",
    event: "200 Yard Individual Medley",
    timeLabel: "1:49.00 Barrier",
    pb: "1:48.37",
    seed: "1:49.50",
    votesOver: 45,
    votesUnder: 55,
  },
  {
    id: "curzan-100back-ncaa-w-2026",
    meetId: "ncaa-w-2026",
    gender: "Women",
    swimmer: "Claire Curzan",
    event: "100 Yard Backstroke",
    timeLabel: "1:48.00 Barrier",
    pb: "48.26",
    seed: "48.60",
    votesOver: 40,
    votesUnder: 60,
  },

  // Olympics - Paris 2024
  {
    id: "marchand-400im-oly-2024",
    meetId: "oly-paris-2024",
    gender: "Men",
    swimmer: "Léon Marchand",
    event: "400m Individual Medley",
    timeLabel: "World Record Line",
    pb: "4:02.50",
    seed: "4:03.10",
    votesOver: 30,
    votesUnder: 70,
  },
  {
    id: "mckeon-100free-oly-2024",
    meetId: "oly-paris-2024",
    gender: "Women",
    swimmer: "Emma McKeon",
    event: "100m Freestyle",
    timeLabel: "52.00 Barrier",
    pb: "51.96",
    seed: "52.20",
    votesOver: 55,
    votesUnder: 45,
  },

  // Pan Pacs 2026 (example international slate)
  {
    id: "dressel-50free-panpacs-2026",
    meetId: "panpacs-2026",
    gender: "Men",
    swimmer: "Caeleb Dressel",
    event: "50m Freestyle",
    timeLabel: "21.20 Barrier",
    pb: "21.04",
    seed: "21.30",
    votesOver: 48,
    votesUnder: 52,
  },
  {
    id: "titmus-400free-panpacs-2026",
    meetId: "panpacs-2026",
    gender: "Women",
    swimmer: "Ariarne Titmus",
    event: "400m Freestyle",
    timeLabel: "3:55.00 Barrier",
    pb: "3:55.38",
    seed: "3:56.20",
    votesOver: 37,
    votesUnder: 63,
  },
];

/* -------------------- HELPERS (optional, but handy) -------------------- */

export function getMeetById(id: string): Meet | undefined {
  return meets.find((m) => m.id === id);
}

export function getMarketsForMeet(meetId: string, gender?: Gender): Market[] {
  return markets.filter(
    (m) => m.meetId === meetId && (!gender || m.gender === gender),
  );
}