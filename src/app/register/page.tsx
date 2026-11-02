import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return (
    <PageTransition>
      <AuthShell kicker="Join UniFantasy" title="Claim your" outline="arena" lede="One account for every sport you play. Pick your universes, platforms and formats next — it takes about a minute.">
        <RegisterForm />
      </AuthShell>
    </PageTransition>
  );
}
