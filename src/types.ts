//
//  types.ts
//  ascend-kit
//
//  Created by Prakash on 17/10/26.
//

/** Ops roles (PRD, Ascend Ops Portal). */
export type OpsRole = "super_admin" | "sales" | "onboarding" | "support" | "finance";

/** Tenant roles (PRD, Tenant Portal). */
export type TenantRole = "owner" | "billing";

/** Default school roles (PRD, Platform Core §3). */
export type SchoolRole =
  | "school_owner" | "principal" | "headmaster" | "administration" | "accountant" | "teacher" | "parent";
