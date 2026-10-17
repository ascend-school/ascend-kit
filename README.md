# ascend-kit

The shared package `@ascend/kit`: the code that core, the gateway and the UI apps all need. It is not a Worker and serves nothing.

## What is in it

- `src/ui/`: the UI kit. Themes (`themes.ts`), the one stylesheet (`styles.ts`), components (`kit.ts`) and assets such as `base.css` (`assets.ts`).
- `src/html.ts`: `esc`, `html`, `page`, `href`.
- `src/http.ts`: `AppError` and HTTP helpers.
- `src/hosts.ts`: `routeHost`, `urlFor` and the other pure host rules.
- `src/catalogue.ts`: plans in words (labels, badges, `rupees`, `perCycle`). Core reads the catalogue. The UI apps say it.
- `src/types.ts`, `src/common.ts`: shared types (roles) and helpers for UI apps (form, seeOther, error page).
- `src/contract/`: the RPC contract, one file per audience (`gateway`, `site`, `ops`, `tenant`, `portal`). Core implements it. UI apps type their `CORE` binding with it.
- `src/views/shared/`: views used by more than one app (invoice view, domain panel).

Imports use the subpath, for example `@ascend/kit/hosts` or `@ascend/kit/contract/ops`.

## How apps depend on it

Each repo has:

```json
"@ascend/kit": "github:naptrix-org/ascend-kit#v1.0.0"
```

A change here needs a new git tag, then a version bump in each app that wants it. Locally, the npm workspace in the parent folder links the sibling checkout, so edits show at once. See the ascend-gateway README.

## Tests

```bash
npm test            # node --test tests/
npm run typecheck
```

`tests/themes.test.ts` fails if a theme misses a token or drops below WCAG AA for text.

## Design system

Every portal draws from `src/ui/`. The marketing site, Ops, the Tenant Portal and the School Portal use it. The public school website does not, because it wears each school's brand.

- `themes.ts` holds four themes as token sets: Inland Letter (the default), Receipt Book, Typographic Tiles and Classic. A super admin picks one in Ops, Settings, and every portal follows within a minute (`/_ui/theme.css`, cached in KV).
- `styles.ts` is the one stylesheet. It reads tokens only, so a theme never needs code.
- `kit.ts` holds the components. Screens compose these and never write their own colours.
- Fonts (Anek Latin, Hind, Inter; SIL OFL) are self-hosted in ascend-gateway `public/fonts`.

Rules the system keeps:

- Red means money owed or late, nothing else.
- Gold means waiting on someone.
- Statuses are flat dated tags.
- Figures are plain statements, never label-over-number tiles.
