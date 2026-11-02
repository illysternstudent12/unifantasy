import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { ConnectionsView } from "@/components/connections/ConnectionsView";

export const metadata: Metadata = { title: "Platform Connections" };

export default function Page() {
  return (
    <PageTransition>
      <ConnectionsView />
    </PageTransition>
  );
}
