// src/app/meets/[meetId]/page.tsx
import { notFound } from "next/navigation";
import { MeetDetailView } from "@/components/meet/MeetDetailView";
import { meets, markets } from "@/data/taperData";

type Props = {
  params: Promise<{ meetId: string }>;
};

export default async function MeetPage({ params }: Props) {
  const { meetId } = await params;

  const meet = meets.find((m) => m.id === meetId);
  if (!meet) notFound();

  const meetMarkets = markets.filter((m) => m.meetId === meetId);

  // No longer passing 'initialResults' - the data is inside meetMarkets[i].actualTime
  return <MeetDetailView meet={meet} markets={meetMarkets} />;
}