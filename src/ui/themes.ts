//
//  themes.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

/**
 * Every Ascend portal is drawn from these tokens and nothing else, so a theme is data:
 * Ops picks one in Settings and every portal follows. Components never name a colour,
 * radius or face; they name a token.
 */
export const THEME_KEYS = ["electric", "inland", "receipt", "tiles", "classic"] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];
export const DEFAULT_THEME: ThemeKey = "electric";

export const isThemeKey = (k: unknown): k is ThemeKey => typeof k === "string" && (THEME_KEYS as readonly string[]).includes(k);

type Tokens = {
  /** Page ground, working surfaces, and a quieter surface for headers and stripes. */
  bg: string; surface: string; surface2: string;
  ink: string; ink2: string; line: string;
  /** The navigation rail. `railImage` is a gradient over it (also the hero and footer), or "none". */
  railBg: string; railImage: string; railInk: string; railMuted: string; railActiveBg: string; railActiveInk: string;
  /** The one action colour; `accentImage` is a gradient on primary buttons, or "none". */
  accent: string; accentImage: string; accentInk: string; accentHover: string;
  /** Status tones. `due` means money owed or late, and nothing else. */
  due: string; paid: string; sent: string; info: string;
  focus: string;
  radius: string; radiusLg: string;
  fontDisplay: string; fontBody: string; displayWeight: string;
  /** The status mark: a dotted tag, a rubber stamp, a tile or a pill, all from these. */
  markRadius: string; markRotate: string; markBorder: string; markFill: string; markInk: string;
  markRing: string; markAspect: string; markMin: string; markPad: string; markSize: string;
  /** "none" or "uppercase"; "inline-block" or "none" for the tone dot before the label. */
  markCase: string; markDot: string;
  shadow: string;
  scheme: "light" | "dark";
};

export type Theme = { key: ThemeKey; name: string; summary: string; tokens: Tokens };

export const THEMES: Record<ThemeKey, Theme> = {
  electric: {
    key: "electric",
    name: "Electric",
    summary: "A deep royal blue with soft blue-to-indigo gradients on the rail and buttons, white sheets on a calm grey-blue ground.",
    tokens: {
      bg: "#f0f3fa", surface: "#ffffff", surface2: "#f5f7fc", ink: "#0e1a3f", ink2: "#4a587d", line: "#d9e0f0",
      railBg: "#233f9c", railImage: "linear-gradient(165deg, #233f9c 0%, #1c3283 55%, #15255f 100%)",
      railInk: "#f1f4fc", railMuted: "#bcc7ea", railActiveBg: "#e8edf9", railActiveInk: "#233f9c",
      accent: "#2b4cc0", accentImage: "linear-gradient(135deg, #3254c8 0%, #2b4cc0 55%, #243fa6 100%)", accentInk: "#ffffff", accentHover: "#243fa6",
      due: "#c8102e", paid: "#2846b0", sent: "#8a6a00", info: "#4a587d", focus: "#f4c430",
      radius: "10px", radiusLg: "14px",
      fontDisplay: "'Anek Latin', 'Hind', system-ui, sans-serif", fontBody: "'Hind', system-ui, sans-serif", displayWeight: "600",
      markRadius: "6px", markRotate: "0deg", markBorder: "1px", markFill: "9%", markInk: "var(--tone)",
      markRing: "none", markAspect: "auto", markMin: "0", markPad: ".2rem .6rem", markSize: ".82rem", markCase: "none", markDot: "inline-block",
      shadow: "0 1px 2px rgb(35 63 156 / .06), 0 8px 22px -12px rgb(35 63 156 / .22)",
      scheme: "light",
    },
  },
  inland: {
    key: "inland",
    name: "Inland Letter",
    summary: "India Post's pale-blue inland letter and red post box. Statuses are quiet dated tags with a coloured dot.",
    tokens: {
      bg: "#dfeaf3", surface: "#ffffff", surface2: "#eef4f9", ink: "#13294b", ink2: "#4a5f7c", line: "#c9d9e8",
      railBg: "#1d3f6e", railImage: "none", railInk: "#e8f0f7", railMuted: "#9fb8d3", railActiveBg: "#dfeaf3", railActiveInk: "#1d3f6e",
      accent: "#1d3f6e", accentImage: "none", accentInk: "#ffffff", accentHover: "#142f55",
      due: "#c8102e", paid: "#1d3f6e", sent: "#8a6a00", info: "#4a5f7c", focus: "#f4c430",
      radius: "10px", radiusLg: "14px",
      fontDisplay: "'Anek Latin', 'Hind', system-ui, sans-serif", fontBody: "'Hind', system-ui, sans-serif", displayWeight: "600",
      markRadius: "6px", markRotate: "0deg", markBorder: "1px", markFill: "9%", markInk: "var(--tone)",
      markRing: "none", markAspect: "auto", markMin: "0", markPad: ".2rem .6rem", markSize: ".82rem", markCase: "none", markDot: "inline-block",
      shadow: "0 1px 2px rgb(19 41 75 / .06), 0 6px 18px -8px rgb(19 41 75 / .18)",
      scheme: "light",
    },
  },
  receipt: {
    key: "receipt",
    name: "Receipt Book",
    summary: "The office's carbon-copy fee receipt book: carbon blue on white, violet rubber stamps.",
    tokens: {
      bg: "#f6f3ea", surface: "#ffffff", surface2: "#faf8f2", ink: "#1c2554", ink2: "#565b78", line: "#ddd6c3",
      railBg: "#ffffff", railImage: "none", railInk: "#24306e", railMuted: "#5f6480", railActiveBg: "#24306e", railActiveInk: "#ffffff",
      accent: "#24306e", accentImage: "none", accentInk: "#ffffff", accentHover: "#1a2457",
      due: "#c23a2b", paid: "#6a3fb5", sent: "#8a6a00", info: "#565b78", focus: "#6a3fb5",
      radius: "8px", radiusLg: "10px",
      fontDisplay: "'Anek Latin', 'Hind', system-ui, sans-serif", fontBody: "'Hind', system-ui, sans-serif", displayWeight: "700",
      markRadius: "4px", markRotate: "-4deg", markBorder: "2px", markFill: "0%", markInk: "var(--tone)",
      markRing: "none", markAspect: "auto", markMin: "0", markPad: ".15rem .5rem", markSize: ".72rem", markCase: "uppercase", markDot: "none",
      shadow: "0 1px 0 #ddd6c3",
      scheme: "light",
    },
  },
  tiles: {
    key: "tiles",
    name: "Typographic Tiles",
    summary: "Flat colour tiles on a dark ground, type as the interface. Best on good screens indoors.",
    tokens: {
      bg: "#0b0b0f", surface: "#17171e", surface2: "#202029", ink: "#f4f4f7", ink2: "#a9a9b8", line: "#2e2e39",
      railBg: "#0b0b0f", railImage: "none", railInk: "#d4d4de", railMuted: "#8b8b9c", railActiveBg: "#00a3c4", railActiveInk: "#0b0b0f",
      accent: "#00a3c4", accentImage: "none", accentInk: "#0b0b0f", accentHover: "#00bde3",
      due: "#ff4d8d", paid: "#a4c400", sent: "#f4c430", info: "#8bd4e6", focus: "#f4c430",
      radius: "0px", radiusLg: "0px",
      fontDisplay: "'Anek Latin', 'Hind', system-ui, sans-serif", fontBody: "'Hind', system-ui, sans-serif", displayWeight: "300",
      markRadius: "0px", markRotate: "0deg", markBorder: "0px", markFill: "100%", markInk: "#0b0b0f",
      markRing: "none", markAspect: "auto", markMin: "0", markPad: ".2rem .55rem", markSize: ".72rem", markCase: "uppercase", markDot: "none",
      shadow: "none",
      scheme: "dark",
    },
  },
  classic: {
    key: "classic",
    name: "Classic",
    summary: "The category standard, done carefully: white surfaces, grey rail, one blue accent, pill statuses.",
    tokens: {
      bg: "#f3f4f6", surface: "#ffffff", surface2: "#f9fafb", ink: "#111827", ink2: "#4b5563", line: "#e5e7eb",
      railBg: "#ffffff", railImage: "none", railInk: "#374151", railMuted: "#6b7280", railActiveBg: "#eff6ff", railActiveInk: "#1d4ed8",
      accent: "#2563eb", accentImage: "none", accentInk: "#ffffff", accentHover: "#1d4ed8",
      due: "#b91c1c", paid: "#15803d", sent: "#a16207", info: "#4b5563", focus: "#2563eb",
      radius: "8px", radiusLg: "12px",
      fontDisplay: "'Inter', system-ui, sans-serif", fontBody: "'Inter', system-ui, sans-serif", displayWeight: "600",
      markRadius: "999px", markRotate: "0deg", markBorder: "0px", markFill: "14%", markInk: "var(--tone)",
      markRing: "none", markAspect: "auto", markMin: "0", markPad: ".15rem .65rem", markSize: ".8rem", markCase: "none", markDot: "none",
      shadow: "0 1px 2px rgb(17 24 39 / .06)",
      scheme: "light",
    },
  },
};

const VAR: Record<keyof Tokens, string> = {
  bg: "--bg", surface: "--surface", surface2: "--surface-2", ink: "--ink", ink2: "--ink-2", line: "--line",
  railBg: "--rail-bg", railImage: "--rail-image", railInk: "--rail-ink", railMuted: "--rail-muted", railActiveBg: "--rail-active-bg", railActiveInk: "--rail-active-ink",
  accent: "--accent", accentImage: "--accent-image", accentInk: "--accent-ink", accentHover: "--accent-hover",
  due: "--due", paid: "--paid", sent: "--sent", info: "--info", focus: "--focus",
  radius: "--radius", radiusLg: "--radius-lg", fontDisplay: "--font-display", fontBody: "--font-body", displayWeight: "--display-weight",
  markRadius: "--mark-radius", markRotate: "--mark-rotate", markBorder: "--mark-border", markFill: "--mark-fill", markInk: "--mark-ink",
  markRing: "--mark-ring", markAspect: "--mark-aspect", markMin: "--mark-min", markPad: "--mark-pad", markSize: "--mark-size", markCase: "--mark-case", markDot: "--mark-dot",
  shadow: "--shadow", scheme: "--scheme",
};

/** The theme as CSS declarations, for `:root` (the live theme) or a preview box. */
export function themeDeclarations(theme: Theme): string {
  return (Object.keys(VAR) as (keyof Tokens)[]).map((k) => `${VAR[k]}:${theme.tokens[k]}`).join(";");
}

