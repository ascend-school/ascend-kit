//
//  escape.test.ts
//  ascend-cloud
//
//  Created by Prakash on 17/10/26.
//

import { test } from "node:test";
import assert from "node:assert/strict";
import { field, modal, pageHead, panel } from "../src/ui/kit.ts";

test("panel, modal and page-head leads are escaped as plain text", () => {
  const p = panel({ lead: "<b>x</b>", title: "t", body: "" });
  assert.ok(p.includes("<p>&lt;b&gt;x&lt;/b&gt;</p>"));
  assert.ok(!p.includes("<b>"));
  const m = modal({ id: "m", title: "t", lead: "<meta>", body: "" });
  assert.ok(m.includes("<p>&lt;meta&gt;</p>"));
  assert.ok(!m.includes("<meta>"));
  const h = pageHead("t", "<i>");
  assert.ok(h.includes("<p>&lt;i&gt;</p>"));
  assert.ok(!h.includes("<i>"));
});

test("the html escape hatch passes markup through", () => {
  assert.ok(panel({ title: "t", leadHtml: "<b>x</b>", body: "" }).includes("<p><b>x</b></p>"));
  assert.ok(modal({ id: "m", title: "t", leadHtml: "<b>x</b>", body: "" }).includes("<p><b>x</b></p>"));
  assert.ok(pageHead("t", { html: "<b>x</b>" }).includes("<p><b>x</b></p>"));
});

test("a number field carries its step and range, so half marks and whole numbers both pass the browser's check", () => {
  const f = field("Marks", "marks", { type: "number", min: "0.5", step: "0.5", max: "10" });
  assert.ok(f.includes(' min="0.5" step="0.5" max="10"'));
  assert.ok(!field("Name", "name").includes("step="), "no step unless asked");
  assert.ok(field("Pages", "pages", { type: "file", multiple: true }).includes(" multiple"));
});
