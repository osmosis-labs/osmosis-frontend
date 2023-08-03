import { DenomHelper } from "@keplr-wallet/common";
import { Hash } from "@keplr-wallet/crypto";
import { ChainStore } from "@keplr-wallet/stores";
import {
  AppCurrency,
  ChainInfo,
  Currency,
  IBCCurrency,
} from "@keplr-wallet/types";

type OriginChainCurrencyInfo = [
  string, // chain ID
  string, // coinMinimalDenom
  { portId: string; channelId: string }[] // IBC path (configured)
];

/** Will register IBC currencies to the Osmosis chain in the chain store, without querying for IBC trace denom from IBC module.
 *  It assumes the given IBC asset config is valid.
 *  Use for major performance boost if working with many IBC assets (as we are on Osmosis). */
export class UnsafeIbcCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
  /** IBC hash (ibc/XXXXX) => [chainId, coinMinimalDenom] (uatom) */
  // include chain ID, because nothing is stopping currencies from having the same config on multiple chains
  // example: uluna on columbus (original Terra) and uluna on phoenix (new Terra)
  protected _configuredIbcHashToOriginChainAndCoinMinimalDenom: Map<
    string,
    OriginChainCurrencyInfo
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
    const ibcCache = new Map<string, OriginChainCurrencyInfo>();
    osmosisIbcAssets.forEach(
      ({
        counterpartyChainId,
        sourceChannelId,
        coinMinimalDenom,
        ibcTransferPathDenom,
      }) => {
        const path = [{ portId: "transfer", channelId: sourceChannelId }];

        // multihop IBC
        if (ibcTransferPathDenom) {
          const ibcDenom = makeIBCMinimalDenom(
            sourceChannelId,
            ibcTransferPathDenom
          );
          path.push({
            portId: "transfer",
            channelId: ibcTransferPathDenom.split("/")[1],
          });
          ibcCache.set(ibcDenom, [counterpartyChainId, coinMinimalDenom, path]);
          return;
        }

        if (coinMinimalDenom.startsWith("ibc/")) {
          ibcCache.set(coinMinimalDenom, [
            counterpartyChainId,
            coinMinimalDenom,
            path,
          ]);
          return;
        }

        // compute the hash locally
        const ibcDenom = DenomHelper.ibcDenom(path, coinMinimalDenom);

        ibcCache.set(ibcDenom, [counterpartyChainId, coinMinimalDenom, path]);
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

    console.log("process", {
      encounteredIbcHashDenom,
      originChainAndCoinMinDenom,
    });

    // Check if IBC asset was configured and passed as osmosis IBC assets
    if (originChainAndCoinMinDenom) {
      const [originChainId, originCoinMinimalDenom, path] =
        originChainAndCoinMinDenom;

      // Find the currency in the configured counterparty chain info
      const chainInfo = this.chainStore.getChain(originChainId);
      const originCurrency = chainInfo.currencies.find((c) =>
        // use startsWith to accommodate cw20 tokens
        c.coinMinimalDenom.startsWith(originCoinMinimalDenom)
      ) as Currency;
      if (originCurrency) {
        // Register the origin currency info to the Osmosis chain, but with the IBC denom as the coinMinimalDenom
        // this is because it's the IBC representation on Osmosis of the token on the origin chain
        // the IBC currency on Osmosis inherits the origin chain's currency info, but with the IBC hash denom
        const ibcCurrency: IBCCurrency = {
          ...originCurrency,
          originChainId,
          coinMinimalDenom: encounteredIbcHashDenom,
          paths: path,
          originCurrency,
        };

        return ibcCurrency;
      }
    } else {
      // it's not configured for our frontend, but it's still an IBC asset, so add it uniquely
      return {
        coinDenom: "UNKNOWN",
        coinDecimals: 0,
        coinMinimalDenom: encounteredIbcHashDenom,
      };
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
