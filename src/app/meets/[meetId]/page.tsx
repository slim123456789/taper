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

type PageParams = {
  params: Promise<{ meetId: string }>;
};

export default function MeetPage({ params }: PageParams) {
  const { meetId } = use(params);
  const meet = meets.find((m) => m.id === meetId);

  const { picks, submitted, setPick, submitMarket } = usePicks();

  const [selectedGender, setSelectedGender] = useState<Gender>(
    (meet?.genders[0] as Gender) ?? "Men",
  );

  if (!meet) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-slate-200">
        <p>Meet not found.</p>
      </main>
    );
  }

  const meetMarkets = useMemo(
    () =>
      markets.filter(
        (m) => m.meetId === meet.id && m.gender === selectedGender,
      ),
    [selectedGender, meet.id],
  );

  const totalMarkets = meetMarkets.length;
  const submittedCount = meetMarkets.filter((m) => !!submitted[m.id]).length;

  const lockTime = meet.lockTime ? new Date(meet.lockTime) : undefined;
  const now = new Date();
  const isLockedByTime = lockTime ? now >= lockTime : false;

  return (
    <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#02030A] to-[#020107] px-4 py-8">
      <div className="w-full max-w-[430px] rounded-3xl border border-white/10 bg-[#070A14] px-5 pb-9 pt-7 shadow-[0_26px_70px_rgba(0,0,0,0.85)] text-slate-50">
        {/* Top row: back */}
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
        <div className="mb-4 flex gap-2 text-[12px]">
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

        {/* Summary */}
        <section className="mb-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[12px] text-slate-200">
          <div className="flex items-center justify-between">
            <p>
              Picks locked:{" "}
              <span className="font-semibold text-slate-50">
                {submittedCount}/{totalMarkets}
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
                  totalMarkets > 0
                    ? `${(submittedCount / totalMarkets) * 100}%`
                    : "0%",
              }}
            />
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            {isLockedByTime
              ? "Slate locked — predictions are closed."
              : "Tap Over/Under, then submit each card to lock that pick."}
          </p>
        </section>

        {/* Markets */}
        <section className="space-y-3">
          {meetMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              pick={picks[market.id]}
              submitted={!!submitted[market.id]}
              onPick={setPick}
              onSubmit={submitMarket}
              lockedByTime={isLockedByTime}
            />
          ))}
          {meetMarkets.length === 0 && (
            <p className="text-[12px] text-slate-400">
              No markets yet for this gender.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

/* ---------- Market card ---------- */

function MarketCard({
  market,
  pick,
  submitted,
  onPick,
  onSubmit,
  lockedByTime,
}: {
  market: MarketType;
  pick?: PickSide;
  submitted: boolean;
  onPick: (id: string, side: PickSide) => void;
  onSubmit: (id: string) => void;
  lockedByTime: boolean;
}) {
  const votesOver = market.votesOver ?? 0;
  const votesUnder = market.votesUnder ?? 0;
  const totalVotes = votesOver + votesUnder;
  const percentOver =
    totalVotes > 0 ? Math.round((votesOver / totalVotes) * 100) : 0;
  const percentUnder = 100 - percentOver;

  const disabled = submitted || lockedByTime;

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-slate-100">
      {/* Swimmer + event */}
      <div>
        <p className="text-[13px] font-semibold leading-tight">
          {market.swimmer}
        </p>
        <p className="mt-1 text-[11px] text-slate-200">{market.event}</p>
      </div>

      {/* PB / seed if present */}
      {(market.pb || market.seed) && (
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-300">
          {market.pb && (
            <span>
              PB: <span className="text-slate-100">{market.pb}</span>
            </span>
          )}
          {market.seed && (
            <span>
              Seed: <span className="text-slate-100">{market.seed}</span>
            </span>
          )}
        </div>
      )}

      {/* Line + sentiment */}
      <div className="mt-2 space-y-1.5 text-[11px]">
        <p className="text-slate-100">
          <span className="opacity-75">Time to beat:</span>{" "}
          <span className="font-semibold">{market.timeLabel}</span>
        </p>

        {totalVotes > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-300">
              <span>👥 {totalVotes}</span>
              <span>
                Over {percentOver}% · Under {percentUnder}%
              </span>
            </div>
            <div className="flex h-1 w-full overflow-hidden rounded-full bg-slate-900/70">
              <div
                className="h-full bg-[#B5473C]"
                style={{ width: `${percentOver}%` }}
              />
              <div
                className="h-full bg-[#2E7C5A]"
                style={{ width: `${percentUnder}%` }}
              />
            </div>
          </div>
        )}

        {pick && (
          <p className="text-[10px] font-semibold text-slate-100">
            Your pick:{" "}
            <span
              className={
                pick === "under" ? "text-emerald-300" : "text-rose-300"
              }
            >
              {pick === "under" ? "Under ↓" : "Over ↑"}
            </span>
          </p>
        )}
      </div>

      {/* Over / Under + submit */}
      <div className="mt-3 space-y-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPick(market.id, "over")}
            className={`flex-1 rounded-full border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
              disabled
                ? "border-slate-600 text-slate-500"
                : pick === "over"
                ? "border-rose-300 bg-rose-500/20 text-rose-50"
                : "border-rose-500/70 text-rose-200 hover:bg-rose-500/10"
            }`}
          >
            Over
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPick(market.id, "under")}
            className={`flex-1 rounded-full border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
              disabled
                ? "border-slate-600 text-slate-500"
                : pick === "under"
                ? "border-emerald-300 bg-emerald-500/20 text-emerald-50"
                : "border-emerald-500/70 text-emerald-200 hover:bg-emerald-500/10"
            }`}
          >
            Under
          </button>
        </div>

        <button
          type="button"
          disabled={submitted || !pick || lockedByTime}
          onClick={() => {
            if (!pick || lockedByTime) return;
            onSubmit(market.id);
          }}
          className={`w-full rounded-full px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
            submitted
              ? "border border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
              : lockedByTime
              ? "border border-slate-600 bg-transparent text-slate-500"
              : pick
              ? "border border-slate-100 bg-slate-50 text-[#070A14] hover:bg-white"
              : "border border-slate-600 bg-transparent text-slate-500"
          }`}
        >
          {submitted
            ? "Submitted"
            : lockedByTime
            ? "Locked"
            : pick
            ? "Submit pick"
            : "Choose Over/Under"}
        </button>
      </div>
    </article>
  );
}