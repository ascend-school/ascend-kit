//
//  common.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

import type { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { html } from "./html.ts";
import { plainPage } from "./ui/kit.ts";

/** What helpers need from a request, whatever variables the app declares. */
export type Ctx = { req: HonoRequest };

export async function form(c: Ctx): Promise<Record<string, string>> {
  const body = await c.req.parseBody();
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) if (typeof v === "string") out[k] = v.trim();
  return out;
}

export const seeOther = (location: string, headers: Record<string, string> = {}) =>
  new Response(null, { status: 303, headers: { location, ...headers } });

/** Core's AppError arrives over RPC as a plain Error that keeps its name, message and status. */
const isAppError = (e: unknown): e is Error & { status: number } => e instanceof Error && e.name === "AppError";

/** Errors become a page in the portal's own frame. 401 signs out (`clearCookie`); 403 never does. */
export function errorPage(brand: string, err: unknown, clearCookie?: string): Response {
  // HTTPException here is hono/csrf refusing a form posted from another site.
  const status = isAppError(err) || err instanceof HTTPException ? err.status : 500;
  const text = isAppError(err) ? err.message
    : err instanceof HTTPException ? "That form could not be accepted. Go back, reload the page and try again."
    : "Something went wrong. Please try again.";
  if (!isAppError(err) && !(err instanceof HTTPException)) console.error(err);
  const headers: Record<string, string> = status === 401 && clearCookie ? { "set-cookie": clearCookie } : {};
  const heading = status === 404 ? "Not found" : status === 403 ? "Not for your role" : status === 401 ? "Please sign in again" : status === 429 ? "Too many tries" : "Something needs fixing";
  return html(plainPage({ title: `${heading} · ${brand}`, heading, body: `<p><a class="btn quiet" href="/">Home</a></p>`, flash: { tone: "bad", text } }), status, headers);
}
