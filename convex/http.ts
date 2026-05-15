import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const SESSION_COOKIE = "tazid_session";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

type Headers = Record<string, string>;

function corsHeaders(req: Request): Headers {
  const origin = req.headers.get("Origin") || "";
  if (!origin) return {};
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://tazid.co",
    "https://www.tazid.co",
  ];
  const allowed = allowedOrigins.some((o) => origin === o || origin.endsWith(".vercel.app"));
  if (!allowed) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function respond(req: Request, body: string | null, status: number, extra: Headers = {}) {
  const headers: Headers = {};
  const cors = corsHeaders(req);
  for (const k of Object.keys(cors)) headers[k] = cors[k];
  for (const k of Object.keys(extra)) headers[k] = extra[k];
  if (body) headers["Content-Type"] = "application/json";
  return new Response(body, { status, headers });
}

http.route({
  pathPrefix: "/api/auth/",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, req) => {
    return respond(req, null, 200);
  }),
});

http.route({
  path: "/api/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { email, password } = await req.json();
    const result = await ctx.runAction(api.auth.signIn, { email, password });
    return respond(req, JSON.stringify(result), 200, {
      "Set-Cookie": `${SESSION_COOKIE}=${result.token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
    });
  }),
});

http.route({
  path: "/api/auth/signup",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const result = await ctx.runAction(api.auth.signUp, body);
    return respond(req, JSON.stringify(result), 200, {
      "Set-Cookie": `${SESSION_COOKIE}=${result.token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
    });
  }),
});

http.route({
  path: "/api/auth/logout",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const cookie = req.headers.get("Cookie") || "";
    const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (match) {
      try { await ctx.runMutation(api.auth.signOut, { token: match[1] }); } catch {}
    }
    return respond(req, null, 200, {
      "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0`,
    });
  }),
});

http.route({
  path: "/api/auth/session",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const cookie = req.headers.get("Cookie") || "";
    const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (!match) {
      return respond(req, JSON.stringify({ token: null }), 200);
    }
    const user = await ctx.runQuery(api.auth.me, { token: match[1] });
    if (!user) {
      return respond(req, JSON.stringify({ token: null }), 200);
    }
    return respond(req, JSON.stringify({ token: match[1] }), 200);
  }),
});

export default http;
