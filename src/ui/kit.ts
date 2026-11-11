//
//  kit.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

import { esc, href } from "../html.ts";
import { EN, LANGS, type Lang, type T } from "../i18n.ts";
import { BASE_CSS } from "./styles.ts";

/**
 * The components every portal is built from. Pure functions from data to HTML: no
 * request, no database, no theme knowledge (themes arrive as CSS tokens).
 */

// ---- Icons: one authored set, one stroke. --------------------------------------------

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.2A6.5 6.5 0 0 1 21.5 20"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  keys: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8"/><path d="m16 7 3 3"/><path d="m14 9 2 2"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  upload: '<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
  receipt: '<path d="M5 2.5h14v19l-2.5-1.6L14 21.5l-2-1.6-2 1.6-2.5-1.6L5 21.5z"/><path d="M9 7.5h6M9 11.5h6M9 15.5h3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  building: '<path d="M4 21V5l8-3 8 3v16"/><path d="M2 21h20"/><path d="M9 21v-5h6v5"/><path d="M8 8.5h.01M12 8.5h.01M16 8.5h.01M8 12.5h.01M12 12.5h.01M16 12.5h.01"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  back: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  file: '<path d="M14 2.5H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5z"/><path d="M14 2.5v6h6"/>',
  layers: '<path d="m12 2.5 9.5 5-9.5 5-9.5-5z"/><path d="m2.5 12 9.5 5 9.5-5"/><path d="m2.5 16.5 9.5 5 9.5-5"/>',
} as const;
export type IconName = keyof typeof ICONS;

export const icon = (name: IconName, label?: string) =>
  `<svg class="i" viewBox="0 0 24 24"${label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"'}>${ICONS[name]}</svg>`;

/** Ascend's mark, the Crest: a school badge with the learner cut out of it, shoulders rising like a peak. */
const CREST = "M72 16 H184 A36 36 0 0 1 220 52 V150 C220 202 176 222 128 244 C80 222 36 202 36 150 V52 A36 36 0 0 1 72 16 Z M103 84 A25 25 0 1 0 153 84 A25 25 0 1 0 103 84 Z M128 122 L178 172 L178 211.6 L128 161.6 L78 211.6 L78 172 Z";
/** The Crest redrawn for 32 px and below: bigger head, heavier shoulders. */
export const CREST_SMALL = "M72 16 H184 A36 36 0 0 1 220 52 V150 C220 202 176 222 128 244 C80 222 36 202 36 150 V52 A36 36 0 0 1 72 16 Z M98 82 A30 30 0 1 0 158 82 A30 30 0 1 0 98 82 Z M128 124 L174 170 L174 220.91 L128 174.91 L82 220.91 L82 170 Z";
/** The brand blue: the Electric theme's action colour, so the mark matches the buttons and links. */
export const BRAND_BLUE = "#2b4cc0";

export const brandMark = (title = "Ascend") =>
  `<svg viewBox="0 0 256 256" role="img" aria-label="${esc(title)}"><path fill="currentColor" fill-rule="evenodd" d="${CREST}"/></svg>`;

/** The large Crest used as the one piece of art on sign-in panels. */
export const seal = () => `<svg class="seal" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${CREST}"/></svg>`;

// ---- Document. ---------------------------------------------------------------------

/** A hash of BASE_CSS: the year-long cache can never serve a stale stylesheet. */
export const UI_VERSION = [...BASE_CSS].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(36);

/**
 * The only script. It upgrades modals (which open by #id link and CSS :target without
 * it) to real modal dialogs, and turns a confirm button into a confirm dialog. Without
 * it every form still posts; a confirmed action just skips the question.
 */
export const UI_SCRIPT = `document.addEventListener("click",e=>{if(e.target.closest("[data-print]")){e.preventDefault();print()}});
document.addEventListener("click",e=>{if(!e.target.closest("[data-back]")||history.length<2)return;try{if(new URL(document.referrer).host!==location.host)return}catch{return}e.preventDefault();history.back()});
const shut=d=>{d.close();if(location.hash==="#"+d.id)history.replaceState(null,"",location.pathname+location.search)};
const deep=document.getElementById(location.hash.slice(1));if(deep&&deep.tagName==="DIALOG")deep.showModal();
document.addEventListener("click",e=>{const t=e.target.closest("[data-open],[data-close],[data-confirm]");
if(!t){if(e.target.tagName==="DIALOG")shut(e.target);return}
if(t.dataset.open){e.preventDefault();document.getElementById(t.dataset.open)?.showModal();return}
if(t.hasAttribute("data-close")){e.preventDefault();const d=t.closest("dialog");if(d)shut(d);return}
if(t.dataset.ok){delete t.dataset.ok;return}
e.preventDefault();const d=document.getElementById("confirm-dialog");d.querySelector("p").textContent=t.dataset.confirm;
d.returnValue="";d.onclose=()=>{if(d.returnValue==="ok"){t.dataset.ok="1";t.click()}};d.showModal()});`;
/** ui.js changes without base.css changing: its own token, so browsers fetch the new one. */
const SCRIPT_VERSION = [...UI_SCRIPT].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(36);
const confirmDialog = (t: T) => `<dialog id="confirm-dialog" class="modal" aria-labelledby="confirm-title"><form method="dialog" class="stack">
<h2 id="confirm-title">${esc(t("Are you sure?"))}</h2><p></p><div class="cluster modal-actions"><button value="cancel" class="quiet">${esc(t("Cancel"))}</button><button value="ok" class="danger">${esc(t("Confirm"))}</button></div></form></dialog>`;

/** `head` carries a public page's description, canonical, social and structured-data tags. `t`: the page's language (F-03). */
export function document(o: { title: string; body: string; index?: boolean; bodyAttrs?: string; head?: string; t?: T }): string {
  const t = o.t ?? EN;
  return `<!doctype html><html lang="${t.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${o.index ? "" : `<meta name="robots" content="noindex">`}<title>${esc(o.title)}</title>
<link rel="preload" href="/fonts/anek-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/_ui/theme.css"><link rel="stylesheet" href="/_ui/base.css?v=${UI_VERSION}">
<link rel="icon" href="/_ui/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">${o.head ?? ""}</head>
<body${o.bodyAttrs ?? ""}><a class="skip" href="#main">${esc(t("Skip to content"))}</a>${o.body}${confirmDialog(t)}<script src="/_ui/ui.js?v=${SCRIPT_VERSION}" defer></script></body></html>`;
}


// ---- Shell. ------------------------------------------------------------------------

export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { title: string; items: NavItem[] };
export type Flash = { tone: "good" | "bad" | "warn"; text: string } | null | undefined;
/** Where a page sits: the trail above its title, and its sibling pages in the module. */
export type Crumb = { href?: string; label: string };
/** `label` names the module (the tabs' accessible name); a tab also owns the paths in `also`. */
export type Local = { label: string; crumbs: Crumb[]; tabs: { href: string; label: string; also?: string[] }[] };

const isOnPath = (href: string, current: string) => href === current || (href !== "/" && current.startsWith(`${href}/`));

/** A record's own tabs (a student's Overview, Parents, Documents): one page per part. */
export const tabs = (label: string, items: [string, string][], current: string) =>
  `<nav class="tabs" aria-label="${esc(label)}">${items.map(([to, l]) => `<a ${href(to)}${to === current ? ' aria-current="page"' : ""}>${esc(l)}</a>`).join("")}</nav>`;

function localNav(l: Local, current: string, t: T = EN): string {
  const crumbs = l.crumbs.length > 1 ? `<nav class="crumbs" aria-label="${esc(t("Breadcrumb"))}"><ol>${l.crumbs.map((c, i) =>
    `<li>${c.href && i < l.crumbs.length - 1 ? `<a ${href(c.href)}>${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`}</li>`).join("")}</ol></nav>` : "";
  // the most specific tab wins, so /students/new does not also light up /students
  const owns = (t: Local["tabs"][number]) => [t.href, ...(t.also ?? [])].filter((h) => isOnPath(h, current)).reduce((n, h) => Math.max(n, h.length), -1);
  const on = [...l.tabs].sort((a, b) => owns(b) - owns(a)).find((t) => owns(t) >= 0)?.href;
  const tabs = l.tabs.length > 1 ? `<nav class="tabs" aria-label="${esc(l.label)}">${l.tabs.map((t) =>
    `<a ${href(t.href)}${t.href === on ? ' aria-current="page"' : ""}>${esc(t.label)}</a>`).join("")}</nav>` : "";
  return crumbs + tabs;
}

export function banner(tone: "good" | "bad" | "warn" | "info", text: string, role = "status"): string {
  const i: IconName = tone === "good" ? "check" : tone === "bad" ? "alert" : tone === "warn" ? "alert" : "info";
  return `<div class="banner ${tone === "info" ? "" : tone}" role="${role}">${icon(i)}<div>${text}</div></div>`;
}

export const flashHtml = (f: Flash) => (f ? banner(f.tone, esc(f.text), f.tone === "bad" ? "alert" : "status") : "");

/** A school's mark: its logo, or the first letter of its name until it uploads one. */
export const schoolMark = (name: string, logo: string | null) =>
  logo ? `<img class="school-logo" src="${esc(logo)}" alt="">` : `<span class="school-initial" aria-hidden="true">${esc(name.trim().charAt(0).toUpperCase())}</span>`;
/** The quiet credit on a school's own pages. */
export const poweredBy = (ascendUrl: string, t: T = EN) => `<p class="powered">${esc(t("Powered by"))} <a ${href(ascendUrl)}>Ascend</a></p>`;

/** English or Telugu (F-03): a form post per language that comes back to `back`; the current one is pressed. */
export type LanguageSwitch = { action: string; back: string };
export const languageSwitch = (o: LanguageSwitch, current: Lang) =>
  `<form class="lang-switch" method="post" action="${esc(o.action)}"><input type="hidden" name="back" value="${esc(o.back)}">${LANGS.map((l) =>
    `<button name="lang" value="${l.code}" class="quiet sm" lang="${l.code}" aria-pressed="${l.code === current}">${esc(l.name)}</button>`).join("")}</form>`;

/** The working shell: rail with brand, organisation and grouped navigation; the work area. */
export function appShell(o: {
  title: string; product: string; org?: { name: string; detail?: string }; groups: NavGroup[]; current: string;
  /** A school's own brand: its logo (or its initial) beside its name, with "Powered by Ascend" at the foot. */
  school?: { logo: string | null; poweredBy: string };
  user?: { name: string; detail?: string }; signoutAction?: string; body: string; flash?: Flash;
  /** A find bar across the top of the work area: a GET form to `action` with one field. */
  find?: { action: string; name: string; label: string; value?: string };
  /** Breadcrumbs and the module's tabs, above the page. */
  local?: Local;
  /** Reload the page every so many seconds, while it waits on something outside (a certificate). */
  refreshSeconds?: number;
  /** The page's language, and the switch between languages in the menu (F-03). */
  t?: T; languages?: LanguageSwitch;
}): string {
  const t = o.t ?? EN;
  const isOn = (href: string) => isOnPath(href, o.current);
  const nav = o.groups.filter((g) => g.items.length).map((g) => `<div><h2>${esc(g.title)}</h2>${g.items.map((i) =>
    `<a ${href(i.href)}${isOn(i.href) ? ' aria-current="page"' : ""}>${icon(i.icon)}<span>${esc(i.label)}</span></a>`).join("")}</div>`).join("");
  const body = `<div class="app"><aside class="rail" aria-label="${esc(o.product)}">
<a class="brand" href="/">${o.school ? schoolMark(o.product, o.school.logo) : brandMark()}<span>${esc(o.product)}</span></a>
${o.org ? `<div class="rail-org">${o.org.name ? `<strong>${esc(o.org.name)}</strong>` : ""}${o.org.detail ? `<span>${esc(o.org.detail)}</span>` : ""}</div>` : ""}
<details class="menu"><summary>${icon("menu")} ${esc(t("Menu"))}</summary></details>
<nav aria-label="${esc(t("Main"))}">${nav}</nav>
<div class="rail-foot">${o.user ? `<div><strong>${esc(o.user.name)}</strong>${o.user.detail ? esc(o.user.detail) : ""}</div>` : ""}
${o.languages ? languageSwitch(o.languages, t.lang) : ""}
${o.signoutAction ? `<form method="post" action="${esc(o.signoutAction)}"><button>${icon("logout")} ${esc(t("Sign out"))}</button></form>` : ""}
${o.school ? poweredBy(o.school.poweredBy, t) : ""}</div>
</aside><main class="work" id="main">${o.find ? `<form class="find" method="get" action="${esc(o.find.action)}" role="search"><label class="sr" for="find">${esc(o.find.label)}</label>${icon("search")}<input id="find" name="${esc(o.find.name)}" type="search" placeholder="${esc(o.find.label)}" value="${esc(o.find.value ?? "")}" autocomplete="off"></form>` : ""}${o.local ? localNav(o.local, o.current, t) : ""}${flashHtml(o.flash)}${o.body}</main></div>`;
  return document({ title: `${o.title} · ${o.org?.name ?? o.product}`, body, t, head: o.refreshSeconds ? `<meta http-equiv="refresh" content="${o.refreshSeconds}">` : undefined });
}

/** Sign-in and other doors: the organisation on one side, the form on the other. */
export function authPage(o: { title: string; org: string; headline: string; lead: string; logoSrc?: string | null; body: string; flash?: Flash; poweredBy?: string; t?: T; languages?: LanguageSwitch }): string {
  const t = o.t ?? EN;
  // A school's door carries the school's mark; Ascend's own doors carry Ascend's.
  const brand = o.poweredBy ? `${schoolMark(o.org, o.logoSrc ?? null)}<span>${esc(o.org)}</span>` : `${brandMark()}<span>Ascend</span>`;
  const body = `<div class="auth"><section class="auth-side"><a class="brand" href="/" style="color:inherit">${brand}</a>
<div><h1>${esc(o.headline)}</h1><p>${esc(o.lead)}</p></div>${o.poweredBy ? poweredBy(o.poweredBy, t) : seal()}</section>
<main class="auth-main" id="main">${o.languages ? languageSwitch(o.languages, t.lang) : ""}${o.logoSrc && !o.poweredBy ? `<img class="auth-logo" src="${esc(o.logoSrc)}" alt="${esc(o.org)} logo">` : ""}${flashHtml(o.flash)}${o.body}</main></div>`;
  return document({ title: `${o.title} · ${o.org}`, body, t });
}

/** The 404 every surface answers with: the brand frame, a way home, no dead end. */
/** An address nothing answers at, outside any shell. Signed-in apps show errors in their shell instead (common.ts errorBody). */
export const notFoundPage = (home = "/", label = "Home", brand = "Ascend") => plainPage({ title: `We couldn't find that · ${brand}`, heading: "We couldn't find that", brand,
  body: `<p>It may have been removed, or the link is old.</p>${backWays({ back: home, home, homeLabel: label })}` });

/** The ways out of an error: Go back (history, else `back`), then the module, then home. A module that is home is dropped. */
export function backWays(o: { back: string; module?: { href: string; label: string }; home?: string; homeLabel?: string; t?: T }): string {
  const t = o.t ?? EN;
  const home = o.home ?? "/";
  const mod = o.module && o.module.href !== home ? `<a class="btn quiet" ${href(o.module.href)}>${esc(t("Back to {place}", { place: o.module.label }))}</a>` : "";
  return `<div class="cluster"><a class="btn" ${href(o.back)} data-back>${icon("back")}${esc(t("Go back"))}</a>${mod}<a class="btn quiet" ${href(home)}>${esc(o.homeLabel ?? t("Home"))}</a></div>`;
}

/** The menu item an address sits under (longest match, never home): an error page's "Back to …" in apps without a module map. */
export function navModule(groups: NavGroup[], path: string): { href: string; label: string } | undefined {
  let best: NavItem | undefined;
  for (const i of groups.flatMap((g) => g.items)) {
    if (i.href !== "/" && (path === i.href || path.startsWith(`${i.href}/`)) && i.href.length > (best?.href.length ?? 0)) best = i;
  }
  return best && { href: best.href, label: best.label };
}

/** A minimal frame for errors and notices outside any shell, under the school's name or Ascend's. */
export function plainPage(o: { title: string; heading: string; body: string; flash?: Flash; index?: boolean; brand?: string; t?: T }): string {
  const brand = o.brand ?? "Ascend";
  return document({ title: o.title, index: o.index, t: o.t, body: `<main class="work stack" id="main" style="max-width:40rem;margin:10vh auto">
<a class="brand" href="/">${brandMark(brand)}<span>${esc(brand)}</span></a>${flashHtml(o.flash)}<h1>${esc(o.heading)}</h1>${o.body}</main>` });
}

// ---- Page parts. -------------------------------------------------------------------

// Leads are plain text and escaped here; pass { html } (or leadHtml) only for markup whose interpolated values are already esc()'d.
export function pageHead(title: string, lead?: string | { html: string }, actions?: string): string {
  const p = !lead ? "" : typeof lead === "string" ? esc(lead) : lead.html;
  return `<header class="page-head"><div><h1>${esc(title)}</h1>${p ? `<p>${p}</p>` : ""}</div>${actions ? `<div class="cluster">${actions}</div>` : ""}</header>`;
}

/** A section of a page. `flush` bodies (registers) run edge to edge. */
export function panel(o: { title?: string; lead?: string; leadHtml?: string; actions?: string; body: string; flush?: boolean; id?: string }): string {
  const head = o.title || o.actions ? `<header><div>${o.title ? `<h2>${esc(o.title)}</h2>` : ""}${o.lead || o.leadHtml ? `<p>${o.lead ? esc(o.lead) : o.leadHtml}</p>` : ""}</div>${o.actions ? `<div class="cluster">${o.actions}</div>` : ""}</header>` : "";
  return `<section class="panel"${o.id ? ` id="${esc(o.id)}"` : ""}>${head}<div class="${o.flush ? "flush" : "body"}">${o.body}</div></section>`;
}

/** `one` is the label when the value is exactly 1 ("1 school", not "1 schools"). */
export type Figure = { label: string; one?: string; value: string; due?: boolean; note?: string; href?: string; linkText?: string };
/**
 * Live figures as a line of plain statements: the number, then what it counts, in words.
 * Deliberately not the label-over-big-number tile.
 */
export const figures = (items: Figure[]) => `<ul class="figures">${items.map((f) => {
  const label = f.value === "1" && f.one ? f.one : f.label;
  const words = label.charAt(0).toLowerCase() + label.slice(1);
  const statement = `<strong class="num${f.due ? " due" : ""}">${esc(f.value)}</strong> ${esc(words)}`;
  // The statement itself is the link; a second link only when it names a different action.
  const extra = f.href && f.linkText && f.linkText.toLowerCase() !== f.label.toLowerCase() ? ` <a ${href(f.href)}>${esc(f.linkText)}</a>` : "";
  return `<li>${f.href && !extra ? `<a class="stat" ${href(f.href)}>${statement}</a>` : statement}${extra}${f.note ? `<span class="note">${esc(f.note)}</span>` : ""}</li>`;
}).join("")}</ul>`;

/** `bare`: on phones, do not print the column name before a right-aligned cell. */
export type Column = { label: string; right?: boolean; sr?: boolean; bare?: boolean };
/** A register. Cells are trusted HTML the caller escaped; headers are escaped here. */
export function register(columns: Column[], rows: string[][], empty: { title: string; body?: string; action?: string }): string {
  if (!rows.length) return emptyState(empty.title, empty.body, empty.action);
  const cls = (c: Column) => (c.right ? ' class="r"' : "");
  return `<table><thead><tr>${columns.map((c) => `<th${cls(c)} scope="col">${c.sr ? `<span class="sr">${esc(c.label)}</span>` : esc(c.label)}</th>`).join("")}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((d, i) => `<td${cls(columns[i] ?? { label: "" })} ${columns[i]?.bare ? "" : ` data-label="${esc(columns[i]?.label ?? "")}"`}>${d}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

/** Read-only facts as a definition list. Values are HTML the caller escaped; empty reads "Not given". */
export const facts = (items: [string, string][], t: T = EN) =>
  `<dl class="facts">${items.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v || `<span class="muted">${esc(t("Not given"))}</span>`}</dd></div>`).join("")}</dl>`;

/** A one-field form for a register cell: a hidden label, the input, a small button. */
export const inlineForm = (action: string, o: { id: string; label: string; name: string; type?: string; placeholder?: string; cta: string }) =>
  `<form class="inline-form" method="post" action="${esc(action)}"><label class="sr" for="${esc(o.id)}">${esc(o.label)}</label><input id="${esc(o.id)}" name="${esc(o.name)}" type="${esc(o.type ?? "text")}" required${o.placeholder ? ` placeholder="${esc(o.placeholder)}"` : ""}>${button(o.cta, { variant: "quiet", small: true })}</form>`;

export const emptyState = (title: string, body?: string, action?: string) =>
  `<div class="empty"><strong>${esc(title)}</strong>${body ? `<p>${esc(body)}</p>` : ""}${action ?? ""}</div>`;

/** "1 student", "2 students". */
export const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-IN")} ${n === 1 ? one : many}`;

/** "16 Oct" from a date or a timestamp, the one date style status tags use. */
/** "15 Jan"; in Telugu, use i18n's dayMonth. */
export const shortDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** A status mark: the theme decides whether it is a dotted tag, a stamp, a tile or a pill. */
export type Tone = "paid" | "due" | "sent" | "info";
export const mark = (tone: Tone, label: string, sub?: string) =>
  `<span class="mark ${tone}">${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ""}</span>`;

export type Stop = { label: string; done: boolean; detail?: string; href?: string };
/** A sequence with a "you are here": the first unfinished stop. */
export function stops(items: Stop[]): string {
  const here = items.findIndex((s) => !s.done);
  return `<ol class="stops" style="--n:${items.length}">${items.map((s, i) => {
    const cls = s.done ? "" : i === here ? "here" : "todo";
    const label = s.href && !s.done ? `<a ${href(s.href)}>${esc(s.label)}</a>` : esc(s.label);
    return `<li class="${cls}"${i === here ? ' aria-current="step"' : ""}><strong>${label}</strong>${s.detail ? esc(s.detail) : s.done ? "Done" : i === here ? "Next" : ""}</li>`;
  }).join("")}</ol>`;
}

// ---- Forms. ------------------------------------------------------------------------

type FieldOpts = { value?: string | number | null; type?: string; required?: boolean; id?: string; hint?: string; placeholder?: string; autocomplete?: string; min?: string; step?: string; max?: string; pattern?: string; inputmode?: string; accept?: string; multiple?: boolean; maxlength?: number };

export function field(label: string, name: string, o: FieldOpts = {}): string {
  const id = o.id ?? `f-${name}`;
  const attrs = [
    o.required ? " required" : "", o.placeholder ? ` placeholder="${esc(o.placeholder)}"` : "",
    o.autocomplete ? ` autocomplete="${esc(o.autocomplete)}"` : "", o.min ? ` min="${esc(o.min)}"` : "", o.step ? ` step="${esc(o.step)}"` : "", o.max ? ` max="${esc(o.max)}"` : "",
    o.pattern ? ` pattern="${esc(o.pattern)}"` : "", o.inputmode ? ` inputmode="${esc(o.inputmode)}"` : "",
    o.accept ? ` accept="${esc(o.accept)}"` : "", o.multiple ? " multiple" : "", o.maxlength ? ` maxlength="${o.maxlength}"` : "",
    o.hint ? ` aria-describedby="${esc(id)}-h"` : "",
  ].join("");
  return `<div class="field"><label for="${esc(id)}">${esc(label)}</label><input id="${esc(id)}" name="${esc(name)}" type="${esc(o.type ?? "text")}" value="${esc(o.value ?? "")}"${attrs}>${o.hint ? `<span class="hint" id="${esc(id)}-h">${esc(o.hint)}</span>` : ""}</div>`;
}

export function select(label: string, name: string, options: [string, string][], selected: string | null | undefined, o: { id?: string; hint?: string } = {}): string {
  const id = o.id ?? `f-${name}`;
  return `<div class="field"><label for="${esc(id)}">${esc(label)}</label><select id="${esc(id)}" name="${esc(name)}">${options
    .map(([v, l]) => `<option value="${esc(v)}"${v === (selected ?? "") ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>${o.hint ? `<span class="hint">${esc(o.hint)}</span>` : ""}</div>`;
}

export function textarea(label: string, name: string, o: { value?: string | null; id?: string; hint?: string; rows?: number; maxlength?: number } = {}): string {
  const id = o.id ?? `f-${name}`;
  return `<div class="field"><label for="${esc(id)}">${esc(label)}</label><textarea id="${esc(id)}" name="${esc(name)}" rows="${o.rows ?? 4}"${o.maxlength ? ` maxlength="${o.maxlength}"` : ""}>${esc(o.value ?? "")}</textarea>${o.hint ? `<span class="hint">${esc(o.hint)}</span>` : ""}</div>`;
}

/** `confirm` asks in a dialog before the form posts. */
export const button = (label: string, o: { variant?: "quiet" | "danger"; small?: boolean; icon?: IconName; confirm?: string } = {}) =>
  `<button class="${[o.variant, o.small ? "sm" : ""].filter(Boolean).join(" ")}"${o.confirm ? ` data-confirm="${esc(o.confirm)}"` : ""}>${o.icon ? icon(o.icon) : ""}${esc(label)}</button>`;

/**
 * A modal for one short task (add a holiday, link a guardian). Anything longer, or
 * anything worth a link of its own, is a page. Its form posts like any other.
 */
export const modal = (o: { id: string; title: string; lead?: string; leadHtml?: string; body: string }) =>
  `<dialog class="modal" id="${esc(o.id)}" aria-labelledby="${esc(o.id)}-t"><header><div><h2 id="${esc(o.id)}-t">${esc(o.title)}</h2>${o.lead || o.leadHtml ? `<p>${o.lead ? esc(o.lead) : o.leadHtml}</p>` : ""}</div>
<a class="btn quiet sm" href="#" data-close aria-label="Close">${icon("close")}</a></header>${o.body}</dialog>`;

/** Opens a modal: a link to it, so it also works (via :target) without JavaScript. */
export const openModal = (id: string, label: string, o: { variant?: "quiet"; small?: boolean; icon?: IconName } = {}) =>
  `<a class="btn ${[o.variant, o.small ? "sm" : ""].filter(Boolean).join(" ")}" href="#${esc(id)}" data-open="${esc(id)}" aria-haspopup="dialog">${o.icon ? icon(o.icon) : ""}${esc(label)}</a>`;

export const linkButton = (to: string, label: string, o: { variant?: "quiet"; small?: boolean; icon?: IconName } = {}) =>
  `<a class="btn ${[o.variant, o.small ? "sm" : ""].filter(Boolean).join(" ")}" ${href(to)}>${o.icon ? icon(o.icon) : ""}${esc(label)}</a>`;

/** A one-button form, for the many single actions a register row carries. */
export const actionForm = (action: string, label: string, o: { variant?: "quiet" | "danger"; confirm?: string; hidden?: Record<string, string> } = {}) =>
  `<form method="post" action="${esc(action)}">${Object.entries(o.hidden ?? {}).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join("")}${button(label, { variant: o.variant ?? "quiet", small: true, confirm: o.confirm })}</form>`;

/** Delete, when core allows it; otherwise why not, in its place, so nobody presses a button that can only fail. */
export const deleteOr = (action: string, label: string, confirm: string, inUse: string | null) =>
  inUse ? `<span class="small muted">${esc(inUse)}</span>` : actionForm(action, label, { variant: "danger", confirm });

/** A row's actions: the same small size, side by side, right-aligned (on phones the table becomes cards, so they still fit). */
export const rowActions = (...actions: string[]) => `<div class="cluster" style="justify-content:flex-end;gap:.4rem;flex-wrap:nowrap">${actions.filter(Boolean).join("")}</div>`;

// ---- Sign-in. ----------------------------------------------------------------------

export const RESET_SENT = "If that email has an account, a link to set the password is on its way.";

/**
 * Email + password, posted to our own server, which checks it against the portal's
 * Firebase project. Plain HTML: works on every host and without JavaScript.
 */
export function signInForm(o: { action?: string; resetAction?: string; devHint?: string | null; t?: T } = {}): string {
  const t = o.t ?? EN;
  return `<form class="form" method="post" action="${esc(o.action ?? "/session")}">
${field(t("Email"), "email", { type: "email", autocomplete: "username", required: true, id: "email" })}
${field(t("Password"), "password", { type: "password", autocomplete: "current-password", required: true, id: "password" })}
<div>${button(t("Sign in"), { icon: "arrow" })}</div></form>
<details><summary>${esc(t("Forgot your password, or setting it for the first time?"))}</summary>
<form class="form" method="post" action="${esc(o.resetAction ?? "/password-reset")}" style="margin-top:.8rem">
${field(t("Email"), "email", { type: "email", autocomplete: "username", required: true, id: "reset-email" })}
<div>${button(t("Email me a link"), { variant: "quiet" })}</div></form></details>
${o.devHint ? banner("warn", `Development: Firebase is not configured, so every account's password is <code>${esc(o.devHint)}</code>.`) : ""}`;
}

/** Mobile and the PIN from the school office's slip: the school portal's first sign-in form (F-01). */
export function pinSignInForm(o: { action?: string; t?: T } = {}): string {
  const t = o.t ?? EN;
  return `<form class="form" method="post" action="${esc(o.action ?? "/session/pin")}">
${field(t("Mobile number"), "mobile", { type: "tel", autocomplete: "tel-national", inputmode: "tel", required: true, id: "pin-mobile", placeholder: "98765 43210" })}
${field(t("PIN"), "pin", { type: "password", autocomplete: "current-password", inputmode: "numeric", pattern: "[0-9]{6}", maxlength: 6, required: true, id: "pin-pin",
    hint: t("The 6-digit PIN on the slip from the school office. Lost it? Ask the office for a new slip.") })}
<div>${button(t("Sign in"), { icon: "arrow" })}</div></form>`;
}

/** The marketing slideshow: served as /_ui/slides.js so the page needs no inline script. */
export const SLIDES_SCRIPT = `(()=>{const t=document.getElementById("slides"),s=[...t.children],d=[...document.querySelectorAll("[data-slide]")],n=s.length;let i=0,hold=false;
const mark=()=>{d.forEach((b,k)=>b.toggleAttribute("aria-current",k===i));s.forEach((x,k)=>x.inert=k!==i)};mark();
const go=k=>{i=(k+n)%n;t.scrollTo({left:i*t.clientWidth,behavior:"smooth"});mark()};
d.forEach((b,k)=>b.addEventListener("click",()=>go(k)));
document.querySelectorAll("[data-step]").forEach(b=>b.addEventListener("click",()=>go(i+Number(b.dataset.step))));
t.addEventListener("scroll",()=>{const k=Math.round(t.scrollLeft/t.clientWidth);if(k!==i){i=k;mark()}},{passive:true});
const r=t.closest(".slides");["mouseenter","focusin"].forEach(e=>r.addEventListener(e,()=>hold=true));["mouseleave","focusout"].forEach(e=>r.addEventListener(e,()=>hold=false));
if(!matchMedia("(prefers-reduced-motion: reduce)").matches)setInterval(()=>{if(!hold&&!document.hidden)go(i+1)},6000)})()`;
