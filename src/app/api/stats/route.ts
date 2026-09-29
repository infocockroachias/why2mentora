import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOUBTS_BASE = 128000;
const MENTORS_BASE = 340;
const PYQS_BASE = 42000;
const INSTITUTES_BASE = 52;

const STAT_LABELS: Record<string, string> = {
  doubts_answered: "Doubts answered",
  mentors: "Verified mentors",
  pyqs: "PYQs with solutions",
  institutes: "Partner institutes",
};

const STAT_ORDER = ["doubts_answered", "mentors", "pyqs", "institutes"] as const;

/**
 * GET /api/stats — live platform counters.
 * Ensures the four PlatformStat rows exist (upserts each request), then
 * returns { ok, stats: [{ key, label, value }] }.
 */
export async function GET() {
  try {
    const doubtCount = await db.doubt.count();

    const values: Record<string, number> = {
      doubts_answered: DOUBTS_BASE + doubtCount,
      mentors: MENTORS_BASE,
      pyqs: PYQS_BASE,
      institutes: INSTITUTES_BASE,
    };

    const stats: Array<{ key: string; label: string; value: number }> = [];
    for (const key of STAT_ORDER) {
      const label = STAT_LABELS[key];
      const value = values[key];
      await db.platformStat.upsert({
        where: { key },
        update: { value, label },
        create: { key, label, value },
      });
      stats.push({ key, label, value });
    }

    return Response.json({ ok: true, stats });
  } catch {
    return Response.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
