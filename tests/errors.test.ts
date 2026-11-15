//
//  errors.test.ts
//  ascend-kit
//
//  Created by Venumadhav on 05/11/26.
//

import { test } from "node:test";
import assert from "node:assert/strict";
import { HTTPException } from "hono/http-exception";
import { backHref, describeError, errorBody, errorPage } from "../src/common.ts";
import { backWays, notFoundPage } from "../src/ui/kit.ts";

const appError = (status: number, message: string) => Object.assign(new Error(message), { name: "AppError", status });
const ctx = (url: string, headers: Record<string, string>) => ({ req: { url, header: (k: string) => headers[k.toLowerCase()] } }) as never;

test("each status gets a heading that says what happened, with core's own words as the reason", () => {
  assert.deepEqual(describeError(appError(400, "Give Q2 a mark from 0 to 3, in halves.")), { status: 400, heading: "That didn't go through", text: "Give Q2 a mark from 0 to 3, in halves." });
  assert.equal(describeError(appError(403, "Exams are not in your plan.")).heading, "You can't open this");
  assert.deepEqual(describeError(appError(404, "Not found.")), { status: 404, heading: "We couldn't find that", text: "It may have been removed, or the link is old." });
  assert.equal(describeError(appError(404, "No such student in your sections.")).text, "No such student in your sections.", "a specific 404 keeps its words");
  assert.equal(describeError(appError(429, "Wait a minute.")).heading, "Too many tries");
  assert.equal(describeError(new HTTPException(403)).heading, "That didn't go through", "a refused cross-site form");
  const log = console.error; console.error = () => {};
  try { assert.deepEqual(describeError(new TypeError("x is undefined")).status, 500); } finally { console.error = log; }
  assert.ok(!describeError(new TypeError("secret detail")).text.includes("secret"), "an unexpected error's message is never shown");
});

test("Go back leads to the page of this site the person came from, never to itself or another site", () => {
  assert.equal(backHref(ctx("http://x.portal.localhost/exams/s/1/confirm", { host: "x.portal.localhost", referer: "http://x.portal.localhost/exams/s/1?step=a" })), "/exams/s/1?step=a");
  assert.equal(backHref(ctx("http://x.portal.localhost/a", { host: "x.portal.localhost", referer: "https://evil.example/a" }), "/exams"), "/exams");
  assert.equal(backHref(ctx("http://x.portal.localhost/a", { host: "x.portal.localhost", referer: "http://x.portal.localhost/a" })), "/");
  assert.equal(backHref(ctx("http://x.portal.localhost/a", { host: "x.portal.localhost" }), "/home"), "/home");
});

test("the ways back: Go back first, then the module, then home; a module that is home is not repeated", () => {
  const w = backWays({ back: "/exams/p/1", module: { href: "/exams", label: "Exam & Evals" } });
  assert.ok(w.indexOf("Go back") < w.indexOf("Back to Exam &amp; Evals") && w.indexOf("Back to Exam") < w.indexOf(">Home<"));
  assert.match(w, /href="\/exams\/p\/1" data-back/);
  assert.ok(!backWays({ back: "/x", module: { href: "/", label: "Home" } }).includes("Back to"));
});

test("in the shell: heading, reason and ways back; only a 500 is shown as an alarm", () => {
  const b = errorBody({ status: 403, heading: "You can't open this", text: "Only <the> office" }, { back: "/" });
  assert.ok(b.includes("<h1>You can&#39;t open this</h1>"));
  assert.ok(b.includes("Only &lt;the&gt; office") && !b.includes('role="alert"'));
  assert.ok(errorBody({ status: 500, heading: "h", text: "t" }, { back: "/" }).includes('role="alert"'));
});

test("outside the shell: the school's name, the same headings, status kept, 401 signs out", async () => {
  const r = errorPage("Oxford High School", appError(403, "Not in your plan."));
  assert.equal(r.status, 403);
  const body = await r.text();
  assert.ok(body.includes("<span>Oxford High School</span>") && body.includes("You can&#39;t open this") && body.includes("Go back"));
  assert.equal(errorPage("S", appError(401, "Session ended."), "sid=; Max-Age=0").headers.get("set-cookie"), "sid=; Max-Age=0");
  assert.ok(notFoundPage("/", "Home", "Riverside School").includes("We couldn&#39;t find that · Riverside School"));
});

test("in apps without a module map, Back to … is the menu item the address sits under", async () => {
  const { navModule } = await import("../src/ui/kit.ts");
  const groups = [{ title: "Ops", items: [{ href: "/", label: "Overview", icon: "chart" as const }, { href: "/schools", label: "Schools", icon: "building" as const },
    { href: "/schools/new", label: "Add a school", icon: "plus" as const }] }];
  assert.deepEqual(navModule(groups, "/schools/abc/domains"), { href: "/schools", label: "Schools" });
  assert.deepEqual(navModule(groups, "/schools/new"), { href: "/schools/new", label: "Add a school" });
  assert.equal(navModule(groups, "/schoolsx"), undefined, "a prefix must end at a /");
  assert.equal(navModule(groups, "/nothing"), undefined, "home is never a module");
});
