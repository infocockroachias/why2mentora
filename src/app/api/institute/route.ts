import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const InstituteSchema = z.object({
  institute: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(80),
  email: z.email(),
  phone: z.string().trim().max(24).optional(),
  city: z.string().trim().max(80).optional(),
  students: z.string().trim().max(30).optional(),
  message: z.string().trim().max(2000).optional(),
});

/**
 * POST /api/institute — institute partnership inquiry.
 * Body: { institute, contactName, email, phone?, city?, students, message? }
 * 200 { ok, id } | 400 invalid | 500 failure
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = InstituteSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.map(String).join(".");
      const message = issue?.message ?? "Invalid request";
      return Response.json(
        { ok: false, error: field ? `${field}: ${message}` : message },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const inquiry = await db.instituteInquiry.create({
      data: {
        institute: d.institute,
        contactName: d.contactName,
        email: d.email.toLowerCase(),
        phone: d.phone?.trim() || null,
        city: d.city?.trim() || null,
        students: d.students?.trim() || "1-100",
        message: d.message?.trim() || null,
      },
    });

    return Response.json({ ok: true, id: inquiry.id });
  } catch {
    return Response.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
