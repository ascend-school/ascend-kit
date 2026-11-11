import { test } from "node:test";
import assert from "node:assert/strict";
import { dayMonth, EN, isLang, LANGS, translator } from "../src/i18n.ts";
import { TE } from "../src/words/te.ts";
import { appShell, document } from "../src/ui/kit.ts";

test("a word list turns English into the language; a missing word stays English and is reported", () => {
  const missed: string[] = [];
  const t = translator("te", (en) => missed.push(en));
  assert.equal(t("Sign out"), "బయటకు వెళ్ళండి");
  assert.equal(t("Back to {place}", { place: "ఫీజు" }), "ఫీజుకి తిరిగి");
  assert.equal(t("Not in any list"), "Not in any list");
  assert.deepEqual(missed, ["Not in any list"]);
  assert.equal(EN("Back to {place}", { place: "Fees" }), "Back to Fees");
  assert.equal(EN("{a} of {b}", { a: 1 }), "1 of {b}", "an unknown placeholder stays visible");
});

test("languages are named in their own script, and only listed codes count", () => {
  assert.deepEqual(LANGS.map((l) => l.code), ["en", "te"]);
  assert.ok(isLang("te") && !isLang("hi") && !isLang(undefined));
});

test("dates read with the language's month names and Western digits", () => {
  assert.equal(dayMonth("2026-01-15"), "15 Jan");
  assert.equal(dayMonth("2026-01-15", "te"), "15 జన");
  assert.equal(dayMonth("2026-11-11T20:00:00Z", "te"), "11 నవం");
});

test("every Telugu entry keeps the placeholders of its English key", () => {
  const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();
  for (const [en, te] of Object.entries(TE)) assert.equal(names(te), names(en), en);
});

test("a page in Telugu says so, and the shell's own words follow the language", () => {
  const t = translator("te");
  assert.match(document({ title: "x", body: "", t }), /<html lang="te">/);
  assert.match(document({ title: "x", body: "" }), /<html lang="en">/, "English stays the default");
  const shell = appShell({ title: "x", product: "School", groups: [], current: "/", body: "", signoutAction: "/signout", t, languages: { action: "/language", back: "/" } });
  assert.match(shell, /బయటకు వెళ్ళండి/);
  assert.match(shell, /<button name="lang" value="te"[^>]*aria-pressed="true">తెలుగు<\/button>/);
  assert.doesNotMatch(shell, /Sign out|Skip to content|Are you sure/);
});
