"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  markets,
  meets,
  type PickSide,
  type Market as MarketType,
} from "@/data/taperData";

type PickMap = Record<string, PickSide>;

export default function PicksPage() {
  const [picks, setPicks] = useState<PickMap>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("taper_picks_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as PickMap;
      setPicks(parsed);
    } catch (err) {
      console.error("Failed to load picks", err);
    }
  }, []);

  const grouped = useMemo(() => {
    const marketById = new Map<string, MarketType>();
    for (const m of markets) marketById.set(m.id, m);

    const byMeet: Record<
      string,
      { meetName: string; markets: { market: MarketType; side: PickSide }[] }
    > = {};

    for (const [marketId, side] of Object.entries(picks)) {
      const market = marketById.get(marketId);
      if (!market) continue;
      const meet = meets.find((m) => m.id === market.meetId);
      if (!meet) continue;

      if (!byMeet[meet.id]) {
        byMeet[meet.id] = { meetName: meet.name, markets: [] };
      }
      byMeet[meet.id].markets.push({ market, side });
    }

    return byMeet;
  }, [picks]);

  const hasPicks = Object.keys(grouped).length > 0;

  const handleClear = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("taper_picks_v1");
    setPicks({});
  };

  return (
    <main className="flex min-h-screen justify-center bg-gradient-to-b from-[#0E1A33] to-[#07101F] px-4 py-8">
      <div className="app-shell glass-panel w-full max-w-[430px] rounded-2xl border border-white/10 bg-[#101E3C]/90 px-4 pb-8 pt-5 shadow-lg shadow-black/20 text-slate-100">
        {/* Top nav */}
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-300">
          <Link href="/" className="hover:text-white">
            ← Meets
          </Link>
        </div>

        <header className="mb-4 text-center">
          <h1 className="font-migra text-3xl tracking-[0.08em] uppercase">
            TAPER
          </h1>
          <p className="mt-1 text-[10px] tracking-[0.15em] text-slate-300 uppercase">
            Swim Predictions
          </p>
          <p className="mt-2 text-[11px] text-slate-200">Your picks</p>
        </header>

        {!hasPicks && (
          <div className="mt-10 text-center text-xs text-slate-200">
            <p>You haven&apos;t made any picks yet.</p>
            <p className="mt-2 text-[11px] text-slate-300">
              Choose a meet, build a slate, and track your swim instincts.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-white/10 px-4 py-2 text-[11px] font-medium text-slate-100 hover:bg-white/20"
            >
              View meets
            </Link>
          </div>
        )}

        {hasPicks && (
          <>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-300">
              <span>All your predictions across meets.</span>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-slate-500/60 px-3 py-1 text-[10px] text-slate-200 hover:bg-white/5"
              >
                Clear all
              </button>
            </div>

            <section className="mt-4 space-y-5">
              {Object.entries(grouped).map(([meetId, group]) => (
                <div key={meetId} className="rounded-xl bg-white/7 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[13px] font-semibold">
                        {group.meetName}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-300">
                        {group.markets.length} picks
                      </p>
                    </div>
                    <Link
                      href={`/meets/${meetId}`}
                      className="text-[11px] text-slate-300 hover:text-white"
                    >
                      View slate →
                    </Link>
                  </div>

                  <div className="mt-3 space-y-2">
                    {group.markets.map(({ market, side }) => (
                      <div
                        key={market.id}
                        className="rounded-lg bg-[#0F2B56] px-3 py-2 text-[11px]"
                      >
                        <p className="font-semibold">{market.swimmer}</p>
                        <p className="mt-1 text-[11px] text-slate-200">
                          {market.event}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-300">
                          Time to beat: {market.timeLabel}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-100">
                          Your pick: {side === "under" ? "Under ↓" : "Over ↑"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
