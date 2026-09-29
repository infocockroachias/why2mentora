"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { NavigateFn } from "@/components/mentora-app";
import { cn } from "@/lib/utils";

export type LegalDoc = "terms" | "privacy" | "refund" | "use";

const DOCS: Record<
  LegalDoc,
  { title: string; updated: string; sections: { h: string; p: string[] }[] }
> = {
  terms: {
    title: "Terms of Service",
    updated: "Summary — plain language",
    sections: [
      {
        h: "1. What MENTORA IAS provides",
        p: [
          "MENTORA IAS Academy operates a doubt-support platform for competitive-exam aspirants. The service combines automated AI-generated explanations with sessions from independently verified human mentors.",
          "AI explanations are study aids, not authoritative legal or academic opinion. Mentor answers reflect the individual mentor's understanding and experience.",
        ],
      },
      {
        h: "2. Accounts and eligibility",
        p: [
          "You must provide accurate registration details and keep your credentials private. One person may hold one student account; institutes receive separate institutional accounts.",
          "We may suspend accounts that abuse the service, attempt to poach mentors, or violate the Acceptable Use terms.",
        ],
      },
      {
        h: "3. Payments and the solved promise",
        p: [
          "AI explanations are free. Mentor credits are consumed only when you explicitly mark a doubt as solved. If no mentor accepts your doubt in the promised window, credits used for routing are automatically returned.",
          "Prices, tiers and institute agreements are listed on the Plans page and in your institute contract, if applicable.",
        ],
      },
      {
        h: "4. Mentor independence",
        p: [
          "Mentors are independent professionals verified by MENTORA IAS, not employees. Sessions are recorded in notes both parties keep, and all communication must remain on-platform.",
        ],
      },
      {
        h: "5. Changes and termination",
        p: [
          "We may update these terms with notice on this page. You may delete your account at any time; statutory records are retained as required by law.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Summary — plain language",
    sections: [
      {
        h: "1. What we collect",
        p: [
          "Account details (name, email, target exam), the doubts you ask, mentor session notes, and standard technical logs needed to run the service securely.",
        ],
      },
      {
        h: "2. What we never do",
        p: [
          "We never sell your personal data. We never show your real identity to a mentor during a doubt session — students stay pseudonymous inside the platform.",
          "Wellbeing tools and focus analytics are private to the student; institutes see aggregate outcomes, not personal wellbeing data.",
        ],
      },
      {
        h: "3. How data is protected",
        p: [
          "Passwords are stored only as salted hashes. Personal contact details and outside links are filtered out of mentor messages to keep interactions on-platform.",
          "You may request export or deletion of your data at grievance@mentora-ias.in and we will respond within 30 days.",
        ],
      },
      {
        h: "4. Cookies",
        p: [
          "We use only essential cookies needed for sign-in and preferences. No third-party advertising trackers run on the platform.",
        ],
      },
    ],
  },
  refund: {
    title: "Refund & Cancellation Policy",
    updated: "Summary — plain language",
    sections: [
      {
        h: "1. Subscriptions",
        p: [
          "Student plans can be cancelled any time from account settings; access continues until the end of the paid period. Annual plans cancelled within 7 days of purchase are refunded in full.",
        ],
      },
      {
        h: "2. Mentor credits",
        p: [
          "A credit is charged only when you mark a doubt solved. If a doubt never reaches a mentor, or a session is cut short by the mentor, the credit is automatically returned to your balance.",
        ],
      },
      {
        h: "3. Institute contracts",
        p: [
          "Institute agreements follow the refund schedule written into the contract. Campus pilots carry a 30-day satisfaction guarantee.",
        ],
      },
      {
        h: "4. How to request",
        p: [
          "Write to grievance@mentora-ias.in with your registered email. Approved refunds reach the original payment method within 7–10 working days.",
        ],
      },
    ],
  },
  use: {
    title: "Acceptable Use Policy",
    updated: "Summary — plain language",
    sections: [
      {
        h: "1. Be real, be respectful",
        p: [
          "No impersonation, harassment, spam, or content that is unlawful, hateful or unsafe. Doubts should be your own; don't use the platform to complete assignments that prohibit outside help.",
        ],
      },
      {
        h: "2. Keep it on-platform",
        p: [
          "Exchanging personal contact details, external payment links, or off-platform meeting invites inside doubt sessions is prohibited — these are filtered automatically and repeat attempts lead to suspension.",
        ],
      },
      {
        h: "3. Protect the network",
        p: [
          "No scraping, automated bulk requests, attempts to bypass credit rules, or reverse-engineering the AI engine. Institutes may not resell access without a written agreement.",
        ],
      },
      {
        h: "4. Reporting",
        p: [
          "Report misuse from any session note or write to grievance@mentora-ias.in. We review every report and act within 72 hours.",
        ],
      },
    ],
  },
};

export function LegalView({ doc, navigate }: { doc: LegalDoc; navigate: NavigateFn }) {
  const d = DOCS[doc] ?? DOCS.terms;

  return (
    <main className="pb-10">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Button variant="ghost" onClick={() => navigate("home")} className="mb-6 -ml-2 text-muted-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" /> Back to home
        </Button>

        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{d.title}</h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">{d.updated}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This page is a plain-language summary written for MENTORA IAS. It does
          not constitute legal advice.
        </p>

        <div className="mt-10 flex flex-col gap-8">
          {d.sections.map((s) => (
            <section key={s.h} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">{s.h}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {s.p.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav aria-label="Other legal documents" className="mt-10 flex flex-wrap gap-2">
          {(Object.keys(DOCS) as LegalDoc[]).map((k) => (
            <button
              key={k}
              onClick={() => navigate("legal", { doc: k })}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                k === doc
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              )}
            >
              {DOCS[k].title}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
