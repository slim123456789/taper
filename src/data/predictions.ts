// src/data/predictions.ts

import type { MeetCategory, Gender } from "@/data/taperData";

export type PredictionCard = {
  id: string;
  swimmer: string;
  event: string;
  timeLabel: string; // e.g. "Dressel's 42.80" or "1:36.00 Barrier"
};

export type PredictionGroup = {
  category: MeetCategory;
  gender: Gender;
  cards: PredictionCard[];
};

export const predictionGroups: PredictionGroup[] = [
  {
    category: "NCAA",
    gender: "Men",
    cards: [
      {
        id: "liendo-100fly",
        swimmer: "Josh Liendo",
        event: "100 Yard Butterfly",
        timeLabel: "Dressel's 42.80",
      },
      {
        id: "urlando-200fly",
        swimmer: "Luca Urlando",
        event: "200 Yard Butterfly",
        timeLabel: "1:36.00 Barrier",
      },
      {
        id: "germonprez-100br",
        swimmer: "Nate Germonprez",
        event: "100 Yard Breast",
        timeLabel: "Smith's 49.51",
      },
      {
        id: "kos-200back",
        swimmer: "Hubert Kos",
        event: "200 Yard Back",
        timeLabel: "1:34.00 Barrier",
      },
    ],
  },
  // You can add more groups: NCAA/Women, Pan Pacs, Europeans, etc.
];