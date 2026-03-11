/**
 * @file balance-config.ts
 * @description Centralised balance requirements for all e2e test accounts.
 *
 * Each account has a two-threshold model per token:
 * - `minAmount`  — hard floor. The precursor script exits non-zero when the
 *   on-chain balance is below this value.
 * - `warnAmount` — soft floor. When the balance is between minAmount and
 *   warnAmount, the precursor sends a Slack alert but lets the tests proceed.
 *
 * Thresholds default to **token units** but can be set to **USD** via
 * `unit: "usd"`. USD thresholds are converted to token amounts at runtime
 * using the current SQS price. Use USD for volatile assets (BTC, OSMO)
 * where fixed token amounts would quickly become stale.
 *
 * ## Maintenance
 *
 * When adding or changing a test that uses tokens, bump the relevant
 * entry here. The `note` field documents which tests consume each token.
 *
 * ## Sell-tab caveat
 *
 * The Osmosis Buy tab always uses fiat (USD) input, but the Sell tab's
 * default depends on the `inGivenOut` feature flag. The amounts below
 * assume fiat mode for sell tests. If the flag changes, BTC / OSMO sell
 * amounts may need adjustment.
 */

export interface AccountBalanceRequirement {
  /** Token symbol (must match a key in TOKEN_DENOMS). */
  token: string;
  /** Hard minimum — FAIL if below. */
  minAmount: number;
  /** Warning threshold — Slack alert if below. */
  warnAmount: number;
  /** `"token"` (default) = amounts in token units; `"usd"` = amounts in US dollars, converted at runtime. */
  unit?: "token" | "usd";
  /** Which tests / workflows consume this token. */
  note?: string;
}

/**
 * Per-account balance requirements keyed by ACCOUNT_LABEL.
 *
 * Labels match the values used in the cancel-open-orders and CI workflows.
 */
export const ACCOUNT_REQUIREMENTS: Record<
  string,
  AccountBalanceRequirement[]
> = {
  "E2E Test Account": [
    // minAmount = actual consumed + 5% buffer (only fail when tests would genuinely fail)
    // warnAmount = ~2x consumed (top-up reminder before it becomes critical)
    // trade.wallet.spec.ts: buy 1.12 USDC, sell 1.11+1.01 ATOM, limit 1.01 OSMO
    // swap.usdc.wallet.spec.ts: 0.5 USDC, 0.015 ATOM, 0.02 TIA, 0.01 INJ, 0.025 AKT
    // swap.osmo.wallet.spec.ts: 0.2 OSMO, 0.01 ATOM
    { token: "USDC", minAmount: 1.7, warnAmount: 3.5, note: "~1.62 consumed (trade buy + swaps)" },
    { token: "ATOM", minAmount: 2.27, warnAmount: 4.5, note: "~2.16 consumed (trade sell + limit + swaps)" },
    { token: "OSMO", minAmount: 1.27, warnAmount: 2.5, note: "~1.21 consumed (limit sell + swap)" },
    { token: "TIA", minAmount: 0.022, warnAmount: 0.05, note: "~0.02 consumed (swap TIA)" },
    { token: "INJ", minAmount: 0.011, warnAmount: 0.025, note: "~0.01 consumed (swap INJ)" },
    { token: "AKT", minAmount: 0.027, warnAmount: 0.06, note: "~0.025 consumed (swap AKT)" },
  ],

  "Monitoring SG": [
    // monitoring.swap.wallet.spec.ts + monitoring.market.wallet.spec.ts
    {
      token: "USDC",
      minAmount: 7,
      warnAmount: 8.4,
      note: "market buy + swap stables",
    },
    {
      token: "OSMO",
      minAmount: 2,
      warnAmount: 5,
      unit: "usd",
      note: "market sell OSMO",
    },
    {
      token: "BTC",
      minAmount: 1.6,
      warnAmount: 5,
      unit: "usd",
      note: "market sell BTC (fiat-mode ~$1.60)",
    },
    {
      token: "USDC.eth.axl",
      minAmount: 1,
      warnAmount: 1.2,
      note: "swap stables",
    },
    { token: "USDT", minAmount: 1, warnAmount: 1.2, note: "swap stables" },
  ],

  "Monitoring EU": [
    // monitoring.swap + monitoring.market + monitoring.limit
    {
      token: "USDC",
      minAmount: 7,
      warnAmount: 8.4,
      note: "market buy + limit buy + swap stables",
    },
    {
      token: "OSMO",
      minAmount: 2,
      warnAmount: 5,
      unit: "usd",
      note: "market sell + limit sell OSMO",
    },
    {
      token: "BTC",
      minAmount: 1.6,
      warnAmount: 5,
      unit: "usd",
      note: "market sell BTC (fiat-mode ~$1.60)",
    },
    {
      token: "USDC.eth.axl",
      minAmount: 1,
      warnAmount: 1.2,
      note: "swap stables",
    },
    { token: "USDT", minAmount: 1, warnAmount: 1.2, note: "swap stables" },
  ],

  "Monitoring US": [
    // monitoring.swap + monitoring.market + monitoring.limit
    {
      token: "USDC",
      minAmount: 7,
      warnAmount: 8.4,
      note: "market buy + limit buy + swap stables",
    },
    {
      token: "OSMO",
      minAmount: 2,
      warnAmount: 5,
      unit: "usd",
      note: "market sell + limit sell OSMO",
    },
    {
      token: "BTC",
      minAmount: 1.6,
      warnAmount: 5,
      unit: "usd",
      note: "market sell BTC (fiat-mode ~$1.60)",
    },
    {
      token: "USDC.eth.axl",
      minAmount: 1,
      warnAmount: 1.2,
      note: "swap stables",
    },
    { token: "USDT", minAmount: 1, warnAmount: 1.2, note: "swap stables" },
  ],
};
