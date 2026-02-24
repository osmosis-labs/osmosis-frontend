# @osmosis-labs/web/e2e

This package contains the Playwright E2E tests and a Keplr wallet extension for browser automation,
as well as standalone utility scripts for on-chain operations (e.g. cancelling open limit orders).

## Environment Variables

By default, configuration is pointing to the [Stage](https://stage.osmosis.zone) environment. Tests will automatically install a wallet.
All you need to add is a private key for the wallet being used:

- example command `export PRIVATE_KEY=0x....` for the frontend tests.
- On PowerShell: `$env:PRIVATE_KEY="0x...."`
- Or add `PRIVATE_KEY=<hex>` to `packages/e2e/.env` (gitignored)

### CI Secrets — Account Mapping

| Secret | Used In |
|---|---|
| `TEST_PRIVATE_KEY` | Frontend E2E tests (preview + prod) |
| `TEST_PRIVATE_KEY_1` | Monitoring SG region (swap, trade, limit) |
| `TEST_PRIVATE_KEY_2` | Monitoring EU region (swap, trade, limit) |
| `TEST_PRIVATE_KEY_3` | Monitoring US region (swap, trade, limit) |

> Wallet addresses are derived from each private key at runtime. `TEST_WALLET_ID_*` secrets are not required by scripts in this package.

### Run E2E Tests

To install Playwright, please execute `npx playwright install --with-deps chromium` from the `/packages/e2e` folder.

To run a Select pair tests, please execute `npx playwright test -g "Test Select Swap Pair feature"` from the /web folder.
To run a Swap E2E tests, please execute `npx playwright test swap.osmo.wallet` from the /web folder.
To run a Monitoring E2E tests, please execute `npx playwright test monitoring --timeout 180000` from the /web folder.

Tests can be executed locally in a browser by changing `headless: true` to `headless: false`.

### Frontend E2E Test Wallet

The wallet for `TEST_PRIVATE_KEY` must contain:

- OSMO > 10
- ATOM > 1
- INJ > 0.4
- TIA > 0.5
- AKT > 1
- BTC > 0
- WBTC > 0
- SOL > 0
- SOL.wh > 0
- ETH.axl > 0
- DAI > 0
- milkTIA > 0
- KUJI > 0
- USDC > 5
- USDT > 2
- USDC.eth.axl > 2

Tokens marked as `> 0` are needed for a portfolio balances test.

### Synthetic Geo Monitoring Frontend Tests

Monitoring tests run from three geographic regions using separate accounts.
In CI secrets they are referenced as:

- `TEST_PRIVATE_KEY_1` — SG region
- `TEST_PRIVATE_KEY_2` — EU region
- `TEST_PRIVATE_KEY_3` — US region

Each monitoring test wallet must contain:

- OSMO > 10
- USDC > 10
- USDT > 2
- USDC.eth.axl > 2

The USDC is used to buy OSMO and WBTC and must be kept above 5$ at all times, so it is better to have some buffer.

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
| `monitoring-limit-geo-e2e-tests.yml` | `fe-limit-eu` | `TEST_PRIVATE_KEY_2` (Monitoring EU) |
| `monitoring-limit-geo-e2e-tests.yml` | `fe-limit-us` | `TEST_PRIVATE_KEY_3` (Monitoring US) |
| `frontend-e2e-tests.yml` | `preview-trade-tests` | `TEST_PRIVATE_KEY` (E2E Test Account) |

The cleanup step uses `continue-on-error: true` so that a transient RPC failure does not block the test run.

---

## Compromised Wallets

- osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa
