# Production ingress

`osmosis-frontend-router` forwards every request on `app.osmosis.zone/*` to
`osmosis-frontend-production` through its `PRODUCTION` service binding. The
frontend serves pages and forwards `/api/*` to its API Worker. Crawlers use the
same path. Old rollout cookies and `osmo_backend` query parameters have no effect.
Responses carry `x-osmosis-backend: cf`, except WebSocket upgrades, which pass
through untouched.

The ingress makes one upstream attempt. Cloudflare errors and missing assets
return directly; there is no origin fallback or traffic percentage setting.
Rollback uses Cloudflare deployment versions.

## Deploy

```bash
yarn workspace @osmosis-labs/web cf:router:dry-run
yarn workspace @osmosis-labs/web cf:router:deploy
```

Deploying does not attach a route. Keep the `app.osmosis.zone/*` route attached to
this Worker so requests reach the production frontend's service binding.

Cloudflare Workers Builds deploys the ingress on pushes to `master` that change
`packages/web/router/`. This is configured in the Cloudflare dashboard under
Settings → Builds: root directory `packages/web`, deploy command
`npx wrangler deploy -c router/wrangler.jsonc`, build watch path
`packages/web/router/*`, non-production branch builds off.

The upstream exception for `sqsprod.osmosis.zone`, `rpc.app.osmosis.zone` and
`lcd.app.osmosis.zone` must allow Worker requests from the `osmosis.zone` zone.

## Observability

`router_upstream` events record the method, path (at most 512 characters, without
the query string), ray ID, duration to response headers, status, and outcome.
HTTP 5xx and exceptions use `console.error`; exception logs include the error type
without its message. Cookies and bodies are not logged.

```bash
yarn workspace @osmosis-labs/web exec wrangler tail -c router/wrangler.jsonc --format json
```

Also inspect the production frontend and API Workers' error metrics. Ingress logs
do not capture browser errors or failures while streaming response bodies.
