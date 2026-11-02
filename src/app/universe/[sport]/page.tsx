import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/shell/PageTransition";
import { UniverseView } from "@/components/universe/UniverseView";
import { SPORT_IDS, SPORTS, isSportId } from "@/lib/sports";

// The six universes are prerendered; any other slug hits notFound() below,
// rendered at request time so the shell sees the real pathname.
export function generateStaticParams() {
  return SPORT_IDS.map((sport) => ({ sport }));
}

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  if (!isSportId(sport)) return {};
  const s = SPORTS[sport];
  return { title: `${s.league} Universe`, description: `${s.league} in UniFantasy — ${s.tagline}` };
}

export default async function Page({ params }: Props) {
  const { sport } = await params;
  if (!isSportId(sport)) notFound();
  return (
    <PageTransition>
      <UniverseView id={sport} />
    </PageTransition>
  );
}
