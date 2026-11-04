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
loaded before a ramp change.

A page load (a document GET) that the production Worker fails, by throwing (including
the CPU limit) or answering 5xx, is served by Vercel instead, with
`x-osmosis-fallback: cf-<status>` or `cf-error`. A bad deploy then shows up as slower
pages and that header rather than error pages. Nothing else is retried across platforms:
API calls stay where they were routed, so a failed swap or broadcast never runs twice.

After a ramp change, a browser at the margin with an open tab asks the other platform
for `/_next/data/<buildId>/...`, which has a different build ID and answers 404. Next
handles that with a full reload that lands on the new platform, so expect a short bump
in `/_next/data` 404s per `x-osmosis-backend` after each step.

## Operating it

`CF_PERCENT` lives in `wrangler.jsonc` and is currently `100`. A deploy resets dashboard
edits, so change it in the file and deploy. In an emergency, set it to `0` in the
dashboard, then commit the same value.

```bash
yarn workspace @osmosis-labs/web cf:router:dry-run  # bundle and bindings, no upload
yarn workspace @osmosis-labs/web cf:router:deploy   # uploads the router; no route
```

Cloudflare Workers Builds deploys the router on pushes to `master` that change
`packages/web/router/`. It is configured on the Worker in the Cloudflare dashboard
(Settings → Builds), not in this repository: root directory `packages/web`, deploy
command `npx wrangler deploy -c router/wrangler.jsonc`, build watch path
`packages/web/router/*`, and non-production branch builds off.

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
   Worker CPU-limit errors per `x-osmosis-backend` before each step. Fallbacks hide
   page failures from users, so count `router_upstream` events with `backend = cf` and
   `outcome = http_error|exception` as Cloudflare errors when comparing.

## Checking routing and errors

After deploying, open Workers & Pages → osmosis-frontend-router → Observability
→ Logs. Structured console events include:

- `router_request`: `selectedBackend`, `routeReason` (override/crawler/bucket),
  `servedBy`, final `status`, and `fallback` (null when no retry occurred).
  Filter `servedBy = vercel` to identify remaining Vercel traffic.
- `router_upstream`: one event per upstream attempt, with `backend`, `status`
  (when a response arrived), `outcome`, and `durationMs` to response headers.
  Filter `outcome = http_error` or `outcome = exception` for failures, including
  failures hidden by a successful fallback. These events use console.error.
- Both events carry `method`, `path` (at most 512 characters, no query string),
  and `rayId`. Cookies, bodies, and exception messages are not logged.

Static asset retries also set `x-osmosis-fallback: cf-404|vercel-404`.
A recovered asset 404 is a build mismatch, not necessarily an application failure.

For a live stream from the repository root:

```bash
yarn workspace @osmosis-labs/web exec wrangler tail -c router/wrangler.jsonc --format json
```

Do not filter only by failed invocation status: a fallback can return 200 while an
upstream attempt failed. Also inspect osmosis-frontend-production's Errors metrics
and logs for CPU/memory limits and runtime exceptions. Router logs describe upstream
responses/exceptions; they do not capture browser JavaScript errors, failures inside
a successful HTTP response, or errors while streaming a response body.
Live tails can be sampled under load; use Worker metrics for overall error rates.
