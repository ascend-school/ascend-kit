# Error pages in the app's own frame — happy flow

Written by QA after the change. Copy-paste runnable, current for this change only.

## Start
```bash
cd ascend-core && npm run db:reset:local
cd ../ascend-gateway && npm run dev:all
# in another shell, once it is up:
cd ascend-core && bash scripts/seed-evals-demo.sh
```

## Logins
| Role | URL | User | Password |
|---|---|---|---|
| Teacher | http://oxforded.portal.localhost:8790 | teacher@oxforded.in | devpassword |
| Ops | http://ops.localhost:8790 | hello@naptrixlabs.com | devpassword |
| Tenant owner | http://tenant.localhost:8790 | owner@oxforded.in | devpassword |

## Steps
1. As the teacher, from **Home** click into any page, then open http://oxforded.portal.localhost:8790/import.
   → "You can't open this" **inside the portal**: the menu, the school's name and the find bar are still there. **Go back** returns
   to the page you came from; **Home** goes home.
2. Open http://oxforded.portal.localhost:8790/exams/s/nothing → "We couldn't find that", breadcrumbs "Exam & Evals / Exams",
   and **Back to Exam & Evals**.
3. Refused form: on a script's page, give a question more than its marks in a browser that skips the field's limit (or post it with curl)
   → "That didn't go through" with core's words ("Give Q2 a mark from 0 to 3, in halves."). **Go back** returns to the form with
   what you typed still in it.
4. An address nothing answers at, signed in: http://oxforded.portal.localhost:8790/no/such/page → the same in-portal page.
5. Ops: http://ops.localhost:8790/schools/nothing → in the Ops frame, with **Back to Schools**.
6. Tenant Portal: http://tenant.localhost:8790/schools/nothing → in the account frame.
7. Signed out or public: http://localhost:8790/no/such/page → the plain page with Ascend's name, **Go back** and **Home**.
   A school website's missing page (http://oxforded.localhost:8790/no/such) keeps the website's own look, with the school's name.

## Scripted check (optional)
```bash
cd ascend-gateway && B=http://127.0.0.1:8790 bash scripts/smoke.sh | grep -E "404|own frame|no module"
```

## What changed
- ascend-kit: `describeError` (heading and reason per status), `backHref`, `errorBody` (in-shell), `errorPage` (plain, with the
  school's name), `backWays`, `navModule`, `notFoundPage` reworded; `plainPage` takes a `brand`; `[data-back]` in `ui.js` uses
  browser history; ui.js has its own cache token.
- ascend-school-portal: `onError` and `notFound` render in the shell (`errorView`); `portalModule` for "Back to …".
- ascend-admin, ascend-tenant-portal: the same with their shells (`opsErrorView`, `tenantError`).
- ascend-marketing, ascend-school-website: the plain page with their name; the website's 404 in its own look.
- ascend-gateway smoke: new wording, plus in-shell checks.

## Not covered
- A 500 was checked through the kit's tests only (red banner, no detail leaked), not by breaking a page in the running app.
