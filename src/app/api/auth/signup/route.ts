import { randomBytes, scryptSync } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const SCRYPT_KEYLEN = 64;

/** scrypt password hashing with a per-user random salt (no external deps). */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt:${SCRYPT_KEYLEN}:${salt}:${key}`;
}

const SignupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
  exam: z.string().trim().max(60).optional(),
});

/** GET /api/auth/signup — liveness ping for the auth module. */
export async function GET() {
  return Response.json({ ok: true });
}

/**
 * POST /api/auth/signup — create a student account.
 * Body: { name, email, password, exam }
 * 200 { ok, user: { id, name, email, exam } } | 400 invalid | 409 email taken
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.map(String).join(".");
      const message = issue?.message ?? "Invalid request";
      return Response.json(
        { ok: false, error: field ? `${field}: ${message}` : message },
        { status: 400 }
      );
    }

    const { name, password } = parsed.data;
    const email = parsed.data.email;
    const exam = parsed.data.exam?.trim() || "UPSC CSE";

    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return Response.json(
        { ok: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        exam,
        role: "student",
        passwordHash: hashPassword(password),
      },
    });

    return Response.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, exam: user.exam },
    });
  } catch (error) {
    // Unique-constraint race (two signups in the same tick) → treat as 409.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      return Response.json(
        { ok: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    return Response.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
