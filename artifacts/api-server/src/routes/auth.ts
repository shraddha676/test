import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearSession,
  getSessionId,
  createSession,
  deleteSession,
  hashPassword,
  verifyPassword,
  SESSION_COOKIE,
  SESSION_TTL,
} from "../lib/auth";

const router: IRouter = Router();

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function parseRegisterBody(body: unknown): { identifier: string; password: string; firstName?: string; lastName?: string } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.identifier !== "string" || b.identifier.length < 3) return null;
  if (typeof b.password !== "string" || b.password.length < 6) return null;
  return {
    identifier: b.identifier,
    password: b.password,
    firstName: typeof b.firstName === "string" ? b.firstName : undefined,
    lastName: typeof b.lastName === "string" ? b.lastName : undefined,
  };
}

function parseLoginBody(body: unknown): { identifier: string; password: string } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.identifier !== "string" || !b.identifier) return null;
  if (typeof b.password !== "string" || !b.password) return null;
  return { identifier: b.identifier, password: b.password };
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string) {
  return /^[+]?[\d\s\-().]{7,15}$/.test(value.trim());
}

router.get("/auth/user", (req: Request, res: Response) => {
  const authenticated = req.isAuthenticated();
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: authenticated ? req.user : null,
      isAuthenticated: authenticated,
    }),
  );
});

router.post("/auth/register", async (req: Request, res: Response) => {
  const parsed = parseRegisterBody(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Enter a valid email or phone and a password with at least 6 characters" });
    return;
  }

  const { identifier, password, firstName, lastName } = parsed;
  const trimmed = identifier.trim();

  const emailVal = isEmail(trimmed) ? trimmed.toLowerCase() : null;
  const phoneVal = !emailVal && isPhone(trimmed) ? trimmed : null;

  if (!emailVal && !phoneVal) {
    res.status(400).json({ error: "Enter a valid email address or phone number" });
    return;
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      emailVal
        ? eq(usersTable.email, emailVal)
        : eq(usersTable.phone, phoneVal!),
    );

  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email or phone already exists" });
    return;
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values({
      email: emailVal ?? undefined,
      phone: phoneVal ?? undefined,
      passwordHash,
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
    })
    .returning();

  const sessionData = {
    user: {
      id: user.id,
      email: user.email ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      profileImage: user.profileImageUrl ?? null,
      username: user.phone ?? user.email?.split("@")[0] ?? null,
    },
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.status(201).json({ user: sessionData.user });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const parsed = parseLoginBody(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Enter your email or phone number and password" });
    return;
  }

  const { identifier, password } = parsed;
  const trimmed = identifier.trim();

  const emailVal = isEmail(trimmed) ? trimmed.toLowerCase() : null;
  const phoneVal = !emailVal && isPhone(trimmed) ? trimmed : null;

  if (!emailVal && !phoneVal) {
    res.status(400).json({ error: "Enter a valid email address or phone number" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      emailVal
        ? eq(usersTable.email, emailVal)
        : eq(usersTable.phone, phoneVal!),
    );

  if (!user) {
    res.status(401).json({ error: "No account found with this email or phone number" });
    return;
  }

  if (!user.passwordHash) {
    res.status(401).json({ error: "Password login is not set up for this account" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  const sessionData = {
    user: {
      id: user.id,
      email: user.email ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      profileImage: user.profileImageUrl ?? null,
      username: user.phone ?? user.email?.split("@")[0] ?? null,
    },
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.json({ user: sessionData.user });
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.json({ success: true });
});

router.get("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.redirect("/");
});

export default router;
