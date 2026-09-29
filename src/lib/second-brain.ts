"use client";

/**
 * Second Brain — the aspirant's personal revision shelf.
 * Everything is stored locally in the browser (localStorage) on purpose:
 * doubts and drill stats never leave the device. Keys are namespaced `mentora_*`.
 */

export type SavedDoubt = {
  id: string;
  question: string;
  exam: string;
  subject: string;
  summary: string;
  points: string[];
  concept: string;
  savedAt: number; // epoch ms
};

const DOUBTS_KEY = "mentora_saved_doubts";
const RECENT_KEY = "mentora_recent_doubts";

export type PyqStats = {
  streak: number;
  best: number;
  correct: number;
  attempts: number;
  /** ISO dates (yyyy-mm-dd) on which at least one attempt was made */
  days: string[];
};

const PYQ_KEYS = {
  streak: "mentora_pyq_streak",
  best: "mentora_pyq_best",
  correct: "mentora_pyq_correct",
  attempts: "mentora_pyq_attempts",
  days: "mentora_pyq_days",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

/* ---------------- Saved doubts ---------------- */

export function getSavedDoubts(): SavedDoubt[] {
  return read<SavedDoubt[]>(DOUBTS_KEY, []);
}

export function isDoubtSaved(question: string): boolean {
  return getSavedDoubts().some((d) => d.question === question);
}

export function saveDoubt(d: Omit<SavedDoubt, "id" | "savedAt">): SavedDoubt {
  const list = getSavedDoubts();
  if (list.some((x) => x.question === d.question)) return list[0];
  const entry: SavedDoubt = { ...d, id: `sb_${Date.now().toString(36)}`, savedAt: Date.now() };
  write(DOUBTS_KEY, [entry, ...list].slice(0, 60));
  return entry;
}

export function removeSavedDoubt(id: string) {
  write(DOUBTS_KEY, getSavedDoubts().filter((d) => d.id !== id));
}

export function clearSavedDoubts() {
  try {
    window.localStorage.removeItem(DOUBTS_KEY);
  } catch {
    /* ignore */
  }
}

/* ---------------- Recent doubts (quick re-ask chips) ---------------- */

export function getRecentDoubts(): string[] {
  return read<string[]>(RECENT_KEY, []);
}

export function pushRecentDoubt(q: string) {
  const next = [q, ...getRecentDoubts().filter((x) => x !== q)].slice(0, 4);
  write(RECENT_KEY, next);
}

/* ---------------- PYQ drill stats ---------------- */

export function getPyqStats(): PyqStats {
  return {
    streak: read<number>(PYQ_KEYS.streak, 0),
    best: read<number>(PYQ_KEYS.best, 0),
    correct: read<number>(PYQ_KEYS.correct, 0),
    attempts: read<number>(PYQ_KEYS.attempts, 0),
    days: read<string[]>(PYQ_KEYS.days, []),
  };
}

export function recordPyqAttempt(wasCorrect: boolean, nextStreak: number) {
  const s = getPyqStats();
  const best = Math.max(s.best, nextStreak);
  const today = new Date().toISOString().slice(0, 10);
  const days = s.days.includes(today) ? s.days : [...s.days, today].slice(-90);
  write(PYQ_KEYS.streak, nextStreak);
  write(PYQ_KEYS.best, best);
  write(PYQ_KEYS.correct, s.correct + (wasCorrect ? 1 : 0));
  write(PYQ_KEYS.attempts, s.attempts + 1);
  write(PYQ_KEYS.days, days);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
