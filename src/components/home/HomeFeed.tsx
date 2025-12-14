"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePicks } from "@/hooks/usePicks";
import { AuthButton } from "@/app/auth/AuthButton";

// --- 1. DEFINING TYPES LOCALLY (Matches Supabase Schema) ---
export type PickSide = "over" | "under";

export type Meet = {
  id: string;
  name: string;
  year: number;
  league_tag: string; // changed from leagueTag
  category: string;
  genders: string[];
};

export type Market = {
  id: string;
  meet_id: string;
  swimmer_name: string; // Changed from 'swimmer'
  event_name: string;   // Changed from 'event'
  time_label: string;
  votes_over?: number;
  votes_under?: number;
  completed?: boolean;
};

type HomeFeedProps = {
  meets: Meet[];
  spotlightMarkets: Market[];
};

export function HomeFeed({ meets, spotlightMarkets }: HomeFeedProps) {
  const { picks, submitted, setPick, submitMarket, clearSubmission } = usePicks();

  // Helper to order meets
  const sortedMeets = [...meets].sort((a, b) => b.year - a.year);
  const categoryOrder = ["NCAA", "International", "Olympics"];

  return (
    <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#02030A] to-[#020107] px-4 py-8">
      <div className="w-full max-w-[430px] rounded-3xl border border-white/10 bg-[#070A14] px-5 pb-9 pt-7 shadow-[0_26px_70px_rgba(0,0,0,0.85)]">
        
        {/* TOP NAVIGATION ROW */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/picks"
            className="whitespace-nowrap rounded-full border border-white/18 bg-white/[0.02] px-4 py-1.5 text-[11px] font-medium text-slate-50 hover:border-white/35 hover:bg-white/[0.05] transition-colors"
          >
            Your Picks
          </Link>
          <AuthButton />
        </div>

        {/* Logo Header */}
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
        </div>

        {/* Quick meet pills */}
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
                {/* UPDATED: league_tag */}
                {meet.league_tag} {meet.year}
              </Link>
            ))}
          </div>
        </section>

        {/* Spotlight picks */}
        {spotlightMarkets.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Today&apos;s spotlight
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {spotlightMarkets.map((market) => {
                // UPDATED: meet_id
                const marketMeet = meets.find((m) => m.id === market.meet_id);
                return (
                  <HomeMarketCard
                    key={market.id}
                    market={market}
                    meet={marketMeet}
                    pick={picks[market.id]}
                    submitted={!!submitted[market.id]}
                    onPick={setPick}
                    onSubmit={submitMarket}
                    onUnlock={clearSubmission}
                  />
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mt-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center text-[11px] text-slate-400">
              <p>No active spotlight markets right now.</p>
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
                          {meet.name} {meet.year}
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

// --- Sub-component ---
type HomeMarketCardProps = {
  market: Market;
  meet?: Meet;
  pick?: PickSide;
  submitted: boolean;
  onPick: (id: string, side: PickSide) => void;
  onSubmit: (id: string) => void;
  onUnlock: (id: string) => void;
};

function HomeMarketCard({
  market,
  meet,
  pick,
  submitted,
  onPick,
  onSubmit,
  onUnlock,
}: HomeMarketCardProps) {
  const router = useRouter();

  // ✅ UPDATED: Database snake_case columns
  const votesOver = market.votes_over || 0;
  const votesUnder = market.votes_under || 0;
  
  const totalVotes = votesOver + votesUnder;
  // Safety check for 0 votes to avoid NaN
  const percentOver = totalVotes > 0 ? Math.round((votesOver / totalVotes) * 100) : 50;
  const percentUnder = totalVotes > 0 ? Math.round((votesUnder / totalVotes) * 100) : 50;

  const handleCardClick = () => {
    if (!meet) return;
    router.push(`/meets/${meet.id}`);
  };

  const handleMainAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (submitted) {
      onUnlock(market.id);
    } else if (pick) {
      onSubmit(market.id);
    }
  };

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.03] px-3.5 py-3 text-slate-100">
      <div className="cursor-pointer" onClick={handleCardClick}>
        <p className="text-[13px] font-semibold leading-tight">{market.swimmer_name}</p>
        <p className="mt-1 text-[11px] leading-tight text-slate-200">{market.event_name}</p>

        {meet && (
          <div className="mt-2 flex flex-wrap gap-1 text-[9px] uppercase tracking-[0.14em] text-slate-300">
             {/* UPDATED: league_tag */}
            <span className="rounded-full bg-black/40 px-2 py-[2px]">{meet.league_tag}</span>
            <span className="rounded-full bg-black/30 px-2 py-[2px]">{meet.year}</span>
          </div>
        )}

        <div className="mt-2 space-y-1.5">
          <p className="text-[11px] text-slate-100">
            <span className="opacity-75">Time to beat:</span>{" "}
            {/* UPDATED: time_label */}
            <span className="font-semibold">{market.time_label}</span>
          </p>

          {/* Show stats even if 0 votes, or keep check if you prefer hidden */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-300">
              <span>👥 {totalVotes}</span>
              <span>Over {percentOver}% · Under {percentUnder}%</span>
            </div>
            <div className="flex h-1 w-full overflow-hidden rounded-full bg-slate-900/70">
              <div className="h-full bg-[#B5473C]" style={{ width: `${percentOver}%` }} />
              <div className="h-full bg-[#2E7C5A]" style={{ width: `${percentUnder}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!submitted) onPick(market.id, "over");
            }}
            className={`flex-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
              pick === "over"
                ? "border-rose-300 bg-rose-500/20 text-rose-50"
                : "border-rose-500/70 text-rose-200 hover:bg-rose-500/10"
            } ${submitted && pick !== "over" ? "opacity-30" : "opacity-100"}`}
          >
            Over
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!submitted) onPick(market.id, "under");
            }}
            className={`flex-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
              pick === "under"
                ? "border-emerald-300 bg-emerald-500/20 text-emerald-50"
                : "border-emerald-500/70 text-emerald-200 hover:bg-emerald-500/10"
            } ${submitted && pick !== "under" ? "opacity-30" : "opacity-100"}`}
          >
            Under
          </button>
        </div>

        <button
          type="button"
          disabled={!pick && !submitted}
          onClick={handleMainAction}
          className={`w-full rounded-full px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
            submitted
              ? "border border-slate-500 bg-transparent text-slate-400 hover:border-red-400 hover:text-red-300"
              : pick
              ? "border border-slate-100 bg-slate-50 text-[#070A14] hover:bg-white"
              : "border border-slate-600 bg-transparent text-slate-500"
          }`}
        >
          {submitted ? "Unlock" : pick ? "Submit pick" : "Choose Over/Under"}
        </button>
      </div>
    </article>
  );
}