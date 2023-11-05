import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import {
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import {
  AccountStore,
  ChainStore,
  IPriceStore,
  makeIBCMinimalDenom,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { Asset } from "@osmosis-labs/types";
import { getMinimalDenomFromAssetList } from "@osmosis-labs/utils";
import { computed, makeObservable } from "mobx";

import { IBCAdditionalData } from "~/config/ibc-overrides";
import {
  CoinBalance,
  IBCBalance,
  IBCCW20ContractBalance,
} from "~/stores/assets/types";
import { UnverifiedAssetsState, UserSettings } from "~/stores/user-settings";
import { last } from "~/utils/array";

/**
 * Wrapper around IBC asset config and stores to provide memoized metrics about osmosis assets.
 */
export class ObservableAssets {
  private _verifiedAssets = new Set<string>();

  constructor(
    protected readonly assets: Asset[],
    // protected readonly ibcAssets: (IBCAsset & {
    //   /** URL if the asset requires a custom deposit external link. Must include `https://...`. */
    //   depositUrlOverride?: string;

    //   /** URL if the asset requires a custom withdrawal external link. Must include `https://...`. */
    //   withdrawUrlOverride?: string;

    //   /** Alternative chain name to display as the source chain */
    //   sourceChainNameOverride?: string;
    // })[],
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: Pick<AccountStore, "getWallet">,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & CosmwasmQueries & OsmosisQueries
    >,
    protected readonly priceStore: IPriceStore,
    protected readonly osmosisChainId: string,
    protected readonly userSettings: UserSettings
  ) {
    makeObservable(this);
  }

  @computed
  get showUnverified() {
    return this.userSettings.getUserSettingById<UnverifiedAssetsState>(
      "unverified-assets"
    )?.state.showUnverifiedAssets;
  }

  @computed
  get queries() {
    return this.queriesStore.get(this.osmosisChainId);
  }

  @computed
  get address() {
    return this.accountStore.getWallet(this.osmosisChainId)?.address;
  }

  @computed
  get chain() {
    return this.chainStore.getChain(this.osmosisChainId);
  }

  isVerifiedAsset(coinDenom: string) {
    return this._verifiedAssets.has(coinDenom);
  }

  @computed
  get nativeBalances(): CoinBalance[] {
    return this.chain.currencies
      .filter(
        (currency) =>
          currency.coinMinimalDenom.includes("factory") ||
          !currency.coinMinimalDenom.includes("/")
      )
      .map((currency) => {
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.address ?? "")
          .getBalanceFromCurrency(currency);

        this._verifiedAssets.add(bal.currency.coinDenom);

        return {
          balance: bal,
          fiatValue: this.priceStore.calculatePrice(bal),
        };
      });
  }

  @computed
  get unverifiedIbcBalances(): ((IBCBalance | IBCCW20ContractBalance) & {
    depositingSrcMinDenom?: string;
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
    sourceChainNameOverride?: string;
  })[] {
    return this.assets
      .filter((asset) => asset.origin_chain_id !== this.chain.chainId) // Filter osmosis native assets
      .map((ibcAsset) => {
        const chainInfo = this.chainStore.getChain(ibcAsset.origin_chain_id);

        const minimalDenom = getMinimalDenomFromAssetList(ibcAsset);
        const originCurrency = chainInfo.currencies.find((cur) => {
          if (typeof minimalDenom === "undefined") return false;

          if (minimalDenom.startsWith("cw20:")) {
            return cur.coinMinimalDenom.startsWith(minimalDenom);
          }
          return cur.coinMinimalDenom === minimalDenom;
        });

        if (!originCurrency) {
          throw new Error(
            `Unknown currency ${minimalDenom} for ${ibcAsset.origin_chain_id}`
          );
        }

        const lastTrace = last(ibcAsset.traces);

        if (lastTrace?.type !== "ibc-cw20" && lastTrace?.type !== "ibc") {
          throw new Error(
            `Unknown trace type ${lastTrace?.type}. Asset ${ibcAsset.symbol}`
          );
        }

        const sourceChannelId = lastTrace.chain.channel_id;
        const destChannelId = lastTrace.counterparty.channel_id;
        const isVerified = ibcAsset.keywords?.includes("osmosis-main");
        let ibcDenom = minimalDenom.startsWith("/ibc")
          ? minimalDenom
          : makeIBCMinimalDenom(sourceChannelId, minimalDenom);

        /**
         * If this is a multihop ibc, need to special case because the denom on osmosis
         * isn't Hash(source_denom), but rather Hash(ibc_path).
         *
         * the ibcAsset.base will do this for us, but we still have to check if it's a multihop
         * to send the source denom for deposits.
         */
        let sourceDenom: string | undefined;
        if ((lastTrace.chain.path.match(/transfer/gi)?.length ?? 0) >= 2) {
          sourceDenom = minimalDenom;
        }

        const balance = this.queries.queryBalances
          .getQueryBech32Address(this.address ?? "")
          .getBalanceFromCurrency({
            coinDecimals: originCurrency.coinDecimals,
            coinGeckoId: originCurrency.coinGeckoId,
            coinImageUrl: originCurrency.coinImageUrl,
            coinDenom: originCurrency.coinDenom,
            coinMinimalDenom: ibcDenom,
            paths: [
              {
                portId: "transfer",
                channelId: sourceChannelId,
              },
            ],
            originChainId: chainInfo.chainId,
            originCurrency,
          });

        let ibcBalance: IBCBalance & {
          depositingSrcMinDenom?: string;
          depositUrlOverride?: string;
          withdrawUrlOverride?: string;
          sourceChainNameOverride?: string;
        } = {
          chainInfo,
          balance,
          fiatValue: balance.toDec().isZero()
            ? new PricePretty(
                this.priceStore.getFiatCurrency(
                  this.priceStore.defaultVsCurrency
                )!,
                0
              )
            : this.priceStore.calculatePrice(balance),
          sourceChannelId: sourceChannelId,
          destChannelId: destChannelId,
          isVerified: Boolean(isVerified),
          depositingSrcMinDenom: sourceDenom,
          ...IBCAdditionalData[minimalDenom as keyof typeof IBCAdditionalData],
        };

        if (ibcBalance.isVerified) {
          this._verifiedAssets.add(balance.currency.coinDenom);
        }

        if (ibcAsset.address) {
          return {
            ...ibcBalance,
            ics20ContractAddress: ibcAsset.address,
          } as IBCCW20ContractBalance;
        } else {
          return ibcBalance;
        }
      });
  }

  @computed
  get ibcBalances(): ((IBCBalance | IBCCW20ContractBalance) & {
    depositingSrcMinDenom?: string;
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
    sourceChainNameOverride?: string;
  })[] {
    return this.unverifiedIbcBalances.filter((ibcAsset) =>
      this.showUnverified ? true : ibcAsset.isVerified
    );
  }

  @computed
  get availableBalance(): CoinPretty[] {
    return this.queries.queryBalances
      .getQueryBech32Address(this.address ?? "")
      .balances.map((queryBalance) => queryBalance.balance);
  }

  @computed
  get lockedCoins(): CoinPretty[] {
    return (
      this.queries.osmosis?.queryLockedCoins.get(this.address ?? "")
        .lockedCoins ?? []
    );
  }

  @computed
  get stakedBalance(): CoinPretty {
    return this.queries.cosmos.queryDelegations.getQueryBech32Address(
      this.address ?? ""
    ).total;
  }

  @computed
  get unstakingBalance(): CoinPretty {
    const bech32Address = this?.address ?? "";
    return this.queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      bech32Address
    ).total;
  }
}

export * from "./transfer-ui-config";
export * from "./types";
