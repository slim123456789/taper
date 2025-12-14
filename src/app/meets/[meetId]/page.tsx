import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MeetDetailView } from "@/components/meet/MeetDetailView";

type Props = {
  params: Promise<{ meetId: string }>;
};

export default async function MeetPage({ params }: Props) {
  const { meetId } = await params;
  
  // 1. Initialize Supabase
  const supabase = await createClient();

  // 2. Fetch the specific meet (Single Object)
  const { data: meet } = await supabase
    .from("meets")
    .select("*")
    .eq("id", meetId)
    .single();

  if (!meet) {
    return notFound();
  }

  // 3. Fetch markets for this meet (Array)
  const { data: markets } = await supabase
    .from("markets")
    .select("*")
    .eq("meet_id", meetId); // Matches the snake_case column in DB

  // 4. Render the view with live data
  return <MeetDetailView meet={meet} markets={markets || []} />;
}