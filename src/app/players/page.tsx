import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { PlayersView } from "@/components/players/PlayersView";

export const metadata: Metadata = { title: "Player Intelligence" };

export default function Page() {
  return (
    <PageTransition>
      <PlayersView />
    </PageTransition>
  );
}
