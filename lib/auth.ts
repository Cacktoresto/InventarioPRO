import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessPath } from "@/lib/permissions";

const cookieName = "inventariopro_session";
const maxAgeSeconds = 60 * 60 * 8;

type SessionPayload = { userId: string; role: UserRole; exp: number };
export type AuthUser = Pick<User, "id" | "name" | "email" | "role" | "isActive" | "lastLoginAt">;

function secret() { return process.env.AUTH_SECRET ?? "inventariopro-dev-secret-change-me"; }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }

function encodeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (!parsed.userId || !parsed.role || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: parsed.userId, role: parsed.role, exp: parsed.exp };
  } catch { return null; }
}

export async function createSession(user: Pick<User, "id" | "role">) {
  const store = await cookies();
  store.set(cookieName, encodeSession({ userId: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: maxAgeSeconds });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const payload = decodeSession(store.get(cookieName)?.value);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true } });
  if (!user?.isActive) return null;
  return user;
}

export async function requireUser(pathname?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (pathname && !canAccessPath(user.role, pathname)) redirect("/");
  return user;
}
