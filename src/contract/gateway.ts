//
//  gateway.ts
//  ascend-kit
//
//  Created by Prakash on 17/10/26.
//

import type { SchoolSurface } from "../hosts.ts";
import type { Theme } from "../ui/themes.ts";

export type ResolvedSite = { target: SchoolSurface; school: { id: string; slug: string; name: string; status: "onboarding" | "live" | "suspended" } };

/** What the gateway asks core: binding CORE, entrypoint GatewayApi. */
export interface GatewayApi {
  /** The school an address belongs to and which of its two faces it shows; null when nothing is served there. */
  resolve(host: string): Promise<ResolvedSite | null>;
  /** The theme Ops chose, for /_ui/theme.css. */
  activeTheme(): Promise<Theme>;
}
