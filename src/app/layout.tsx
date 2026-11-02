import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Manrope } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { SPORT_STORAGE_KEY } from "@/lib/sport-key";
import { DEFAULT_SPORT, SPORTS } from "@/lib/sports";
import { SELECTIONS } from "@/lib/universe";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["500", "600"] });

export const metadata: Metadata = {
  title: { default: "UniFantasy — Multi-sport fantasy, reimagined", template: "%s · UniFantasy" },
  description:
    "UniFantasy is an AI-powered multi-sport fantasy platform for NBA, NFL, Soccer/FPL, MLB, NHL and EuroLeague.",
};

export const viewport: Viewport = {
  themeColor: SPORTS[DEFAULT_SPORT].hex.deep,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Runs before first paint: applies the stored sport theme and motion/grain
 * preferences to <html> so there is no flash of the default theme.
 */
const bootScript = `(function(){try{var d=document.documentElement;d.setAttribute('data-js','');var ids=${JSON.stringify(SELECTIONS)};var s=JSON.parse(localStorage.getItem('${SPORT_STORAGE_KEY}')||'null');if(ids.indexOf(s)>-1)d.setAttribute('data-sport',s);var p=JSON.parse(localStorage.getItem('uf:prefs')||'null');if(p){if(p.motion)d.setAttribute('data-motion',p.motion);d.setAttribute('data-grain',p.grain===false?'off':'on');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-sport={DEFAULT_SPORT}
      data-motion="system"
      data-grain="on"
      className={`${anton.variable} ${manrope.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
