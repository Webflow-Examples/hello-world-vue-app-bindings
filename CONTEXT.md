# CONTEXT — hello-world-vue-app-bindings

Orientation for contributors to this **Vue 3 + Vite + bindings** Hello World
example for [Webflow Cloud](https://developers.webflow.com/webflow-cloud). Keep
this file current when structure or workflows change.

## What this is

A minimal, branded **Hello, world** page built with **Vue 3 + Vite** and
deployed on Cloudflare Workers via Webflow Cloud. This is the **bindings**
variant — it wires up all four Cloudflare bindings provisioned by Webflow
Cloud (D1, KV Sessions, KV Flags, R2) and renders live status cards.

The page shows:

- Webflow brand hero + gradient logo
- A curated set of Webflow Cloud doc cards
- A live **BindingsStatus** block pinging D1, KV, and R2 via
  `api/binding-status`

## Stack

- Framework: **Vue 3** on **Vite 6** (`<script setup lang="ts">` with `ref`,
  `onMounted`, `computed`)
- Worker entry: hand-written Worker (`worker/index.ts`) serving `/api/*` and
  delegating everything else to the Vite-built `ASSETS`
- Styling: Tailwind v3 + `wf-*` brand tokens (see `src/style.css`)
- Deploy target: Cloudflare Workers via **Webflow Cloud** (`wrangler.json`)
- Bindings: `DB` (D1), `SESSIONS` + `FLAGS` (KV), `MEDIA` (R2)

## Repo layout

```
index.html
src/
  App.vue                        ← hero, DOC_LINKS, <BindingsStatus />
  main.ts
  style.css                      ← Tailwind + .wf-* design tokens
  components/
    WebflowLogo.vue
    DocCard.vue
    BindingsStatus.vue           ← fetches api/binding-status on mount
worker/
  index.ts                       ← routes /api/* and serves ASSETS
  routes/
    binding-status.ts            ← pings D1, KV, R2 and returns JSON
drizzle/                          ← D1 migrations
wrangler.json                     ← bindings declaration
vite.config.ts
tailwind.config.js
package.json
```

## Running locally

```bash
npm install
npm run dev                # vite dev — worker not attached
npm run preview            # vite build && wrangler dev — full bindings
```

## Building

```bash
npm run build              # vue-tsc -b && vite build
```

Build output lands in `dist/`. Wrangler bundles `worker/index.ts` separately
when deployed.

## Bindings

Declared in `wrangler.json`:

| Binding    | Kind | Purpose                         |
| ---------- | ---- | ------------------------------- |
| `DB`       | D1   | SQL database (Drizzle migrations in `drizzle/`) |
| `SESSIONS` | KV   | Session store                   |
| `FLAGS`    | KV   | Feature flags                   |
| `MEDIA`    | R2   | Object storage                  |
| `ASSETS`   | Fetcher | Serves built Vite static assets |

The worker matches `/api/...` regardless of mount prefix — it uses
`pathname.indexOf("/api/")` so the app works under any Webflow Cloud mount
path. Non-`/api/*` requests are delegated to `env.ASSETS`.

`worker/routes/binding-status.ts` performs a cheap read/write against each
binding and returns per-binding status + latency.

## Editing the UI

- **Page content (hero, CTAs, doc cards):** `src/App.vue`
- **Doc card list:** search for `DOC_LINKS` in `src/App.vue`
- **Bindings status cards:** `src/components/BindingsStatus.vue`
- **Worker entry:** `worker/index.ts`
- **Health-check route:** `worker/routes/binding-status.ts`
- **Brand tokens and `.wf-*` styles:** `src/style.css`

## Deploying to Webflow Cloud

1. Push this repo to GitHub.
2. In your Webflow Cloud project, connect the repo and pick a mount path
   (e.g. `/my-app`). The app runs under any prefix.
3. Webflow Cloud builds with `npm run build` and provisions all bindings
   from `wrangler.json` automatically on deploy.

See [Deployments](https://developers.webflow.com/webflow-cloud/deployments)
and [Environments](https://developers.webflow.com/webflow-cloud/environments).

## Contributing

- Keep the **Webflow brand tone**: blue gradient (`#4353FF` → `#146EF5`), dark
  background, minimal copy. Reuse the existing `.wf-*` CSS tokens.
- This is a Hello World. Do **not** add extra pages, client-state libraries,
  or UI kits. Small and readable beats clever.
- Run `npm run build` before opening a PR.
- Keep **cross-app parity**: if you change shared copy or doc links, update
  the sibling `hello-world-*-app[-bindings]` apps too.

## Related docs

- [Webflow Cloud overview](https://developers.webflow.com/webflow-cloud)
- [Getting started](https://developers.webflow.com/webflow-cloud/getting-started)
- [Storing data overview](https://developers.webflow.com/webflow-cloud/storing-data/overview)
- [SQLite (D1)](https://developers.webflow.com/webflow-cloud/storing-data/sqlite)
- [Key Value Store](https://developers.webflow.com/webflow-cloud/storing-data/key-value-store)
- [Object Storage (R2)](https://developers.webflow.com/webflow-cloud/storing-data/object-storage)
- [Environments](https://developers.webflow.com/webflow-cloud/environments)
- [Deployments](https://developers.webflow.com/webflow-cloud/deployments)
- [Configuration](https://developers.webflow.com/webflow-cloud/environment/configuration)
- [Limits](https://developers.webflow.com/webflow-cloud/limits)
