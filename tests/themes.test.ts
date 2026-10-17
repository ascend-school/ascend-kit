import { test } from "node:test";
import assert from "node:assert/strict";
import { THEMES, THEME_KEYS, themeDeclarations } from "../src/ui/themes.ts";
import { BASE_CSS } from "../src/ui/styles.ts";

// WCAG relative luminance and contrast, for hex colours.
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x! + 0.05) / (y! + 0.05); };

test("every theme fills every token the stylesheet reads", () => {
  const used = new Set([...BASE_CSS.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  for (const k of THEME_KEYS) {
    const declared = new Set([...themeDeclarations(THEMES[k]).matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]));
    for (const v of used) if (v !== "--tone" && v !== "--n" && v !== "--gap") assert.ok(declared.has(v), `${k} lacks ${v}`);
  }
});

test("text stays readable in every theme (WCAG AA)", () => {
  for (const k of THEME_KEYS) {
    const t = THEMES[k].tokens;
    const pairs: [string, string, string, number][] = [
      ["ink on surface", t.ink, t.surface, 4.5], ["ink on page", t.ink, t.bg, 4.5], ["secondary ink on surface", t.ink2, t.surface, 4.5],
      ["rail text", t.railInk, t.railBg, 4.5], ["muted rail and hero text", t.railMuted, t.railBg, 4.5], ["active nav", t.railActiveInk, t.railActiveBg, 4.5],
      ["button text", t.accentInk, t.accent, 4.5], ["money owed", t.due, t.surface, 4.5], ["paid mark", t.paid, t.surface, 4.5], ["sent mark", t.sent, t.surface, 3],
    ];
    for (const [what, fg, bg, min] of pairs) assert.ok(contrast(fg, bg) >= min, `${k}: ${what} ${fg} on ${bg} is ${contrast(fg, bg).toFixed(2)}:1, needs ${min}`);
    // A gradient must stay readable at every colour it passes through, not only its flat fallback.
    const stops = (g: string) => [...g.matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0]);
    for (const c of stops(t.railImage)) {
      assert.ok(contrast(t.railInk, c) >= 4.5, `${k}: rail text on gradient ${c} is ${contrast(t.railInk, c).toFixed(2)}:1`);
      assert.ok(contrast(t.railMuted, c) >= 4.5, `${k}: muted rail text on gradient ${c} is ${contrast(t.railMuted, c).toFixed(2)}:1`);
    }
    for (const c of stops(t.accentImage)) assert.ok(contrast(t.accentInk, c) >= 4.5, `${k}: button text on gradient ${c} is ${contrast(t.accentInk, c).toFixed(2)}:1`);
  }
});
