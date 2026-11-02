import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Reset password" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <PageTransition>
      <AuthShell kicker="Account recovery" title="Locked" outline="out?" lede="It happens to the best managers. We'll send a secure link to set a new password.">
        <ForgotForm expired={sp.expired === "1"} />
      </AuthShell>
    </PageTransition>
  );
}
