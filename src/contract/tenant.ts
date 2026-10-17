//
//  tenant.ts
//  ascend-kit
//
//  Created by Prakash on 17/10/26.
//

import type { FeatureRow, PlanStep } from "../catalogue.ts";
import type { TenantRole } from "../types.ts";

/** A school as every school page needs it. `ready` = its addresses have their certificates. */
export type TenantSchool = { id: string; name: string; slug: string; ready: boolean };

/** A file posted to the app, passed on as bytes. */
export type Upload = { name: string; type: string; bytes: ArrayBuffer };

/** What the shell shows, and a reissued cookie when the session is past half its life. */
export type TenantInfo = { tenant: { name: string; code: string }; user: { name: string }; role: TenantRole; cookie: string | null };

export type SchoolListing = TenantSchool & { plan_key: string | null; student_strength: number | null; term_end: string | null };

export type Subscription = { plan_key: string; student_strength: number; term_start: string; term_end: string; status: string; billing_cycle: string; pricing: string };

export type SchoolOverview = {
  school: TenantSchool;
  /** The school's own profile, in words: the board as its label, the hours as one line. */
  profile: { name: string; board: string; affiliationNo: string; address: string; academicYear: string; hours: string };
  counts: { students: number; staff: number; classes: number };
  sub: Subscription | null;
  hasWebsite: boolean;
  hasLogo: boolean;
};

export type RequestKind = "addon" | "plan";
export type OpenRequest = { id: string; kind: RequestKind; item: string; item_name: string; created_at: string };

export type SubscriptionPage = {
  school: TenantSchool;
  /** null when the school has no plan yet. */
  plan: {
    sub: Subscription;
    plans: { key: string; name: string; sort: number }[];
    core: { key: string; name: string }[];
    steps: PlanStep[];
    /** Feature keys the school can use, of those the kit names. */
    features: string[];
    /** The plan's own feature rows, for its limits. */
    limits: FeatureRow[];
    /** Names of the add-ons the school has on. */
    addons: string[];
    open: OpenRequest[];
    bill: { cycle: "yearly" | "monthly"; lines: string[] } | null;
  } | null;
};

export type AddonRow = { key: string; name: string; on: boolean; needs: string[]; pending: { id: string; created_at: string } | null };
/** `addons` is null when the school has no plan yet. */
export type AddonsPage = { school: TenantSchool; addons: AddonRow[] | null };

export type InvoiceStatus = "issued" | "part_paid" | "paid" | "void";
export type InvoiceRow = { id: string; number: string; due_on: string; period_start: string; period_end: string; total_paise: number; paid_paise: number; status: InvoiceStatus };

/** One invoice, with what is paid and how to pay worked out by core. */
export type InvoiceDoc = {
  number: string; status: InvoiceStatus; issued_on: string; due_on: string; period_start: string; period_end: string;
  cycle: "yearly" | "monthly"; pricing: string; students: number; subtotal_paise: number; gst_paise: number; total_paise: number; void_reason: string | null;
  seller: { legalName: string; address: string; gstin: string; email: string };
  lines: { label: string; amount_paise: number }[];
  /** `method` is already in words ("UPI", "bank transfer"). */
  payments: { received_on: string; amount_paise: number; method: string; reference: string | null }[];
  paid: number;
  outstanding: number;
  /** Empty when Ascend's billing details are not set. */
  howToPay: string;
  schoolName: string;
  tenantName: string;
};

export type DomainView = {
  id: string; hostname: string; target: "website" | "portal"; status: "pending" | "active" | "failed";
  last_error: string | null; verified_at: string | null; records: { type: string; name: string; value: string }[];
};
export type DomainsPage = { school: TenantSchool; domains: DomainView[]; websiteIncluded: boolean; fallback: string };

/** Every method checks the school belongs to the signed-in tenant (404) and, for a change, that the caller is its owner (403). */
export interface TenantSchools {
  list(): Promise<SchoolListing[]>;
  add(s: { name: string; slug: string }): Promise<{ id: string }>;
  overview(schoolId: string): Promise<SchoolOverview>;
  logo(schoolId: string): Promise<Response>;
  /** null file: nothing was chosen (400, after the owner and school checks). */
  setLogo(schoolId: string, file: Upload | null): Promise<void>;
}

export interface TenantPlan {
  subscription(schoolId: string): Promise<SubscriptionPage>;
  addons(schoolId: string): Promise<AddonsPage>;
  request(schoolId: string, r: { kind: RequestKind; item: string; note: string }): Promise<void>;
  withdraw(schoolId: string, requestId: string): Promise<void>;
}

export interface TenantInvoices {
  list(schoolId: string): Promise<{ school: TenantSchool; invoices: InvoiceRow[] }>;
  get(schoolId: string, invoiceId: string): Promise<InvoiceDoc>;
}

export interface TenantDomains {
  list(schoolId: string): Promise<DomainsPage>;
  add(schoolId: string, d: { hostname: string; target: "website" | "portal" }): Promise<void>;
  check(schoolId: string, domainId: string): Promise<void>;
  remove(schoolId: string, domainId: string): Promise<void>;
}

/** The verified tenant member. Membership and role are re-read when it is opened. */
export interface TenantSession {
  info(): Promise<TenantInfo>;
  readonly schools: TenantSchools;
  readonly plan: TenantPlan;
  readonly invoices: TenantInvoices;
  readonly domains: TenantDomains;
}

export type SetPasswordResult = { ok: true; email: string; schools: { name: string; slug: string; ready: boolean }[] } | { ok: false; message: string };

/** What the Tenant Portal asks core: binding CORE, entrypoint TenantApi. `ip` is cf-connecting-ip, for the rate limits. */
export interface TenantApi {
  /** Throws AppError 401 for a wrong password, 429 past a limit. */
  signIn(r: { email: string; password: string; ip?: string }): Promise<{ setCookie: string }>;
  requestReset(r: { email: string; ip?: string }): Promise<void>;
  /** Ends this session (every copy of its cookie); the clearing cookie comes back either way. */
  signOut(r: { cookie: string }): Promise<{ setCookie: string }>;
  clearCookie(): Promise<string>;
  /** The development sign-in password, while the Firebase stand-in is active; otherwise null. */
  devHint(): Promise<string | null>;
  setPasswordLink(token: string): Promise<{ ok: true; name: string; email: string } | { ok: false; message: string }>;
  setPassword(r: { token: string; password: string; confirm: string }): Promise<SetPasswordResult>;
  /** null without a valid session; throws AppError 401 when the person is no longer an active member. */
  open(r: { cookie: string }): Promise<TenantSession | null>;
}
