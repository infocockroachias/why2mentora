"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, Landmark, RefreshCw, Trophy, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { recordPyqAttempt } from "@/lib/second-brain";

/**
 * PYQ Daily Drill — an original practice-MCQ widget.
 * Questions are written fresh for MENTORA IAS on standard, verifiable exam facts;
 * each attempt is tracked locally so the drill feels personal.
 */

type Q = {
  subject: string;
  year: string;
  question: string;
  options: string[];
  answer: number; // index
  why: string;
};

const POOL: Q[] = [
  {
    subject: "Polity",
    year: "Pattern: 2019 · 2022",
    question:
      "With reference to the amendment procedure in the Constitution, which statement is correct?",
    options: [
      "All constitutional amendments require ratification by half the state legislatures",
      "The basic structure doctrine limits what Parliament may amend under Article 368",
      "Ordinary legislation can amend any part of the Constitution",
      "Amendments need a simple majority in both Houses",
    ],
    answer: 1,
    why: "Article 368 needs a special majority, and (for federal provisions) ratification by half the states — but the Kesavananda Bharati (1973) ruling bars Parliament from destroying the Constitution's basic structure by any amendment.",
  },
  {
    subject: "Economy",
    year: "Pattern: 2018 · 2021",
    question:
      "India's flexible inflation-targeting framework obliges the RBI to keep CPI inflation at 4% with a tolerance band of:",
    options: ["2% to 6%", "1% to 5%", "3% to 7%", "4% to 8%"],
    answer: 0,
    why: "The 2015 Monetary Policy Framework Agreement (backed by the RBI Amendment Act, 2016) set the target at 4% CPI with a ±2% band — so failure to hold 2–6% for three straight quarters triggers a written report to the Government.",
  },
  {
    subject: "History",
    year: "Pattern: 2020 · 2023",
    question:
      "The Non-Cooperation Movement (1920–22) was suspended by Gandhiji primarily because of:",
    options: [
      "The Simon Commission's arrival",
      "Violence at Chauri Chaura",
      "The Rowlatt Act's extension",
      "The failure of the Khilafat issue",
    ],
    answer: 1,
    why: "After a clash at Chauri Chaura (February 1922) left policemen dead when a station was set on fire, Gandhiji withdrew the movement, arguing satyagraha could not survive a loss of non-violent discipline.",
  },
  {
    subject: "Geography",
    year: "Pattern: 2017 · 2022",
    question:
      "Which river is the longest by course among the peninsular rivers of India?",
    options: ["Narmada", "Krishna", "Kaveri", "Godavari"],
    answer: 3,
    why: "The Godavari runs roughly 1,465 km — the longest peninsular course — rising in the Western Ghats (Trimbakeshwar) and draining into the Bay of Bengal, which is why it is called the Dakshina Ganga.",
  },
  {
    subject: "Polity",
    year: "Pattern: 2021",
    question:
      "Who certifies whether a Bill introduced in the Lok Sabha is a Money Bill under Article 110?",
    options: ["The President", "The Speaker of the Lok Sabha", "The Prime Minister", "The Chairman of the Rajya Sabha"],
    answer: 1,
    why: "Article 110(3) vests the final certification in the Speaker of the Lok Sabha, and the Speaker's decision is final — a point that drew wide debate during the 2017 Aadhaar and 2021 Finance Act controversies.",
  },
  {
    subject: "Environment",
    year: "Pattern: 2019 · 2023",
    question:
      "The Great Himalayan National Park, a UNESCO World Heritage Site, lies in which state?",
    options: ["Uttarakhand", "Sikkim", "Himachal Pradesh", "Arunachal Pradesh"],
    answer: 2,
    why: "The GHNP lies in Kullu district, Himachal Pradesh, and was inscribed as a World Heritage Site in 2014 for its conservation of Western Himalayan temperate and alpine ecosystems.",
  },
  {
    subject: "International Relations",
    year: "Pattern: 2018 · 2020",
    question: "The permanent secretariat of SAARC is located in:",
    options: ["New Delhi", "Dhaka", "Kathmandu", "Colombo"],
    answer: 2,
    why: "SAARC — founded at Dhaka in 1985 — keeps its permanent secretariat in Kathmandu, Nepal, headed by a Secretary-General appointed on rotation among member states.",
  },
  {
    subject: "Economy",
    year: "Pattern: 2021 · 2024",
    question: "The repo rate is the rate at which:",
    options: [
      "Banks lend to their best retail customers",
      "The RBI lends short-term funds to banks against government securities",
      "Banks park excess liquidity overnight with the RBI",
      "The Government borrows from small savings",
    ],
    answer: 1,
    why: "Repo is the RBI's collateralised short-term lending rate to banks; the reverse repo (now the SDF floor) is where banks park surplus funds. Repo is the policy rate that transmits to EMI benchmarks like EBLR.",
  },
];

const LETTERS = ["A", "B", "C", "D"];

const MOTIVATION = [
  "One PYQ a day keeps the prelims trap list short.",
  "Option elimination is a skill — reps build it.",
  "Toppers don't know more; they recall faster.",
  "Read the wrong options too — the examiner writes them first.",
];

export function PyqDaily() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [round, setRound] = useState(1);

  // restore streak from localStorage (client only, async to satisfy effect rules)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const s = Number(window.localStorage.getItem("mentora_pyq_streak") || "0");
        const b = Number(window.localStorage.getItem("mentora_pyq_best") || "0");
        if (!Number.isNaN(s)) setStreak(s);
        if (!Number.isNaN(b)) setBest(b);
      } catch {
        /* storage unavailable */
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const q = POOL[index];
  const answered = picked !== null;
  const isCorrect = answered && picked === q.answer;

  function persist(nextStreak: number, nextCorrect: number) {
    const nextBest = Math.max(best, nextStreak);
    setStreak(nextStreak);
    setCorrectCount(nextCorrect);
    setAttempts((a) => a + 1);
    try {
      window.localStorage.setItem("mentora_pyq_streak", String(nextStreak));
      window.localStorage.setItem("mentora_pyq_best", String(nextBest));
    } catch {
      /* ignore */
    }
    // shared record for the Second Brain dashboard (accuracy + active days)
    recordPyqAttempt(nextCorrect > correctCount, nextStreak);
  }

  function pick(i: number) {
    if (answered) return;
    setPicked(i);
    const wasCorrect = i === q.answer;
    const nc = wasCorrect ? correctCount + 1 : correctCount;
    persist(wasCorrect ? streak + 1 : 0, nc);
  }

  function next() {
    setPicked(null);
    setIndex((prev) => (prev + 1) % POOL.length);
    setRound((r) => r + 1);
  }

  const motivation = useMemo(() => MOTIVATION[round % MOTIVATION.length], [round]);

  return (
    <section aria-labelledby="pyq-heading" className="relative overflow-hidden bg-secondary/50 py-16 sm:py-20">
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">PYQ Vault · daily drill</p>
            <h2 id="pyq-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              One real exam pattern, every day.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              A small taster of the 42,000+ solved questions in the full PYQ
              Vault — attempt it cold, then read why the right option wins and
              the others bait you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-border bg-card px-4 py-3 text-center">
              <p className="flex items-center gap-1.5 font-display text-2xl font-bold text-gold" aria-label="Current streak">
                <Trophy className="h-4 w-4" aria-hidden="true" /> {streak}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                streak · best {best}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Question card */}
          <article className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-secondary text-primary">
                  <Landmark className="mr-1 h-3 w-3" aria-hidden="true" /> {q.subject}
                </Badge>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {q.year}
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                Q{round} of ∞
              </span>
            </div>

            <Progress
              value={((index + 1) / POOL.length) * 100}
              className="mt-4 h-1"
              aria-label="Progress through today's question pool"
            />

            <h3 className="mt-5 text-[15px] font-semibold leading-relaxed sm:text-base">
              {q.question}
            </h3>

            <fieldset className="mt-5 grid gap-2.5">
              <legend className="sr-only">Answer options</legend>
              {q.options.map((opt, i) => {
                const state = !answered
                  ? "idle"
                  : i === q.answer
                    ? "correct"
                    : i === picked
                      ? "wrong"
                      : "muted";
                return (
                  <label
                    key={i}
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200",
                      state === "idle" &&
                        "border-border bg-background hover:border-gold/60 hover:bg-accent/40",
                      state === "correct" && "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-500/10",
                      state === "wrong" && "border-destructive/50 bg-destructive/5",
                      state === "muted" && "border-border bg-background opacity-55"
                    )}
                  >
                    <input
                      type="radio"
                      name="pyq-option"
                      className="sr-only"
                      checked={picked === i}
                      onChange={() => pick(i)}
                      disabled={answered}
                    />
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        state === "correct"
                          ? "bg-emerald-600 text-white"
                          : state === "wrong"
                            ? "bg-destructive text-white"
                            : "bg-secondary text-primary group-hover:bg-gold group-hover:text-gold-foreground"
                      )}
                      aria-hidden="true"
                    >
                      {LETTERS[i]}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                    {state === "correct" && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    )}
                    {state === "wrong" && (
                      <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                    )}
                  </label>
                );
              })}
            </fieldset>

            {/* Explanation */}
            {answered && (
              <div className="msg-in mt-5 rounded-xl border border-gold/30 bg-gold/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  {isCorrect ? "Correct — here's the why" : "Why the right answer wins"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{q.why}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <p className="text-xs italic text-muted-foreground">“{motivation}”</p>
              {answered ? (
                <Button onClick={next} size="sm" className="bg-primary font-semibold text-primary-foreground hover:bg-pine-soft">
                  Next question <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => pick(q.answer)} variant="ghost" size="sm" className="text-muted-foreground">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Show answer
                </Button>
              )}
            </div>
          </article>

          {/* Side panel */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-[#0d1710] p-5 text-[#e6efe7]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                How the Vault works
              </p>
              <ul className="mt-3 flex flex-col gap-2.5 text-xs leading-relaxed text-white/70">
                <li className="flex gap-2"><span className="text-gold">1.</span> Every option — right or wrong — carries a written explanation.</li>
                <li className="flex gap-2"><span className="text-gold">2.</span> Answers are verified against the official key wherever one exists.</li>
                <li className="flex gap-2"><span className="text-gold">3.</span> In the full app, wrong options pin their concept straight into your Second Brain.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold">This session</p>
              <p className="mt-2 font-display text-3xl font-bold text-primary">
                {correctCount}<span className="text-lg text-muted-foreground">/{attempts}</span>
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                correct attempts since you opened the page
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
