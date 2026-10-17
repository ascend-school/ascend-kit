//
//  ops.ts
//  ascend-kit
//
//  Created by Prakash on 17/10/26.
//

import type { OpsRole } from "../types.ts";
import type { Theme } from "../ui/themes.ts";
import type { DomainView } from "../views/shared/domain-ui.ts";
import type { Invoice, Payment, Seller } from "../views/shared/invoice-view.ts";

/** A form as posted, trimmed. Core reads the fields exactly as the Ops page did. */
export type OpsForm = Record<string, string>;

export type OpsStaff = { email: string; role: OpsRole };

export type OpsSchool = {
  id: string; tenant_id: string; slug: string; name: string; board: string | null; town: string | null;
  shard: string; status: "onboarding" | "live" | "suspended"; host_attached: number; host_error: string | null;
  hosts_attached_at: string | null; hosts_ready_at: string | null; welcome_pending: number;
};
export type OpsSchoolListRow = OpsSchool & { tenant_name: string; tenant_status: string; plan_key: string | null; welcome: string | null; created_at: string };
export type OpsLead = { id: string; name: string; school_name: string; town: string; mobile: string; student_strength: number | null; status: string; created_at: string };
export type OpsPlanRequest = { id: string; school_id: string; kind: "addon" | "plan"; item: string; note: string | null; status: string; requested_by: string; created_at: string; decided_at: string | null; school_name: string; item_name: string };
export type OpsInvoiceRow = Invoice & { school_name: string; paid_paise: number };
export type OpsPlan = { key: string; name: string };
export type OpsWelcome = { to_email: string; status: string; error: string | null; created_at: string } | null;
export type OpsSubscription = { plan_key: string; student_strength: number; term_start: string; term_end: string; status: string; billing_cycle: string; pricing: string };
export type OpsPlanPrices = OpsPlan & { included: number | null; pricePaise: number | null; minimumPaise: number | null; extraPaise: number | null; packagePaise: number | null };

/** What every school tab shows above its body: the school, its account and whether its plan has the website. */
export type OpsSchoolHead = { school: OpsSchool; tenant: { id: string; code: string; name: string; status: string } | null; websiteIncluded: boolean };

export interface OpsSchools {
  list(): Promise<OpsSchoolListRow[]>;
  /** The New tenant form: the lead it starts from (null without one) and the plans to pick. */
  newTenant(leadId?: string): Promise<{ lead: OpsLead | null; plans: OpsPlan[] }>;
  /** Creates the tenant, its school and owner. `created` is the flash the school page shows. */
  create(f: OpsForm): Promise<{ schoolId: string; created: "1" | "waiting" | "nomail" }>;
  /** Looking at the school sends its welcome once its addresses are ready (`sent`). */
  overview(id: string): Promise<OpsSchoolHead & { sent: { ok: boolean } | null; steps: { step: string; done_at: string | null }[]; welcome: OpsWelcome }>;
  subscription(id: string): Promise<OpsSchoolHead & { sub: OpsSubscription | null; billLines: string[] | null; billCycle: "yearly" | "monthly" | null; plans: OpsPlan[]; requests: OpsPlanRequest[]; invoices: OpsInvoiceRow[]; nextPeriodStart: string }>;
  owners(id: string): Promise<OpsSchoolHead & { owners: { id: string; name: string; email: string; role: string }[]; welcome: OpsWelcome }>;
  domains(id: string): Promise<OpsSchoolHead & { domains: DomainView[]; fallback: string }>;
  /** Returns the school page to go back to and the flash (sent, nolink or failed). */
  resendWelcome(tenantId: string): Promise<{ schoolId: string; welcome: "sent" | "nolink" | "failed" }>;
  changeEmail(schoolId: string, personId: string, email: string): Promise<{ schoolId: string; rearmed: boolean }>;
  setAccountStatus(tenantId: string, status: string): Promise<{ schoolId: string; status: "active" | "suspended" }>;
  setSubscription(id: string, f: OpsForm): Promise<{ schoolId: string }>;
  decideRequest(id: string, requestId: string, approve: boolean): Promise<{ schoolId: string }>;
  attach(id: string): Promise<{ schoolId: string }>;
  requestDomain(id: string, hostname: string, target: string): Promise<{ schoolId: string }>;
  checkDomain(id: string, domainId: string): Promise<{ schoolId: string }>;
  removeDomain(id: string, domainId: string): Promise<{ schoolId: string }>;
  /** Takes an address away from whichever school holds it. */
  releaseDomain(hostname: string): Promise<void>;
  issueInvoice(id: string, periodStart: string): Promise<{ invoiceId: string }>;
}

export interface OpsInvoices {
  list(status?: string): Promise<OpsInvoiceRow[]>;
  get(id: string): Promise<{ inv: Invoice; payments: Payment[]; schoolName: string; tenantName: string }>;
  recordPayment(id: string, f: OpsForm): Promise<{ invoiceId: string }>;
  void(id: string, reason: string): Promise<void>;
}

export interface OpsSettings {
  get(): Promise<{ theme: Theme; prices: OpsPlanPrices[]; seller: Seller }>;
  setTheme(key: string): Promise<void>;
  setPrices(f: OpsForm): Promise<void>;
  setSeller(f: OpsForm): Promise<void>;
}

/**
 * A verified Ops session. Every method re-reads the staff member's role and status, as the
 * Ops page did on each request: a disabled account is refused at once (401), a role without
 * the job is refused (403).
 */
export interface OpsSession {
  info(): Promise<OpsStaff>;
  /** The Overview's figures. Demo requests only for sales, unpaid invoices only for billing; empty otherwise. */
  overview(): Promise<{ leads: OpsLead[]; schools: OpsSchoolListRow[]; requests: OpsPlanRequest[]; unpaid: OpsInvoiceRow[] }>;
  leads(): Promise<OpsLead[]>;
  readonly schools: OpsSchools;
  readonly invoices: OpsInvoices;
  readonly settings: OpsSettings;
}

/** What the Ops Portal asks core: binding CORE, entrypoint OpsApi. `ip` is cf-connecting-ip, for the rate limits. */
export interface OpsApi {
  /** Throws AppError 401 for a wrong password, 429 past a limit. */
  signIn(o: { email: string; password: string; ip?: string }): Promise<{ setCookie: string }>;
  requestReset(o: { email: string; ip?: string }): Promise<void>;
  /** Ends this session (when there is one) and returns the cookie that clears it. */
  signOut(o: { cookie: string }): Promise<{ setCookie: string }>;
  /** The cookie that clears the Ops session, for a 401 page. */
  clearCookie(): Promise<string>;
  /** The development sign-in stand-in's password, while it is active; null otherwise. */
  devHint(): Promise<string | null>;
  /** null when the cookie holds no valid Ops session (missing, expired, revoked). */
  open(o: { cookie: string }): Promise<OpsSession | null>;
}
