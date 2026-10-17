//
//  html.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

/**
 * HTML escaping and the response helper every surface uses. `page()` is the plain frame
 * the public school website still draws in (it wears each school's own brand, not
 * Ascend's); every Ascend portal draws through src/ui/kit.ts.
 */
export function esc(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const CSS = `
*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,sans-serif;color:#1b2430;background:#f7f7f4}
header,main{max-width:980px;margin-inline:auto;padding:16px}header{display:flex;gap:16px;align-items:baseline;flex-wrap:wrap;border-bottom:1px solid #ddd}
header nav a{margin-right:12px}h1{font-size:24px;margin:12px 0}h2{font-size:18px;margin:24px 0 8px}
a{color:#1f5fbf}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:14px;vertical-align:top}
th{background:#efefea}label{display:block;margin:10px 0 2px;font-size:14px;font-weight:600}
input,select{width:100%;max-width:420px;padding:8px;border:1px solid #aaa;border-radius:4px;font:inherit}
button{padding:9px 14px;border:1px solid #1b2430;background:#1b2430;color:#fff;border-radius:4px;font:inherit;cursor:pointer}
button.secondary{background:#fff;color:#1b2430}.row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}
.card{background:#fff;border:1px solid #ddd;border-radius:6px;padding:12px;margin:8px 0}.muted{color:#667;font-size:13px}
.banner{border:1px solid #c90;background:#fff8e6;padding:10px;border-radius:4px;margin:12px 0}.banner.bad{border-color:#b22;background:#fdeaea}.banner.good{border-color:#0a6;background:#eafaf2}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}.tile{background:#fff;border:1px solid #ddd;border-radius:6px;padding:10px}
.tile.locked{opacity:.55}code{background:#eee;padding:1px 4px;border-radius:3px;font-size:13px}
`;

export type Nav = { href: string; label: string }[];

/** `index`: let search engines list the page. Only a school's published website asks for it. */
/**
 * An anchor's href. A link to another address (another portal, a school's website, a map)
 * opens in a new tab so the page the person is on stays open; a path in this portal does not.
 * Only http, https, mailto, tel and relative links pass; anything else (javascript:, data:) becomes "#".
 */
export const href = (url: string) => {
  // Browsers drop tabs, newlines and leading spaces before reading a scheme ("java\tscript:").
  const scheme = url.replace(/[\u0000-\u0020]/g, "").match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  if (scheme && !["http", "https", "mailto", "tel"].includes(scheme)) return 'href="#"';
  return `href="${esc(url)}"${/^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener"' : ""}`;
};

export function page(opts: { title: string; brand: string; nav?: Nav; body: string; flash?: { tone: "good" | "bad"; text: string } | null; index?: boolean; head?: string }): string {
  const nav = (opts.nav ?? []).map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("");
  const flash = opts.flash ? `<p class="banner ${opts.flash.tone}" role="status">${esc(opts.flash.text)}</p>` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${opts.index ? "" : `<meta name="robots" content="noindex">`}<title>${esc(opts.title === opts.brand ? opts.title : `${opts.title} · ${opts.brand}`)}</title><style>${CSS}</style>${opts.head ?? ""}</head>
<body><header><strong>${esc(opts.brand)}</strong><nav>${nav}</nav></header><main>${flash}${opts.body}</main></body></html>`;
}

export const html = (body: string, status = 200, headers: Record<string, string> = {}) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", ...headers } });

/**
 * The tags a public page needs to be found and shared well: description, canonical URL,
 * Open Graph and Twitter cards, and optional structured data (schema.org JSON-LD).
 * JSON-LD is data, not script, so the security policy's script-src does not apply to it.
 */
export function seoHead(o: { title: string; description: string; url: string; image?: string; siteName: string; jsonLd?: object | object[]; icon?: string }): string {
  const ld = o.jsonLd ? `<script type="application/ld+json">${JSON.stringify(o.jsonLd).replace(/</g, "\\u003c")}</script>` : "";
  return `<meta name="description" content="${esc(o.description)}"><link rel="canonical" href="${esc(o.url)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(o.siteName)}"><meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}"><meta property="og:url" content="${esc(o.url)}">${o.image ? `<meta property="og:image" content="${esc(o.image)}">` : ""}
<meta name="twitter:card" content="${o.image ? "summary_large_image" : "summary"}"><meta name="twitter:title" content="${esc(o.title)}"><meta name="twitter:description" content="${esc(o.description)}">${o.image ? `<meta name="twitter:image" content="${esc(o.image)}">` : ""}
${o.icon ? `<link rel="icon" href="${esc(o.icon)}">` : ""}${ld}`;
}
