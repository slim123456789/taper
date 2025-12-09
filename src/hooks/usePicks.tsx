// src/hooks/usePicks.ts
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PickSide } from "@/data/taperData";

type PicksMap = Record<string, PickSide | undefined>;
type SubmittedMap = Record<string, boolean>;

type StoredState = {
  picks: PicksMap;
  submitted: SubmittedMap;
};

type PicksContextValue = {
  picks: PicksMap;
  submitted: SubmittedMap;
  setPick: (marketId: string, side: PickSide) => void;
  submitMarket: (marketId: string) => void;
  clearSubmission: (marketId: string) => void;
  clearAll: () => void;
};

const STORAGE_KEY = "taper_picks_v3";

const PicksContext = createContext<PicksContextValue | undefined>(undefined);

function loadInitialState(): StoredState {
  if (typeof window === "undefined") {
    return { picks: {}, submitted: {} };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { picks: {}, submitted: {} };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      picks: parsed.picks ?? {},
      submitted: parsed.submitted ?? {},
    };
  } catch {
    return { picks: {}, submitted: {} };
  }
}

export function PicksProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>({
    picks: {},
    submitted: {},
  });

  // Load from localStorage on first client render
  useEffect(() => {
    const loaded = loadInitialState();
    setState(loaded);
  }, []);

  // Persist whenever state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const value: PicksContextValue = {
    picks: state.picks,
    submitted: state.submitted,

    setPick: (marketId, side) => {
      setState((prev) => ({
        ...prev,
        picks: {
          ...prev.picks,
          [marketId]: side,
        },
      }));
    },

    submitMarket: (marketId) => {
      setState((prev) => ({
        ...prev,
        submitted: {
          ...prev.submitted,
          [marketId]: true,
        },
      }));
    },

    clearSubmission: (marketId) => {
      setState((prev) => {
        const next = { ...prev.submitted };
        delete next[marketId];
        return { ...prev, submitted: next };
      });
    },

    clearAll: () => {
      setState({ picks: {}, submitted: {} });
    },
  };

  return (
    <PicksContext.Provider value={value}>{children}</PicksContext.Provider>
  );
}

export function usePicks(): PicksContextValue {
  const ctx = useContext(PicksContext);
  if (!ctx) {
    throw new Error("usePicks must be used within a PicksProvider");
  }
  return ctx;
}