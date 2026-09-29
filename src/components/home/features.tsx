"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  Flame,
  Image as ImageIcon,
  Landmark,
  LineChart,
  Lock,
  MessageSquareText,
  Moon,
  PenLine,
  Printer,
  Radio,
  Sparkles,
  Timer,
  Users,
  Video,
} from "lucide-react";
import type { NavigateFn } from "@/components/mentora-app";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/views/reveal";

/* ---------------- What you get (pillars + help tiers) ---------------- */

const PILLARS = [
  {
    icon: Sparkles,
    title: "AI answers in seconds",
    body: "Trained on the demand of the exam, not the whole internet. It reads what the question is really asking and answers exactly that — free, unlimited, every single time.",
  },
  {
    icon: Lock,
    title: "You decide when it's solved",
    body: "Not the mentor. Not a countdown. If the doubt still nags you, it stays open — and you are never charged for a doubt you don't call solved.",
  },
  {
    icon: Users,
    title: "Humans when it matters",
    body: "Rankers, professors and serving officers step in when a doubt needs lived experience — over text, voice or video, your call.",
  },
];

const TIERS = [
  {
    name: "Quick",
    icon: MessageSquareText,
    desc: "Text or voice reply, usually within an hour.",
    best: "For single-point confusions.",
  },
  {
    name: "Standard",
    icon: ImageIcon,
    desc: "Text, voice and images — share your notes or the question paper.",
    best: "For multi-part doubts.",
  },
  {
    name: "Deep",
    icon: Video,
    desc: "A recorded video walkthrough you can rewatch forever.",
    best: "For topics that keep returning.",
  },
];

export function Pillars({ navigate }: { navigate: NavigateFn }) {
  return (
    <section aria-labelledby="pillars-heading" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">The promise</p>
          <h2 id="pillars-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            What you get, in plain words
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} className="h-full" delay={i * 90}>
              <article className="card-lift card-sheen group h-full rounded-2xl border border-border bg-card p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <p.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Help tiers */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary/70 via-card to-card">
          <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
            {TIERS.map((t, i) => (
              <div key={t.name} className="p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <t.icon className="h-5 w-5 text-gold" aria-hidden="true" />
                    {t.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    tier {i + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                <p className="mt-2 text-xs font-medium text-primary">{t.best}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pick how big the doubt is.{" "}
          <button onClick={() => navigate("plans")} className="link-sweep font-semibold text-primary hover:text-pine-soft">
            See mentor pricing →
          </button>
        </p>
      </div>
    </section>
  );
}

/* ---------------- Nine tools (7 live + 2 in development) ---------------- */

const LIVE_TOOLS = [
  {
    icon: BrainCircuit,
    name: "Aspirant's Second Brain",
    body: "One living map of the whole syllabus. It remembers what you have covered, resurfaces what is due, and spots the topics examiners keep returning to.",
    meta: "700+ topics · 19 subjects",
  },
  {
    icon: Landmark,
    name: "PYQ Vault",
    body: "Decades of actual prelims questions with every option explained and checked against the official key where one exists. Preparation on the real thing, nothing less.",
    meta: "42,000+ solved PYQs",
  },
  {
    icon: PenLine,
    name: "Mains Writing Lab",
    body: "A training ground for Mains answers against the clock. Rubric-based marking that scores your structure and content — and never sees your name.",
    meta: "GS1–GS4 rubrics",
  },
  {
    icon: Timer,
    name: "Focus Lounge",
    body: "Timed study sprints alongside aspirants working at the same hour, plus honest analytics: your best hour, your true pace, your week in one glance.",
    meta: "25-min sprints · hall view",
  },
  {
    icon: Moon,
    name: "Wellbeing Corner",
    body: "Short resets for mind and body, sleep and food check-ins, and routines that fit around a study timetable. Private to you, always.",
    meta: "60-second tools",
  },
  {
    icon: CalendarCheck,
    name: "Mentor Connect",
    body: "Book the hours mentors publish, take the call in-app, and keep a written note of every session so the next one starts where the last one ended.",
    meta: "In-app calls · notes",
  },
  {
    icon: Printer,
    name: "Clean Reports",
    body: "One printable sheet per student or mentor. Every reader sees only what they are meant to see — students, mentors and institutes each get their own lens.",
    meta: "Role-based · printable",
  },
];

const SOON_TOOLS = [
  {
    icon: Radio,
    name: "Sunday Townhall",
    body: "A weekend hour with a guest worth hearing — officers, authors, educators — to refill the motivation tank.",
  },
  {
    icon: Flame,
    name: "Wellness Desk",
    body: "For the days that need more than a timetable: guided support, licensed help, zero stigma.",
  },
];

export function Toolbelt() {
  return (
    <section aria-labelledby="tools-heading" className="relative overflow-hidden bg-secondary/50 py-16 sm:py-20 lg:py-24">
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">The toolbelt</p>
            <h2 id="tools-heading" className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for deep preparation.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Nine tools. Seven are live today. Two are still being built — and we
            say so plainly instead of pretending.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_TOOLS.map((t, i) => (
            <Reveal key={t.name} className="h-full" delay={(i % 3) * 80}>
              <article className="card-lift card-sheen group relative h-full rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <t.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/10" variant="outline">
                    Live now
                  </Badge>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{t.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-gold">
                  <span className="h-1 w-1 rounded-full bg-gold/70" aria-hidden="true" />
                  {t.meta}
                </p>
              </article>
            </Reveal>
          ))}

          {SOON_TOOLS.map((t, i) => (
            <Reveal key={t.name} className="h-full" delay={(i + 1) * 80}>
              <article
                className="relative h-full rounded-2xl border border-dashed border-border bg-card/40 p-6"
                aria-label={`${t.name} — in development`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <t.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    In development
                  </Badge>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground/70">{t.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground/80">{t.body}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <LineChart className="h-3 w-3" aria-hidden="true" /> shipping soon
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- How it works (3 steps) ---------------- */

const STEPS = [
  {
    n: "1",
    title: "Drop the doubt",
    body: "Type or paste the question — any subject, any exam vertical. Attach the paper if you have it.",
    tag: null as string | null,
  },
  {
    n: "2",
    title: "Get the AI breakdown",
    body: "A structured explanation in seconds: the demand of the question, the provisions, the trap — plus the prerequisite you might be missing.",
    tag: "FREE",
  },
  {
    n: "3",
    title: "Bring in a mentor",
    body: "Still stuck? A verified mentor picks it up over text, voice or video. You close the doubt, you mark it solved. Only then does it count.",
    tag: "MENTOR",
  },
];

export function HowItWorks({ navigate }: { navigate: NavigateFn }) {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">The flow</p>
          <h2 id="how-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            What happens when you ask
          </h2>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative">
              <Reveal className="h-full" delay={i * 110}>
                <div className="card-lift card-sheen group h-full rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground ring-2 ring-transparent transition-all duration-300 group-hover:ring-gold/50">
                      {s.n}
                    </span>
                    {s.tag && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-[10px] tracking-widest",
                          s.tag === "FREE"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "border-gold/40 bg-gold/10 text-gold"
                        )}
                      >
                        {s.tag}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
              {i < STEPS.length - 1 && (
                <ArrowRight
                  className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-gold md:block"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center">
          <Button onClick={() => navigate("home", { anchor: "try-doubt" })} variant="outline" className="h-11 px-6 font-semibold">
            Try it live below <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
