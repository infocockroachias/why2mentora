"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, CircleCheck, CornerDownRight, Loader2, PhoneCall, Send, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/views/reveal";

const EXAMS = ["UPSC CSE", "State PCS", "SSC CGL", "RBI Grade B", "NABARD Grade A"];
const SUBJECTS = [
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Environment",
  "International Relations",
  "Science & Tech",
  "CSAT / Aptitude",
  "Current Affairs",
];

type Answer = {
  id: string;
  question: string;
  exam: string;
  subject: string;
  summary: string;
  points: string[];
  concept: string;
  seconds: number;
};

const SAMPLES = [
  "Can Parliament amend the basic structure under Article 368?",
  "Why does RBI target 4% inflation and not zero?",
  "Difference between continental shelf and exclusive economic zone?",
];

/** Pseudonymous mentor personas + exam-strategy replies (original writing). */
const MENTORS = [
  { initials: "AS", tint: "bg-emerald-800", tag: "Rank 47, UPSC CSE · Polity, History" },
  { initials: "MD", tint: "bg-amber-700", tag: "State PCS topper · Polity, Economy" },
  { initials: "RK", tint: "bg-teal-800", tag: "RBI Grade B · ESI, Finance" },
];

function mentorReply(subject: string): string {
  if (/economy|rbi|finance|budget|inflation/i.test(subject)) {
    return `Good question — and the AI summary is right. My exam-lens: in Prelims, this is asked as a statement-pair, so memorise the numbers (the 4% midpoint, the ±2% band, the year it took effect) — not just the idea. In Mains, one committee citation and one recent MPC decision makes the answer top-quartile. Do this now: re-derive the whole thing from memory on one page. If you can teach it to a blank sheet, it's yours.`;
  }
  if (/history|culture/i.test(subject)) {
    return `Yes — the AI breakdown covers the provision. What I'd add from experience: examiners frame this as "which of the following is/are correct", so convert the summary into 3 flashcard statements today. Anchor it to one timeline hook and one personality — recall needs handles, not paragraphs. And attempt one PYQ on it within 48 hours; retrieval beats re-reading every time.`;
  }
  return `The AI answer is solid — here's how I'd finish it in the exam hall. Structure: one line stating the provision, two lines on the mechanism, one line on the precedent, one on current relevance. That's four sentences and full marks' architecture. The trap they'll set: a near-identical option swapping "may" with "shall", or moving a power between the two houses. Underline the verb in every option before you pick. Revise this topic again after three days — spaced, not crammed.`;
}

function pickMentor(subject: string) {
  if (/economy|rbi|finance/i.test(subject)) return MENTORS[2];
  if (/history|culture/i.test(subject)) return MENTORS[1];
  return MENTORS[0];
}

export function DoubtSimulator() {
  const [exam, setExam] = useState(EXAMS[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marked, setMarked] = useState(false);
  const [solvedCount, setSolvedCount] = useState<number | null>(null);
  const [mentorStage, setMentorStage] = useState<"idle" | "finding" | "typing" | "answered">("idle");
  const [mentorNote, setMentorNote] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);
  const handoverTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function startHandover() {
    if (!answer || mentorStage !== "idle") return;
    setMentorStage("finding");
    const t1 = setTimeout(() => setMentorStage("typing"), 1400);
    const t2 = setTimeout(() => {
      setMentorNote(mentorReply(answer.subject));
      setMentorStage("answered");
    }, 4200);
    // store timers for cleanup on re-ask
    handoverTimers.current = [t1, t2];
  }

  // fetch recent counters for the strip under the panel
  useEffect(() => {
    fetch("/api/doubt")
      .then((r) => r.json())
      .then((d) => d?.ok && setSolvedCount(d.stats?.total ?? 0))
      .catch(() => undefined);
  }, [answer]);

  async function ask(q?: string) {
    const text = (q ?? question).trim();
    if (text.length < 8) {
      setError("Give us a little more than that — at least 8 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    setAnswer(null);
    setMarked(false);
    setMentorStage("idle");
    setMentorNote("");
    handoverTimers.current.forEach(clearTimeout);
    handoverTimers.current = [];
    const started = Date.now();
    try {
      const res = await fetch("/api/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, exam, subject }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "The engine hiccuped. Try again.");
      } else {
        // measure real round-trip, then small pause so the "thinking" state feels real
        const seconds = Math.max(1, Math.round((Date.now() - started) / 1000));
        const elapsed = Date.now() - started;
        if (elapsed < 900) await new Promise((r) => setTimeout(r, 900 - elapsed));
        setAnswer({ ...data.doubt, seconds });
      }
    } catch {
      setError("Network trouble. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  function renderPoint(p: string) {
    // bold-able "Lead:" prefix like "Constitutional basis: ..."
    const idx = p.indexOf(":");
    if (idx > 0 && idx < 40) {
      return (
        <>
          <span className="font-semibold text-gold">{p.slice(0, idx + 1)}</span>
          {p.slice(idx + 1)}
        </>
      );
    }
    return p;
  }

  return (
    <section id="try-doubt" aria-labelledby="simulator-heading" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Live demo · no account needed</p>
          <h2 id="simulator-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ask a doubt right here. Watch it get answered.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            A working preview of the MENTORA engine — the full app adds mentor
            handover, credits and your revision schedule.
          </p>
        </div>

        <Reveal className="mt-10">
          <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
            {/* Ask panel */}
            <div className="card-sheen rounded-2xl border border-border bg-card p-5 shadow-[0_18px_50px_-30px_rgba(20,83,45,0.35)] sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="exam-select" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Exam
                </label>
                <Select value={exam} onValueChange={setExam}>
                  <SelectTrigger id="exam-select" aria-label="Choose exam">
                    <SelectValue placeholder="Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMS.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="subject-select" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Subject
                </label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="subject-select" aria-label="Choose subject">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="doubt-input" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Your doubt
              </label>
              <Textarea
                id="doubt-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") ask();
                }}
                placeholder="e.g. What happens if the President returns a Money Bill?"
                className="min-h-[110px] resize-none border-input bg-background text-sm"
                maxLength={600}
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>⌘/Ctrl + Enter to ask</span>
                <span aria-live="polite">{question.length}/600</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {SAMPLES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuestion(s);
                    ask(s);
                  }}
                  className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-gold/60 hover:bg-accent/40 hover:text-gold active:scale-[0.97]"
                >
                  {s.length > 42 ? `${s.slice(0, 42)}…` : s}
                </button>
              ))}
            </div>

            <Button
              onClick={() => ask()}
              disabled={loading}
              className="btn-sheen mt-4 h-11 w-full bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-pine-soft"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Reading the demand of the question…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" /> Ask MENTORA — free
                </>
              )}
            </Button>

            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            {solvedCount !== null && (
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                {solvedCount.toLocaleString("en-IN")} doubts asked on MENTORA so far
              </p>
            )}
          </div>

          {/* Answer panel */}
          <div ref={panelRef} className="panel-night relative min-h-[420px] rounded-2xl border border-white/10 p-5 text-[#e6efe7] sm:p-6" aria-live="polite">
            <div className="grain-dark pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  <Bot className="h-4 w-4" aria-hidden="true" /> MENTORA engine
                </p>
                <p className="font-mono text-[10px] text-white/35">
                  {answer ? `answered in ${answer.seconds}s` : loading ? "thinking…" : "idle"}
                </p>
              </div>

              {!answer && !loading && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="max-w-xs text-sm text-white/50">
                    Your structured breakdown will appear here — summary, the
                    points that matter, and the concept to revise next.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-1 flex-col justify-center gap-3 py-8">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"><User className="h-4 w-4 text-white/60" /></span>
                    <span className="h-3 w-3/4 rounded bg-white/10 shimmer" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15"><Bot className="h-4 w-4 text-emerald-300" /></span>
                    <span className="h-3 w-2/3 rounded bg-white/10 shimmer" />
                  </div>
                  <div className="ml-12 flex flex-col gap-2">
                    <span className="h-3 w-full rounded bg-white/10 shimmer" />
                    <span className="h-3 w-5/6 rounded bg-white/10 shimmer" />
                    <span className="h-3 w-4/6 rounded bg-white/10 shimmer" />
                  </div>
                </div>
              )}

              {answer && (
                <div className="scroll-dark flex-1 overflow-y-auto pt-4 pr-1">
                  {/* question echo */}
                  <div className="msg-in flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <User className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
                    </span>
                    <div className="rounded-xl rounded-tl-sm bg-white/8 px-3.5 py-2.5 text-xs leading-relaxed text-white/80">
                      {answer.question}
                      <span className="mt-1 block text-[10px] text-white/40">
                        {answer.exam} · {answer.subject}
                      </span>
                    </div>
                  </div>

                  {/* summary */}
                  <div className="msg-in mt-4 flex items-start gap-2.5" style={{ animationDelay: "120ms" }}>
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                      <Bot className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                    </span>
                    <p className="flex-1 text-sm leading-relaxed text-white/90">{answer.summary}</p>
                  </div>

                  {/* points */}
                  <ol className="ml-10 mt-3 flex flex-col gap-2">
                    {answer.points.map((p, i) => (
                      <li
                        key={i}
                        className="msg-in flex gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-white/75"
                        style={{ animationDelay: `${260 + i * 130}ms` }}
                      >
                        <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden="true" />
                        <span>{renderPoint(p)}</span>
                      </li>
                    ))}
                  </ol>

                  {/* concept */}
                  <p
                    className="msg-in ml-10 mt-3 inline-flex max-w-full items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-medium text-gold"
                    style={{ animationDelay: `${300 + answer.points.length * 130}ms` }}
                  >
                    📌 {answer.concept}
                  </p>

                  {/* mentor handover + mark solved */}
                  <div className="mt-5 border-t border-white/10 pt-4">
                    {mentorStage !== "answered" && (
                      <div className="flex flex-wrap items-center gap-3">
                        {marked ? (
                          <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">
                            <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" /> Marked solved — ₹0 charged
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMarked(true)}
                            className="border-emerald-400/40 bg-transparent text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200"
                          >
                            <CircleCheck className="mr-1.5 h-4 w-4" aria-hidden="true" /> Mark as solved
                          </Button>
                        )}
                        {mentorStage === "idle" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={startHandover}
                            className="border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:text-gold"
                          >
                            <PhoneCall className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Still stuck? Bring in a mentor
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-[11px] text-white/50">
                            {mentorStage === "finding" ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" aria-hidden="true" /> Routing to a verified mentor…
                              </>
                            ) : (
                              <>
                                <span className="flex gap-1" aria-label="Mentor is typing">
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
                                </span>
                                mentor typing…
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    )}

                    {mentorStage === "answered" && (() => {
                      const m = pickMentor(answer.subject);
                      return (
                        <div className="msg-in flex items-start gap-2.5">
                          <span
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold text-white",
                              m.tint
                            )}
                            aria-hidden="true"
                          >
                            {m.initials}
                          </span>
                          <div className="flex-1 rounded-xl rounded-tl-sm border border-emerald-400/25 bg-emerald-400/5 px-3.5 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                                Verified MENTORA mentor
                              </p>
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">
                                {m.tag}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-white/85">{mentorNote}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-2.5">
                              <span className="text-[10px] text-white/40">Session note kept · student stays pseudonymous</span>
                              {marked ? (
                                <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">
                                  <CircleCheck className="h-3 w-3" aria-hidden="true" /> Marked solved — credit used
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setMarked(true)}
                                  className="h-7 border-emerald-400/40 bg-transparent px-2.5 text-[11px] text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200"
                                >
                                  <CircleCheck className="mr-1 h-3 w-3" aria-hidden="true" /> Mark as solved
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
