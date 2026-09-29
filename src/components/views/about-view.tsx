"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  Bot,
  Eye,
  HandHeart,
  Landmark,
  MoonStar,
  Palette,
  Printer,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { NavigateFn } from "@/components/mentora-app";
import { Reveal } from "@/components/views/reveal";

const PILLARS = [
  {
    icon: Bot,
    title: "Instant AI explanations",
    body: "A clean, structured breakdown the moment you ask — free and unlimited, on every doubt across every vertical we serve.",
  },
  {
    icon: Users,
    title: "Verified human mentors",
    body: "Rankers, professors and serving practitioners, screened before they ever pick up a doubt, answering over text, voice or video when AI is not enough.",
  },
  {
    icon: ShieldCheck,
    title: "Nobody stays stuck",
    body: "If the first mentor cannot crack it, the doubt moves to the next available expert automatically — until you, and only you, call it solved.",
  },
];

const SUBSTANCE = [
  {
    icon: Landmark,
    title: "PYQ Vault",
    live: true,
    body: "42,000+ real prelims questions from 1979 to 2026 across nine subjects, each with a worked solution. Answers since 2011 are checked against the official key.",
  },
  {
    icon: Eye,
    title: "Second Brain",
    live: true,
    body: "700+ topics across 19 subjects as one map. Mark what you have covered and spaced revision schedules itself — untouched topics stay visibly unlit.",
  },
  {
    icon: Printer,
    title: "Mains Writing Lab",
    live: true,
    body: "Every Mains GS question from 2013 to 2025 with a scored rubric. A builder with a clock, an evaluator that never sees your name.",
  },
  {
    icon: MoonStar,
    title: "Study Lounge & Wellbeing",
    live: true,
    body: "25-minute focus sprints, a shared hall of working aspirants, weekly insights — plus private wellbeing tools the institute never sees.",
  },
  {
    icon: Users,
    title: "Mentor Connect",
    live: true,
    body: "Book a mentor's published hours, take the call in-app, and keep the session note so the next call starts where the last ended.",
  },
  {
    icon: Palette,
    title: "Reads your way",
    live: true,
    body: "Three colour themes and three text sizes, so long nights are easier on every pair of eyes.",
  },
  {
    icon: ShieldCheck,
    title: "Kept on-platform",
    live: true,
    body: "Personal contacts and outside links are filtered out of messages. Every conversation stays where it can be trusted.",
  },
  {
    icon: HandHeart,
    title: "PYQ intelligence",
    live: false,
    body: "In development: topic weightage across four decades, theme repetition, and how the examiner's framing has shifted.",
  },
  {
    icon: BadgeCheck,
    title: "Analytics for institutes",
    live: false,
    body: "In development: outcomes and mentor accountability in one dashboard for administrators — no black boxes.",
  },
];

const CREDO = [
  { icon: Bot, label: "AI powered, real humans" },
  { icon: BadgeCheck, label: "AI is always free" },
  { icon: HandHeart, label: "Credits return if nobody picks up" },
];

export function AboutView({ navigate }: { navigate: NavigateFn }) {
  return (
    <main className="pb-8">
      {/* Intro */}
      <section className="border-b border-border bg-secondary/40 paper-grain">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">About MENTORA IAS</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            You bring the question.
            <br />
            <span className="text-primary">We bring the clarity.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            MENTORA IAS pairs an instant AI explanation with a verified human
            mentor, so every doubt a serious aspirant carries gets an honest
            shot at actually being solved — before the next paper, not after it.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {CREDO.map((c) => (
              <li key={c.label} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground">
                <c.icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {c.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-14 sm:py-16" aria-label="How we help">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {PILLARS.map((p) => (
            <article key={p.title} className="card-lift rounded-2xl border border-border bg-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold">{p.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Substance grid */}
      <section className="bg-secondary/40 py-14 sm:py-16" aria-labelledby="substance-heading">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="substance-heading" className="font-display text-3xl font-semibold tracking-tight">
            Substance, not slogans.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Everything below is already shaping up on the platform — some of it
            live today, the rest honest about being in development.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SUBSTANCE.map((s) => (
              <Reveal key={s.title}>
                <article className={`h-full rounded-2xl border p-6 ${s.live ? "border-border bg-card card-lift" : "border-dashed border-border bg-card/40"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.live ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <s.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${s.live ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"}`}>
                      {s.live ? "Live now" : "In development"}
                    </span>
                  </div>
                  <h3 className={`mt-4 font-display text-lg font-semibold ${s.live ? "" : "text-foreground/70"}`}>{s.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${s.live ? "text-muted-foreground" : "text-muted-foreground/80"}`}>{s.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Institute strip */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-[0_36px_90px_-42px_rgba(20,83,45,0.65)] sm:px-12">
            <div className="grain-dark pointer-events-none absolute inset-0" aria-hidden="true" />
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">Running a coaching institute?</h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                  Your own mentors answer first. When nobody is free, the doubt
                  flows to the shared MENTORA network instead of going cold —
                  and you see outcomes in one place.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
                <Button onClick={() => navigate("institute")} className="bg-gold text-gold-foreground hover:bg-gold/90">
                  Talk to us
                </Button>
                <Button onClick={() => navigate("mentor")} variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  Become a mentor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
