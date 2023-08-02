import { DenomHelper } from "@keplr-wallet/common";
import { Hash } from "@keplr-wallet/crypto";
import { ChainStore } from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";

/** Will register IBC currencies to the Osmosis chain in the chain store, without querying for IBC trace denom from IBC module.
 *  It assumes the given IBC asset config is valid.
 *  Use for major performance boost if working with many IBC assets (as we are on Osmosis). */
export class UnsafeIbcCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
  /** IBC hash (ibc/XXXXX) => coinMinimalDenom (uatom) */
  protected _configuredIbcHashToOriginCoinMinimalDenom: Map<string, string>;

  constructor(
    protected readonly chainStore: ChainStore<C>,
    protected readonly osmosisIbcAssets: {
      sourceChannelId: string;
      coinMinimalDenom: string;
      ibcTransferPathDenom?: string;
    }[],
    protected readonly osmosisChainId: string
  ) {
    chainStore.addSetChainInfoHandler((chainInfoInner) => {
      chainInfoInner.registerCurrencyRegistrar(this.unsafeRegisterIbcCurrency);
    });

    // calculate the hash based on the given IBC assets' channel id and coin minimal denom
    // tutorial: https://tutorials.cosmos.network/tutorials/6-ibc-dev/
    const ibcCache = new Map<string, string>();
    osmosisIbcAssets.forEach(
      ({ sourceChannelId, coinMinimalDenom, ibcTransferPathDenom }) => {
        // multihop IBC
        if (ibcTransferPathDenom) {
          const ibcDenom = makeIBCMinimalDenom(
            sourceChannelId,
            ibcTransferPathDenom
          );
          ibcCache.set(ibcDenom, coinMinimalDenom);
          return;
        }

        if (coinMinimalDenom.startsWith("ibc/")) {
          console.log("set IBC", coinMinimalDenom);
          ibcCache.set(coinMinimalDenom, coinMinimalDenom);
          return;
        }

        // compute the hash locally
        const ibcDenom = DenomHelper.ibcDenom(
          [{ portId: "transfer", channelId: sourceChannelId }],
          coinMinimalDenom
        );

        ibcCache.set(ibcDenom, coinMinimalDenom);
      }
    );

    this._configuredIbcHashToOriginCoinMinimalDenom = ibcCache;
  }

  /** Map the origin currency configs on counterparty chains, with the IBC hash denom as it lands on our chain */
  protected readonly unsafeRegisterIbcCurrency = (
    encounteredIbcHashDenom: string
  ): AppCurrency | [AppCurrency | undefined, boolean] | undefined => {
    // we only handle IBC currencies, let other registrars handle other currencies
    if (!encounteredIbcHashDenom.startsWith("ibc/")) return;

    const originCoinMinimalDenom =
      this._configuredIbcHashToOriginCoinMinimalDenom.get(
        encounteredIbcHashDenom
      );

    const osmosisChain = this.chainStore.getChain(this.osmosisChainId);

    console.log("process", { encounteredIbcHashDenom, originCoinMinimalDenom });

    // Check if IBC asset was configured and passed as osmosis IBC assets
    if (originCoinMinimalDenom) {
      // Find the currency in one of the chain infos
      for (const chainInfo of this.chainStore.chainInfos) {
        const currency = chainInfo.currencies.find((c) =>
          // use startsWith to accommodate cw20 tokens
          c.coinMinimalDenom.startsWith(originCoinMinimalDenom)
        );
        if (currency) {
          // Register the origin currency info to the Osmosis chain, but with the IBC denom as the coinMinimalDenom
          // this is because it's the IBC representation on Osmosis of the token on the origin chain
          const ibcCurrency = {
            ...currency,
            coinMinimalDenom: encounteredIbcHashDenom,
          };

          // Add the currency to the Osmosis chain once
          if (!osmosisChain.findCurrency(ibcCurrency.coinMinimalDenom)) {
            osmosisChain.addCurrencies(ibcCurrency);
          }
          return ibcCurrency;
        }
      }
    } else {
      // it's not configured for our frontend, but it's still an IBC asset, so add it uniquely
      if (osmosisChain.findCurrency(encounteredIbcHashDenom)) return;
      osmosisChain.addCurrencies({
        coinDenom: "UNKNOWN",
        coinDecimals: 0,
        coinMinimalDenom: encounteredIbcHashDenom,
      });
    }
  };
}

export function makeIBCMinimalDenom(
  sourceChannelId: string,
  coinMinimalDenom: string
): string {
  return (
    "ibc/" +
    Buffer.from(
      Hash.sha256(
        Buffer.from(`transfer/${sourceChannelId}/${coinMinimalDenom}`)
      )
    )
      .toString("hex")
      .toUpperCase()
  );
}
