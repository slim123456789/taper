import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { MeetDetailView } from "@/components/meet/MeetDetailView";
import type { Market, Meet } from "@/data/taperData";

export const revalidate = 0;

type PageProps = {
  params: Promise<{ meetId: string }>;
};

export default async function MeetPage({ params }: PageProps) {
  const { meetId } = await params;
  const supabase = await createClient();

  // 1. Fetch Meet Metadata
  const { data: meetRow } = await supabase
    .from("meets")
    .select("*")
    .eq("id", meetId)
    .single();

  if (!meetRow) {
    return notFound();
  }

  // 2. Fetch All Markets for this Meet
  const { data: marketRows } = await supabase
    .from("markets")
    .select("*")
    .eq("meet_id", meetId);

  const meet: Meet = {
    id: meetRow.id,
    name: meetRow.name,
    category: meetRow.category,
    leagueTag: meetRow.league_tag,
    year: meetRow.year,
    genders: meetRow.genders || ["Men", "Women"],
    lockTime: meetRow.lock_time,
  };

  // Map markets and attach results directly
  // Note: We extend the Market type locally or pass results separately.
  // Here, I pass a map of results to keep the View logic clean.
  const markets: Market[] = (marketRows ?? []).map((row) => ({
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
  }));

  // Create a Results Map: { "market-id": "42.50" }
  // This replaces the old static `results.ts` file.
  const resultsMap: Record<string, string> = {};
  (marketRows ?? []).forEach((row) => {
    if (row.result_value) {
      resultsMap[row.id] = row.result_value;
    }
  });

  return (
    <MeetDetailView meet={meet} markets={markets} initialResults={resultsMap} />
  );
}