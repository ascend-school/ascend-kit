//
//  edge.ts
//  ascend-cloud
//
//  Created by Prakash on 15/11/26.
//

import { html } from "./html.ts";
import { plainPage } from "./ui/kit.ts";
import { uiAsset } from "./ui/assets.ts";
import type { Theme } from "./ui/themes.ts";

/**
 * What every public Worker does before and after its own routes.
 *
 * Each surface answers on its own address now, so the policy that used to sit in the
 * gateway sits here: one copy, applied the same way by all of them. A Worker that
 * forgets to wrap itself loses its headers, which is why this is the default export
 * of each app rather than middleware inside it.
 */

export type Surface = "marketing" | "website" | "portal" | "ops" | "tenant" | "api";

/** Public pages may be indexed; a portal, Ops and the API never. */
const INDEXABLE: Surface[] = ["marketing", "website"];

export type EdgeEnv = { HOST_SUFFIX: string; ENVIRONMENT?: "development" | "production" };

/**
 * Sent on every response. Scripts come only from this site (no inline script anywhere);
 * inline style attributes are allowed. Pages cannot be framed, so no clickjacking.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

export function withSecurityHeaders(res: Response, env: EdgeEnv): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    // HSTS on http://localhost would pin the browser to https for every local port.
    if (k === "strict-transport-security" && env.ENVIRONMENT === "development") continue;
    if (!out.headers.has(k)) out.headers.set(k, v);
  }
  return out;
}

const text = (body: string, type: string) =>
  new Response(body, { headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "public, max-age=3600" } });

export function robots(origin: string, indexable: boolean) {
  return text(indexable ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n", "text/plain");
}

export function sitemap(origin: string, paths: string[]) {
  return text(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${origin}${p}</loc></url>`).join("")}</urlset>\n`, "application/xml");
}

/** Nothing is served at this address: an unresolvable host, or a sitemap no one may index. */
export const nothingHere = () =>
  html(plainPage({ title: "Not found \u00b7 Ascend", heading: "Nothing is served at this address", body: '<p class="muted">Check the address, or ask the school for its link.</p>' }), 404);

export function indexable(surface: Surface): boolean {
  return INDEXABLE.includes(surface);
}

export type EdgeOptions<E> = {
  surface: Surface;
  /** The sitemap's paths. An indexable surface with none lists "/" alone. */
  pages?: string[];
  /** True for the Worker on the bare suffix: it also answers www.<suffix>, with a redirect. */
  apex?: boolean;
  /** The Ops-chosen theme, for /_ui/theme.css. */
  theme: (env: E) => Promise<Theme>;
};

type App<E> = { fetch(request: Request, env: E, ctx: ExecutionContext): Response | Promise<Response> };

/** Wraps an app as a Worker: one address, its own /_ui, robots and sitemap, and the headers. */
export function edge<E extends EdgeEnv>(app: App<E>, o: EdgeOptions<E>) {
  return {
    async fetch(request: Request, env: E, ctx: ExecutionContext): Promise<Response> {
      return withSecurityHeaders(await serve(request, env, ctx, app, o), env);
    },
  };
}

async function serve<E extends EdgeEnv>(request: Request, env: E, ctx: ExecutionContext, app: App<E>, o: EdgeOptions<E>): Promise<Response> {
  const url = new URL(request.url);
  const host = (request.headers.get("host") ?? url.host).toLowerCase().split(":")[0]!;
  // One address per page: plain http and www both move to https on the bare suffix.
  if (env.ENVIRONMENT !== "development" && url.protocol === "http:") {
    return Response.redirect(`https://${host}${url.pathname}${url.search}`, 301);
  }
  if (o.apex && host === `www.${env.HOST_SUFFIX}`) {
    return Response.redirect(`https://${env.HOST_SUFFIX}${url.pathname}${url.search}`, 301);
  }
  if (url.pathname.startsWith("/_ui/")) {
    const asset = await uiAsset(url.pathname, () => o.theme(env));
    if (asset) return asset;
  }
  if (url.pathname === "/robots.txt") return robots(`${url.protocol}//${url.host}`, indexable(o.surface));
  if (url.pathname === "/sitemap.xml") {
    return indexable(o.surface) ? sitemap(`${url.protocol}//${url.host}`, o.pages ?? ["/"]) : nothingHere();
  }
  return app.fetch(request, env, ctx);
}
