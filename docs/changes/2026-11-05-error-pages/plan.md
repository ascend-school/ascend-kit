# Plan: Error pages that look like the product and lead somewhere

**Ask:** Error pages don't match the rest of the UX, and there's no good way back from them. Make them consistent, and give
clear ways to navigate back.

**What happens today** (checked in the School Portal as a teacher):
- Every 400 / 403 / 404 / 500 from core is the same bare page, outside the app: an "Ascend" mark, a red alert box, a heading, one **Home** button.
  No menu, no breadcrumbs, no school name.
- The heading is chosen by status only. "Not for your role" even when the plan or a locked key is the reason.
- A refused form (400: "Give Q2 a mark from 0 to 3…") throws the person onto that page. **Home** loses their place and what they typed.
- An unknown address uses a second design (`notFoundPage`: "This page does not exist", titled "· Ascend").
- The same in Ops, the Tenant Portal, marketing and the school website.

**Assumptions:** No new colours or components. Errors use the kit pieces every page uses (`pageHead`, `panel`, `emptyState`, `banner`).
Status codes stay as they are (the smoke asserts them).

## Acceptance criteria
1. Signed in, every error page (400, 403, 404, 409, 429, 500) renders **inside the app shell**: the same sidebar or menu, school name, user
   and breadcrumbs as other pages, so any part of the app is one click away.
2. Each page has a heading that says what happened, core's own message as the explanation, and what to do next:

   | Status | Heading | Explanation |
   |---|---|---|
   | 400 | "That didn't go through" | Core's message, for example "Give Q2 a mark from 0 to 3, in halves." |
   | 403 | "You can't open this" | Core's message |
   | 404 | "We couldn't find that" | "It may have been removed, or the link is old." |
   | 429 | "Too many tries" | Core's message |
   | 500 | "Something went wrong on our side" | "Try again in a minute. If it keeps happening, tell the school office." |

3. **Ways back**, in this order:
   1. **Go back**: returns to the page the person came from, using browser history, so a refused form still has what they typed.
      Without history (a pasted link), it goes to the referring page of this site, or else to the module.
   2. **Back to <module>**: for example "Back to Exam & Evals". It is worked out from the address with the same module map the menu uses.
   3. **Home**.
4. Unknown addresses (the router's 404) use the same in-shell page when signed in.
5. Signed out, or on public sites (marketing, school website), the plain page is used, redesigned the same way. It shows the school's
   or Ascend's name (not always "Ascend"), plus **Go back** and **Home**.
6. 401 still signs out and sends the person to sign in, with "Your session ended. Sign in again." and a return to the page they were on.
7. The same in the School Portal, Ops and the Tenant Portal; marketing and the school website get the plain version.
8. Works and reads well at 375, 768 and 1280 px.

## Impact analysis
| File | Change | Also used by |
|---|---|---|
| ascend-kit `src/common.ts` | `errorPage` split: `describeError(err)` → {status, heading, text}; `errorPage` (plain) uses it; new `errorBody(d, ways)` for in-shell pages | every app's `onError` |
| ascend-kit `src/ui/kit.ts` | `plainPage` takes a `brand`; `notFoundPage` and plain errors share one layout; `UI_SCRIPT`: `[data-back]` uses history when there is any | every app |
| ascend-school-portal `src/routes/portal.ts` | `onError` and `notFound`: in the shell via `view()` when `me` is set, else plain; module from `portalLocal` | all portal routes |
| ascend-admin `src/routes/ops.ts`, `src/views/ops.ts` | the same with Ops's shell | Ops |
| ascend-tenant-portal `src/tenant.ts` | the same with `tenantView` | Tenant Portal |
| ascend-marketing, ascend-school-website | plain version with their name | public pages |
| ascend-gateway `scripts/smoke.sh` | assertions that read error text: shell present, "Go back", headings | — |

## Existing behaviour that must not break
| Behaviour | Why it is safe |
|---|---|
| Status codes (403, 404, 400…) | unchanged; only the body changes |
| 401 clears the cookie | kept in `errorPage`; the in-shell path never handles 401 |
| Smoke checks on error text ("read-only", "tenant.localhost", "You do not have access") | core's message still shows verbatim; assertions on headings updated in the same change |
| CSRF refusal (HTTPException) | still 403-style text, now with Go back |
| An error before sign-in is known (school lookup, auth) | falls back to the plain page |
| Content-Security-Policy `script-src 'self'` | "Go back" works as a plain link; the history step is in the existing `/_ui/ui.js`, no inline script |

## Tasks (in order)
1. kit: `describeError`, `errorBody`, branded `plainPage`, `[data-back]` in `UI_SCRIPT`, tests. **Pattern:** `errorPage` (`common.ts:30`), `emptyState`, `UI_SCRIPT` (`kit.ts:72`)
2. school-portal: `onError` and `notFound` in the shell. **Pattern:** `view()` (`portal.ts:136`), `portalLocal` for the module
3. admin and tenant-portal: the same with their shells. **Pattern:** `views/ops.ts:44`, `tenantView` (`tenant.ts:37`)
4. marketing and school-website: the plain page with their name
5. smoke updates; Designer review at 375, 768, 1280 for 400, 403, 404, 500 in each app
6. kit release, and every app pointed at it (the kit is now released from `release-v1.0.3`; see the note below)

## Screens
**Error, signed in** (any address)
- Job: understand what happened and get back to work. Primary action: **Go back**.
- Layout: the normal `appShell` with breadcrumbs. `pageHead(heading, explanation)`, then one `panel` holding an `emptyState`-style block:
  **Go back** (primary), **Back to <module>** (quiet), **Home** (quiet). No red box for 404; `banner("bad")` only for 500.
  Mirrors the empty states on list pages (for example "No evals yet").
- States: a 400 after a form post keeps core's message word for word; a 403 for a plan says so ("…not in your plan" comes from core).

**Error, signed out / public**
- Job: the same. Layout: `plainPage` with the school's crest and name or Ascend's, the heading, the explanation, then **Go back** and **Home**
  in one row. Replaces both today's error page and `notFoundPage`.

Words: plain, no codes ("Error 403") on the page; the status stays in the response.

## Risks
- A shell render fails inside `onError` (for example `me` half-loaded) → wrap it, and fall back to the plain page.
- History "back" after a POST could re-show a stale form → that is what people expect from Back; the link fallback is the referrer, never a re-POST.
- Kit release line: core `main` now uses kit v1.0.4 from the teammate's `release-v1.0.3` branch (up to v1.0.7). This change and the answer
  scripts both need a kit release, and that number has to be agreed with them. See the merge note.

## Test impact
- **Existing tests touched:** gateway smoke assertions on error headings; admin `ops.test.ts` (it checks a 403 body).
- **New tests:** kit `describeError` (every status, AppError and plain Error); portal: a 403 renders inside the shell with Go back and Back to the module.

**Approve to proceed? (BA stops here)**
