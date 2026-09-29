"use client";

import { useEffect, useState } from "react";
import { Bot, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/views/reveal";

/** Original narrative scene: a doubt buried in a noisy group chat vs MENTORA. */
const GROUP_NOISE = [
  { name: "Ravi", text: "bhai prelims checklist kahan hai? 😅", delay: 600 },
  { name: "Aditi", text: "new meme page is gold 🤣", delay: 1100 },
  { name: "Sameer", text: "who's coming for chai break??", delay: 1600 },
  { name: "Neha", text: "send 2-page notes for whole syllabus pls 🥲", delay: 2100 },
];

const GROUP_QUESTION = {
  name: "Kavya",
  text: "Can President veto a money bill? GS mock tomorrow, please explain 🙏",
  delay: 2800,
};

const MENTORA_ANSWER = {
  summary:
    "No veto exists — the President must assent to a Money Bill (Art. 109(4)). Here is how it works:",
  points: [
    "Constitutional basis: Article 109 — a Money Bill goes to the Lok Sabha first; Rajya Sabha gets 14 days with recommendations only.",
    "President's choice: Assent or withhold once — but for Money Bills, assent is effectively certain; there is no pocket or absolute veto in practice.",
    "Contrast to remember: Ordinary Bills (Art. 111) allow withholding or reconsideration; Money Bills (Art. 109(4)) do not.",
  ],
  concept: "Revise: Money Bill vs Financial Bill — where each originates and who can amend",
};

const TICKER_EXAMS = [
  "UPSC CSE",
  "State PCS",
  "SSC CGL",
  "RBI Grade B",
  "NABARD Grade A",
  "CDS",
  "CAPF",
  "EPFO",
];

function useStep(target: number, enabled = true) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % target), 1200);
    return () => clearTimeout(t);
  }, [step, target, enabled]);
  return step;
}

export function Story() {
  // group noise messages appear in a loop
  const noiseStep = useStep(GROUP_NOISE.length + 2);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setShowQuestion(noiseStep >= GROUP_NOISE.length);
  }, [noiseStep]);

  useEffect(() => {
    setShowAnswer(false);
    if (!showQuestion) return;
    const t = setTimeout(() => setShowAnswer(true), 900);
    return () => clearTimeout(t);
  }, [showQuestion]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  return (
    <section aria-labelledby="story-heading" className="relative overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20 lg:py-24">
      <div className="grain-dark pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Narrative */}
          <Reveal>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                11:47 PM · the night before a mock
              </p>
              <h2 id="story-heading" className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Every aspirant knows this exact moment.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-primary-foreground/85">
                A doubt strikes at midnight. It lands in a group chat of four
                hundred classmates — and drowns under birthday wishes and memes
                before sunrise. The tab stays open. The doubt stays.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-primary-foreground/85">
                On MENTORA IAS, the same question gets a structured, exam-tuned
                explanation{" "}
                <span className="font-semibold text-gold">
                  before the tab loses focus
                </span>{" "}
                — with the exact provision, the trap to avoid, and what to revise
                next.
              </p>

              <dl className="mt-8 grid grid-cols-3 divide-x divide-primary-foreground/15 border-t border-primary-foreground/15 pt-6">
                {[
                  { k: "< 60s", v: "First AI response" },
                  { k: "24×7", v: "Mentors on rotation" },
                  { k: "₹0", v: "Until you say solved" },
                ].map((s) => (
                  <div key={s.k} className="px-4 first:pl-0 last:pr-0">
                    <dt className="font-display text-2xl font-bold tabular-nums text-gold sm:text-3xl">{s.k}</dt>
                    <dd className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-primary-foreground/70">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {/* Chat demo */}
          <Reveal delay={140}>
            <div className="relative">
              <div className="panel-night rounded-2xl border border-white/10 p-4 sm:p-5" role="img" aria-label="Animation comparing a group chat that buries a doubt with MENTORA answering it instantly">
                {/* noisy group chat */}
                <div className="rounded-xl bg-white/5 p-3.5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                      Group chat · 482 members
                    </p>
                    <span className="text-[10px] text-white/35">unrelated chatter</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {GROUP_NOISE.map((m, i) => (
                      <div
                        key={m.name}
                        className={cn(
                          "max-w-[85%] self-start rounded-lg rounded-bl-sm border border-white/5 bg-white/10 px-3 py-2 text-xs text-white/70",
                          noiseStep > i ? "msg-in" : "opacity-0"
                        )}
                      >
                        <span className="font-semibold text-white/90">{m.name}: </span>
                        {m.text}
                      </div>
                    ))}
                    <div
                      className={cn(
                        "max-w-[92%] self-start rounded-lg rounded-bl-sm border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-white shadow-[0_10px_28px_-14px_rgba(217,119,6,0.55)]",
                        showQuestion ? "msg-in" : "opacity-0"
                      )}
                    >
                      <span className="font-semibold text-gold">{GROUP_QUESTION.name}: </span>
                      {GROUP_QUESTION.text}
                    </div>
                    {showQuestion && !showAnswer && (
                      <div className="ml-1 flex items-center gap-1.5 px-1 text-[10px] text-white/40">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
                        buried by morning…
                      </div>
                    )}
                  </div>
                </div>

                {/* MENTORA answer */}
                <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-3.5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-300">
                      <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/90">
                      MENTORA IAS · answered in 41s
                    </p>
                    <ShieldCheck className="ml-auto h-3.5 w-3.5 text-emerald-300/60" aria-hidden="true" />
                  </div>
                  {showAnswer ? (
                    <div className="flex flex-col gap-2.5">
                      <p className="msg-in text-xs leading-relaxed text-white/90">{MENTORA_ANSWER.summary}</p>
                      {MENTORA_ANSWER.points.map((p, i) => (
                        <p
                          key={i}
                          className="msg-in rounded-md border border-white/5 bg-white/5 px-2.5 py-2 text-[11px] leading-relaxed text-white/75"
                          style={{ animationDelay: `${(i + 1) * 140}ms` }}
                        >
                          {p}
                        </p>
                      ))}
                      <p className="msg-in text-[11px] font-medium text-gold" style={{ animationDelay: "500ms" }}>
                        📌 {MENTORA_ANSWER.concept}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-white/40">
                      <span className="h-3 w-16 rounded bg-white/10 shimmer" />
                      <span className="h-3 w-28 rounded bg-white/10 shimmer" />
                    </div>
                  )}
                </div>
              </div>

              {/* floating badge */}
              <div className={cn("float-slow absolute -left-3 -top-4 hidden rounded-xl border border-gold/40 bg-[#0d1710] px-3 py-2 text-[10px] font-semibold text-gold shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)] sm:block", reduced && "animate-none")}>
                doubt → clarity in seconds
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Exam verticals ticker */}
      <div className="relative mt-14 border-y border-primary-foreground/10 py-4" aria-label="Exams supported">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-primary via-primary/70 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-primary via-primary/70 to-transparent" aria-hidden="true" />
        <div className="overflow-hidden">
          <div className="ticker-track flex w-max items-center gap-10">
            {[...TICKER_EXAMS, ...TICKER_EXAMS].map((exam, i) => (
              <span key={`${exam}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
                <span className="font-display text-lg font-medium text-primary-foreground/70">{exam}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-gold/70" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
