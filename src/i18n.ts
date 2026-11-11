//
//  i18n.ts
//  ascend-kit
//
//  Created by Venumadhav on 11/11/26.
//

import { TE } from "./words/te.ts";

/**
 * The portal's languages (F-03). A word list maps the English text, exactly as the code writes it, to the
 * language's text; a word missing from a list reads in English, so a page never breaks for a missing word.
 * A third language is a new list under words/ and one line in LANGS.
 *
 * Placeholders are `{name}`, filled after the lookup: t("Class {cls}", { cls: "7 A" }). The result is plain
 * text: callers escape it like any other text.
 */
export type Lang = "en" | "te";
/** In the order the switch shows them; `name` is the language's own name for itself. */
export const LANGS: readonly { code: Lang; name: string }[] = [{ code: "en", name: "English" }, { code: "te", name: "తెలుగు" }];
export const isLang = (s: unknown): s is Lang => LANGS.some((l) => l.code === s);

const LISTS: Record<Lang, Readonly<Record<string, string>>> = { en: {}, te: TE };

export type Vars = Record<string, string | number>;
export type T = ((en: string, vars?: Vars) => string) & { readonly lang: Lang };

const fill = (text: string, vars?: Vars) => (vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text);

/** `missing` hears every English text the list lacks: tests use it to prove a page is covered. */
export function translator(lang: Lang, missing?: (en: string) => void): T {
  const list = LISTS[lang];
  const t = (en: string, vars?: Vars) => {
    const said = list[en];
    if (said === undefined && lang !== "en") missing?.(en);
    return fill(said ?? en, vars);
  };
  return Object.assign(t, { lang });
}

/** English: what every page said before F-03, and what apps without a language choice keep saying. */
export const EN: T = translator("en");

/** What a school prints receipts and certificates in (F-03, the owner's decision): one language, or both. */
export type PrintLanguage = Lang | "both";
/**
 * The words of a printed document. "both" puts the English and the Telugu side by side, "Fee receipt / ఫీజు రసీదు",
 * and a word the same in both (a missing one) once. The page itself is marked English for "both".
 */
export function printWords(language: PrintLanguage): T {
  if (language !== "both") return translator(language);
  const te = translator("te");
  const both = (en: string, vars?: Vars) => { const a = EN(en, vars), b = te(en, vars); return a === b ? a : `${a} / ${b}`; };
  return Object.assign(both, { lang: "en" as Lang });
}

const MONTHS: Record<Lang, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  te: ["జన", "ఫిబ్ర", "మార్చి", "ఏప్రి", "మే", "జూన్", "జులై", "ఆగ", "సెప్టెం", "అక్టో", "నవం", "డిసెం"],
};
const MONTHS_LONG: Record<Lang, readonly string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  te: ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జులై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"],
};
/** Monday first, as school calendars print them. */
export const WEEKDAYS_SHORT: Record<Lang, readonly string[]> = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  te: ["సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని", "ఆది"],
};
/** "November 2026", "నవంబర్ 2026", from YYYY-MM. */
export const monthYear = (month: string, lang: Lang = "en") => `${MONTHS_LONG[lang][Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;

/** "15 Jan", "15 జన": the day and the month's short name, from YYYY-MM-DD or a full ISO time (read as UTC). */
export function dayMonth(iso: string, lang: Lang = "en"): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return `${d.getUTCDate()} ${MONTHS[lang][d.getUTCMonth()]}`;
}
