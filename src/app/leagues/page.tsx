import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { LeaguesView } from "@/components/leagues/LeaguesView";

export const metadata: Metadata = { title: "My Leagues" };

export default function Page() {
  return (
    <PageTransition>
      <LeaguesView />
    </PageTransition>
  );
}
