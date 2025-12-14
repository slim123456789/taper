"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { type PickSide } from "@/data/taperData";

type PicksMap = Record<string, PickSide>;
type SubmittedMap = Record<string, boolean>;

interface PicksContextType {
  picks: PicksMap;
  submitted: SubmittedMap;
  setPick: (marketId: string, side: PickSide) => void;
  submitMarket: (marketId: string) => Promise<void>;
  clearSubmission: (marketId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  userId: string | null;
}

const PicksContext = createContext<PicksContextType | undefined>(undefined);

export function PicksProvider({ children }: { children: React.ReactNode }) {
  const [picks, setPicks] = useState<PicksMap>({});
  const [submitted, setSubmitted] = useState<SubmittedMap>({});
  const [userId, setUserId] = useState<string | null>(null);
  
  const supabase = createClient();

  // 1. CENTRAL AUTH & DATA LISTENER
  useEffect(() => {
    // A. Define the data fetcher
    const fetchUserPicks = async (uid: string) => {
      const { data: dbPicks } = await supabase.from("picks").select("market_id, pick_side").eq("user_id", uid);
      
      const loadedPicks: PicksMap = {};
      const loadedSubmitted: SubmittedMap = {};
      
      if (dbPicks) {
        dbPicks.forEach((p) => {
          loadedPicks[p.market_id] = p.pick_side as PickSide;
          loadedSubmitted[p.market_id] = true;
        });
      }
      setPicks(loadedPicks);
      setSubmitted(loadedSubmitted);
    };

    const loadGuestPicks = () => {
      const savedPicks = localStorage.getItem("taper_picks");
      const savedSub = localStorage.getItem("taper_submitted");
      if (savedPicks) setPicks(JSON.parse(savedPicks));
      if (savedSub) setSubmitted(JSON.parse(savedSub));
    };

    // B. Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchUserPicks(user.id);
      } else {
        setUserId(null);
        loadGuestPicks();
      }
    });

    // C. Listen for LIVE changes (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User logged in: Load their data
        setUserId(session.user.id);
        await fetchUserPicks(session.user.id);
      } 
      else if (event === 'SIGNED_OUT') {
        // User logged out: WIPE EVERYTHING
        setUserId(null);
        setPicks({});
        setSubmitted({});
        // Optional: Do we want to show guest drafts immediately? 
        // Usually better to show blank slate so they don't see the previous user's localstorage.
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Draft Pick
  const setPick = useCallback((marketId: string, side: PickSide) => {
    setPicks((prev) => {
      const next = { ...prev, [marketId]: side };
      if (!userId) localStorage.setItem("taper_picks", JSON.stringify(next));
      return next;
    });
  }, [userId]);

  // 3. Submit Single
  const submitMarket = useCallback(async (marketId: string) => {
    const side = picks[marketId];
    if (!side) return;

    setSubmitted((prev) => {
      const next = { ...prev, [marketId]: true };
      if (!userId) localStorage.setItem("taper_submitted", JSON.stringify(next));
      return next;
    });

    if (userId) {
      await supabase.from("picks").upsert({
        user_id: userId,
        market_id: marketId,
        pick_side: side,
      });
    }
  }, [picks, userId, supabase]);

  // 4. Unlock Single
  const clearSubmission = useCallback(async (marketId: string) => {
    setSubmitted((prev) => {
      const next = { ...prev };
      delete next[marketId];
      if (!userId) localStorage.setItem("taper_submitted", JSON.stringify(next));
      return next;
    });

    if (userId) {
      await supabase.from("picks").delete().match({ user_id: userId, market_id: marketId });
    }
  }, [userId, supabase]);

  // 5. Clear All
  const clearAll = useCallback(async () => {
    setPicks({});
    setSubmitted({});
    
    if (userId) {
      await supabase.from("picks").delete().eq("user_id", userId);
    } else {
      localStorage.removeItem("taper_picks");
      localStorage.removeItem("taper_submitted");
    }
  }, [userId, supabase]);

  return (
    <PicksContext.Provider
      value={{ picks, submitted, setPick, submitMarket, clearSubmission, clearAll, userId }}
    >
      {children}
    </PicksContext.Provider>
  );
}

export function usePicks() {
  const context = useContext(PicksContext);
  if (!context) {
    throw new Error("usePicks must be used within a PicksProvider");
  }
  return context;
}