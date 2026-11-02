"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { PreviewTag, Reveal } from "@/components/ui/primitives";
import { SportScene } from "@/components/art/SportScene";
import { useUniverse } from "@/lib/preferences";
import type { Selection } from "@/lib/universe";
import { cn } from "@/lib/cn";

type Msg = { id: number; role: "user" | "copilot"; text: string };

const PROMPTS: Record<Selection, string[]> = {
  all: ["Which of my leagues needs attention?", "Plan my week across every sport", "Where am I weakest overall?"],
  nba: ["Who should I stream this week?", "Is it time to sell high on my guard?", "Build me a punt-assists strategy"],
  nfl: ["Help me set my flex", "Which waiver RB should I bid on?", "Is this trade fair?"],
  soccer: ["Who should I captain this gameweek?", "Plan my next wildcard", "Which defenders have the best run?"],
  mlb: ["Which two-start pitchers matter?", "Find me stolen bases", "Should I bench my slumping slugger?"],
  nhl: ["Which goalie should I start?", "Find power-play specialists", "Who benefits from a line change?"],
  euroleague: ["Who plays twice this round?", "Find value guards", "Which bigs are in form?"],
};

const CAPABILITIES = [
  "Answers grounded in your own leagues and scoring",
  "Start / sit, waiver and trade reasoning — with sources",
  "Daily briefings across every sport you play",
  "Explains its reasoning; never auto-makes moves",
];

const HONEST_REPLY =
  "I'm not connected yet. The Copilot engine, your league data and live stats all arrive in later batches — so I can't answer this for real, and I won't guess. When I'm live, this is exactly the kind of question I'll work through with you.";

export function CopilotView() {
  const { selection: sportId, meta: sport } = useUniverse();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const nextId = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text: t }]);
    setDraft("");
    setThinking(true);
    timer.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id: nextId.current++, role: "copilot", text: HONEST_REPLY }]);
      setThinking(false);
    }, 900);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  return (
    <section className="copilot">
      <SportScene key={sportId} sport={sportId} variant="banner" depth={0.05} className="copilot__scene" backdrop />
      <div className="container copilot__grid">
        <div className="copilot__intro">
          <Reveal>
            <span className="kicker">{sport.league} · AI Copilot</span>
          </Reveal>
          <Reveal as="h1" className="display page-hero__title" delay={80}>
            Your
            <br />
            <span className="text-outline">Copilot</span>
          </Reveal>
          <Reveal delay={140}>
            <p className="lede">A fantasy analyst that knows your leagues, explains its thinking and never makes a move without you.</p>
          </Reveal>
          <Reveal className="panel panel--glass copilot__caps" delay={200}>
            <span className="kicker">When it launches</span>
            <ul>
              {CAPABILITIES.map((c) => (
                <li key={c}>
                  <Sparkles size={16} aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="chat panel" delay={120}>
          <div className="chat__head">
            <span className="chat__avatar">
              <Bot size={22} aria-hidden="true" />
            </span>
            <div>
              <strong>UniFantasy Copilot</strong>
              <span className="chat__status">Offline · preview</span>
            </div>
            <PreviewTag>Not connected</PreviewTag>
          </div>

          <div className="chat__log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation">
            {messages.length === 0 && (
              <div className="chat__empty">
                <p className="display display-s">Ask anything about your {sport.league} season.</p>
                <p className="panel__text">Try a prompt below. Responses are placeholders until the engine is live.</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={cn("bubble", `bubble--${m.role}`)}>
                {m.text}
              </div>
            ))}
            {thinking && (
              <div className="bubble bubble--copilot bubble--typing" aria-label="Copilot is typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <div className="chat__prompts">
            {PROMPTS[sportId].map((p) => (
              <button key={p} className="prompt" onClick={() => send(p)} disabled={thinking}>
                {p}
              </button>
            ))}
          </div>

          <form className="chat__form" onSubmit={onSubmit}>
            <label htmlFor="copilot-input" className="sr-only">
              Message the Copilot
            </label>
            <input
              id="copilot-input"
              className="input"
              placeholder="Message your Copilot…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="chat__send" aria-label="Send message" disabled={!draft.trim() || thinking}>
              <Send size={20} aria-hidden="true" />
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
