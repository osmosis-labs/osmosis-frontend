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
export const ACCOUNT_REQUIREMENTS: Record<string, AccountBalanceRequirement[]> =
  {
    "E2E Test Account": [
      // minAmount gates the PR smoke job (check-balances skips it below this),
      // so it covers only what that job spends: the swap.usdc.wallet round
      // trip (0.1-0.2 USDC out and back) and the trade.wallet OSMO limit order
      // (~$1.01, placed and cancelled), plus gas.
      // warnAmount sizes auto-topup for the full suite on stage, which has no
      // balance gate of its own: trade.wallet buy 1.12 USDC, sell 1.11+1.01
      // ATOM, limit 1.01 OSMO; swap.osmo.wallet 0.2 OSMO out and back.
      // The swap tests are round trips that start from USDC or OSMO, so they
      // need no TIA, INJ or AKT on hand.
      {
        token: "USDC",
        minAmount: 0.3,
        warnAmount: 3.5,
        note: "PR smoke: ~0.2 (swap round trip). Full suite: ~1.62 (trade buy + swaps). USDC is the alloy since the assetlist identity handover; the topup account must hold allUSDC (convert Noble 1:1 via the transmuter) for auto-topup to fund it.",
      },
      {
        token: "ATOM",
        minAmount: 0,
        warnAmount: 4.5,
        note: "PR smoke: none. Full suite: ~2.16 (trade sell + limit + swaps)",
      },
      {
        token: "OSMO",
        minAmount: 1.3,
        warnAmount: 2.5,
        unit: "usd",
        note: "USD-denominated (MTN-157): the limit sell is fiat-mode (~$1.01), so required OSMO scales inversely with price. Fixed token thresholds went stale as OSMO fell and created a topup dead-zone (3.4 OSMO cleared the old 2.5-token gate yet starved the sells). min covers the fiat sell (~$1.01) PLUS the swap.osmo 0.2 OSMO swap (token-denominated), with deliberate price headroom: at $1.3 the USD floor still funds the fixed 0.2 OSMO swap until OSMO reaches ~$1.45 (1.01 + 0.2*1.45 = 1.30), well above the current ~$0.04; warn≈2x. NB: the 0.2 OSMO swap is a fixed token need, so this USD floor under-provisions only once OSMO climbs past ~$1.45; revisit then. NB: the check-balances auto-topup dispatches --ref stage, so the scaled target only applies once this is merged to stage.",
      },
    ],
  };
