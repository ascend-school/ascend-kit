//
//  catalogue.ts
//  ascend-kit
//
//  Created by Prakash on 17/10/26.
//

/**
 * Plans in words, shared by the marketing site and the Tenant Portal so both describe a
 * plan the same way. Core reads the catalogue; these only say it.
 */

/** What each core module gives every school, in a line. */
export const CORE_LINE: Record<string, string> = {
  student_master: "Every student's record, guardians and documents",
  staff_master: "Staff records, documents and sign-ins",
  academic_structure: "Academic year, terms, holidays, classes and sections",
  notification_engine: "Notices to staff and parents, in the portal",
};
/** Platform basics every plan has today. */
export const CORE_BASICS = ["Go live from your own Excel files, checked row by row", "Roles: each person sees only their own work", "Your school's own portal address, on any phone or computer"];

// Features a module already names (branded parent app, auto timetable) are left out so a plan never lists one thing twice.
export const FEATURE_LABEL: Record<string, string> = {
  "fees.online_payment": "Online fee payment", "fees.whatsapp_reminders": "Fee reminders on WhatsApp",
  "fees.late_fines": "Late fines", "exams.report_card_templates": "Report card templates", "parent_app.pay_online": "Parents pay from their phone",
  "timetable.clash_detection": "Timetable clash checks",
  "school.website": "Your school's public website", "school.custom_domain": "Your own domain", "support.priority": "Priority support",
  "support.dedicated_manager": "A dedicated account manager",
};
export const LIMITS: [string, string, (v: number) => string][] = [
  ["limit.students", "Students included", (v) => v.toLocaleString("en-IN")], ["limit.admin_users", "Office accounts", (v) => String(v)],
  ["limit.branches", "Schools and branches", (v) => String(v)],
];
export type FeatureRow = { plan_key: string; feature: string; enabled: number; limit_value: number | null };

/** One line per plan, so each card says who it is for. */
export const PLAN_TAGLINE: Record<string, string> = {
  starter: "Get off paper: records, attendance, fee receipts, notices and the timetable.",
  standard: "Your school website today, with certificates and admissions as they arrive.",
  premium: "Exam & Evals today: suggested marks for answer sheets, and answer keys. Then the money side: fee collection, payroll and transport.",
  group: "Every school and branch of your trust in one account, side by side.",
};

/** Who each plan is for, on its card. Standard is the plan most schools buy, so it is the highlighted one. */
export const PLAN_BADGE: Record<string, string> = { standard: "Most schools", premium: "For growing schools", group: "For trusts and chains" };

export type PlanStep = { key: string; name: string; sort: number; added: { key: string; name: string }[] };

/**
 * What a school can use today. A module not listed here is sold in a plan but still being
 * built, and every page that lists modules says so. Move a module here when it ships.
 */
export const MODULE_READY: Record<string, "ready" | "partly"> = {
  student_master: "ready", staff_master: "ready", academic_structure: "ready", student_info: "ready", multi_branch: "ready",
  attendance: "ready", fees_basic: "ready", communication: "ready", timetable_manual: "ready", id_cards: "ready", parent_app_basic: "ready",
  certificates: "ready", homework: "ready", leave: "ready", admissions: "ready", compliance: "ready", fees_advanced: "ready", owner_dashboard: "ready",
  notification_engine: "partly", exams: "partly",
};
/** Plan features usable today (or services Ascend provides); the rest are coming. */
export const FEATURE_READY = new Set(["school.website", "school.custom_domain", "support.priority", "support.dedicated_manager"]);
export const READY_NOTE: Record<string, string> = {
  notification_engine: "notices in the portal today; SMS and WhatsApp coming",
  exams: "answer-sheet evaluation today; marks entry and report cards coming",
};
/** A module in a list, with its state when it is not fully ready. Labels are plain text; callers escape nothing else. */
export function moduleItem(m: { key: string; name: string }, escape: (s: string) => string): string {
  const state = MODULE_READY[m.key];
  if (state === "ready") return `<li>${escape(m.name)}</li>`;
  // The note sits outside the pill: a pill never wraps, and a long note would push a narrow plan card wide.
  if (state === "partly") return `<li>${escape(m.name)} <span class="soon">Partly ready</span>${READY_NOTE[m.key] ? `<span class="muted">: ${escape(READY_NOTE[m.key]!)}</span>` : ""}</li>`;
  return `<li>${escape(m.name)} <span class="soon">Coming soon</span></li>`;
}

/** ₹1,23,450 from paise, the Indian grouping. */
export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export type Cycle = "yearly" | "monthly";
/** Paying for the year costs ten months: two months free against paying monthly. */
export const MONTHS_IN_YEARLY_PRICE = 10;
export const PERIOD: Record<Cycle, string> = { yearly: "a year", monthly: "a month" };
/** A yearly price in the given cycle: the same for yearly, a tenth for monthly. */
export const perCycle = (yearlyPaise: number, cycle: Cycle) => (cycle === "yearly" ? yearlyPaise : Math.round(yearlyPaise / MONTHS_IN_YEARLY_PRICE));
