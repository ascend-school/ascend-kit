//
//  admissions.ts
//  ascend-kit
//
//  Created by Prakash on 04/11/26.
//

import type { AdmissionStage } from "./contract/portal.ts";

/**
 * Which admission stage may follow which. Shared, so the buttons the office is offered and
 * the moves core accepts cannot drift apart. A seat is declined from any live stage;
 * nothing moves out of a closed one.
 */
export const ADMISSION_STAGES: AdmissionStage[] = ["enquiry", "applied", "admitted", "declined", "enrolled"];

export const NEXT_STAGES: Record<AdmissionStage, AdmissionStage[]> = {
  enquiry: ["applied", "declined"],
  applied: ["admitted", "declined"],
  admitted: ["enrolled", "declined"],
  declined: [],
  enrolled: [],
};

export const isStage = (s: string): s is AdmissionStage => (ADMISSION_STAGES as string[]).includes(s);

/** Whether this move is allowed at all; the caller still checks who is asking. */
export const mayMove = (from: AdmissionStage, to: AdmissionStage): boolean => NEXT_STAGES[from].includes(to);

/** What the office is told when a move is refused. */
export const moveProblem = (from: AdmissionStage, to: AdmissionStage): string | null =>
  mayMove(from, to) ? null : NEXT_STAGES[from].length
    ? `An ${from} can only become ${NEXT_STAGES[from].join(" or ")}.`
    : `This one is ${from}; it does not move again.`;
