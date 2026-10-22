# Traffic router

`osmosis-frontend-router` moves `app.osmosis.zone` from Vercel to Cloudflare Workers
gradually. It sits on the `app.osmosis.zone/*` route and sends a sticky share of
browsers to the `osmosis-frontend-production` Worker (built from `master-cf` with
OpenNext) over a service binding; everyone else is passed through to Vercel. The URL
never changes, and every response carries `x-osmosis-backend: cf|vercel`.

## Routing

`decideBackend` in `routing.ts`, in order:

1. **QA override.** `?osmo_backend=cf|vercel` pins the session to one platform (even
   at 0%) through the `osmo_backend` cookie; `?osmo_backend=auto` clears it.
2. **Crawlers** stay on Vercel, so search indexing is unaffected by the rollout.
3. **Bucket.** Each browser gets a bucket from 0 to 9999: the `osmo_bucket` cookie
   (30 days), or a hash of IP and user agent until a page load sets it, so a page's
   own assets follow the page. Buckets below `CF_PERCENT`% go to Cloudflare, so
   ramping from 1% to 5% keeps the first 1% where they are, and ramping down only
   moves browsers at the margin.

The two platforms serve different builds, so a page and its JavaScript must come from
the same one. A 404 for `/_next/static/*` is retried on the other platform, for pages
loaded before a ramp change. Nothing else is retried across platforms: a failed swap or
broadcast must never run twice.

## Operating it

`CF_PERCENT` lives in `wrangler.jsonc` and starts at `0`. A deploy resets dashboard
edits, so change it in the file and deploy. In an emergency, set it to `0` in the
dashboard, then commit the same value.

```bash
yarn workspace @osmosis-labs/web cf:router:dry-run  # bundle and bindings, no upload
yarn workspace @osmosis-labs/web cf:router:deploy   # uploads the router; no route
```

CI deploys the router on pushes to `master` that change `packages/web/router/`
(`.github/workflows/deploy-cf-router.yml`, also runnable by hand from `master`). It
needs `CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit) and `CLOUDFLARE_ACCOUNT_ID` in the
`cloudflare-production` GitHub environment.

Deploying does not attach a route; that is a separate, deliberate step in Cloudflare.
`VERCEL_ORIGIN` sends Vercel traffic to another host, for running the router on a test
hostname (set it to `https://app.osmosis.zone` there). Leave it unset on the
production route, where `fetch(request)` reaches the zone's origin (Vercel).

Before the production Worker serves traffic through the router, the upstream
exception for `sqsprod.osmosis.zone`, `rpc.app.osmosis.zone` and
`lcd.app.osmosis.zone` must allow Worker requests from the `osmosis.zone` zone.

## Rollout

1. Deploy the router; attach it to a test hostname with `VERCEL_ORIGIN` set and check
   both platforms with `?osmo_backend=cf|vercel` (wallet connection, swaps, bridge).
2. Attach it to `app.osmosis.zone/*` at `CF_PERCENT: "0"`: a pure pass-through, to
   measure the router's own overhead.
3. Raise to 1%, then 5%, comparing 5xx and API error rates, latency, chunk-load and
   Worker CPU-limit errors per `x-osmosis-backend` before each step.
