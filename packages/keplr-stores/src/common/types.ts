import { AppCurrency } from "@osmosis-labs/unit";
import { KeplrChainInfo as ChainInfo } from "@osmosis-labs/types";

export interface ChainGetter {
  // Return the chain info matched with chain id.
  // Expect that this method will return the chain info reactively,
  // so it is possible to detect the chain info changed without any additional effort.
  getChain(chainId: string): ChainInfo & {
    raw: ChainInfo;
    addUnknownCurrencies(...coinMinimalDenoms: string[]): void;
    findCurrency(coinMinimalDenom: string): AppCurrency | undefined;
    forceFindCurrency(coinMinimalDenom: string): AppCurrency;
  };
}

export type CoinPrimitive = {
  denom: string;
  amount: string;
};
