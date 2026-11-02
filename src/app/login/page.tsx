import type { Metadata } from "next";
import { PageTransition } from "@/components/shell/PageTransition";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";
import { safeNext } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  return (
    <PageTransition>
      <AuthShell kicker="Welcome back" title="Back in" outline="the game" lede="Sign in to pick up your universes, platforms and preferences exactly where you left them.">
        <LoginForm next={safeNext(one("next"), "/")} linkError={one("error")} />
      </AuthShell>
    </PageTransition>
  );
}
