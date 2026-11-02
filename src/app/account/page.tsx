import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/shell/PageTransition";
import { AccountView } from "@/components/account/AccountView";
import { getProfile, requireUser } from "@/server/dal";

export const metadata: Metadata = { title: "Account" };

export default async function Page() {
  const user = await requireUser("/account");
  const profile = await getProfile();
  if (!profile) redirect("/login?error=link");
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";
  return (
    <PageTransition>
      <AccountView profile={profile} email={user.email ?? ""} provider={provider} />
    </PageTransition>
  );
}
