# @osmosis-labs/web/e2e

This package contains the Playwright E2E tests and a Keplr wallet extension for browser automation,
as well as standalone utility scripts for on-chain operations (e.g. cancelling open limit orders).

## Table of Contents

- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Balance Checking](#balance-checking)
  - [Topup dispatch model (dedup)](#topup-dispatch-model-dedup)
- [Transaction Confirmation](#transaction-confirmation)
- [Required Token Balances](#required-token-balances)
- [Order Cleanup Scripts](#order-cleanup-scripts)
- [Fund Management](#fund-management)
  - [GitHub Actions Workflows](#github-actions-workflows-1)
  - [Migration flow (one-time)](#migration-flow-one-time)
  - [Topup flow (ongoing)](#topup-flow-ongoing)
- [Compromised Wallets](#compromised-wallets)

## Environment Variables

By default, configuration is pointing to the [Stage](https://stage.osmosis.zone) environment. Tests will automatically install a wallet.
All you need to add is a private key for the wallet being used:

- example command `export PRIVATE_KEY=0x....` for the frontend tests.
- On PowerShell: `$env:PRIVATE_KEY="0x...."`
- Or add `PRIVATE_KEY=<hex>` to `packages/e2e/.env` (gitignored)

### CI Secrets — Account Mapping

| Secret | Label | Address |
|--------|-------|---------|
| `E2E_PRIVATE_KEY_PREVIEW` | E2E Test Account (preview + prod frontend tests) | `TBD` |
| `TEST_PRIVATE_KEY_SG` | Monitoring SG region (swap, trade) | `TBD` |
| `TEST_PRIVATE_KEY_EU` | Monitoring EU region (swap, trade, limit) | `TBD` |
| `TEST_PRIVATE_KEY_US` | Monitoring US region (swap, trade, limit) | `TBD` |

All wallet addresses are derived from the private key at runtime using `deriveAddress()` in `utils/wallet-utils.ts`.

## Running Tests

Install Playwright first:

```bash
npx playwright install --with-deps chromium
```

Run specific test suites from the `packages/e2e` directory:

```bash
npx playwright test swap.osmo.wallet          # Swap OSMO tests
npx playwright test trade                      # Trade / limit order tests
npx playwright test monitoring --timeout 180000 # Monitoring tests
```

Set `headless: false` in the Playwright config to run in a visible browser.

## Balance Checking

### How It Works

Balance checks happen at two levels:

1. **Precursor (CI step)** — `scripts/check-balances.ts` runs before Playwright
   and blocks the job if balances are critically low.
2. **Inline (test files)** — `ensureBalances()` runs in each test's `beforeAll`
   hook. It is always warn-only: logs results but never fails the test.

### Two-Threshold Model

Each account/token pair has two thresholds defined in `utils/balance-config.ts`:

- **`minAmount`** — hard floor. If on-chain balance is below this, the CI job
  is aborted with a clear "please top up" message.
- **`warnAmount`** — soft floor / recommended top-up level above `minAmount`. If the balance is
  between minAmount and warnAmount, a Slack alert is sent but tests proceed.

Thresholds default to **token units** but can be set to **USD** via `unit: "usd"`.
USD thresholds are converted to token amounts at runtime using the current price
from SQS. This is used for volatile assets like BTC and OSMO where a fixed token
amount would quickly become stale.

Slack alerts use the `E2E_SLACK_WEBHOOK_BALANCE_ALERTS` secret.

### Updating Requirements

When adding or modifying a test that uses tokens, update the requirements in
`utils/balance-config.ts`. Each entry documents which tests consume the token:

```typescript
// Token-unit threshold (default) — for stablecoins or fixed-amount tests
{ token: "USDC", minAmount: 1.7, warnAmount: 3.5, note: "~1.62 consumed (trade buy + swaps)" },

// USD-denominated threshold — for volatile assets where tests use dollar amounts
{ token: "BTC", minAmount: 1.6, warnAmount: 5, unit: "usd", note: "market sell BTC" },
```

### Price-Aware Checks

Both `balance-config.ts` (CI precursor) and `ensureBalances()` (inline test
checks) support `unit: "usd"` for dollar-denominated requirements:

```typescript
// In balance-config.ts (CI precursor thresholds)
{ token: "BTC", minAmount: 1.6, warnAmount: 5, unit: "usd", note: "market sell BTC" },

// In test files (inline ensureBalances)
await ensureBalances(address, [
  { token: "BTC", amount: 1.6, unit: "usd" },  // need $1.60 worth of BTC
]);
```

The checker fetches the current price from the Osmosis SQS API (`/tokens/prices`)
and converts to token amounts. `ensureBalances()` adds a 1 % buffer (configurable
via `PRICE_BUFFER_PERCENT` env var).

`fetchTokenPrices` retries up to **3 times with exponential backoff** (250 ms, 750 ms,
2 250 ms) on transient `fetch failed` / non-2xx responses (common on cold macos-14
GitHub runners due to DNS, TLS-handshake, or 30 s timeout hiccups). If all retries
fail, the precursor script keeps `outcome = warn` and emits an alert worded
`⚠️ <token> price service unavailable — couldn't verify, dispatching topup as
precaution`. This preserves the topup safety net (false-positive topup costs ~30 s
of CI runtime) over the alternative (silently-draining wallet). The downstream
`topup-accounts.ts` script also calls `fetchTokenPrices`; if prices are still
unavailable there, it gracefully skips USD-denominated tokens and tops up
non-USD ones — no double-failure cascade.

### Running Locally

```bash
# Display all balances for an account
PRIVATE_KEY=<hex-key> npx tsx scripts/check-balances.ts

# Validate against requirements
PRIVATE_KEY=<hex-key> ACCOUNT_LABEL="E2E Test Account" npx tsx scripts/check-balances.ts

# Dry run (show config without fetching)
PRIVATE_KEY=<hex-key> ACCOUNT_LABEL="E2E Test Account" DRY_RUN=true npx tsx scripts/check-balances.ts
```

### Manual Balance Report

Trigger **Check E2E Account Balances** from the GitHub Actions tab to get a
read-only balance report for all four test accounts in parallel. The workflow
always succeeds — it's purely informational with no alerts or blocking.

### Automatic Pre-Test Checks in CI

The following workflows run `check-balances.ts` as a dedicated balance-gating
job before any Playwright tests. All wallet-dependent test jobs depend on the
balance-gate via `needs`, so a single check gates every test — one Slack
alert at most per workflow run (or per region, for the geo-monitoring workflow).

| Workflow | Check job(s) | Gates test jobs | Account |
|----------|-----------|----------------|---------|
| `frontend-e2e-tests.yml` | `check-balances` | `preview-swap-osmo-tests`, `preview-swap-usdc-tests`, `preview-trade-tests`, `preview-claim-tests` | E2E Test Account (`E2E_PRIVATE_KEY_PREVIEW`) |
| `prod-frontend-e2e-tests.yml` | `check-balances` | `prod-e2e-tests` | E2E Test Account (`E2E_PRIVATE_KEY_PREVIEW`) |
| `monitoring-limit-geo-e2e-tests.yml` | `preflight-sg` | `fe-swap-sg`, `fe-trade-sg` | Monitoring SG (`TEST_PRIVATE_KEY_SG`) |
| `monitoring-limit-geo-e2e-tests.yml` | `preflight-eu` | `fe-swap-eu`, `fe-trade-eu`, `fe-limit-eu` | Monitoring EU (`TEST_PRIVATE_KEY_EU`) |
| `monitoring-limit-geo-e2e-tests.yml` | `preflight-us` | `fe-swap-us`, `fe-trade-us`, `fe-limit-us` | Monitoring US (`TEST_PRIVATE_KEY_US`) |

Each `preflight-*` job in the geo-monitoring workflow runs the balance pipeline
(check → alert if low → expose `outcome` output) **once** per region per cron
tick. Test jobs use `if: needs.preflight-XX.outputs.outcome != 'fail'` to skip
cleanly when the wallet is critically low — preserving the original fail-stop
safety net while reducing per-cron-tick noise from up to 9 Slack alerts down to
1 per region.

### Topup dispatch model (dedup)

Topup dispatch is decoupled from the per-region/per-push balance checks so the
"E2E: Topup Test Accounts" workflow normally fires **about once per low-balance
episode** instead of once per push and once per region (which raced and produced
same-second and minutes-apart duplicate dispatches). One topup run refills
**all four accounts** (preview + US/EU/SG), so a single dispatch always covers
everyone. Note the dedup is **best-effort, not a hard guarantee**: the guard is a
non-atomic `gh run list` check, so two dispatchers firing in the same instant can
still both dispatch (harmless — the second run finds accounts already funded and
sends nothing).

| Workflow | Dispatches topup? | Notes |
|----------|-------------------|-------|
| `monitoring-limit-geo-e2e-tests.yml` | Yes — single `topup-dispatch` job | `needs` all 3 preflights; dispatches once if any region is `warn`/`fail`. This is the primary funding path (hourly cron) and keeps the preview account funded too. |
| `prod-frontend-e2e-tests.yml` | Yes — `check-balances` job | Master-push path; same cooldown guard. |
| `frontend-e2e-tests.yml` | **No** (Phase A / MTN-97) | Preview push keeps the low-balance Slack alert + critical-fail gate, but no longer dispatches — the hourly monitoring path already refills the preview account. |

Two complementary mechanisms keep dispatch deduplicated:

- **Consolidation** — the geo-monitoring workflow uses one `topup-dispatch` job
  (`needs: [preflight-us, preflight-eu, preflight-sg]`) instead of three
  independent per-preflight dispatches, which removes the same-tick race (the
  three preflights ran in parallel and all saw "nothing in flight").
- **Cooldown guard** — every dispatcher skips if a topup is already
  `queued`/`in_progress`, **or** a real successful topup (`conclusion == "success"`)
  whose run was **created within the last ~45 min** (`COOLDOWN_SECONDS=2700`). The
  window is keyed off the run's `createdAt` (≈ when it was dispatched/queued), not
  its completion time, because the intent is to rate-limit how often we dispatch.
  This removes cross-tick and cross-workflow repeats. 45 min is deliberately below
  the 60 min cron so a still-low account is still refilled on the next hourly tick.
  **Failed** runs do not count (so a bad/partial topup can be retried immediately),
  and **dry runs** do not count (they move no funds — excluded via the topup
  workflow's `run-name`, matched with `displayTitle | startswith("Dry run")`).

The per-region Slack alerts remain independent of dispatch, so a persistently
low account still pages every cron tick even while dispatch is on cooldown.

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All balances healthy |
| `1` | At least one balance below `minAmount` (critical — blocks tests) |
| `2` | All above `minAmount` but at least one below `warnAmount` (Slack warning) |

The script also exits `2` (warn) when SQS pricing for any USD-denominated
requirement is unavailable after retries — see "Price-Aware Checks" above.
The Slack alert wording in that case calls out the cause ("price service
unavailable — couldn't verify, dispatching topup as precaution") so it isn't
mistaken for an actual shortage.

## Transaction Confirmation

Trade tests (swap / buy / sell) confirm a transaction succeeded using **two
signals that race**, so a flaky WebSocket can't produce a false failure:

1. **Primary — WebSocket toast.** The in-app "Transaction Successful" toast is
   driven by the app's WebSocket `TxTracer` (`packages/tx/src/tracer.ts`). It's
   fast and is what passes in non-proxied (US / preview / prod) runs.
2. **Fallback — REST poll.** The EU/SG monitoring suites drive the browser
   through an HTTP CONNECT proxy, over which long-lived WebSockets frequently
   stall or disconnect — so the toast may never render even though the tx was
   broadcast and included on-chain. To cover that, `TradePage.startTxConfirmation()`
   also captures the broadcast tx hash from the app's `/api/broadcast-transaction`
   response and polls the Osmosis LCD `GET /cosmos/tx/v1beta1/txs/{hash}` directly
   from the Node test process (see `utils/tx-confirm.ts`). That fetch does **not**
   go through the browser proxy, so it's reliable regardless of WebSocket health.

Whichever signal confirms first wins (the loser is aborted); the test only fails
if **both** time out, or if the REST poll sees the tx included with a non-zero
code (a genuine on-chain failure). `getTransactionUrl()` likewise falls back to
the captured hash (Mintscan URL) when the success-toast link is absent.

The REST endpoint is `REST_ENDPOINT` (default `https://lcd.osmosis.zone`, see
`utils/config.ts`). `TradePage.goto()` additionally retries with backoff so a
proxy stall on initial page load surfaces as a recoverable retry rather than a
hard `beforeAll` timeout.

> Note: this is an E2E-layer safety net. A complementary product-side change —
> making the app's own `broadcastMsgs` fall back to REST when `TxTracer`
> exhausts its WebSocket endpoints — is tracked separately and ships as its own PR.

## Required Token Balances

### E2E Test Account (`E2E_PRIVATE_KEY_PREVIEW`)

| Token | Min | Warn | Unit | Used By |
|-------|-----|------|------|---------|
| USDC | 1.7 | 3.5 | token | ~1.62 consumed (trade buy + swaps) |
| ATOM | 2.27 | 4.5 | token | ~2.16 consumed (trade sell + limit + swaps) |
| OSMO | 1.27 | 2.5 | token | ~1.21 consumed (limit sell + swap) |
| TIA | 0.022 | 0.05 | token | ~0.02 consumed (swap TIA) |
| INJ | 0.011 | 0.025 | token | ~0.01 consumed (swap INJ) |
| AKT | 0.027 | 0.06 | token | ~0.025 consumed (swap AKT) |

### Monitoring Accounts (`TEST_PRIVATE_KEY_SG` / `_EU` / `_US`)

All three monitoring accounts (SG, EU, US) share the same thresholds:

| Token | Min | Warn | Unit | Used By |
|-------|-----|------|------|---------|
| USDC | 7 | 8.4 | token | market buy + limit buy + swap stables |
| OSMO | $2 | $5 | USD | market sell + limit sell OSMO |
| BTC | $1.60 | $5 | USD | market sell BTC |
| USDC.eth.axl | 1 | 2 | token | swap stables |
| USDT | 1 | 1.2 | token | swap stables |

---

## Order Cleanup Scripts

Standalone scripts for managing open limit orders without a browser. These use the SQS API
(`sqs.osmosis.zone`) and sign transactions directly via cosmjs — no Playwright required.

### `scripts/get-active-orders.ts` — List open orders (read-only)

Safe to run at any time. Prints all active orders for an account without sending any transactions.

```bash
# From packages/e2e/
npx tsx scripts/get-active-orders.ts
```

Example output:
```text
=== Active Orders: Monitoring EU ===
Derived address: osmo1...

3 active orders found:

  #1  order_id=42  tick_id=100  direction=ask  status=open
      pair: OSMO/USDC  price: $0.3850
      quantity: 1080000  placed: 1080000  filled: 0%
      orderbook: osmo1contract...
```

### `scripts/cancel-all-orders.ts` — Cancel all open orders

Fetches and cancels all open limit orders for an account, with up to 3 retry rounds.

```bash
# Dry run — shows what would be cancelled, no transactions sent
# Mac/Linux:
DRY_RUN=true npx tsx scripts/cancel-all-orders.ts
# PowerShell:
$env:DRY_RUN="true"; npx tsx scripts/cancel-all-orders.ts

# Live — sends real cancel transactions
npx tsx scripts/cancel-all-orders.ts
```

### How accounts are handled

Each script processes **one account per invocation** — whichever `PRIVATE_KEY` is set in the environment at the time.
The GitHub Actions workflow achieves full coverage by running four parallel jobs, each injecting a different key secret.

To run against multiple accounts locally, either swap `PRIVATE_KEY` in `.env` between runs, or override it inline:

```bash
# Mac/Linux — run for each account in sequence
PRIVATE_KEY=<key-1> npx tsx scripts/cancel-all-orders.ts
PRIVATE_KEY=<key-2> npx tsx scripts/cancel-all-orders.ts

# PowerShell
$env:PRIVATE_KEY="<key-1>"; npx tsx scripts/cancel-all-orders.ts
$env:PRIVATE_KEY="<key-2>"; npx tsx scripts/cancel-all-orders.ts
```

### Local Setup

1. Add your key to `packages/e2e/.env` (already gitignored):
   ```env
   PRIVATE_KEY=<your-hex-private-key>
   ACCOUNT_LABEL=Local Test
   ```
2. Install deps: `yarn install` (from `packages/e2e/`)
3. Run `get-active-orders` first to confirm orders exist, then `cancel-all-orders` with `DRY_RUN=true` to preview, then without `DRY_RUN` to execute.

### GitHub Actions Workflows

A single manually-triggered workflow handles both dry runs and real cancellations:

| Workflow | File |
|---|---|
| **Cancel Open Limit Orders (E2E Test Accounts)** | `cancel-open-orders.yml` |

The workflow has a **Dry run** checkbox (checked by default) so the safe path is always the default.
All four test accounts run in parallel via matrix strategy.

**Recommended flow:**
1. Trigger from the GitHub Actions tab → **Cancel Open Limit Orders (E2E Test Accounts)** → **Run workflow** (leave "Dry run" checked)
2. Review the logs to confirm address derivation and order listing work correctly
3. Trigger again with "Dry run" **unchecked** to send real cancel transactions

### Automatic Pre-Test Cleanup in CI

The following CI workflows run `cancel-all-orders.ts` as a **prerequisite step** before executing limit order tests. This ensures each test run starts with a clean slate, preventing order buildup from prior failed runs.

| Workflow | Job(s) | Account cleaned |
|---|---|---|
| `monitoring-limit-geo-e2e-tests.yml` | `fe-limit-eu` | `TEST_PRIVATE_KEY_EU` (Monitoring EU) |
| `monitoring-limit-geo-e2e-tests.yml` | `fe-limit-us` | `TEST_PRIVATE_KEY_US` (Monitoring US) |
| `frontend-e2e-tests.yml` | `preview-trade-tests` | `E2E_PRIVATE_KEY_PREVIEW` (E2E Test Account) |

The cleanup step uses `continue-on-error: true` so that a transient RPC failure does not block the test run.

---

## Fund Management

All fund management scripts default to **dry run** and are **safe to re-run**.
If a run is interrupted, re-running detects what was already sent (by checking
on-chain balances) and only sends the remainder — no double-sends will occur.

### GitHub Actions Workflows

| Workflow | File | Purpose |
|---|---|---|
| **E2E: Migrate Funds** | `e2e-migrate-funds.yml` | One-time extract/distribute for wallet rotation |
| **E2E: Topup Test Accounts** | `e2e-topup-accounts.yml` | Ongoing topup when accounts run low |

Both workflows default to **dry run**. The `RESERVE_OSMO` / `RESERVE_USDC` inputs
control how much to keep in the **topup account** during distribute and topup phases.

**Required secrets:**

| Secret | Used by |
|---|---|
| `E2E_PRIVATE_KEY_TOPUP` | Both workflows (topup/funding account) |
| `E2E_PRIVATE_KEY_PREVIEW` | Both workflows (new E2E Test Account) |
| `TEST_PRIVATE_KEY_SG` | Both workflows (new Monitoring SG) |
| `TEST_PRIVATE_KEY_EU` | Both workflows (new Monitoring EU) |
| `TEST_PRIVATE_KEY_US` | Both workflows (new Monitoring US) |
| `TEST_PRIVATE_KEY` | Migrate only (old E2E Test Account) |
| `TEST_PRIVATE_KEY_1` | Migrate only (old Monitoring SG) |
| `TEST_PRIVATE_KEY_2` | Migrate only (old Monitoring EU) |
| `TEST_PRIVATE_KEY_3` | Migrate only (old Monitoring US) |

**Workflow inputs:**

| Input | Default | Description |
|---|---|---|
| `dry_run` | `true` | Simulate without broadcasting transactions |
| `reserve_osmo` | `5` | OSMO to keep in topup account (distribute/topup phases) |
| `reserve_usdc` | `100` | USDC to keep in topup account (distribute/topup phases) |
| `topup_multiplier` | `3.0` | Target = warnAmount x this (topup workflow only) |

### Migration flow (one-time)

`scripts/migrate-funds.ts` — drains old accounts and distributes to new ones via
the topup holding account.

1. Add new secrets to GitHub
2. Run **extract** with dry run → verify derived addresses and amounts
3. Run **extract** live → funds move to topup account
4. Run **distribute** with dry run → review swap gap report + distribution plan
5. Do manual swaps on the Osmosis frontend if the gap report shows deficits
6. Run **distribute** live → funds split to new accounts by `warnAmount` ratio
7. If any step fails, re-run safely — already-completed transfers are detected and skipped

**Extract** drains one old account per invocation (4 parallel jobs in CI).
**Distribute** splits all available funds (after reserves) proportionally — nothing
is capped, so all funds are utilized.

### Topup flow (ongoing)

`scripts/topup-accounts.ts` — for each account/token, applies a **hysteresis
rule**: top up only when `current < warnAmount`, and when topping up, refill
all the way to `warnAmount × topup_multiplier` (the "target", default
`3 × warnAmount`). When `warnAmount ≤ current < target`, the script reports
`✓ ok (above warn, below target — no topup)` and skips the token. With the
default multiplier and the observed monitoring-wallet drain rate (~5 USDC/hr
on US, less on EU/SG), an auto-cron topup fires roughly every ~3.4 hours and
refills the account back to ~5 hours of headroom — striking a balance between
alert frequency and the size of stranded reserves.

The hysteresis matters because the monitoring tests are cyclic (each cron tick
runs Buy then Sell pairs that *should* net to ~0 USDC). Mid-cycle, between a
Buy and its matching Sell, the wallet looks transiently lower than its true
post-cycle floor. Without hysteresis, any topup dispatched mid-test (e.g. a
manual run while `prod-fe-trade-us` is executing) would over-top-up because
it sees the in-flight low. With hysteresis, only a real persistent shortfall
(below warnAmount) triggers a refill, so manual dispatches are idempotent
above warnAmount and safe to run any time.

When `reserve_usdc` / `reserve_osmo` leave less distributable than the sum of all
accounts' targets, the post-run Slack summary annotates the affected token with
`⚠ post-reserve < target (short X)` plus a footer note explaining the meaning
(`post-reserve = balance − reserve_<token>`). This is purely informational —
the topup itself still runs for tokens that have enough headroom, and the
warning suggests lowering the relevant reserve input if it becomes persistent.

1. Run with dry run → see per-account balances, targets, and deficits
2. Run live → sends only the deficits
3. If interrupted, re-run safely — already-topped-up accounts are skipped

**Who dispatches this workflow automatically?** See
[Topup dispatch model (dedup)](#topup-dispatch-model-dedup) above — the
geo-monitoring `topup-dispatch` job and the prod-master `check-balances` job,
both behind a shared in-flight + ~45 min success cooldown guard so only one
auto-topup fires per low-balance episode.

---

## Compromised Wallets

- osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa
