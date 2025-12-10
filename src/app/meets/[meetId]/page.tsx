// src/app/meets/[meetId]/page.tsx
"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import {
  meets,
  markets,
  type Market as MarketType,
  type Gender,
  type PickSide,
} from "@/data/taperData";
import { usePicks } from "@/hooks/usePicks";
import { results } from "@/data/results";
import { getPickOutcome } from "@/utils/scoring";

type PageParams = {
  params: Promise<{ meetId: string }>;
};

type ViewMode = "upcoming" | "results";

export default function MeetPage({ params }: PageParams) {
  const { meetId } = use(params);

  const meet = meets.find((m) => m.id === meetId);
  const { picks, submitted, setPick, submitMarket, clearSubmission } = usePicks();

  const [selectedGender, setSelectedGender] = useState<Gender>(
    (meet?.genders[0] as Gender) ?? "Men",
  );
  
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");

  if (!meet) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-slate-200">
        <p>Meet not found.</p>
      </main>
    );
  }

  // Split markets
  const { upcomingMarkets, settledMarkets } = useMemo(() => {
    const relevant = markets.filter(
      (m) => m.meetId === meet.id && m.gender === selectedGender
    );

    const upcoming: MarketType[] = [];
    const settled: MarketType[] = [];

    relevant.forEach((m) => {
      if (results[m.id]) {
        settled.push(m);
      } else {
        upcoming.push(m);
      }
    });

    return { upcomingMarkets: upcoming, settledMarkets: settled };
  }, [selectedGender, meet.id]);

  const currentMarkets = viewMode === "upcoming" ? upcomingMarkets : settledMarkets;

  const totalUpcoming = upcomingMarkets.length;
  const submittedCount = upcomingMarkets.filter((m) => !!submitted[m.id]).length;

  const lockTime = meet.lockTime ? new Date(meet.lockTime) : undefined;
  const now = new Date();
  const isLockedByTime = lockTime ? now >= lockTime : false;

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
        </div>

        {/* Header */}
        <header className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Meet
          </p>
          <h1 className="mt-1 font-migra text-[22px] leading-snug text-white">
            {meet.name}
          </h1>

          <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-300">
            <span className="rounded-full border border-white/18 bg-white/[0.03] px-2 py-[3px]">
              {meet.leagueTag}
            </span>
            <span className="rounded-full border border-white/18 bg-white/[0.03] px-2 py-[3px]">
              {meet.year}
            </span>
            {lockTime && (
              <span className="rounded-full border border-white/18 bg-white/[0.02] px-2 py-[3px] text-slate-300">
                Locks{" "}
                {lockTime.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </header>

        {/* Gender tabs */}
        <div className="mb-6 flex gap-2 text-[12px]">
          {meet.genders.map((g) => {
            const isActive = g === selectedGender;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGender(g as Gender)}
                className={`flex-1 rounded-full border px-3 py-1.5 font-medium transition ${
                  isActive
                    ? "border-white bg-white text-[#070A14]"
                    : "border-white/16 bg-transparent text-slate-200 hover:border-white/40"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Toggle */}
        <div className="mb-4 flex rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setViewMode("upcoming")}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-medium uppercase tracking-wider transition ${
              viewMode === "upcoming"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setViewMode("results")}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-medium uppercase tracking-wider transition ${
              viewMode === "results"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Results
          </button>
        </div>

        {/* Market summary */}
        {viewMode === "upcoming" && (
          <section className="mb-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[12px] text-slate-200">
            <div className="flex items-center justify-between">
              <p>
                Picks locked:{" "}
                <span className="font-semibold text-slate-50">
                  {submittedCount}/{totalUpcoming}
                </span>
              </p>
              {isLockedByTime && (
                <span className="rounded-full border border-slate-400/50 bg-slate-500/10 px-2 py-[2px] text-[10px] font-medium text-slate-200">
                  Locked
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/80">
              <div
                className="h-full bg-slate-100"
                style={{
                  width:
                    totalUpcoming > 0
                      ? `${(submittedCount / totalUpcoming) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </section>
        )}

        {/* Markets */}
        <section className="space-y-3">
          {currentMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              pick={picks[market.id]}
              submitted={!!submitted[market.id]}
              onPick={setPick}
              onSubmit={submitMarket}
              onUnlock={clearSubmission}
              lockedByTime={isLockedByTime}
            />
          ))}

          {currentMarkets.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-[12px] text-slate-400">
                {viewMode === "upcoming"
                  ? "No active markets available."
                  : "No final results yet."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ---------- Market Card ---------- */

type MarketCardProps = {
  market: MarketType;
  pick?: PickSide;
  submitted: boolean;
  onPick: (id: string, side: PickSide) => void;
  onSubmit: (id: string) => void;
  onUnlock: (id: string) => void;
  lockedByTime: boolean;
};

function MarketCard({
  market,
  pick,
  submitted,
  onPick,
  onSubmit,
  onUnlock,
  lockedByTime,
}: MarketCardProps) {
  const result = results[market.id];
  const outcome = getPickOutcome(market.timeLabel, result, pick);

  const votesOver = market.votesOver ?? 0;
  const votesUnder = market.votesUnder ?? 0;
  const totalVotes = votesOver + votesUnder;
  const percentOver =
    totalVotes > 0 ? Math.round((votesOver / totalVotes) * 100) : 0;
  const percentUnder = 100 - percentOver;

  const isSettled = !!result;
  const interactionDisabled = lockedByTime || isSettled;

  // KEY FIX: Only show visual selection if it was actually submitted (locked in).
  // If settled and not submitted, we force visual neutrality.
  const visualPick = (isSettled && !submitted) ? undefined : pick;

  const handleMainAction = () => {
    if (interactionDisabled) return;
    if (submitted) {
      onUnlock(market.id);
    } else if (pick) {
      onSubmit(market.id);
    }
  };

  return (
    <article className={`rounded-2xl border px-4 py-3 text-slate-100 transition ${
        isSettled ? "border-white/5 bg-white/[0.01]" : "border-white/12 bg-white/[0.03]"
    }`}>

      {/* Header Info */}
      <div className={isSettled && !submitted ? "opacity-75" : ""}>
        <p className="text-[13px] font-semibold leading-tight">
          {market.swimmer}
        </p>
        <p className="mt-1 text-[11px] text-slate-200">{market.event}</p>
      </div>

      {/* PB + Seed */}
      {(market.pb || market.seed) && (
        <div className={`mt-2 flex flex-wrap gap-3 text-[11px] text-slate-300 ${isSettled && !submitted ? "opacity-60" : ""}`}>
          {market.pb && (
            <span>PB: <span className="text-slate-100">{market.pb}</span></span>
          )}
          {market.seed && (
            <span>Seed: <span className="text-slate-100">{market.seed}</span></span>
          )}
        </div>
      )}

      {/* The Line */}
      <p className={`mt-2 text-[11px] text-slate-100 ${isSettled && !submitted ? "opacity-60" : ""}`}>
        <span className="opacity-75">Time to beat:</span>{" "}
        <span className="font-semibold">{market.timeLabel}</span>
      </p>

      {/* Result Display (Only if settled) */}
      {result && (
        <div className="mt-2 rounded bg-white/10 px-2 py-1 text-[11px]">
          <span className="opacity-70">Official Result:</span>{" "}
          <span className="font-bold text-white">{result}</span>
        </div>
      )}

      {/* User Status: Only if submitted! */}
      {submitted && isSettled && (
        <p className="mt-1 text-[10px] font-semibold">
          {outcome === "correct" && <span className="text-emerald-300">You Won ✓</span>}
          {outcome === "incorrect" && <span className="text-rose-400">You Lost ✗</span>}
          {outcome === "pending" && <span className="text-slate-400">Pending Result…</span>}
        </p>
      )}

      {/* Sentiment Bar - dim if settled */}
      {totalVotes > 0 && (
        <div className={`mt-2 space-y-1 ${isSettled ? "opacity-40" : ""}`}>
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

      {/* Action Buttons */}
      <div className="mt-3 space-y-2">
        <div className="flex gap-1.5">
          {/* OVER BUTTON */}
          <button
            type="button"
            disabled={interactionDisabled}
            // Logic: if settled/unsubmitted, visualPick is undefined, so this renders as "unselected"
            onClick={() => !submitted && onPick(market.id, "over")}
            className={`flex-1 rounded-full border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
              visualPick === "over"
                ? "border-rose-300 bg-rose-500/20 text-rose-50" // Selected
                : "border-rose-500/70 text-rose-200 hover:bg-rose-500/10" // Unselected
            } ${
              (submitted && visualPick !== "over") || (isSettled && visualPick !== "over") 
                ? "opacity-30" 
                : "opacity-100"
            } ${
              isSettled ? "cursor-default" : ""
            }`}
          >
            Over
          </button>

          {/* UNDER BUTTON */}
          <button
            type="button"
            disabled={interactionDisabled}
            onClick={() => !submitted && onPick(market.id, "under")}
            className={`flex-1 rounded-full border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
               visualPick === "under"
                ? "border-emerald-300 bg-emerald-500/20 text-emerald-50" // Selected
                : "border-emerald-500/70 text-emerald-200 hover:bg-emerald-500/10" // Unselected
            } ${
              (submitted && visualPick !== "under") || (isSettled && visualPick !== "under") 
                ? "opacity-30" 
                : "opacity-100"
            } ${
              isSettled ? "cursor-default" : ""
            }`}
          >
            Under
          </button>
        </div>

        {/* Main Action Button */}
        <button
          type="button"
          disabled={interactionDisabled || (!pick && !submitted)}
          onClick={handleMainAction}
          className={`w-full rounded-full px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
            isSettled
              ? "border border-transparent bg-white/5 text-slate-500 cursor-default"
              : submitted
              ? "border border-slate-500 bg-transparent text-slate-400 hover:border-red-400 hover:text-red-300"
              : lockedByTime
              ? "border border-slate-600 bg-transparent text-slate-500"
              : pick
              ? "border border-slate-100 bg-slate-50 text-[#070A14] hover:bg-white"
              : "border border-slate-600 bg-transparent text-slate-500"
          }`}
        >
          {isSettled
            ? submitted ? "Settled" : "Did Not Submit"
            : lockedByTime
            ? "Locked"
            : submitted
            ? "Submitted (Tap to Unlock)"
            : pick
            ? "Submit pick"
            : "Choose Over/Under"}
        </button>
      </div>
    </article>
  );
}