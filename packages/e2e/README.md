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

| Secret | Address | Used In |
|---|---|---|
| `TEST_PRIVATE_KEY` | `osmo1qyc8u7cn0zjxcu9dvrjz5zwfnn0ck92v62ak9l` | Frontend E2E tests (preview + prod) |
| `TEST_PRIVATE_KEY_1` | `osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c` | Monitoring SG region (swap, trade, limit) |
| `TEST_PRIVATE_KEY_2` | `osmo1fapvfx64af2eperkggnwd6zmpzdvvnq4xjc2dv` | Monitoring EU region (swap, trade, limit) |
| `TEST_PRIVATE_KEY_3` | derived at runtime | Monitoring US region (swap, trade, limit) |

> `TEST_WALLET_ID_*` secrets mirror the addresses above but are not required by the scripts in this package — addresses are derived from the private key automatically.

### Run E2E Tests

To install Playwright, please execute `npx playwright install --with-deps chromium` from the `/packages/e2e` folder.

To run a Select pair tests, please execute `npx playwright test -g "Test Select Swap Pair feature"` from the /web folder.
To run a Swap E2E tests, please execute `npx playwright test swap.osmo.wallet` from the /web folder.
To run a Monitoring E2E tests, please execute `npx playwright test monitoring --timeout 180000` from the /web folder.

Tests can be executed locally in a browser by changing `headless: true` to `headless: false`.

### Frontend E2E Test Wallet

The wallet for `TEST_PRIVATE_KEY` (`osmo1qyc8u7cn0zjxcu9dvrjz5zwfnn0ck92v62ak9l`) must contain:

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

- `TEST_PRIVATE_KEY_1` for `osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c` (SG region)
- `TEST_PRIVATE_KEY_2` for `osmo1fapvfx64af2eperkggnwd6zmpzdvvnq4xjc2dv` (EU region)
- `TEST_PRIVATE_KEY_3` — address derived at runtime (US region)

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
```
=== Active Orders: Monitoring EU ===
Derived address: osmo1fapvfx64af2eperkggnwd6zmpzdvvnq4xjc2dv

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
   ```
   PRIVATE_KEY=<your-hex-private-key>
   ACCOUNT_LABEL=Local Test
   ```
2. Install deps: `yarn install` (from `packages/e2e/`)
3. Run `get-active-orders` first to confirm orders exist, then `cancel-all-orders` with `DRY_RUN=true` to preview, then without `DRY_RUN` to execute.

### GitHub Actions Workflows

Two manually-triggered workflows are available:

| Workflow | File | Effect |
|---|---|---|
| **Cancel Open Limit Orders — Dry Run** | `cancel-open-orders-dry-run.yml` | Lists open orders and previews what would be cancelled. No transactions sent. |
| **Cancel Open Limit Orders** | `cancel-open-orders.yml` | Cancels all open orders for all test accounts. Sends real transactions. |

Both run all four test accounts in parallel.

**Recommended flow:**
1. Trigger the dry run first from the GitHub Actions tab → **Cancel Open Limit Orders — Dry Run (E2E Test Accounts)** → **Run workflow**
2. Review the logs to confirm address derivation and order listing work correctly
3. Trigger the real workflow → **Cancel Open Limit Orders (E2E Test Accounts)** → **Run workflow**

---

## Compromised Wallets

- osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa
