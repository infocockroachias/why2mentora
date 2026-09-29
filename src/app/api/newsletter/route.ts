import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const NewsletterSchema = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
});

/**
 * POST /api/newsletter — subscribe an email (idempotent upsert).
 * Body: { email }
 * 200 { ok: true } | 400 invalid | 500 failure
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = NewsletterSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "Invalid email address" }, { status: 400 });
    }

    await db.subscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
