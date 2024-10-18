import { CoinPretty, Int, RatePretty } from "@keplr-wallet/unit";
import type { SplitTokenInQuote } from "@osmosis-labs/pools";
import { MinimalAsset } from "@osmosis-labs/types";

interface FormattedSplit {
  pools: {
    id: string;
    type:
      | "concentrated"
      | "weighted"
      | "stable"
      | "cosmwasm-transmuter"
      | "cosmwasm-astroport-pcl"
      | "cosmwasm-whitewhale"
      | "cosmwasm";
    spreadFactor: RatePretty;
    dynamicSpreadFactor: boolean;
    inCurrency: MinimalAsset | undefined;
    outCurrency: MinimalAsset | undefined;
  }[];
  initialAmount: Int;
  tokenOutDenoms: string[];
  tokenInDenom: string;
}

// we reformat the response to be more readable - this is the corresponding type
export type FormattedQuote = Omit<
  SplitTokenInQuote,
  "split" | "swapFee" | "amount" | "priceImpactTokenOut"
> & {
  split: FormattedSplit[];
  name: string | void;
  timeMs: number;
  amount: CoinPretty;
  priceImpactTokenOut: RatePretty | undefined;
  swapFee: RatePretty | undefined;
};
