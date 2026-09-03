/**
 * @file wallet-msg.ts
 * @description Normalizes the YAML that Keplr renders for a message awaiting
 * approval, so assertions can match a `key: value` pair without caring how
 * long the value happens to be.
 *
 * Keplr shows the message as YAML, and YAML moves a scalar onto its own
 * indented line once the rendered line would exceed 80 columns:
 *
 *     token_in:
 *       amount: '1120000'
 *       denom: >-
 *         factory/osmo147h5.../alloyed/allUSDC
 *
 * That threshold cuts straight through the denoms these tests assert on. An
 * `ibc/` denom is 68 characters, so `    denom: ibc/...` renders at 79 — one
 * column under the limit, on a single line. The alloyed USDC denom is 87, so
 * the same line would be 98 and folds. A `toContain("denom: <value>")`
 * assertion therefore passes for one denom and fails for the other while both
 * messages are perfectly correct, which is what happened when the default USDC
 * quote moved to the alloy.
 *
 * Rejoining the folded scalars keeps the assertions meaningful — they still
 * require the value to appear under the right key, rather than loosely
 * anywhere in the message — without encoding a guess about string length.
 */

/**
 * Rejoins YAML block scalars (`>`, `>-`, `|`, `|+` and friends) onto their key
 * so `key: value` matches regardless of the wrapping Keplr applied.
 *
 * The denoms involved contain no spaces, so YAML has no interior break point
 * and always folds them onto exactly one continuation line.
 */
export function unfoldWalletMsgYaml(msg: string | undefined) {
  return msg?.replace(/:[ \t]*[>|][-+]?[ \t]*\r?\n[ \t]+/g, ": ");
}
