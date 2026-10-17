//
//  domain-ui.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

import { esc } from "../../html.ts";
import type { SchoolSurface } from "../../hosts.ts";
import { actionForm, button, field, mark, panel, register, select } from "../../ui/kit.ts";

/** A school's own address as core lists it (core's domain/domains.ts DomainView), with the DNS records to add. */
export type DnsInstruction = { type: "CNAME" | "TXT"; name: string; value: string; purpose: "routing" | "ownership" | "ssl" };
export type DomainView = {
  id: string; school_id: string; hostname: string; target: SchoolSurface; cf_id: string | null;
  status: "pending" | "active" | "failed"; last_error: string | null; created_at: string; verified_at: string | null; records: DnsInstruction[];
};

/** The same custom-domain panel in the Ops and Tenant Portals. */
export function domainSection(opts: { base: string; domains: DomainView[]; canEdit: boolean; fallback: string; websiteIncluded: boolean }): string {
  const list = opts.domains.map((d) => {
    const records = d.status === "active" ? "" : `<div class="stack" style="--gap:.6rem;margin-top:.75rem">
<p class="small muted">Add these at the school's domain provider, then check.</p>
<div class="panel"><div class="flush">${register([{ label: "Type" }, { label: "Name" }, { label: "Value" }],
      d.records.map((r) => [esc(r.type), `<code>${esc(r.name)}</code>`, `<code>${esc(r.value)}</code>`]), { title: "No records" })}</div></div>
${d.last_error ? `<p class="error-text">${esc(d.last_error)}</p>` : ""}</div>`;
    const actions = `<div class="cluster">${d.status === "active" ? "" : actionForm(`${opts.base}/${d.id}/check`, "Check now")}${opts.canEdit
      ? actionForm(`${opts.base}/${d.id}/remove`, `Remove`, { variant: "danger", confirm: `Remove ${d.hostname}? The school stops answering at that address.` }) : ""}</div>`;
    const state = d.status === "active" ? mark("paid", "Live", d.verified_at ? d.verified_at.slice(0, 10) : undefined) : mark("sent", "Waiting", "for DNS");
    return `<div class="panel" style="padding:1rem 1.15rem"><div class="split"><div><strong>${esc(d.hostname)}</strong><div class="small muted">Shows the ${d.target === "portal" ? "school portal" : "school website"}</div></div>
<div class="cluster">${state}${actions}</div></div>${records}</div>`;
  }).join("");
  const add = opts.canEdit ? `<form class="form" method="post" action="${esc(opts.base)}"><div class="fields">
${field("The school's own address", "hostname", { required: true, placeholder: "www.yourschool.in", hint: `A subdomain the school controls. It points (CNAME) at ${opts.fallback}.` })}
${select("Shows", "target", [...(opts.websiteIncluded ? [["website", "The school website"] as [string, string]] : []), ["portal", "The school portal"]], opts.websiteIncluded ? "website" : "portal", { id: "f-target" })}
</div><div>${button("Add domain", { icon: "plus" })}</div></form>` : "";
  return panel({ title: "Own domain", lead: "A school can use its own address for its website or portal.", body: `<div class="stack">${list || '<p class="muted small">None yet.</p>'}${add}</div>` });
}
