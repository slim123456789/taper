// src/app/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  meets,
  markets,
  type MeetCategory,
  type Market as MarketType,
} from "@/data/taperData";
import { usePicks } from "@/hooks/usePicks";
import type { PickSide } from "@/data/taperData";

const categoryOrder: MeetCategory[] = ["NCAA", "International", "Olympics"];

export default function MeetSelectorPage() {
  const { picks, submitted, setPick, submitMarket } = usePicks();

  const spotlightMarkets = useMemo(() => {
    const validMeetIds = new Set(meets.map((m) => m.id));
    const withValidMeet = markets.filter((m) => validMeetIds.has(m.meetId));

    const sorted = [...withValidMeet].sort((a, b) => {
      const aVotes = (a.votesOver ?? 0) + (a.votesUnder ?? 0);
      const bVotes = (b.votesOver ?? 0) + (b.votesUnder ?? 0);
      return bVotes - aVotes;
    });

    return sorted.slice(0, 4);
  }, []);

  return (
    <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#02030A] to-[#020107] px-4 py-8">
      <div className="w-full max-w-[430px] rounded-3xl border border-white/10 bg-[#070A14] px-5 pb-9 pt-7 shadow-[0_26px_70px_rgba(0,0,0,0.85)]">
        {/* Header */}
        <header className="mb-6 text-center text-white">
          <h1 className="font-migra text-[32px] leading-none tracking-[0.12em] uppercase">
            TAPER
          </h1>

          <p className="mt-2 text-[11px] tracking-[0.22em] text-slate-200 uppercase">
            Swim Predictions
          </p>

          <p className="mt-3 font-migra text-[13px] italic text-slate-100">
            How elite is your swim knowledge?
          </p>
        </header>

        {/* Top helper row */}
        <div className="mb-4 flex items-center justify-between text-[11px] text-slate-300">
          <p className="text-left">
            Tap Over/Under, then submit each pick to lock it in.
          </p>
          <Link
            href="/picks"
            className="rounded-full border border-white/18 px-3 py-1 text-[10px] font-medium text-slate-50 hover:border-white/35 hover:bg-white/5"
          >
            Your picks
          </Link>
        </div>

        {/* Quick meet pills */}
        <MeetQuickLinks />

        {/* Spotlight picks */}
        {spotlightMarkets.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Today&apos;s spotlight
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {spotlightMarkets.map((market) => (
                <HomeMarketCard
                  key={market.id}
                  market={market}
                  pick={picks[market.id]}
                  submitted={!!submitted[market.id]}
                  onPick={setPick}
                  onSubmit={submitMarket}
                />
              ))}
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="mt-7 mb-4 h-px w-full bg-white/8" />

        {/* Meet groups */}
        <section className="space-y-5">
          {categoryOrder.map((cat) => {
            const catMeets = meets.filter((m) => m.category === cat);
            if (!catMeets.length) return null;
            return (
              <div key={cat}>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  {cat}
                </h2>
                <div className="mt-2 space-y-2.5">
                  {catMeets.map((meet) => (
                    <Link
                      key={meet.id}
                      href={`/meets/${meet.id}`}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-sm text-slate-100 hover:border-white/25 hover:bg-white/[0.04]"
                    >
                      <div className="space-y-1">
                        <p className="text-[13px] font-medium">
                          {meet.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {meet.genders.join(" · ")}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 transition group-hover:text-slate-50">
                        View slate →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

/* ---------- Meet quick links (pills for each meet) ---------- */

function MeetQuickLinks() {
  const sortedMeets = [...meets].sort((a, b) => {
    const order: MeetCategory[] = ["NCAA", "International", "Olympics"];
    const catDiff = order.indexOf(a.category) - order.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return b.year - a.year;
  });

  return (
    <section>
      <p className="mb-2 text-[11px] text-slate-400">
        Jump straight into a meet
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sortedMeets.map((meet) => (
          <Link
            key={meet.id}
            href={`/meets/${meet.id}`}
            className="whitespace-nowrap rounded-full border border-white/18 bg-white/[0.02] px-3 py-1 text-[11px] font-medium text-slate-50 hover:border-white/35 hover:bg-white/[0.05]"
          >
            {meet.leagueTag} {meet.year}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Home Market Card (Spotlight) ---------- */

type HomeMarketCardProps = {
  market: MarketType;
  pick?: PickSide;
  submitted: boolean;
  onPick: (id: string, side: PickSide) => void;
  onSubmit: (id: string) => void;
};

function HomeMarketCard({
  market,
  pick,
  submitted,
  onPick,
  onSubmit,
}: HomeMarketCardProps) {
  const router = useRouter();
  const meet = meets.find((m) => m.id === market.meetId);
  const votesOver = market.votesOver ?? 0;
  const votesUnder = market.votesUnder ?? 0;
  const totalVotes = votesOver + votesUnder;
  const percentOver =
    totalVotes > 0 ? Math.round((votesOver / totalVotes) * 100) : 0;
  const percentUnder = 100 - percentOver;

  const handleCardClick = () => {
    if (!meet) return;
    router.push(`/meets/${meet.id}`);
  };

  const disabled = submitted;

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.03] px-3.5 py-3 text-slate-100">
      {/* Top-clickable area */}
      <div className="cursor-pointer" onClick={handleCardClick}>
        {/* Swimmer + event */}
        <p className="text-[13px] font-semibold leading-tight">
          {market.swimmer}
        </p>
        <p className="mt-1 text-[11px] leading-tight text-slate-200">
          {market.event}
        </p>

        {/* Meet tags: league + year */}
        {meet && (
          <div className="mt-2 flex flex-wrap gap-1 text-[9px] uppercase tracking-[0.14em] text-slate-300">
            <span className="rounded-full bg-black/40 px-2 py-[2px]">
              {meet.leagueTag}
            </span>
            <span className="rounded-full bg-black/30 px-2 py-[2px]">
              {meet.year}
            </span>
          </div>
        )}

        {/* Line + sentiment */}
        <div className="mt-2 space-y-1.5">
          <p className="text-[11px] text-slate-100">
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
        </div>
      </div>

      {/* Bottom: Over/Under + submit */}
      <div className="mt-2 space-y-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onPick(market.id, "over");
            }}
            className={`flex-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
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
            onClick={(e) => {
              e.stopPropagation();
              onPick(market.id, "under");
            }}
            className={`flex-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
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
          disabled={submitted || !pick}
          onClick={(e) => {
            e.stopPropagation();
            if (!pick) return;
            onSubmit(market.id);
          }}
          className={`w-full rounded-full px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
            submitted
              ? "border border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
              : pick
              ? "border border-slate-100 bg-slate-50 text-[#070A14] hover:bg-white"
              : "border border-slate-600 bg-transparent text-slate-500"
          }`}
        >
          {submitted
            ? "Submitted"
            : pick
            ? "Submit pick"
            : "Choose Over/Under"}
        </button>
      </div>
    </article>
  );
}