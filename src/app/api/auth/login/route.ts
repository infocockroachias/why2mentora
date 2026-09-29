import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const SCRYPT_KEYLEN = 64;

/** Current-parameter scrypt hashing (same format as signup). */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt:${SCRYPT_KEYLEN}:${salt}:${key}`;
}

/**
 * Verify a stored "scrypt:keylen:salt:key" hash. Constant-time comparison.
 * `needsUpgrade` is true when the hash used legacy parameters and should be
 * re-hashed with the current key length after a successful login.
 */
function verifyPassword(
  password: string,
  stored: string
): { ok: boolean; needsUpgrade: boolean } {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "scrypt") {
    return { ok: false, needsUpgrade: false };
  }
  const keylen = Number(parts[1]);
  const salt = parts[2];
  const keyHex = parts[3];
  if (!Number.isInteger(keylen) || keylen < 16 || !salt || !keyHex) {
    return { ok: false, needsUpgrade: false };
  }

  let derived: Buffer;
  try {
    derived = scryptSync(password, salt, keylen);
  } catch {
    return { ok: false, needsUpgrade: false };
  }

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== derived.length) {
    return { ok: false, needsUpgrade: false };
  }
  return {
    ok: timingSafeEqual(derived, key),
    needsUpgrade: keylen !== SCRYPT_KEYLEN,
  };
}

const LoginSchema = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
});

/**
 * POST /api/auth/login — verify credentials and return the user profile.
 * Body: { email, password }
 * 200 { ok, user: { id, name, email, exam } } | 401 invalid credentials
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const verdict = verifyPassword(password, user.passwordHash);
    if (!verdict.ok) {
      return Response.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update-if-needed: silently re-hash legacy-parameter hashes to current params.
    if (verdict.needsUpgrade) {
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(password) },
      });
    }

    return Response.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, exam: user.exam },
    });
  } catch {
    return Response.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
