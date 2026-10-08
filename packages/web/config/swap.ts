import { Dec } from "@osmosis-labs/unit";

export const DefaultSlippage = "0.1";

/**
 * Slippage tiers the swap tool selects automatically from a quote, narrowest
 * first. A tier applies when the quote's adverse price impact reaches
 * `minPriceImpact` or its route liquidity is at most `maxRouteLiquidityUsd`;
 * the widest applicable tier wins. Below every tier, {@link DefaultSlippage}
 * applies.
 *
 * Route liquidity is the router's `liquidity_cap`: the summed USD liquidity
 * of every pool the quote routes through.
 */
export const AutoSlippageTiers: ReadonlyArray<{
  /** Slippage tolerance, in percent. */
  slippage: string;
  minPriceImpact: Dec;
  maxRouteLiquidityUsd: Dec;
}> = [
  {
    slippage: "0.2",
    minPriceImpact: new Dec("0.003"),
    maxRouteLiquidityUsd: new Dec(50_000),
  },
  {
    slippage: "0.3",
    minPriceImpact: new Dec("0.006"),
    maxRouteLiquidityUsd: new Dec(25_000),
  },
  {
    slippage: "0.5",
    minPriceImpact: new Dec("0.01"),
    maxRouteLiquidityUsd: new Dec(10_000),
  },
  {
    slippage: "1",
    minPriceImpact: new Dec("0.03"),
    maxRouteLiquidityUsd: new Dec(3_000),
  },
  {
    slippage: "2",
    minPriceImpact: new Dec("0.05"),
    maxRouteLiquidityUsd: new Dec(1_000),
  },
  {
    slippage: "3",
    minPriceImpact: new Dec("0.1"),
    maxRouteLiquidityUsd: new Dec(300),
  },
  {
    slippage: "5",
    minPriceImpact: new Dec("0.2"),
    maxRouteLiquidityUsd: new Dec(100),
  },
];
