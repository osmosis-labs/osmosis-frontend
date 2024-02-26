import { Currency, IBCCurrency } from "@keplr-wallet/types";
import { ChainStore } from "@osmosis-labs/keplr-stores";
import type {
  AppCurrency,
  Asset,
  ChainInfo,
  CosmosCounterparty,
  IbcTransferMethod,
} from "@osmosis-labs/types";

type OriginChainCurrencyInfo = [
  string, // chain ID
  string, // coinMinimalDenom
  { portId: string; channelId: string }[] // IBC path (configured)
];

/** Will register IBC currencies to the Osmosis chain in the chain store, without querying for IBC trace denom from IBC module.
 *  It assumes the given IBC asset config is valid.
 *  Use for major performance boost if working with many IBC assets (as we are on Osmosis). */
export class UnsafeIbcCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
  /** 
    IBC hash (ibc/XXXXX) => [chainId, coinMinimalDenom, IBC path]
  
    include chain ID, because nothing is stopping currencies from having the same config on multiple chains
    example: uluna on columbus (original Terra) and uluna on phoenix (new Terra)
  */
  protected _configuredIbcHashToOriginChainAndCoinMinimalDenom: Map<
    string,
    OriginChainCurrencyInfo
  >;

  constructor(
    protected readonly chainStore: ChainStore<C>,
    protected readonly assets: Asset[]
  ) {
    chainStore.addSetChainInfoHandler((chainInfoInner) => {
      chainInfoInner.registerCurrencyRegistrar(this.unsafeRegisterIbcCurrency);
    });

    // calculate the hash based on the given IBC assets' channel id and coin source denom
    // tutorial: https://tutorials.cosmos.network/tutorials/6-ibc-dev/
    const ibcCache = new Map<string, OriginChainCurrencyInfo>();
    assets
      .filter((asset) => asset.transferMethods.some((m) => m.type === "ibc")) // Filter Osmosis assets
      .forEach((ibcAsset) => {
        const ibcInfo = ibcAsset.transferMethods.find(
          (m) => m.type === "ibc"
        ) as IbcTransferMethod;
        const ibcDenom = ibcAsset.coinMinimalDenom; // The IBC denom will also be the multihop hash when needed

        if (!ibcInfo) {
          throw new Error(
            `Invalid IBC asset config: ${JSON.stringify(ibcAsset)}`
          );
        }

        const channels = ibcInfo.chain.path.match(/channel-(\d+)/g);
        const paths = [];

        if (!channels) {
          throw new Error(`Invalid IBC path ${ibcInfo.chain.path}`);
        }

        const originChainId = (ibcAsset.counterparty[0] as CosmosCounterparty)
          ?.chainId;

        if (!originChainId || typeof originChainId !== "string")
          throw new Error(
            `No origin chain ID found for IBC asset ${ibcAsset.coinMinimalDenom}`
          );

        for (const channel of channels) {
          paths.push({
            portId: "transfer",
            channelId: channel,
          });
        }

        ibcCache.set(ibcDenom, [originChainId, ibcAsset.sourceDenom, paths]);
      });

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
      // it's not configured for our frontend, but it's still an IBC asset, so consider it unknown

      return {
        coinDenom: encounteredIbcHashDenom.slice(0, 8).toUpperCase(),
        coinDecimals: 0,
        coinMinimalDenom: encounteredIbcHashDenom,
      };
    }
  };
}
