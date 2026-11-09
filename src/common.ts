//
//  common.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

import type { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { esc, html } from "./html.ts";
import { backWays, banner, pageHead, panel, plainPage } from "./ui/kit.ts";

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

/** What an error page says: a heading for what happened and core's own words for why. Unexpected errors are logged here. */
export type ErrorInfo = { status: number; heading: string; text: string };
const GENERIC_404 = /^not found\.?$/i;
export function describeError(err: unknown): ErrorInfo {
  // HTTPException here is hono/csrf refusing a form posted from another site.
  if (err instanceof HTTPException) return { status: err.status, heading: "That didn't go through", text: "The form could not be accepted. Go back, reload the page and try again." };
  if (!isAppError(err)) {
    console.error(err);
    return { status: 500, heading: "Something went wrong on our side", text: "Try again in a minute. If it keeps happening, tell us what you were doing." };
  }
  const s = err.status;
  if (s === 404) return { status: s, heading: "We couldn't find that", text: GENERIC_404.test(err.message) ? "It may have been removed, or the link is old." : err.message };
  const heading = s === 401 ? "Please sign in again" : s === 403 ? "You can't open this" : s === 429 ? "Too many tries" : s >= 500 ? "Something went wrong on our side" : "That didn't go through";
  return { status: s, heading, text: err.message };
}

/** Where Go back leads without history: the page of this site the person came from, else `fallback`. */
export function backHref(c: Ctx, fallback = "/"): string {
  try {
    const ref = new URL(c.req.header("referer") ?? "");
    const here = new URL(c.req.url);
    if (ref.host === (c.req.header("host") ?? here.host) && ref.pathname + ref.search !== here.pathname + here.search) return ref.pathname + ref.search;
  } catch { /* no usable referrer */ }
  return fallback;
}

/** An error inside an app's own shell: what happened, why, and the ways back. 500s carry a red banner; the rest don't alarm. */
export function errorBody(d: ErrorInfo, ways: { back: string; module?: { href: string; label: string }; home?: string }): string {
  return `${pageHead(d.heading)}${panel({ body: `<div class="stack">${d.status >= 500 ? banner("bad", esc(d.text), "alert") : `<p>${esc(d.text)}</p>`}${backWays(ways)}</div>` })}`;
}

/** Errors outside any shell (signed out, public sites). 401 signs out (`clearCookie`); 403 never does. */
export function errorPage(brand: string, err: unknown, clearCookie?: string, c?: Ctx): Response {
  const d = describeError(err);
  const headers: Record<string, string> = d.status === 401 && clearCookie ? { "set-cookie": clearCookie } : {};
  const body = `<p>${esc(d.text)}</p>${backWays({ back: c ? backHref(c) : "/" })}`;
  return html(plainPage({ title: `${d.heading} · ${brand}`, heading: d.heading, brand, body }), d.status, headers);
}
