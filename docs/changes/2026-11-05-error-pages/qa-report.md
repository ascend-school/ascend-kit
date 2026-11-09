# QA report: Error pages in the app's own frame

**Verdict:** GO. Ships with the next kit release, together with the answer scripts change.

## Static gate
Node 22.17 on Windows: `npx tsc --noEmit`, `node --experimental-strip-types --test "tests/**/*.test.ts"`.

| Repo | typecheck | tests |
|---|---|---|
| ascend-kit | pass | 19 / 19 (6 new in `errors.test.ts`) |
| ascend-school-portal | pass | 5 / 5 |
| ascend-admin | pass | 4 / 4 (its 401 test still passes) |
| ascend-tenant-portal | pass | 2 / 2 |
| ascend-marketing, ascend-school-website | pass | — / 2 / 2 |
| ascend-core, ascend-gateway | pass | unchanged (known Windows path failures) |

## Acceptance criteria
| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Signed in, errors render in the shell | pass | portal 403 `/import`, 404 `/exams/s/…`, 400 confirm; Ops 404; Tenant 404 (menu present) |
| 2 | Heading per status, core's words as the reason | pass | kit tests; browser: "You can't open this", "We couldn't find that", "That didn't go through" |
| 3 | Go back (history, else referrer, else module), Back to module, Home | pass | browser: Go back from a refused confirm returned to the form with "7" and the typed note intact; "Back to Exam & Evals", "Back to Schools" |
| 4 | Unknown addresses in the shell when signed in | pass | portal `/no/such/page`, tenant `/no/such` |
| 5 | Signed out / public: plain page with the right name | pass | marketing 404 "· Ascend"; school website 404 in its own look with the school's name |
| 6 | 401 still signs out | pass | kit test (`set-cookie` cleared); admin `ops.test.ts` |
| 7 | Portal, Ops, Tenant Portal in-shell; public sites plain | pass | as above |
| 8 | 375, 768, 1280 px | pass | see UX review |

A module the person can't open is never offered: a parent's 403 on the scripts register shows no "Back to Exam & Evals" (smoke).

## Regression
Gateway smoke on a fresh database with `DEV_LOG`: **259 ok, 51 fail**. Same 51 failures as the previous run (all in the Nov 1 baseline).
The two 404 checks were updated to the new wording; two new checks pass. Log: `samples/smoke-error-pages.log`.

## UX review
| Page | 375 | 768 | 1280 |
|---|---|---|---|
| Portal error in the shell | ✅ buttons wrap, no sideways scroll | ✅ | ✅ |
| Ops error in the shell | — | — | ✅ |
| Plain page (marketing) | — | ✅ | ✅ |

Fix made: text and buttons sat flush in the panel; the body is now a `stack` (spaced like other panels).

## Issues found
- None blocking. Not done: breaking a page on purpose to see a 500 in the running app (covered by kit tests).
