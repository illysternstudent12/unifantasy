import { PageTransition } from "@/components/shell/PageTransition";
import { HomeView } from "@/components/home/HomeView";

export default function Page() {
  return (
    <PageTransition>
      <HomeView />
    </PageTransition>
  );
}
