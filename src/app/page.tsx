// src/app/page.tsx
import { createClient } from "@/utils/supabase/server";
import { HomeFeed } from "@/components/home/HomeFeed";
import type { Market, Meet } from "@/data/taperData";

export const revalidate = 0; // Realtime: Ensure fresh data on every request

export default async function HomePage() {
  const supabase = await createClient();

  const [meetsRes, spotlightRes] = await Promise.all([
    supabase.from("meets").select("*").order("year", { ascending: false }),
    supabase
      .from("markets")
      .select("*, meets!inner(*)")
      .is("result_value", null) // Only fetch OPEN markets
      .order("votes_over", { ascending: false }) // Approximate popularity sort
      .limit(4),
  ]);

  const meets = (meetsRes.data ?? []).map(mapDbMeetToApp);
  const spotlightMarkets = (spotlightRes.data ?? []).map(mapDbMarketToApp);

  return <HomeFeed meets={meets} spotlightMarkets={spotlightMarkets} />;
}

// --- Mappers ---

function mapDbMeetToApp(row: any): Meet {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    leagueTag: row.league_tag,
    year: row.year,
    genders: row.genders || ["Men", "Women"],
    lockTime: row.lock_time,
  };
}

function mapDbMarketToApp(row: any): Market {
  return {
    id: row.id,
    meetId: row.meet_id,
    gender: row.gender,
    swimmer: row.swimmer,
    event: row.event,
    timeLabel: row.line_label,
    pb: row.pb,
    seed: row.seed,
    votesOver: row.votes_over,
    votesUnder: row.votes_under,
  };
}