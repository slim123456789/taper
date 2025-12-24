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
  clearUnsubmitted: () => void; // New helper to reset uncommitted picks
  userId: string | null;
}

const PicksContext = createContext<PicksContextType | undefined>(undefined);

export function PicksProvider({ children }: { children: React.ReactNode }) {
  const [picks, setPicks] = useState<PicksMap>({});
  const [submitted, setSubmitted] = useState<SubmittedMap>({});
  const [userId, setUserId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
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

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchUserPicks(user.id);
      } else {
        setUserId(null);
        loadGuestPicks();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUserId(session.user.id);
        await fetchUserPicks(session.user.id);
      } 
      else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setPicks({});
        setSubmitted({});
        localStorage.removeItem("taper_picks");
        localStorage.removeItem("taper_submitted");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const setPick = useCallback((marketId: string, side: PickSide) => {
    setPicks((prev) => {
      const next = { ...prev, [marketId]: side };
      // For guest users, we still keep drafts in localStorage to prevent loss on refresh
      if (!userId) localStorage.setItem("taper_picks", JSON.stringify(next));
      return next;
    });
  }, [userId]);

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

  // NEW: Clear anything that hasn't been "Submitted"
  const clearUnsubmitted = useCallback(() => {
    setPicks((prevPicks) => {
      const cleanPicks: PicksMap = {};
      Object.keys(submitted).forEach((id) => {
        if (submitted[id]) {
          cleanPicks[id] = prevPicks[id];
        }
      });
      if (!userId) localStorage.setItem("taper_picks", JSON.stringify(cleanPicks));
      return cleanPicks;
    });
  }, [submitted, userId]);

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
      value={{ picks, submitted, setPick, submitMarket, clearSubmission, clearAll, clearUnsubmitted, userId }}
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