import { DenomHelper } from "@keplr-wallet/common";
import { Hash } from "@keplr-wallet/crypto";
import { ChainStore } from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";

/** Will register IBC currencies to the Osmosis chain in the chain store, without querying for IBC trace denom from IBC module.
 *  It assumes the given IBC asset config is valid.
 *  Use for major performance boost if working with many IBC assets (as we are on Osmosis). */
export class UnsafeIbcCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
  /** IBC hash (ibc/XXXXX) => [chainId, coinMinimalDenom] (uatom) */
  // include chain ID, because nothing is stopping currencies from having the same config on multiple chains
  // example: uluna on columbus (original Terra) and uluna on phoenix (new Terra)
  protected _configuredIbcHashToOriginChainAndCoinMinimalDenom: Map<
    string,
    [string, string]
  >;

  constructor(
    protected readonly chainStore: ChainStore<C>,
    protected readonly osmosisIbcAssets: {
      counterpartyChainId: string;
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
    const ibcCache = new Map<string, [string, string]>();
    osmosisIbcAssets.forEach(
      ({
        counterpartyChainId,
        sourceChannelId,
        coinMinimalDenom,
        ibcTransferPathDenom,
      }) => {
        // multihop IBC
        if (ibcTransferPathDenom) {
          const ibcDenom = makeIBCMinimalDenom(
            sourceChannelId,
            ibcTransferPathDenom
          );
          ibcCache.set(ibcDenom, [counterpartyChainId, coinMinimalDenom]);
          return;
        }

        if (coinMinimalDenom.startsWith("ibc/")) {
          ibcCache.set(coinMinimalDenom, [
            counterpartyChainId,
            coinMinimalDenom,
          ]);
          return;
        }

        // compute the hash locally
        const ibcDenom = DenomHelper.ibcDenom(
          [{ portId: "transfer", channelId: sourceChannelId }],
          coinMinimalDenom
        );

        ibcCache.set(ibcDenom, [counterpartyChainId, coinMinimalDenom]);
      }
    );

    this._configuredIbcHashToOriginChainAndCoinMinimalDenom = ibcCache;
  }

  /** Map the origin currency configs on counterparty chains, with the IBC hash denom as it lands on our chain */
  protected readonly unsafeRegisterIbcCurrency = (
    encounteredIbcHashDenom: string
  ): AppCurrency | [AppCurrency | undefined, boolean] | undefined => {
    // we only handle IBC currencies, let other registrars handle other currencies
    if (!encounteredIbcHashDenom.startsWith("ibc/")) return;

    const originChainAndCoinMinDenom =
      this._configuredIbcHashToOriginChainAndCoinMinimalDenom.get(
        encounteredIbcHashDenom
      );

    const osmosisChain = this.chainStore.getChain(this.osmosisChainId);

    console.log("process", {
      encounteredIbcHashDenom,
      originChainAndCoinMinDenom,
    });

    // Check if IBC asset was configured and passed as osmosis IBC assets
    if (originChainAndCoinMinDenom) {
      const [originChainId, originCoinMinimalDenom] =
        originChainAndCoinMinDenom;

      // Find the currency in the configured counterparty chain info
      const chainInfo = this.chainStore.getChain(originChainId);
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
        if (
          !osmosisChain.currencies.find(
            (c) => c.coinDenom !== ibcCurrency.coinDenom
          )
        ) {
          osmosisChain.addCurrencies(ibcCurrency);
        }
        return ibcCurrency;
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
