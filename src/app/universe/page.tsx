import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { UniverseView } from "@/components/universe/UniverseView";

export const metadata: Metadata = { title: "All Sports Universe" };

export default function Page() {
  return (
    <PageTransition>
      <UniverseView id="all" />
    </PageTransition>
  );
}
