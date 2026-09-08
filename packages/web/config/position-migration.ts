/**
 * The two USDC denoms the position migration flow moves liquidity between.
 *
 * Matched as full minimal denoms so an `ibc/HASH` is never conflated with
 * another asset sharing its symbol. The pool pairings themselves are authored
 * in the osmosis-labs/fe-content repo rather than here, so a pairing can be
 * added, corrected, or withdrawn without a frontend deploy.
 *
 * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/position-migrations.json
 */
export const USDC_NOBLE_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

export const USDC_ALLOYED_DENOM =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";

/**
 * The allUSDC transmuter pool, converting USDC.noble to the alloy at 1:1.
 * The migration transaction routes its conversion leg through it.
 */
export const USDC_TRANSMUTER_POOL_ID = "3497";

/**
 * The canonical symbol the destination side is presented as, matching how the
 * variant-to-alloy converter names the alloy. The source side's symbol comes
 * from the position's own coins (the assetlist renders it as USDC.noble).
 */
export const USDC_CANONICAL_SYMBOL = "USDC";
