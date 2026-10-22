import type { AppCurrency, CoinPretty, Dec, Int } from "@osmosis-labs/unit";

/** Plain share pool data the config needs. Fed in by the view layer (e.g. from tRPC). */
export type AddLiquidityPoolData = {
  id: string;
  type: "weighted" | "stable";
  /** Total pool shares, as a coin of the 18 decimal share currency. */
  totalShare: CoinPretty;
  /** Pool assets in chain order. `weight` is only set for weighted pools. */
  assets: { amount: CoinPretty; weight?: Int }[];
  /** Only set for weighted pools. */
  totalWeight?: Int;
  swapFee: Dec;
  /** True if an asset currency (and so its decimals) is a guess, e.g. an unlisted asset. */
  hasGuessedCurrency?: boolean;
  /** Only set for stable pools. */
  stableSwapInfo?: {
    scalingFactorController: string;
    scalingFactor: string[];
  };
};

/** Raw user balance in base units. */
export type AddLiquidityBalance = { denom: string; amount: string };

export interface CreatePoolConfigOpts {
  minAssetsCount: number;
  maxAssetsCount: number;
}

/** A raw (base unit) balance of a currency, as provided to the config by the UI. */
export interface CreatePoolBalance {
  currency: AppCurrency;
  /** Amount in base units. */
  amount: string;
}
