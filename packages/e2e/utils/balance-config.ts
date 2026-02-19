/**
 * @file balance-config.ts
 * @description Centralised balance requirements for all e2e test accounts.
 *
 * Each account has a two-threshold model per token:
 * - `minAmount`  — hard floor in token units. The precursor script exits
 *   non-zero when the on-chain balance is below this value.
 * - `warnAmount` — soft floor (~20 % above minAmount). When the balance is
 *   between minAmount and warnAmount, the precursor sends a Slack alert
 *   but lets the tests proceed.
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
  /** Hard minimum in token units — FAIL if below. */
  minAmount: number;
  /** Warning threshold in token units (~20 % above minAmount) — Slack alert if below. */
  warnAmount: number;
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
    // trade.wallet.spec.ts + swap.usdc.wallet.spec.ts + swap.osmo.wallet.spec.ts
    { token: "USDC", minAmount: 5, warnAmount: 6, note: "trade buy + swaps" },
    {
      token: "ATOM",
      minAmount: 3,
      warnAmount: 3.6,
      note: "trade sell + swap ATOM tests",
    },
    {
      token: "OSMO",
      minAmount: 3,
      warnAmount: 3.6,
      note: "limit sell + swap OSMO tests",
    },
    { token: "TIA", minAmount: 0.1, warnAmount: 0.12, note: "swap TIA tests" },
    { token: "INJ", minAmount: 0.05, warnAmount: 0.06, note: "swap INJ tests" },
    { token: "AKT", minAmount: 0.1, warnAmount: 0.12, note: "swap AKT tests" },
  ],

  "Monitoring SG": [
    // monitoring.swap.wallet.spec.ts + monitoring.market.wallet.spec.ts
    {
      token: "USDC",
      minAmount: 6,
      warnAmount: 7.2,
      note: "market buy + swap stables",
    },
    {
      token: "OSMO",
      minAmount: 3,
      warnAmount: 3.6,
      note: "market sell OSMO",
    },
    {
      token: "BTC",
      minAmount: 0.001,
      warnAmount: 0.0012,
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
      minAmount: 4,
      warnAmount: 4.8,
      note: "market sell + limit sell OSMO",
    },
    {
      token: "BTC",
      minAmount: 0.001,
      warnAmount: 0.0012,
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
      minAmount: 4,
      warnAmount: 4.8,
      note: "market sell + limit sell OSMO",
    },
    {
      token: "BTC",
      minAmount: 0.001,
      warnAmount: 0.0012,
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
