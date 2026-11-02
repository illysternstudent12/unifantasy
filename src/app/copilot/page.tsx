import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { CopilotView } from "@/components/copilot/CopilotView";

export const metadata: Metadata = { title: "AI Copilot" };

export default function Page() {
  return (
    <PageTransition>
      <CopilotView />
    </PageTransition>
  );
}
