//
//  site.ts
//  ascend-kit
//
//  Created by Prakash on 17/10/26.
//

import type { FeatureRow, PlanStep } from "../catalogue.ts";

/** What the school writes in the School Portal. Every field is optional; empty ones are hidden. */
export type SiteContent = {
  about?: string;
  principalName?: string;
  principalMessage?: string;
  admissions?: string;
  facilities?: string;     // one per line
  phone?: string;
  email?: string;
  mapUrl?: string;
};

export type SitePhoto = { id: string; key: string; caption: string | null };

/** Read from the school's records. Never typed into the website screen. */
export type SiteFacts = {
  board: string | null;
  affiliationNo: string | null;
  address: string | null;
  town: string | null;
  logoKey: string | null;
  days: string | null;     // 'Monday to Saturday'
  hours: string | null;    // '08:30 to 15:30'
  holidays: { name: string; startsOn: string; endsOn: string }[];
  classes: string[];
};

export type SiteSnapshot = {
  schoolId: string;
  name: string;
  content: SiteContent;
  photos: SitePhoto[];
  facts: SiteFacts;
  publishedAt: string | null;
  composedAt: string;
  /** Last day the gate's answer is known to hold (a timed override ends). The KV copy expires by then. */
  gateHoldsUntil: string | null;
};

export type Catalogue = { plans: PlanStep[]; core: { key: string; name: string }[]; addons: { name: string }[]; features: FeatureRow[] };

/** The demo form as posted, trimmed. `website` is the hidden field only a bot fills. */
export type DemoRequest = { ip?: string; name?: string; school?: string; town?: string; strength?: string; mobile?: string; website?: string };

/** A school's public website: the published snapshot (null until it publishes, or without the plan), its logo already in it. */
export type Website = { school: { slug: string; name: string }; snapshot: SiteSnapshot | null; hasLogo: boolean };

/** What the marketing site and the school website ask core: binding CORE, entrypoint SiteApi. */
export interface SiteApi {
  catalogue(): Promise<Catalogue>;
  /** "invalid" when a required field is missing; "thanks" when stored, or when a bot is quietly ignored. Throws AppError 429 past a limit. */
  requestDemo(d: DemoRequest): Promise<"thanks" | "invalid">;
  /** null when no school is served at the host, or it is suspended. */
  website(host: string): Promise<Website | null>;
  /** The school's logo, or a gallery photo its published snapshot names; null when there is none. */
  media(host: string, id: string): Promise<Response | null>;
}
