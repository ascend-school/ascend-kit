//
//  assets.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

import { BASE_CSS } from "./styles.ts";
import { themeDeclarations, type Theme } from "./themes.ts";
import { BRAND_BLUE, CREST_SMALL, SLIDES_SCRIPT, UI_SCRIPT } from "./kit.ts";
import { QUEUE_SCRIPT } from "./queue-script.ts";

/**
 * /_ui/* on every host. base.css never changes without a version bump, so it is cached
 * for a year; theme.css carries the Ops-chosen theme and is cached for a minute. Fonts
 * are self-hosted static assets under /fonts (public/fonts), declared in base.css.
 */
export async function uiAsset(path: string, activeTheme: () => Promise<Theme>): Promise<Response | null> {
  if (path === "/_ui/base.css") {
    return new Response(BASE_CSS, { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=31536000, immutable" } });
  }
  // Scripts are files, not inline, so the security policy can allow scripts from this site only.
  if (path === "/_ui/ui.js" || path === "/_ui/slides.js") {
    return new Response(path === "/_ui/ui.js" ? UI_SCRIPT : SLIDES_SCRIPT, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=3600" } });
  }
  // F-12: the phone queue for answer scripts, on its upload page only.
  if (path === "/_ui/queue.js") {
    return new Response(QUEUE_SCRIPT, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=3600" } });
  }
  if (path === "/_ui/theme.css") {
    const theme = await activeTheme();
    return new Response(`:root{${themeDeclarations(theme)}}\n`, {
      headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=60" },
    });
  }
  // The favicon is the brand, not the theme: always the small-size Crest in Ascend Indigo.
  if (path === "/_ui/icon.svg") {
    return new Response(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="${BRAND_BLUE}" fill-rule="evenodd" d="${CREST_SMALL}"/></svg>`, {
      headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=3600" },
    });
  }
  return null;
}
