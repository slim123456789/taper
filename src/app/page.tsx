// src/app/page.tsx
import { createClient } from "@/utils/supabase/server";
import { HomeFeed } from "@/components/home/HomeFeed";

export default async function HomePage() {
  const supabase = await createClient(); 
  const { data: _todos } = await supabase.from('todos').select();

  // 1. Fetch live data from Supabase
  const [meetsResult, marketsResult] = await Promise.all([
    supabase.from("meets").select("*"),
    supabase.from("markets").select("*"),
  ]);

  const meets = meetsResult.data || [];
  const allMarkets = marketsResult.data || [];

  // 2. Filter & Sort
  // FIX: Only show markets that are NOT completed AND do not have a result_time recorded.
  // This prevents finished events from appearing in the "Today's Spotlight" section.
  const openMarkets = allMarkets.filter((m) => {
    const isClosed = m.completed || (m.result_time && m.result_time.toString().length > 0);
    return !isClosed;
  });

  const spotlightMarkets = openMarkets
    .sort((a, b) => {
      const volA = (a.votes_over || 0) + (a.votes_under || 0);
      const volB = (b.votes_over || 0) + (b.votes_under || 0);
      return volB - volA;
    })
    .slice(0, 4);

  return <HomeFeed meets={meets} spotlightMarkets={spotlightMarkets} />;
}