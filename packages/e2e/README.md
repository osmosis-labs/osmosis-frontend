# @osmosis-labs/web/e2e

This package contains Playwright E2E tests, a Keplr wallet integration, and
utility scripts for account balance monitoring and limit-order cleanup.

## Environment Variables

By default, configuration points to the [Stage](https://stage.osmosis.zone) environment. Tests automatically install a wallet. All you need is a private key for the wallet being used:

```bash
export PRIVATE_KEY=0x....
```

### CI Secrets → Accounts

| Secret | Label | Address |
|--------|-------|---------|
| `TEST_PRIVATE_KEY` | E2E Test Account | `osmo1qyc8u7cn0zjxcu9dvrjz5zwfnn0ck92v62ak9l` |
| `TEST_PRIVATE_KEY_1` | Monitoring SG | `osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c` |
| `TEST_PRIVATE_KEY_2` | Monitoring EU | `osmo1fapvfx64af2eperkggnwd6zmpzdvvnq4xjc2dv` |
| `TEST_PRIVATE_KEY_3` | Monitoring US | derived at runtime from key |

Addresses are derived from the private key using `deriveAddress()` in `utils/wallet-utils.ts`.

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
- **`warnAmount`** — soft floor (~20 % above minAmount). If the balance is
  between minAmount and warnAmount, a Slack alert is sent but tests proceed.

Slack alerts use the existing `SERVER_E2E_TESTS_SLACK_WEBHOOK_URL` secret.

### Updating Requirements

When adding or modifying a test that uses tokens, update the requirements in
`utils/balance-config.ts`. Each entry documents which tests consume the token:

```typescript
{ token: "USDC", minAmount: 5, warnAmount: 6, note: "trade buy tests" },
```

### Price-Aware Checks

For tests that enter dollar amounts (Buy tab), requirements can use `unit: "usd"`:

```typescript
await ensureBalances(address, [
  { token: "BTC", amount: 1.6, unit: "usd" },  // need $1.60 worth of BTC
]);
```

The checker fetches the current price from SQS and converts to token amounts
with a 1 % buffer (configurable via `PRICE_BUFFER_PERCENT` env var).

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

The following workflows run `check-balances.ts` before Playwright:

| Workflow | Job | Account |
|----------|-----|---------|
| `frontend-e2e-tests.yml` | `preview-trade-tests` | E2E Test Account (`TEST_PRIVATE_KEY`) |
| `monitoring-limit-geo-e2e-tests.yml` | `fe-limit-eu` | Monitoring EU (`TEST_PRIVATE_KEY_2`) |
| `monitoring-limit-geo-e2e-tests.yml` | `fe-limit-us` | Monitoring US (`TEST_PRIVATE_KEY_3`) |

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All balances healthy |
| `1` | At least one balance below `minAmount` (critical — blocks tests) |
| `2` | All above `minAmount` but at least one below `warnAmount` (Slack warning) |

## Required Token Balances

### E2E Test Account (`TEST_PRIVATE_KEY`)

| Token | Min Balance | Used By |
|-------|------------|---------|
| OSMO | 3 | limit sell + swap tests |
| USDC | 5 | trade buy + swaps |
| ATOM | 3 | trade sell + swap tests |
| TIA | 0.1 | swap tests |
| INJ | 0.05 | swap tests |
| AKT | 0.1 | swap tests |

### Monitoring Accounts (`TEST_PRIVATE_KEY_1` / `_2` / `_3`)

| Token | Min Balance | Used By |
|-------|------------|---------|
| OSMO | 3–4 | market sell + limit sell |
| USDC | 6–7 | market buy + limit buy + swap stables |
| BTC | 0.001 | market sell BTC |
| USDC.eth.axl | 1 | swap stables |
| USDT | 1 | swap stables |

## Compromised Wallets

- `osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa`
