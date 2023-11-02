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
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { computed, makeObservable } from "mobx";

import { AssetList } from "~/config/asset-list/type";
import { matchesDenomOrAlias } from "~/config/utils";
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
    protected readonly assetLists: AssetList[],
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
    const assets = this.assetLists
      .filter((assetList) => assetList.chain_id !== this.chain.chainId) // Filter osmosis native assets
      .flatMap((assetList) => assetList.assets);
    return assets.map((ibcAsset) => {
      const chainInfo = this.chainStore.getChain(ibcAsset.origin_chain_id);
      let ibcDenom = ibcAsset.base;

      const baseDenomUnit = ibcAsset.denom_units.find((denomUnits) =>
        matchesDenomOrAlias({
          denomToSearch: ibcAsset.base,
          ...denomUnits,
        })
      );
      const minimalDenom = baseDenomUnit?.aliases?.[0] ?? baseDenomUnit?.denom;

      const originCurrency = chainInfo.currencies.find((cur) => {
        if (!minimalDenom) return false;

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

      // If this is a multihop ibc, need to special case because the denom on osmosis
      // isn't H(source_denom), but rather H(ibc_path)
      let sourceDenom: string | undefined;
      if ((lastTrace.chain.path.match(/transfer/gi)?.length ?? 0) >= 2) {
        sourceDenom = lastTrace.counterparty.base_denom;
      }

      const sourceChannelId = lastTrace.chain.channel_id;
      const destChannelId = lastTrace.counterparty.channel_id;
      const isVerified = ibcAsset.keywords?.includes("osmosis-main");

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
        // isUnstable: ibcAsset.isUnstable,
        // depositUrlOverride: ibcAsset.depositUrlOverride,
        // withdrawUrlOverride: ibcAsset.withdrawUrlOverride,
        // sourceChainNameOverride: ibcAsset.sourceChainNameOverride,
        // originBridgeInfo: ibcAsset.originBridgeInfo,
        // fiatRamps: ibcAsset.fiatRamps,
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
