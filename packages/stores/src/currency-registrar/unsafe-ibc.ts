import { DenomHelper } from "@keplr-wallet/common";
import { ChainStore } from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";

/** Will register IBC currencies to the Osmosis chain in the chain store, without querying for IBC trace denom from IBC module.
 *  It assumes the given IBC asset config is valid.
 *  Use for major performance boost if working with many IBC assets (as we are on Osmosis). */
export class UnsafeIbcCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
  /** IBC hash (ibc/XXXXX) => coinMinimalDenom (uatom) */
  protected _configuredIbcHashToCoinMinimalDenom: Map<string, string>;

  constructor(
    protected readonly chainStore: ChainStore<C>,
    protected readonly osmosisIbcAssets: {
      sourceChannelId: string;
      coinMinimalDenom: string;
    }[],
    protected readonly osmosisChainId: string
  ) {
    chainStore.addSetChainInfoHandler((chainInfoInner) => {
      chainInfoInner.registerCurrencyRegistrar(this.unsafeRegisterIbcCurrency);
    });

    // calculate the hash based on the given IBC assets' channel id and coin minimal denom
    // tutorial: https://tutorials.cosmos.network/tutorials/6-ibc-dev/
    const ibcCache = new Map<string, string>();
    osmosisIbcAssets.forEach(({ sourceChannelId, coinMinimalDenom }) => {
      const ibcDenom = DenomHelper.ibcDenom(
        [{ portId: "transfer", channelId: sourceChannelId }],
        coinMinimalDenom
      );
      ibcCache.set(ibcDenom, coinMinimalDenom);
    });

    this._configuredIbcHashToCoinMinimalDenom = ibcCache;
  }

  protected readonly unsafeRegisterIbcCurrency = (
    ibcHashCoinMinimalDenom: string
  ): AppCurrency | [AppCurrency | undefined, boolean] | undefined => {
    const coinMinimalDenom = this._configuredIbcHashToCoinMinimalDenom.get(
      ibcHashCoinMinimalDenom
    );

    // Check if IBC asset was configured and passed as osmosis IBC assets
    if (coinMinimalDenom) {
      // Find the currency in one of the chain infos
      for (const chainInfo of this.chainStore.chainInfos) {
        const currency = chainInfo.findCurrency(coinMinimalDenom);
        if (currency) {
          // Register the currency to the Osmosis chain, but with the IBC denom
          const ibcCurrency = {
            ...currency,
            coinMinimalDenom: ibcHashCoinMinimalDenom,
          };

          const osmosisChain = this.chainStore.getChain(this.osmosisChainId);
          osmosisChain.addCurrencies(ibcCurrency);
          return ibcCurrency;
        }
      }
    }
  };
}
