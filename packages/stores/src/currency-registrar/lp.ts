import { AppCurrency } from "@keplr-wallet/types";
import { ChainStore } from "@osmosis-labs/keplr-stores";
import type { ChainInfo } from "@osmosis-labs/types";

/** Adds Osmosis LP share currencies to the Osmosis chain in the chain store as they are encountered in query responses. */
export class LPCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
  constructor(protected readonly chainStore: ChainStore<C>) {
    chainStore.addSetChainInfoHandler((chainInfoInner) => {
      chainInfoInner.registerCurrencyRegistrar(this.registerLPCurrency);
    });
  }

  protected readonly registerLPCurrency = (
    coinMinimalDenom: string
  ): AppCurrency | [AppCurrency | undefined, boolean] | undefined => {
    if (coinMinimalDenom.startsWith("gamm/pool/")) {
      // In the case of GAMM tokens, do not query the bank metadata, register as currency immediately.
      const poolId = coinMinimalDenom.replace("gamm/pool/", "");
      return makeGammCurrency(poolId);
    }
  };
}

export function makeGammCurrency(
  poolId: string,
  coinMinimalDenom: string = `gamm/pool/${poolId}`
) {
  return {
    coinMinimalDenom,
    coinDecimals: 18,
    coinDenom: `GAMM/${poolId}`,
  };
}
