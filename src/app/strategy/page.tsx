import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { StrategyView } from "@/components/strategy/StrategyView";

export const metadata: Metadata = { title: "Strategy Lab" };

export default function Page() {
  return (
    <PageTransition>
      <StrategyView />
    </PageTransition>
  );
}
