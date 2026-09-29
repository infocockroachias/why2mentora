"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BadgeCheck, CircleCheck, PlayCircle, Target } from "lucide-react";
import type { NavigateFn } from "@/components/mentora-app";
import { Reveal } from "@/components/views/reveal";

const ACRONYM = [
  { letter: "M", word: "Mentorship" },
  { letter: "E", word: "Excellence" },
  { letter: "N", word: "Nurture" },
  { letter: "T", word: "Tenacity" },
  { letter: "O", word: "Outcomes" },
  { letter: "R", word: "Resolve" },
  { letter: "A", word: "Aspiration" },
];

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // first tick async to avoid synchronous setState in effect
    const initial = setTimeout(() => setNow(new Date()), 0);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(t);
    };
  }, []);
  const hh = now ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : "--:--:--";
  return (
    <span
      aria-label="Current time"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-xs tracking-wider text-muted-foreground shadow-sm"
    >
      <span className="relative inline-flex h-2 w-2 rounded-full bg-gold text-gold live-ping" />
      {hh} IST
    </span>
  );
}

/** Ticking countdown to the next UPSC CSE Prelims (late May, assumed 25 May 06:00 IST). */
function nextPrelims(now: Date): Date {
  // Prelims generally falls late May — anchor on 25 May 00:30 UTC (06:00 IST)
  let year = now.getUTCFullYear();
  let target = new Date(Date.UTC(year, 4, 25, 0, 30, 0));
  if (target.getTime() < now.getTime()) {
    year += 1;
    target = new Date(Date.UTC(year, 4, 25, 0, 30, 0));
  }
  return target;
}

function PrelimsCountdown() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const initial = setTimeout(() => setNow(new Date()), 0);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(t);
    };
  }, []);
  if (!now) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-xs tracking-wider text-muted-foreground shadow-sm"
      >
        Prelims — d · hh:mm
      </span>
    );
  }
  const target = nextPrelims(now);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const year = target.getUTCFullYear();
  return (
    <span
      aria-label={`Countdown to UPSC CSE Prelims ${year}`}
      className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-accent/50 px-3.5 py-1.5 font-mono text-xs tracking-wider text-foreground shadow-sm dark:bg-accent/30"
    >
      <Target className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
      <span className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">Prelims {year}</span>
      <span className="tabular-nums">
        {days}d {String(hrs).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </span>
  );
}

const CHIPS = [
  { icon: Bot, label: "AI that answers, humans who care" },
  { icon: CircleCheck, label: "AI help is always free" },
  { icon: BadgeCheck, label: "Solved only when YOU say so" },
];

/** Decorative floating "sample doubt" collage — purely presentational. */
function HeroCollage() {
  return (
    <>
      <div
        aria-hidden="true"
        className="float-tilt pointer-events-none absolute left-[3.5%] top-[54%] hidden w-52 xl:block"
        style={{ "--tilt": "-5deg" } as CSSProperties}
      >
        <div className="rounded-xl border border-border bg-card/90 p-3.5 shadow-[0_22px_50px_-22px_rgba(20,83,45,0.38)] backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Sample doubt</p>
          </div>
          <p className="mt-1.5 text-xs font-medium leading-relaxed text-foreground/80">
            Why does RBI target 4% inflation and not zero?
          </p>
          <p className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
            answered in 41s
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="float-tilt pointer-events-none absolute right-[3.5%] top-[27%] hidden w-52 xl:block"
        style={{ "--tilt": "4deg", animationDelay: "1.6s" } as CSSProperties}
      >
        <div className="rounded-xl border border-border bg-card/90 p-3.5 shadow-[0_22px_50px_-22px_rgba(20,83,45,0.38)] backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
              <Bot className="h-2.5 w-2.5" />
            </span>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Mentora · free</p>
          </div>
          <p className="mt-1.5 text-xs font-medium leading-relaxed text-foreground/80">
            Can Parliament amend the basic structure under Article 368?
          </p>
          <div className="mt-2.5 space-y-1.5" >
            <span className="block h-1.5 w-full rounded-full bg-secondary" />
            <span className="block h-1.5 w-4/5 rounded-full bg-secondary" />
            <span className="block h-1.5 w-3/5 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </>
  );
}

export function Hero({ navigate }: { navigate: NavigateFn }) {
  return (
    <section className="relative overflow-hidden">
      {/* layered atmosphere: aurora glow + film grain + grid lines */}
      <div className="hero-aurora pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="hero-grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="grain-fine pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />

      <HeroCollage />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pb-24">
        {/* Acronym rail */}
        <Reveal className="w-full">
          <div
            className="flex flex-wrap items-stretch justify-center gap-1.5 sm:gap-2"
            aria-label="MENTORA stands for Mentorship, Excellence, Nurture, Tenacity, Outcomes, Resolve and Aspiration"
          >
            {ACRONYM.map((a, i) => (
              <div
                key={a.letter}
                className="letter-tile group flex flex-col items-center rounded-xl border border-border bg-card/80 px-3 py-2.5 shadow-sm backdrop-blur-sm hover:bg-card sm:px-4"
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                <span className="acronym-letter text-2xl font-black leading-none text-primary transition-colors duration-300 group-hover:text-pine-soft sm:text-3xl">
                  {a.letter}
                </span>
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-300 group-hover:text-gold sm:text-[10px]">
                  {a.word}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-9" delay={90}>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <LiveClock />
            <PrelimsCountdown />
          </div>
        </Reveal>

        <Reveal className="mt-6" delay={150}>
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
            Built for the answer
            <br />
            that ends the{" "}
            <span className="relative inline-block text-primary">
              confusion.
              <svg
                className="hero-underline absolute -bottom-2 left-0 w-full text-gold"
                viewBox="0 0 220 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M3 9c40-6 140-8 214-3"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength={1}
                />
              </svg>
            </span>
          </h1>
        </Reveal>

        <Reveal className="mt-6" delay={220}>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ask the one doubt standing between you and the merit list. A free,
            structured AI explanation lands in seconds — and when you need more, a
            verified mentor takes over. You pay only when you mark it solved.
          </p>
        </Reveal>

        {/* Trust chips */}
        <Reveal className="mt-8" delay={290}>
          <ul className="flex flex-wrap items-center justify-center gap-2.5">
            {CHIPS.map((c) => (
              <li
                key={c.label}
                className="inline-flex items-center gap-2 rounded-full border border-secondary bg-secondary/70 px-4 py-2 text-xs font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <c.icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {c.label}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-9" delay={360}>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate("auth", { mode: "signup" })}
              className="btn-sheen group h-12 bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-pine-soft hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
            >
              Ask your first doubt — free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("home", { anchor: "how-it-works" })}
              className="h-12 bg-card/70 px-6 text-[15px] font-semibold backdrop-blur-sm hover:border-gold/50 hover:bg-card"
            >
              <PlayCircle className="mr-2 h-5 w-5 text-gold" aria-hidden="true" />
              See how it works
            </Button>
          </div>
        </Reveal>

        <Reveal className="mt-4" delay={420}>
          <p className="text-xs text-muted-foreground">
            No card needed · UPSC CSE, State PCS, SSC, Banking &amp; more
          </p>
        </Reveal>
      </div>
    </section>
  );
}
