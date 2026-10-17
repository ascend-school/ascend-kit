import { test } from "node:test";
import assert from "node:assert/strict";
import { customHostProblem, isValidSlug, platformHost, portalHost, routeHost, websiteHost } from "../src/hosts.ts";

const S = "ascend.naptrixlabs.com";
const ROOT = "naptrixlabs.com";

test("a school gets a website at <slug>.<suffix> and a portal at <slug>.portal.<suffix>", () => {
  assert.equal(websiteHost("greenfield", S), "greenfield.ascend.naptrixlabs.com");
  assert.equal(portalHost("greenfield", S), "greenfield.portal.ascend.naptrixlabs.com");
  assert.equal(websiteHost("greenfield", "ourdomain.com"), "greenfield.ourdomain.com");
  assert.equal(portalHost("greenfield", "ourdomain.com"), "greenfield.portal.ourdomain.com");
  assert.equal(platformHost("ops", S), "ops.ascend.naptrixlabs.com");
  assert.equal(platformHost("tenant", S), "tenant.ascend.naptrixlabs.com");
  assert.equal(platformHost("api", S), "core.ascend.naptrixlabs.com");
  assert.equal(platformHost("marketing", S), S);
});

test("each host reaches its own portal", () => {
  assert.deepEqual(routeHost(S, S), { surface: "marketing" });
  assert.deepEqual(routeHost(`www.${S}`, S), { surface: "marketing" });
  assert.deepEqual(routeHost(`OPS.${S}:443`, S), { surface: "ops" });
  assert.deepEqual(routeHost(`tenant.${S}`, S), { surface: "tenant" });
  assert.deepEqual(routeHost(`core.${S}`, S), { surface: "api" });
  assert.deepEqual(routeHost(`greenfield.${S}`, S), { surface: "website", host: `greenfield.${S}`, slug: "greenfield" });
  assert.deepEqual(routeHost(`greenfield.portal.${S}`, S), { surface: "portal", host: `greenfield.portal.${S}`, slug: "greenfield" });
  assert.deepEqual(routeHost("www.greenfieldschool.in", S), { surface: "custom", host: "www.greenfieldschool.in" });
});

test("anything else under the suffix, or a reserved label, is nobody", () => {
  assert.equal(routeHost(`a.b.${S}`, S).surface, "none");
  assert.equal(routeHost(`a.b.portal.${S}`, S).surface, "none");
  assert.equal(routeHost(`portal.${S}`, S).surface, "none");
  assert.equal(routeHost(`admin.${S}`, S).surface, "none");
  assert.equal(routeHost(`ops.portal.${S}`, S).surface, "none");
});

test("schools cannot take platform or phishing-friendly names", () => {
  for (const bad of ["ops", "tenant", "core", "portal", "www", "admin", "login", "ab", "-ox", "ox-", "Ox", "a_b", "a.b"]) assert.equal(isValidSlug(bad), false, bad);
  for (const ok of ["oxford", "oxford-jagtial", "dps2", "zphs-raikal"]) assert.equal(isValidSlug(ok), true, ok);
});

test("a school's own domain must be a subdomain it controls, never ours", () => {
  assert.equal(customHostProblem("erp.oxfordschool.in", S, ROOT), null);
  assert.equal(customHostProblem("school.oxford.co.in", S, ROOT), null);
  assert.match(customHostProblem("oxfordschool.in", S, ROOT)!, /subdomain/);
  assert.match(customHostProblem("x.naptrixlabs.com", S, ROOT)!, /belongs to Ascend/);
  assert.match(customHostProblem(`evil.${S}`, S, ROOT)!, /belongs to Ascend/);
  assert.match(customHostProblem("10.0.0.1", S, ROOT)!, /IP/);
  assert.equal(customHostProblem("erp.other.co.in", "ascend.example.co.in", "example.co.in"), null, "the root is the configured domain, not the last two labels");
  assert.match(customHostProblem("erp.example.co.in", "ascend.example.co.in", "example.co.in")!, /belongs to Ascend/);
});
