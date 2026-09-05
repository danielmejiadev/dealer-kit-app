## Project coding conventions

- **No short or context-less variable names** — no `e`, `el`, `li`, `i`, `s`,
  `d`, etc. Name things for what they hold (`event`, `element`, `vehicle`,
  `index`, `swatch`...), even in small callbacks (`.map`, `.filter`,
  event handlers).
- **Avoid complex inline functions inside components.** Non-trivial logic
  (formatting, slugs, mock data, event-name constants) belongs in `utils/`,
  grouped by what it relates to (e.g. `utils/currency.ts` for COP
  formatting), not written inline inside a component body.
- **Server data fetching uses React Query** (`@tanstack/react-query`) for
  anything a Client Component fetches after first load — no bare
  `useEffect` + `fetch` + `useState`. Wrap the fetcher (from `hooks/`, see
  "App architecture" below) in a `useQuery`/`useMutation` hook. Data needed
  for the first render of a screen is a Server Component reading from
  `services/` directly instead — see below.
- **Feature modules live under `src/modules/<name>/`**, each with its own
  `components/` and, where it has non-trivial logic, its own `hooks/`,
  `utils/`, and `services/`. Anything shared by more than one module (a
  button, a currency formatter, a cross-module hook, site-wide constants)
  goes in `src/components/`, `src/hooks/`, `src/utils/`, `src/services/`,
  or `src/lib/` instead of being duplicated per module.

## App architecture

Full diagram and rationale, visually: https://claude.ai/code/artifact/19119f49-5903-48a8-9d56-50dbedb6053a
(from the `dealerkit` landing repo, where this was designed — the rules
below are the same, this is the repo they apply to).

Two flows, both ending in `services/`, never crossing into each other:

- **Reading data on first load of a screen**: `page.tsx` → Server Component
  (`modules/<name>/components/`) → `services/` directly. No Route Handler,
  no client fetch — it's already running on the server.
- **User-triggered interaction** (create/edit/delete, publish/unpublish, the
  AI price suggestion, foto→ficha): Client Component → hook in `hooks/`
  (`useQuery`/`useMutation`) → `fetch` → Route Handler
  (`app/api/v1/**/route.ts`) → `services/`.

Per-folder rules:

- **`app/**/page.tsx`** — renders one component from the matching module.
  No markup, no `await` to a service, no business logic in the page file.
- **`app/api/v1/**/route.ts`** — thin: auth check, parse/validate the
  request, call a function in `services/`, respond. No business logic and
  no direct Supabase queries inline in the route file.
- **`modules/<name>/components/`** (or `src/components/` if shared) — all
  real UI, Server or Client Components alike. Components call `services/`
  (Server Components) or a `hooks/` hook (Client Components) — never
  Supabase/AI directly themselves.
- **`services/`** (module-local or `src/services/` if shared) — the only
  layer allowed to call Supabase or the AI provider. Business rules live
  here, using clients from `lib/`. No JSX, no `NextRequest`/`NextResponse`.
- **`lib/`** — low-level configured clients only (`lib/supabaseClient.ts`,
  a future AI client). No business logic.
- **`hooks/`** — React Query hooks that call Route Handlers via `fetch`.
  No business logic, no direct Supabase/AI calls.
- **`utils/`** — pure, deterministic helpers with no external calls
  (formatting, slugs, `getOsSystem`-style helpers, `utils/color.ts` for the
  per-tenant accent contrast math). If it calls Supabase, the AI provider,
  or reads `NextRequest`, it belongs in `services/` instead, not here.

Why: keeps business logic in exactly one place (`services/`) reusable from
both a Server Component and a Route Handler with no duplication; keeps
Supabase/AI access behind one layer so swapping either later touches one
place; and keeps Route Handlers as plain HTTP so a future mobile app can
call the same API without any rewrite — Server Actions were deliberately
ruled out for this reason, since they're bound to Next.js's own React tree
and unreachable from a mobile client.

**Connecting to Supabase vs. the AI provider — not the same trust model.**
The browser is allowed to call Supabase directly with the public anon key,
because Postgres Row-Level Security enforces access per row regardless of
who holds that key — a leaked anon key grants nothing beyond what a
legitimate signed-in user could already do. The AI provider's API key has
no equivalent per-request access control: whoever holds it can spend
without limit. That's the whole reason it's confined to `services/`, only
ever reached through a Route Handler, and never sent to the client.

## Design kit

No monolithic `globals.css`. Styling splits into small, single-purpose
files, already scaffolded:

```
src/styles/
  tokens/
    colors.css       — neutral palette, semantic tokens, and the
                        --color-accent: var(--tenant-accent) indirection
                        (see "Per-tenant theming" below)
    typography.css    — font-family vars + the explicit type scale
    elevation.css     — shadow tokens (--shadow-soft, --shadow-lift...)
    radius.css        — border-radius scale
  reset.css           — base element reset only (body, headings, links)
  theme.css           — single entry point: imports reset.css + every
                         tokens/*.css file, each with its own @theme
                         inline block (Tailwind v4 merges them at build)

src/app/globals.css   — only @imports: Tailwind + styles/theme.css.
                         Never author CSS directly in this file.
```

- **Component-specific styling never goes in `globals.css` or the token
  files.** Default to Tailwind utility classes in JSX. If a component needs
  real bespoke CSS (animation, pseudo-elements, complex state), colocate a
  CSS Module next to it: `VehicleCard.tsx` + `VehicleCard.module.css` in the
  same `components/` folder.
- **Typography and font-family are global, defined once** in
  `tokens/typography.css` (`--font-sans`, `--font-mono`, an explicit
  `--text-*`/`--leading-*` scale), loaded via `next/font/google` in
  `layout.tsx`. Every heading/body size comes from this scale — no ad hoc
  font sizes in components.

### Per-tenant theming

Only the tenant's brand color is dynamic (per the product's "nombre +
color" personalization) — everything else in the design kit is fixed and
shared across tenants. Mechanism:

- `tokens/colors.css` declares `--color-accent: var(--tenant-accent, #b8842e)`
  in `@theme inline` — build-time wiring, with DealerKit's own default
  color as the fallback when no tenant is in context.
- The root Server Component layout for a tenant's routes (public catalog
  and admin panel) fetches the tenant via `services/`, derives a safe
  accent + contrasting text color in `utils/color.ts` (pure, no external
  calls), and sets `--tenant-accent` via inline `style` on the wrapping
  element.
- Every component below just uses `bg-accent`/`text-accent` like any other
  Tailwind class — never aware the value is dynamic.
- Out of scope for v1: dark mode for tenant catalogs, a full theme builder.
  Only name + one brand color, matching the roadmap.

### UI component library: Base UI, hand-wrapped (no shadcn CLI)

`src/components/ui/` is the shared component library every module builds on:

- **Simple components** (`Button`, `Input`, `Badge`, `Card`) — plain
  semantic HTML, styled with the tokens above, written by hand.
- **Stateful/interactive components** (`Modal`, `Select`, `Toast`) — wrap
  **Base UI** primitives (`@base-ui/react`) for behavior, keyboard
  handling, and ARIA; the wrapper file lives in `src/components/ui/` and
  is styled entirely with our own tokens, never Base UI's (unstyled)
  defaults. Not generated via the shadcn CLI — written directly.
- Base UI was chosen over Radix UI because Radix's maintenance slowed after
  its acquisition by WorkOS, while Base UI (built by the original Radix
  engineers, now at MUI) is the actively maintained primitive layer as of
  2026.
- From any consuming module's perspective, these are just
  `<Modal>`/`<Select>`/`<Toast>` (via `useToast()`) — Base UI is an
  implementation detail that never leaks outward.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
