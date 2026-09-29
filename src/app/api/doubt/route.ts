import { z } from "zod";
import { db } from "@/lib/db";
import { answerDoubt } from "@/lib/mentora-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DoubtSchema = z.object({
  question: z.string().trim().min(8).max(600),
  exam: z.string().trim().max(60).optional(),
  subject: z.string().trim().max(60).optional(),
  email: z.string().trim().toLowerCase().optional(),
});

function badRequest(error: string) {
  return Response.json({ ok: false, error }, { status: 400 });
}

/**
 * POST /api/doubt — ask a doubt, get the instant MENTORA AI answer.
 * Body: { question, exam, subject, email? }
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return badRequest("Invalid request body");
    }

    const parsed = DoubtSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.map(String).join(".");
      const message = issue?.message ?? "Invalid request";
      return badRequest(field ? `${field}: ${message}` : message);
    }

    const question = parsed.data.question;
    const exam = parsed.data.exam?.trim() || "UPSC CSE";
    const subject = parsed.data.subject?.trim() || "Polity";

    const rawEmail = parsed.data.email;
    let email: string | null = null;
    if (rawEmail && rawEmail.length > 0) {
      const emailCheck = z.email().safeParse(rawEmail);
      if (!emailCheck.success) {
        return badRequest("Invalid email address");
      }
      email = emailCheck.data;
    }

    const answer = await answerDoubt(question, exam, subject);

    // If the email belongs to a registered user, link the doubt to them.
    const linkedUser = email
      ? await db.user.findUnique({ where: { email }, select: { id: true } })
      : null;

    const doubt = await db.doubt.create({
      data: {
        question,
        exam,
        subject,
        email,
        studentId: linkedUser?.id ?? null,
        aiSummary: answer.summary,
        aiPoints: JSON.stringify(answer.points),
        aiConcept: answer.concept,
        status: "ai_answered",
      },
    });

    return Response.json({
      ok: true,
      doubt: {
        id: doubt.id,
        question: doubt.question,
        exam: doubt.exam,
        subject: doubt.subject,
        summary: answer.summary,
        points: answer.points,
        concept: answer.concept,
        createdAt: doubt.createdAt,
      },
    });
  } catch {
    // Unexpected failure (DB down etc.) — keep the message generic.
    return Response.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * GET /api/doubt — recent platform doubt stats.
 * Response: { ok, stats: { total, solved } }
 */
export async function GET() {
  try {
    const [total, solved] = await Promise.all([
      db.doubt.count(),
      db.doubt.count({ where: { status: "solved" } }),
    ]);
    return Response.json({ ok: true, stats: { total, solved } });
  } catch {
    return Response.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
