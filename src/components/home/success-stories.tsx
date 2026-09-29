"use client";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/views/reveal";
import { Quote, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Success stories — fictional-but-plausible aspirant journeys written
 * originally for MENTORA IAS. Initial avatars only, no real identities.
 */
const STORIES = [
  {
    initials: "NK",
    tint: "bg-emerald-800",
    result: "Cleared UPSC CSE · AIR 312",
    quote:
      "My Polity doubts used to wait for Sunday class. On MENTORA they were dead in minutes — the AI gave the provision, the mentor gave the exam lens. My Mains answer structure changed within a month.",
    detail: "3rd attempt · Polity was the weak wall",
  },
  {
    initials: "SJ",
    tint: "bg-amber-700",
    result: "State PCS · Rank 11",
    quote:
      "The Second Brain map showed me I had covered 61% of the syllabus but only 20% of high-frequency topics. I re-planned in one evening. That one screen was worth the whole subscription.",
    detail: "Working professional · 4 hrs/day",
  },
  {
    initials: "VP",
    tint: "bg-teal-800",
    result: "RBI Grade B · 2024 batch",
    quote:
      "The Pay-only-when-solved rule sounds like marketing until you actually use it. Doubts got answered at 1 AM during Phase 2 prep — and I never paid for a doubt that wasn't closed properly.",
    detail: "Finance & ESI · night-shift preparer",
  },
];

export function SuccessStories() {
  return (
    <section aria-labelledby="stories-heading" className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Proof, not promises</p>
          <h2 id="stories-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Aspirants who stopped staying stuck.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Journeys from the MENTORA bench — shared with permission, kept pseudonymous.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <Reveal key={s.initials} delay={i * 90}>
              <figure className="card-lift flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <Quote className="h-6 w-6 text-gold/40" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">
                  {s.quote}
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold text-white",
                        s.tint
                      )}
                    >
                      {s.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
                        {s.result}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.detail}</p>
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center">
          <Badge variant="outline" className="max-w-full whitespace-normal border-border bg-card px-3.5 py-1.5 text-center text-muted-foreground">
            Stories are illustrative composites written for the MENTORA preview
          </Badge>
        </p>
      </div>
    </section>
  );
}
