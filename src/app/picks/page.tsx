// src/app/picks/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  markets,
  meets,
  type Market as MarketType,
  type PickSide,
} from "@/data/taperData";
import { usePicks } from "@/hooks/usePicks";
// FIX 1: Remove the import of 'results' (it no longer exists)
import { getPickOutcome } from "@/utils/scoring";

type EnrichedPick = {
  market: MarketType;
  pick?: PickSide;
  submitted: boolean;
};

export default function PicksPage() {
  const { picks, submitted, clearAll, clearSubmission } = usePicks();

  // Group user's interacted markets by meet
  const picksByMeet = useMemo(() => {
    const result = new Map<string, EnrichedPick[]>();

    markets.forEach((market) => {
      const pick = picks[market.id];
      const isSubmitted = !!submitted[market.id];

      // Only show picks that are submitted (Locked Inventory)
      if (!isSubmitted) return;

      const arr = result.get(market.meetId) ?? [];
      arr.push({ market, pick, submitted: isSubmitted });
      result.set(market.meetId, arr);
    });

    return result;
  }, [picks, submitted]);

  const totalPicks = markets.filter(
    (m) => !!submitted[m.id], // Only count submitted
  ).length;

  const hasAny = totalPicks > 0;

  return (
    <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#02030A] to-[#020107] px-4 py-8">
      <div className="w-full max-w-[430px] rounded-3xl border border-white/10 bg-[#070A14] px-5 pb-9 pt-7 shadow-[0_26px_70px_rgba(0,0,0,0.85)] text-slate-50">

        {/* Top row */}
        <div className="mb-4 flex items-center justify-between text-[11px] text-slate-300">
          <Link
            href="/"
            className="rounded-full border border-white/18 px-3 py-1 text-[10px] font-medium text-slate-50 hover:border-white/35 hover:bg-white/5"
          >
            ← Back to Taper
          </Link>

          {hasAny && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-white/18 px-3 py-1 text-[10px] font-medium text-slate-200 hover:border-red-400/70 hover:text-red-200"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Header */}
        <header className="mb-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Your picks
          </p>
          <h1 className="mt-1 font-migra text-[22px] leading-snug text-white">
            Your locked slip
          </h1>

          {!hasAny && (
            <p className="mt-2 text-[11px] text-slate-400">
              You haven&apos;t locked any picks yet. Submit predictions to see them here.
            </p>
          )}
        </header>

        {!hasAny && (
          <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.02] px-4 py-4 text-[12px] text-slate-300">
            <p>Your picks will appear here once you submit them.</p>
          </div>
        )}

        {hasAny && (
          <section className="space-y-6">
            {meets.map((meet) => {
              const meetPicks = picksByMeet.get(meet.id);
              if (!meetPicks || meetPicks.length === 0) return null;

              return (
                <div key={meet.id}>
                  {/* Meet header */}
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Meet
                      </p>
                      <h2 className="text-[14px] font-semibold text-slate-50">
                        {meet.name}
                      </h2>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                        {meet.leagueTag} · {meet.year}
                      </p>
                    </div>
                  </div>

                  {/* Picks list */}
                  <div className="space-y-3">
                    {meetPicks.map(({ market, pick, submitted }) => (
                      <PickRow
                        key={market.id}
                        market={market}
                        pick={pick}
                        submitted={submitted}
                        onClearSubmission={() => clearSubmission(market.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

/* ---------- Pick Row Component ---------- */

type PickRowProps = {
  market: MarketType;
  pick?: PickSide;
  submitted: boolean;
  onClearSubmission: () => void;
};

function PickRow({ market, pick, submitted, onClearSubmission }: PickRowProps) {
  // FIX 2: Use the integrated data from the market object
  const result = market.actualTime; // Was: results[market.id]
  const isSettled = market.completed; // Was: !!result

  // FIX 3: Pass updated values to scoring
  const outcome = getPickOutcome(market.timeLabel, result, pick);

  const meet = meets.find((m) => m.id === market.meetId);
  const now = new Date();
  
  // 1. Is it locked by time?
  const isTimeLocked = meet?.lockTime ? now >= new Date(meet.lockTime) : false;

  // 2. Can we unlock? Only if NOT time locked AND NOT settled.
  const canUnlock = submitted && !isTimeLocked && !isSettled;

  const votesOver = market.votesOver ?? 0;
  const votesUnder = market.votesUnder ?? 0;
  const totalVotes = votesOver + votesUnder;

  const percentOver =
    totalVotes > 0 ? Math.round((votesOver / totalVotes) * 100) : 0;
  const percentUnder = 100 - percentOver;

  return (
    <article className={`rounded-2xl border px-4 py-3 text-[11px] text-slate-100 transition ${isSettled ? "border-white/5 bg-white/[0.01]" : "border-white/12 bg-white/[0.03]"}`}>

      <div className="flex items-start justify-between gap-3">
        
        {/* Left side */}
        <div className="flex-1">
          {/* Swimmer + Event */}
          <p className={`text-[13px] font-semibold leading-tight ${isSettled ? "opacity-75" : ""}`}>
            {market.swimmer}
          </p>
          <p className="mt-1 text-[11px] text-slate-200">{market.event}</p>

          {/* Line */}
          <p className={`mt-2 ${isSettled ? "opacity-60" : ""}`}>
            <span className="opacity-75">Time to beat:</span>{" "}
            <span className="font-semibold">{market.timeLabel}</span>
          </p>

          {/* Result Display */}
          {result && (
            <p className="mt-2 text-[11px]">
              <span className="opacity-75">Result:</span>{" "}
              <span className="font-bold text-white">{result}</span>
            </p>
          )}

          {/* Outcome Display */}
          {submitted && isSettled && (
            <p className="mt-1 text-[10px] font-semibold">
              {outcome === "correct" && (
                <span className="text-emerald-300">You Won ✓</span>
              )}
              {outcome === "incorrect" && (
                <span className="text-rose-400">You Lost ✗</span>
              )}
              {outcome === "pending" && (
                <span className="text-slate-400">Pending Result…</span>
              )}
            </p>
          )}
        </div>

        {/* Right side: Pick Badge + Unlock */}
        <div className="flex flex-col items-end gap-1.5">
          
          {/* The PICK Badge */}
          {pick && (
            <span
              className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                pick === "over"
                  ? "bg-rose-500/20 text-rose-100 border border-rose-500/50"
                  : "bg-emerald-500/20 text-emerald-100 border border-emerald-500/50"
              } ${isSettled ? "opacity-80" : ""}`}
            >
              {pick}
            </span>
          )}

          {/* UNLOCK BUTTON (Only if allowed) */}
          {canUnlock ? (
            <button
              type="button"
              onClick={onClearSubmission}
              className="text-[9px] text-slate-400 underline underline-offset-2 hover:text-red-300"
            >
              Unlock
            </button>
          ) : (
            // Status Badge
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">
              {isSettled ? "Settled" : "Locked"}
            </span>
          )}
        </div>
      </div>

      {/* Sentiment */}
      {totalVotes > 0 && (
        <div className={`mt-3 space-y-1 ${isSettled ? "opacity-40" : ""}`}>
          <div className="flex items-center justify-between text-[10px] text-slate-300">
            <span>👥 {totalVotes}</span>
            <span>
              Over {percentOver}% · Under {percentUnder}%
            </span>
          </div>
          <div className="flex h-1 w-full overflow-hidden rounded-full bg-slate-900/70">
            <div className="h-full bg-[#B5473C]" style={{ width: `${percentOver}%` }} />
            <div className="h-full bg-[#2E7C5A]" style={{ width: `${percentUnder}%` }} />
          </div>
        </div>
      )}
    </article>
  );
}