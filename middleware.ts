import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/login", "/_next", "/favicon.ico"];
const routes: Record<string, string[]> = {
  ADMIN: ["/"],
  TI_CD: ["/", "/ativos", "/pessoas", "/localizacoes", "/movimentacoes", "/termos"],
  SUPORTE_LOJAS: ["/", "/ativos", "/movimentacoes", "/termos"],
  GESTOR: ["/", "/auditoria", "/configuracoes"],
  CONSULTA: ["/", "/ativos", "/pessoas", "/localizacoes", "/movimentacoes", "/termos"],
};

type SessionPayload = { userId: string; role: keyof typeof routes; exp: number };

function canAccess(role: keyof typeof routes, pathname: string) {
  if (role === "ADMIN") return true;
  return routes[role].some((route) => route === "/" ? pathname === "/" : pathname.startsWith(route));
}

function base64UrlToBytes(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  return Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")), (char) => char.charCodeAt(0));
}

async function hmac(value: string) {
  const secret = process.env.AUTH_SECRET ?? "inventariopro-dev-secret-change-me";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function equalBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

async function readSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if (!equalBytes(base64UrlToBytes(signature), await hmac(body))) return null;
  const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as Partial<SessionPayload>;
  if (!parsed.userId || !parsed.role || !routes[parsed.role] || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return { userId: parsed.userId, role: parsed.role, exp: parsed.exp };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPaths.some((path) => pathname.startsWith(path))) return NextResponse.next();
  const session = await readSession(request.cookies.get("inventariopro_session")?.value);
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  if (!canAccess(session.role, pathname)) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
