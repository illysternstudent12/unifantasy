import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <PageTransition>
      <SettingsView />
    </PageTransition>
  );
}
