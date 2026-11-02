import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/shell/PageTransition";
import { AuthShell } from "@/components/auth/AuthShell";
import { NewPasswordForm } from "@/components/auth/AuthForms";
import { getUser } from "@/server/dal";

export const metadata: Metadata = { title: "New password" };

export default async function Page() {
  // Only reachable with the session created by a valid recovery link.
  const user = await getUser();
  if (!user) redirect("/forgot-password?expired=1");
  return (
    <PageTransition>
      <AuthShell kicker="Account recovery" title="Fresh" outline="start" lede={`Setting a new password for ${user.email ?? "your account"}.`}>
        <NewPasswordForm from="reset" />
      </AuthShell>
    </PageTransition>
  );
}
