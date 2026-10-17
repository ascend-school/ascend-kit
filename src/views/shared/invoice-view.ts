//
//  invoice-view.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

import { esc } from "../../html.ts";
import { document, icon, linkButton, mark, type Tone } from "../../ui/kit.ts";
import { rupees, type Cycle } from "../../catalogue.ts";

// The invoice as core stores it, and the pure rules the page reads; copied from core's domain/invoices.ts, which keeps the originals.
export type Seller = { legalName: string; address: string; gstin: string; upiId: string; bankName: string; accountName: string; accountNumber: string; ifsc: string; email: string };
export type InvoiceLine = { label: string; amount_paise: number };
export type InvoiceStatus = "issued" | "part_paid" | "paid" | "void";
export type Invoice = {
  id: string; number: string; school_id: string; tenant_id: string; period_start: string; period_end: string; plan_key: string; cycle: Cycle; pricing: "per_student" | "package";
  students: number; lines: string; subtotal_paise: number; gst_paise: number; total_paise: number; seller: string; status: InvoiceStatus;
  issued_on: string; due_on: string; paid_on: string | null; void_reason: string | null; created_at: string;
};
export type Payment = { id: string; invoice_id: string; amount_paise: number; method: string; reference: string | null; received_on: string; created_at: string };

export const METHODS: Record<string, string> = { upi: "UPI", bank_transfer: "Bank transfer", cheque: "Cheque", cash: "Cash" };
/** How it was paid, mid-sentence: "by UPI", "by bank transfer". */
export const methodInText = (method: string) => (method === "upi" ? "UPI" : (METHODS[method] ?? method).toLowerCase());
export const STATUS_LABEL: Record<InvoiceStatus, string> = { issued: "Due", part_paid: "Part paid", paid: "Paid", void: "Void" };
export const paidSoFar = (payments: Payment[]) => payments.reduce((n, p) => n + p.amount_paise, 0);

/** What is still owed, and the status the payments so far give. */
export function paymentState(totalPaise: number, paidPaise: number): { status: Exclude<InvoiceStatus, "void">; outstanding: number } {
  const outstanding = Math.max(0, totalPaise - paidPaise);
  return { status: outstanding === 0 ? "paid" : paidPaise > 0 ? "part_paid" : "issued", outstanding };
}

/** How to pay, in words, from Ascend's billing details. Empty when none are set. */
export function payInstructions(s: Seller): string {
  const lines = [s.upiId ? `UPI: ${s.upiId}` : "", s.accountNumber ? `Bank transfer: ${s.accountName || s.legalName}, ${s.bankName}, account ${s.accountNumber}, IFSC ${s.ifsc}` : ""].filter(Boolean);
  return lines.length ? `${lines.join("\n")}\nPlease quote the invoice number with your payment.` : "";
}

const TONE: Record<string, Tone> = { issued: "due", part_paid: "sent", paid: "paid", void: "info" };
export const invoiceMark = (status: Invoice["status"]) => mark(TONE[status] ?? "info", STATUS_LABEL[status]);

/**
 * One invoice as a printable page, the same in Ops and the Tenant Portal. The bar above it
 * (back, print, Ops actions) is hidden when printing; what prints is the invoice alone.
 */
export function invoicePage(o: { inv: Invoice; payments: Payment[]; schoolName: string; tenantName: string; back: { href: string; label: string }; actions?: string; flash?: string }): string {
  const { inv, payments } = o;
  const seller = JSON.parse(inv.seller) as Seller;
  const lines = JSON.parse(inv.lines) as InvoiceLine[];
  const paid = paidSoFar(payments);
  const { outstanding } = paymentState(inv.total_paise, paid);
  const how = payInstructions(seller);
  const title = seller.gstin ? "Tax invoice" : "Invoice";
  const body = `<div class="invoice-bar no-print">${linkButton(o.back.href, o.back.label, { variant: "quiet", small: true })}
<button type="button" class="sm" data-print>${icon("receipt")} Print or save as PDF</button>${o.actions ?? ""}</div>${o.flash ?? ""}
<article class="invoice" aria-label="${esc(title)} ${esc(inv.number)}">
<header class="invoice-head"><div><h1>${esc(title)}</h1><p class="muted">${esc(inv.number)}</p></div><div class="invoice-status">${invoiceMark(inv.status)}</div></header>
<div class="invoice-parties"><div><h2>From</h2><p><strong>${esc(seller.legalName)}</strong>${seller.address ? `<br>${esc(seller.address).replace(/\n/g, "<br>")}` : ""}${seller.gstin ? `<br>GSTIN ${esc(seller.gstin)}` : ""}${seller.email ? `<br>${esc(seller.email)}` : ""}</p></div>
<div><h2>Billed to</h2><p><strong>${esc(o.tenantName)}</strong><br>${esc(o.schoolName)}</p></div>
<div><h2>Details</h2><p>Issued ${esc(inv.issued_on)}<br>Due ${esc(inv.due_on)}<br>Period ${esc(inv.period_start)} to ${esc(inv.period_end)}<br>${esc(inv.cycle === "monthly" ? "Monthly" : "Yearly")}, ${esc(inv.pricing === "package" ? "package" : "per student")}, ${esc(inv.students.toLocaleString("en-IN"))} students on the records</p></div></div>
<table class="invoice-lines"><thead><tr><th scope="col">Item</th><th scope="col" class="r">Amount</th></tr></thead><tbody>
${lines.map((l) => `<tr><td>${esc(l.label)}</td><td class="r">${esc(rupees(l.amount_paise))}</td></tr>`).join("")}</tbody>
<tfoot><tr><th scope="row">Subtotal</th><td class="r">${esc(rupees(inv.subtotal_paise))}</td></tr>
${inv.gst_paise ? `<tr><th scope="row">GST 18%</th><td class="r">${esc(rupees(inv.gst_paise))}</td></tr>` : ""}
<tr class="total"><th scope="row">Total</th><td class="r">${esc(rupees(inv.total_paise))}</td></tr>
${paid ? `<tr><th scope="row">Paid</th><td class="r">${esc(rupees(paid))}</td></tr><tr class="total"><th scope="row">Still due</th><td class="r">${esc(rupees(outstanding))}</td></tr>` : ""}</tfoot></table>
${payments.length ? `<section><h2>Payments received</h2><ul class="small">${payments.map((p) => `<li>${esc(p.received_on)}: ${esc(rupees(p.amount_paise))} by ${esc(methodInText(p.method))}${p.reference ? `, ref ${esc(p.reference)}` : ""}</li>`).join("")}</ul></section>` : ""}
${inv.status === "void" ? `<p class="banner bad">Void: ${esc(inv.void_reason ?? "")}</p>` : outstanding && how ? `<section><h2>How to pay</h2><p class="small">${esc(how).replace(/\n/g, "<br>")}</p></section>` : ""}
${seller.gstin ? "" : `<p class="small muted">Issued without GST.</p>`}
</article>`;
  return document({ title: `${inv.number} · ${o.schoolName}`, body: `<main class="invoice-page" id="main">${body}</main>` });
}
