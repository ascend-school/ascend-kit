//
//  hosts.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//


/**
 * One suffix, every address. With HOST_SUFFIX = ascend.naptrixlabs.com and a school whose
 * slug is "greenfield":
 *
 *   ascend.naptrixlabs.com                  marketing website
 *   ops.ascend.naptrixlabs.com              Ascend Ops Portal
 *   tenant.ascend.naptrixlabs.com           Tenant Portal
 *   core.ascend.naptrixlabs.com             API
 *   greenfield.ascend.naptrixlabs.com           the school's public website (plans with school.website)
 *   greenfield.portal.ascend.naptrixlabs.com    the School Portal, where staff and parents work
 *   www.greenfieldschool.in / erp.greenfieldschool.in   either of the two, on the school's own domain
 *
 * Moving to a domain of our own is a HOST_SUFFIX change: greenfield.<ourdomain>.com and
 * greenfield.portal.<ourdomain>.com.
 */
const PLATFORM_LABELS: Record<string, "ops" | "tenant" | "api"> = {
  ops: "ops",
  tenant: "tenant",
  core: "api",
};
const PORTAL_LABEL = "portal";

/** Labels no school can take: ours, plus the ones a phishing page would want. */
export const RESERVED_SLUGS = new Set([
  ...Object.keys(PLATFORM_LABELS), PORTAL_LABEL,
  "www", "api", "app", "admin", "auth", "login", "signin", "account", "accounts", "mail", "smtp",
  "cdn", "static", "assets", "media", "files", "status", "help", "support", "docs", "blog",
  "dev", "staging", "test", "demo", "sites", "ascend", "naptrix", "billing", "pay", "payments",
]);

export function normaliseHost(raw: string): string {
  return raw.trim().toLowerCase().replace(/\.$/, "").split(":")[0] ?? "";
}

export function platformHost(surface: "marketing" | "ops" | "tenant" | "api", suffix: string): string {
  if (surface === "marketing") return suffix;
  const label = Object.keys(PLATFORM_LABELS).find((l) => PLATFORM_LABELS[l] === surface)!;
  return `${label}.${suffix}`;
}

export function websiteHost(slug: string, suffix: string): string {
  return `${slug}.${suffix}`;
}

export function portalHost(slug: string, suffix: string): string {
  return `${slug}.${PORTAL_LABEL}.${suffix}`;
}

export function urlFor(host: string, suffix: string): string {
  // Local development runs on plain http.
  return suffix === "localhost" ? `http://${host}:8788` : `https://${host}`;
}

export type SchoolSurface = "website" | "portal";

export type Routed =
  | { surface: "marketing" | "ops" | "tenant" | "api" }
  | { surface: SchoolSurface; host: string; slug: string }
  /** Not under our suffix: a school's own domain, resolved through the domains table. */
  | { surface: "custom"; host: string }
  | { surface: "none" };

export function routeHost(rawHost: string, suffix: string): Routed {
  const host = normaliseHost(rawHost);
  if (!host) return { surface: "none" };
  if (host === suffix || host === `www.${suffix}`) return { surface: "marketing" };
  if (!host.endsWith(`.${suffix}`)) return { surface: "custom", host };

  const labels = host.slice(0, -(suffix.length + 1)).split(".");
  if (labels.length === 2 && labels[1] === PORTAL_LABEL) {
    return isValidSlug(labels[0]!) ? { surface: "portal", host, slug: labels[0]! } : { surface: "none" };
  }
  if (labels.length !== 1) return { surface: "none" };
  const label = labels[0]!;
  const platform = PLATFORM_LABELS[label];
  if (platform) return { surface: platform };
  return isValidSlug(label) ? { surface: "website", host, slug: label } : { surface: "none" };
}

/** A single DNS label a school may own. It is also spliced into nothing but rows. */
export function isValidSlug(s: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(s) && !RESERVED_SLUGS.has(s);
}

/**
 * Why a hostname cannot be a school's own domain, or null if it can. A subdomain
 * (erp.greenfieldschool.in), because an apex cannot CNAME; never our own zone.
 */
export function customHostProblem(raw: string, suffix: string, root: string): string | null {
  const host = normaliseHost(raw);
  if (!host) return "Enter an address.";
  if (host.length > 253) return "That address is too long.";
  if (/^\d+(\.\d+){3}$/.test(host)) return "Use a domain name, not an IP address.";
  const labels = host.split(".");
  if (!labels.every((l) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l))) return "That is not a valid domain name.";
  if (!/^[a-z]{2,}$/.test(labels[labels.length - 1]!)) return "That is not a valid domain name.";
  if (labels.length < 3) return "Use a subdomain such as erp.yourschool.in; a bare domain cannot point at Ascend.";
  for (const own of [suffix, root]) if (host === own || host.endsWith(`.${own}`)) return "That address belongs to Ascend.";
  return null;
}
