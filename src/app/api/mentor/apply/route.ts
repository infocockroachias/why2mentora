import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const MentorSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  phone: z.string().trim().max(24).optional(),
  exam: z.string().trim().min(1).max(60),
  credential: z.string().trim().min(2).max(300),
  // Accept either a comma-separated string or an array of subject names.
  subjects: z.union([z.string(), z.array(z.string())]),
  bio: z.string().trim().max(2000).optional(),
});

function badRequest(error: string) {
  return Response.json({ ok: false, error }, { status: 400 });
}

/** Normalise "Polity,  Economy" | ["Polity","Economy"] → "Polity, Economy". */
function normaliseSubjects(raw: string | string[]): string {
  const joined = Array.isArray(raw) ? raw.join(",") : raw;
  return joined
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * POST /api/mentor/apply — verified-mentor application.
 * Body: { name, email, phone?, exam, credential, subjects, bio? }
 * 200 { ok, id } | 400 invalid | 500 failure
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return badRequest("Invalid request body");
    }

    const parsed = MentorSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.map(String).join(".");
      const message = issue?.message ?? "Invalid request";
      return badRequest(field ? `${field}: ${message}` : message);
    }

    const d = parsed.data;
    const subjects = normaliseSubjects(d.subjects);
    if (!subjects) {
      return badRequest("subjects: at least one subject is required");
    }

    const application = await db.mentorApplication.create({
      data: {
        name: d.name,
        email: d.email.toLowerCase(),
        phone: d.phone?.trim() || null,
        exam: d.exam,
        credential: d.credential,
        subjects,
        bio: d.bio?.trim() || null,
      },
    });

    return Response.json({ ok: true, id: application.id });
  } catch {
    return Response.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
