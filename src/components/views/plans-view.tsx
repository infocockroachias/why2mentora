"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Building2, Check, GraduationCap, Sparkles } from "lucide-react";
import type { NavigateFn } from "@/components/mentora-app";
import { cn } from "@/lib/utils";

const STUDENT_PLANS = [
  {
    name: "Seeker",
    tagline: "For the first serious attempt",
    monthly: 0,
    yearly: 0,
    cta: "Start free",
    featured: false,
    features: [
      "Unlimited AI doubt answers",
      "PYQ Vault — browse & search",
      "Second Brain syllabus map",
      "3 mentor sessions / month (text)",
      "Community study lounge",
    ],
  },
  {
    name: "Achiever",
    tagline: "The full preparation loop",
    monthly: 299,
    yearly: 2499,
    cta: "Go Achiever",
    featured: true,
    features: [
      "Everything in Seeker",
      "Unlimited Quick & Standard mentor doubts",
      "Mains Writing Lab with rubric scoring",
      "Mentor Connect calls (2 / month)",
      "Focus Lounge analytics & weekly insights",
      "Printable progress reports",
    ],
  },
  {
    name: "Rank Holder",
    tagline: "Interview-grade attention",
    monthly: 699,
    yearly: 5999,
    cta: "Go Rank Holder",
    featured: false,
    features: [
      "Everything in Achiever",
      "Deep video answers on any doubt",
      "Weekly 1:1 mentor check-in",
      "Priority routing — mentors pick up faster",
      "Personalised PYQ trend report",
    ],
  },
];

const INSTITUTE_PLANS = [
  {
    name: "Campus",
    students: "Up to 200 students",
    price: "₹24,999",
    period: "/ year",
    features: [
      "Your mentors answer first",
      "Shared MENTORA network fallback",
      "Student onboarding & CSV import",
      "Basic outcome dashboard",
    ],
  },
  {
    name: "Academy",
    students: "Up to 1,000 students",
    price: "₹89,999",
    period: "/ year",
    featured: true,
    features: [
      "Everything in Campus",
      "Mains Writing Lab for all batches",
      "Full analytics & mentor accountability",
      "Dedicated success manager",
      "Branded student reports",
    ],
  },
  {
    name: "University",
    students: "1,000+ students",
    price: "Custom",
    period: "talk to us",
    features: [
      "Everything in Academy",
      "On-premise mentor network setup",
      "Custom SLAs & integrations",
      "Faculty training workshops",
    ],
  },
];

export function PlansView({ navigate }: { navigate: NavigateFn }) {
  const [yearly, setYearly] = useState(true);

  return (
    <main className="pb-8">
      <section className="border-b border-border bg-secondary/40 paper-grain">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Plans &amp; pricing</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Pay for people, not promises.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            AI help is free on every plan, forever. Paid tiers buy human
            attention — and every mentor credit returns if nobody picks up.
          </p>

          {/* billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-sm">
            <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className={cn("text-sm font-medium", !yearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
            <Switch
              checked={yearly}
              onCheckedChange={setYearly}
              aria-label="Toggle yearly billing"
            />
            <span className={cn("text-sm font-medium", yearly ? "text-foreground" : "text-muted-foreground")}>
              Yearly
            </span>
            <Badge className="bg-gold/15 text-gold ring-1 ring-gold/30" variant="outline">
              Save 30%
            </Badge>
          </div>
        </div>
      </section>

      {/* Student plans */}
      <section aria-labelledby="student-plans" className="py-14 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="student-plans" className="sr-only">Student plans</h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {STUDENT_PLANS.map((p) => (
              <article
                key={p.name}
                className={cn(
                  "card-lift relative flex flex-col rounded-2xl border bg-card p-7",
                  p.featured ? "plan-featured" : "card-sheen border-border"
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> Most chosen
                  </span>
                )}
                <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold tracking-tight tabular-nums">
                    {p.monthly === 0 ? "Free" : `₹${yearly ? p.yearly.toLocaleString("en-IN") : p.monthly}`}
                  </span>
                  {p.monthly > 0 && (
                    <span className="text-sm text-muted-foreground">{yearly ? "/ year" : "/ month"}</span>
                  )}
                </div>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate("auth", { mode: "signup" })}
                  className={cn(
                    "mt-7 h-11 w-full font-semibold",
                    p.featured
                      ? "bg-primary text-primary-foreground hover:bg-pine-soft"
                      : "border-primary/30 bg-transparent text-primary hover:bg-secondary hover:text-primary"
                  )}
                  variant={p.featured ? "default" : "outline"}
                >
                  {p.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Mentor credits never expire while your plan is active. GST as applicable.
          </p>
        </div>
      </section>

      {/* Institute plans */}
      <section id="institute-plans" aria-labelledby="institute-plans-heading" className="scroll-mt-24 bg-secondary/40 py-14 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-gold">
              <Building2 className="h-4 w-4" aria-hidden="true" /> For institutes
            </p>
            <h2 id="institute-plans-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Bring MENTORA to your campus
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your faculty answers first; the shared network covers the rest.
              Every rupee of value, visible in one dashboard.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {INSTITUTE_PLANS.map((p) => (
              <article
                key={p.name}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-7",
                  p.featured ? "card-lift plan-featured" : "card-sheen border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                  {p.featured && <Badge className="bg-primary text-primary-foreground hover:bg-primary">Best value</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.students}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold tracking-tight tabular-nums">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate("institute")}
                  variant={p.featured ? "default" : "outline"}
                  className={cn(
                    "mt-7 h-11 w-full font-semibold",
                    p.featured ? "bg-primary text-primary-foreground hover:bg-pine-soft" : "border-primary/30 text-primary hover:bg-secondary"
                  )}
                >
                  {p.price === "Custom" ? "Talk to us" : "Get a walkthrough"}
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="py-14 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h2 id="faq-heading" className="text-center font-display text-3xl font-semibold tracking-tight">
            Questions about plans, answered
          </h2>
          <Accordion type="single" collapsible className="mt-9 flex flex-col gap-3">
            {FAQS.map((f) => (
              <AccordionItem
                key={f.q}
                value={f.q}
                className="rounded-2xl border border-border bg-card px-5 last:border-b"
              >
                <AccordionTrigger className="py-4 text-left text-[15px] font-semibold hover:no-underline [&>svg]:text-gold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Still unsure? The Seeker plan is free forever — upgrade only when the doubt load says so.
          </p>
        </div>
      </section>
    </main>
  );
}

const FAQS = [
  {
    q: "Is the AI really free forever on every plan?",
    a: "Yes. AI explanations are unlimited and free on Seeker, Achiever and Rank Holder alike — including the doubt simulator on the home page. Paid tiers exist purely for human attention: faster mentor routing, richer formats (voice and video) and more monthly calls.",
  },
  {
    q: "What exactly happens when I 'mark a doubt solved'?",
    a: "A mentor credit is consumed only at that moment — not when the doubt is routed, and not while you decide. If no mentor picked up your doubt within the promised window, any routing credit already returns to your balance automatically.",
  },
  {
    q: "Can I switch between monthly and yearly?",
    a: "Any time, from account settings. Yearly billing saves about 30%, and the unused remainder of a monthly cycle carries forward as credit on your yearly plan.",
  },
  {
    q: "How are mentors verified before they answer?",
    a: "Credential checks (rank, service or teaching record), a supervised mock doubt session, and reference verification. Inside sessions, students stay pseudonymous and contact-detail exchange is filtered — for both sides.",
  },
  {
    q: "Do institute plans replace our own faculty?",
    a: "No — they amplify it. Your mentors' published hours are always tried first; only when nobody is free does the doubt flow to the shared MENTORA bench, so no student waits overnight for an answer.",
  },
];
