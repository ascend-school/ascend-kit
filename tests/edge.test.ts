import { strict as assert } from "node:assert";
import test from "node:test";
import { edge, indexable, robots, withSecurityHeaders } from "../src/edge.ts";

const THEME = { } as never;
const env = { HOST_SUFFIX: "ascend.example.com", ENVIRONMENT: "production" as const };
const ctx = {} as ExecutionContext;
const app = { fetch: () => new Response("the app") };
const call = (worker: ReturnType<typeof edge>, url: string, host?: string) =>
  worker.fetch(new Request(url, { headers: host ? { host } : {} }), env, ctx);

const marketing = edge(app, { surface: "marketing", pages: ["/", "/privacy"], apex: true, theme: async () => THEME });
const ops = edge(app, { surface: "ops", theme: async () => THEME });

test("only the public surfaces may be indexed", () => {
  assert.deepEqual(["marketing", "website", "portal", "ops", "tenant", "api"].filter(indexable as never),
    ["marketing", "website"]);
});

test("every response carries the policy, and development is spared HSTS", () => {
  const h = withSecurityHeaders(new Response("x"), env).headers;
  assert.match(h.get("content-security-policy")!, /script-src 'self'/);
  assert.equal(h.get("x-frame-options"), "DENY");
  assert.ok(h.get("strict-transport-security"));
  assert.equal(withSecurityHeaders(new Response("x"), { ...env, ENVIRONMENT: "development" }).headers.get("strict-transport-security"), null);
});

test("a header the app set itself is left alone", () => {
  const res = withSecurityHeaders(new Response("x", { headers: { "x-frame-options": "SAMEORIGIN" } }), env);
  assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN");
});

test("the apex Worker sends www to the bare suffix, keeping the path", async () => {
  const r = await call(marketing, "https://www.ascend.example.com/privacy?a=1", "www.ascend.example.com");
  assert.equal(r.status, 301);
  assert.equal(r.headers.get("location"), "https://ascend.example.com/privacy?a=1");
});

test("a Worker that is not the apex leaves www alone", async () => {
  assert.equal((await call(ops, "https://www.ascend.example.com/", "www.ascend.example.com")).status, 200);
});

test("plain http moves to https on the same host", async () => {
  const r = await call(ops, "http://ops.ascend.example.com/x", "ops.ascend.example.com");
  assert.equal(r.status, 301);
  assert.equal(r.headers.get("location"), "https://ops.ascend.example.com/x");
});

test("a public surface invites indexing and names its sitemap; a portal refuses", async () => {
  assert.match(await (await call(marketing, "https://ascend.example.com/robots.txt")).text(), /Allow: \/\nSitemap: /);
  assert.match(await (await call(ops, "https://ops.ascend.example.com/robots.txt")).text(), /Disallow: \//);
});

test("the sitemap lists the pages it was given, and is 404 where nothing may be indexed", async () => {
  const xml = await (await call(marketing, "https://ascend.example.com/sitemap.xml")).text();
  assert.match(xml, /<loc>https:\/\/ascend.example.com\/privacy<\/loc>/);
  assert.equal((await call(ops, "https://ops.ascend.example.com/sitemap.xml")).status, 404);
});

test("/_ui/base.css is served by the Worker itself, cached for a year", async () => {
  const r = await call(ops, "https://ops.ascend.example.com/_ui/base.css");
  assert.equal(r.headers.get("content-type"), "text/css; charset=utf-8");
  assert.match(r.headers.get("cache-control")!, /immutable/);
});

test("anything else is the app's, with the policy added", async () => {
  const r = await call(ops, "https://ops.ascend.example.com/anything");
  assert.equal(await r.text(), "the app");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
});

test("robots for an unknown surface still refuses rather than inviting", () => {
  assert.match(robots("https://x", false).headers.get("content-type")!, /text\/plain/);
});
