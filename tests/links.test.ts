//
//  links.test.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

import { test } from "node:test";
import assert from "node:assert/strict";
import { href } from "../src/html.ts";

test("a link to another address opens in a new tab; a path in this portal does not", () => {
  assert.equal(href("https://tenant.ascend.naptrixlabs.com"), 'href="https://tenant.ascend.naptrixlabs.com" target="_blank" rel="noopener"');
  assert.equal(href("http://greenfield.portal.localhost:8788/setup"), 'href="http://greenfield.portal.localhost:8788/setup" target="_blank" rel="noopener"');
  assert.equal(href("/students"), 'href="/students"');
  assert.equal(href("#plans"), 'href="#plans"');
  assert.equal(href("mailto:support@naptrixlabs.com"), 'href="mailto:support@naptrixlabs.com"');
});

test("the address is escaped", () => {
  assert.equal(href('/x?a="b"&c'), 'href="/x?a=&quot;b&quot;&amp;c"');
});

test("only http, https, mailto, tel and relative links pass; script and data URLs become #", () => {
  assert.equal(href("javascript:alert(1)"), 'href="#"');
  assert.equal(href("  JavaScript:alert(1)"), 'href="#"');
  assert.equal(href("java\tscript:alert(1)"), 'href="#"');
  assert.equal(href("data:text/html,<script>alert(1)</script>"), 'href="#"');
  assert.equal(href("vbscript:x"), 'href="#"');
  assert.equal(href("tel:+919876543210"), 'href="tel:+919876543210"');
  assert.equal(href("HTTPS://x.in"), 'href="HTTPS://x.in" target="_blank" rel="noopener"');
  assert.equal(href("setup?tab=1"), 'href="setup?tab=1"');
});
