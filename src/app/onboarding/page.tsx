import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { getProfile, requireUser } from "@/server/dal";

export const metadata: Metadata = { title: "Set up your universe" };

export default async function Page() {
  // Server-side gate (the proxy is only optimistic).
  await requireUser("/onboarding");
  const profile = await getProfile();
  if (!profile) redirect("/account?error=profile");
  return <OnboardingFlow initial={profile} />;
}
