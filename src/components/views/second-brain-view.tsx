"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Brain,
  CalendarCheck2,
  ChevronDown,
  Copy,
  Flame,
  Search,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import type { NavigateFn } from "@/components/mentora-app";
import { Reveal } from "@/components/views/reveal";
import { cn } from "@/lib/utils";
import {
  clearSavedDoubts,
  getPyqStats,
  getSavedDoubts,
  removeSavedDoubt,
  todayIso,
  type PyqStats,
  type SavedDoubt,
} from "@/lib/second-brain";

/**
 * Second Brain — personal revision shelf.
 * Shows saved doubts (from the simulator) and PYQ drill stats.
 * All data lives in localStorage; nothing leaves the browser.
 */

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Last 7 days as [iso, label] pairs, oldest → today. */
function lastSevenDays(): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push([
      d.toISOString().slice(0, 10),
      d.toLocaleDateString("en-IN", { weekday: "narrow" }),
    ]);
  }
  return out;
}

export function SecondBrainView({ navigate }: { navigate: NavigateFn }) {
  const [doubts, setDoubts] = useState<SavedDoubt[] | null>(null);
  const [stats, setStats] = useState<PyqStats | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setDoubts(getSavedDoubts());
    setStats(getPyqStats());
  }, []);

  // hydrate after mount (localStorage is client-only), then listen for saves made elsewhere
  useEffect(() => {
    const t = setTimeout(refresh, 0);
    window.addEventListener("mentora:brain-updated", refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mentora:brain-updated", refresh);
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!doubts) return null;
    const q = query.trim().toLowerCase();
    if (!q) return doubts;
    return doubts.filter(
      (d) =>
        d.question.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q) ||
        d.concept.toLowerCase().includes(q)
    );
  }, [doubts, query]);

  const accuracy = stats && stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : null;
  const week = useMemo(() => lastSevenDays(), [stats]); // recompute when stats change
  const today = todayIso();

  function copyDoubt(d: SavedDoubt) {
    const text = [d.question, "", d.summary, "", ...d.points, "", d.concept].join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(d.id);
        setTimeout(() => setCopiedId((c) => (c === d.id ? null : c)), 1600);
      })
      .catch(() => undefined);
  }

  const statCards = [
    {
      icon: Brain,
      label: "Doubts saved",
      value: doubts ? String(doubts.length) : "—",
      note: "on your revision shelf",
    },
    {
      icon: Flame,
      label: "Current streak",
      value: stats ? String(stats.streak) : "—",
      note: stats ? `best ${stats.best}` : "drill the PYQ Vault",
    },
    {
      icon: Target,
      label: "Accuracy",
      value: accuracy !== null ? `${accuracy}%` : "—",
      note: stats ? `${stats.correct}/${stats.attempts} all-time` : "attempts land here",
    },
    {
      icon: CalendarCheck2,
      label: "Active days",
      value: stats ? String(stats.days.length) : "—",
      note: "last 90 days",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-gold">
              <Brain className="h-4 w-4" aria-hidden="true" /> Your second brain
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Everything you almost forgot, in one shelf.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Save any AI answer from the doubt engine and it lands here with its
              summary, key points and the concept to revise. Drill stats from the
              PYQ Vault live here too. Everything stays in this browser — private
              by design.
            </p>
          </div>
          <Button
            onClick={() => navigate("home", { anchor: "try-doubt" })}
            className="btn-sheen h-11 bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-pine-soft"
          >
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> Ask &amp; save a doubt
          </Button>
        </div>
      </Reveal>

      {/* Stat cards */}
      <Reveal delay={80}>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statCards.map((c) => (
            <div key={c.label} className="card-sheen rounded-2xl border border-border bg-card p-4 sm:p-5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <c.icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {c.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-primary">
                {c.value}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{c.note}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Week strip */}
      <Reveal delay={140}>
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold">This week&apos;s drill attendance</p>
            <p className="text-[11px] text-muted-foreground">One PYQ a day keeps the streak alive.</p>
          </div>
          <div className="mt-3 flex items-center gap-2 sm:gap-3" role="img" aria-label="Last seven days of PYQ practice">
            {week.map(([iso, label]) => {
              const active = stats?.days.includes(iso) ?? false;
              return (
                <div key={iso} className="flex flex-1 flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-9 w-full max-w-[52px] items-center justify-center rounded-xl border text-xs font-semibold transition-all",
                      active
                        ? "border-transparent bg-gradient-to-b from-primary to-pine-soft text-primary-foreground shadow-md shadow-primary/25"
                        : iso === today
                          ? "border-dashed border-gold/50 bg-gold/5 text-gold"
                          : "border-border bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    {active ? "✓" : "·"}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Saved doubts */}
      <div className="mt-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Saved doubts</h2>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doubts or concepts…"
              aria-label="Search saved doubts"
              className="h-10 pl-9"
            />
          </div>
          {doubts && doubts.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Clear all saved doubts" className="h-10 w-10 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear the whole shelf?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all {doubts.length} saved doubts from this browser. PYQ
                    drill stats stay. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep them</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearSavedDoubts();
                      refresh();
                    }}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Clear shelf
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {filtered === null && (
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6">
            <span className="h-4 w-56 rounded bg-muted shimmer" />
            <span className="h-3 w-72 rounded bg-muted shimmer" />
          </div>
        )}

        {filtered && filtered.length === 0 && doubts !== null && doubts.length > 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            No saved doubts match “{query}”. Try a different word.
          </p>
        )}

        {filtered && doubts !== null && doubts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Brain className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-semibold">Your shelf is empty — for now.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Ask a doubt in the engine below and hit{" "}
              <span className="font-semibold text-foreground">“Save to Second Brain”</span> on the
              answer. It will wait here with its key points and the concept to revise next.
            </p>
            <Button
              onClick={() => navigate("home", { anchor: "try-doubt" })}
              className="mt-5 bg-primary font-semibold text-primary-foreground hover:bg-pine-soft"
            >
              Ask your first doubt — free
            </Button>
          </div>
        )}

        {filtered?.map((d) => {
          const open = expanded === d.id;
          return (
            <article key={d.id} className="card-sheen overflow-hidden rounded-2xl border border-border bg-card">
              <button
                onClick={() => setExpanded(open ? null : d.id)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 p-4 text-left sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="border-primary/30 bg-secondary text-primary">
                      {d.subject}
                    </Badge>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {d.exam} · saved {fmtDate(d.savedAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-relaxed sm:text-[15px]">{d.question}</p>
                </div>
                <ChevronDown
                  aria-hidden="true"
                  className={cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")}
                />
              </button>

              {open && (
                <div className="msg-in border-t border-border bg-background/60 px-4 pb-4 pt-4 sm:px-5">
                  <p className="text-sm leading-relaxed text-foreground/90">{d.summary}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {d.points.map((p, i) => (
                      <li key={i} className="flex gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs leading-relaxed text-foreground/80">
                        <span aria-hidden="true" className="mt-0.5 text-gold">▸</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 inline-flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-medium text-gold">
                    📌 {d.concept}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyDoubt(d)} className="h-8 text-xs">
                      <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      {copiedId === d.id ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        removeSavedDoubt(d.id);
                        refresh();
                      }}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Remove
                    </Button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
