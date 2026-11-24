# Production ingress (legacy — ready to retire)

`osmosis-frontend-router` routes `app.osmosis.zone/api/*` directly to
`osmosis-frontend-api-production` (via its `API` service binding) and all other
requests on `app.osmosis.zone/*` to `osmosis-frontend-production` (via its
`PRODUCTION` service binding).

## Retiring this Worker

Now that the Vercel monolith is retired, this pass-through Worker adds one extra
Worker invocation on every production request. To remove it with zero downtime:

1. In the Cloudflare dashboard for `osmosis.zone` → Workers Routes:
   - Add `app.osmosis.zone/api/*` → `osmosis-frontend-api-production`
   - Update `app.osmosis.zone/*` → `osmosis-frontend-production`
2. Disable the Cloudflare Workers Builds trigger for `packages/web/router/*`.
3. Delete `packages/web/router/` and the `cf:router:*` scripts in `packages/web/package.json`.

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
