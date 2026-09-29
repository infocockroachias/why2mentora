"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ArrowRight, Quote } from "lucide-react";
import type { NavigateFn } from "@/components/mentora-app";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/views/reveal";

/** Counts 0 → target with an ease-out once `active` flips true. */
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return active ? value : 0;
}

/* ---------------- Verified mentors ---------------- */

const MENTORS = [
  {
    initials: "AS",
    tint: "bg-emerald-800",
    headline: "Rank 47, UPSC CSE",
    line: "5× Prelims · 3× Mains · 2× Interview",
    subjects: "Polity · Modern History",
  },
  {
    initials: "MD",
    tint: "bg-amber-700",
    headline: "State PCS topper (Rank 3)",
    line: "4× Prelims · 3× Mains · 1× Interview",
    subjects: "Polity · Economy",
  },
  {
    initials: "RK",
    tint: "bg-teal-800",
    headline: "RBI Grade B · NABARD",
    line: "6× Prelims · 3× Mains",
    subjects: "ESI · Finance & Banking",
  },
  {
    initials: "PT",
    tint: "bg-stone-700",
    headline: "Prof. of Geography, 14 yrs teaching",
    line: "Guided 900+ Mains answers",
    subjects: "Geography · Environment",
  },
];

export function Mentors() {
  return (
    <section aria-labelledby="mentors-heading" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">The humans</p>
            <h2 id="mentors-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Verified mentors, checked before they take a doubt.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Every mentor is screened on credentials and teaching ability before
              joining. Inside a session, students stay pseudonymous and contact
              details are filtered — the platform keeps the conversation safe.
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-secondary px-3.5 py-2 text-primary">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            VERIFIED — Toppers · Professors · Practitioners
          </Badge>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MENTORS.map((m, i) => (
            <Reveal key={m.initials} className="h-full" delay={i * 80}>
              <li className="card-lift card-sheen group h-full rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full font-display text-base font-bold tracking-wide text-white ring-2 ring-transparent transition-all duration-300 group-hover:ring-gold/70 group-hover:ring-offset-2 group-hover:ring-offset-card",
                      m.tint
                    )}
                  >
                    {m.initials}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Verified
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold leading-snug">{m.headline}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{m.line}</p>
                <p className="mt-3 border-t border-border pt-3 text-xs font-medium text-gold">{m.subjects}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Live stats band ---------------- */

type Stat = { key: string; label: string; value: number };

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

export function StatsBand() {
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [failed, setFailed] = useState(false);
  const bandRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.ok) setStats(d.stats);
        else if (alive) setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  // start count-up when the band scrolls into view
  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const skeletons = [0, 1, 2, 3];

  return (
    <section ref={bandRef} aria-label="Platform statistics" className="relative border-y border-border bg-gradient-to-b from-card via-card to-secondary/40">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:divide-x lg:divide-border lg:px-8">
        {stats
          ? stats.map((s) => (
              <StatCell key={s.key} stat={s} active={inView} />
            ))
          : !failed
            ? skeletons.map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="h-9 w-24 rounded-lg bg-muted shimmer" />
                  <span className="h-3 w-20 rounded bg-muted" />
                </div>
              ))
            : null}
      </div>
    </section>
  );
}

function StatCell({ stat, active }: { stat: Stat; active: boolean }) {
  const v = useCountUp(stat.value, active);
  const done = v >= stat.value;
  return (
    <div className="text-center">
      <p
        className="font-display text-3xl font-bold tabular-nums tracking-tight text-primary transition-colors duration-500 sm:text-4xl"
        aria-label={`${fmt(stat.value)}+ ${stat.label}`}
      >
        {fmt(done ? stat.value : v)}
        <span className={cn("text-gold transition-opacity duration-500", done ? "opacity-100" : "opacity-40")}>+</span>
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
    </div>
  );
}

/* ---------------- Doubt teaser strip ---------------- */

export function DoubtTeaser({ navigate }: { navigate: NavigateFn }) {
  return (
    <section aria-labelledby="teaser-heading" className="py-16 sm:py-20">
      <Reveal className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <Quote className="mx-auto h-8 w-8 text-gold/50" aria-hidden="true" />
          <h2 id="teaser-heading" className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            You already know this feeling.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            The same doubt, open in the fourth tab, at 1 AM. Close the loop
            tonight — bring the question, leave with clarity.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate("auth", { mode: "signup" })}
              className="btn-sheen h-12 bg-primary px-7 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:bg-pine-soft hover:shadow-xl hover:shadow-primary/30"
            >
              Create your account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("auth", { mode: "login" })} className="h-12 px-6 font-semibold">
              Already have an account? Log in
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
