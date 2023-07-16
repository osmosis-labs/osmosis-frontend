import { ChainStore } from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";

export class LPCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
  constructor(protected readonly chainStore: ChainStore<C>) {
    chainStore.addSetChainInfoHandler((chainInfoInner) => {
      chainInfoInner.registerCurrencyRegistrar(this.registerLPCurrency);
    });
  }

  protected readonly registerLPCurrency = (
    coinMinimalDenom: string
  ): AppCurrency | [AppCurrency | undefined, boolean] | undefined => {
    // if (!coinMinimalDenom) throw new Error("Missing coinMinimalDenom");
    if (coinMinimalDenom.startsWith("gamm/pool/")) {
      // In the case of GAMM tokens, not query the bank metadata, register as currency immediately.
      const poolId = coinMinimalDenom.replace("gamm/pool/", "");
      return {
        coinMinimalDenom,
        coinDecimals: 18,
        coinDenom: `GAMM/${poolId}`,
      };
    }
  };
}
