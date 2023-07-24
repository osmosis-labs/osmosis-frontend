import {
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import {
  AccountStore,
  ChainStore,
  IPriceStore,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import {
  CoinBalance,
  IBCAsset,
  IBCBalance,
  IBCCW20ContractBalance,
} from "~/stores/assets/types";
import { makeIBCMinimalDenom } from "~/stores/assets/utils";
import { UnverifiedAssetsState, UserSettings } from "~/stores/user-settings";

/**
 * Wrapper around IBC asset config and stores to provide memoized metrics about osmosis assets.
 */
export class ObservableAssets {
  constructor(
    protected readonly ibcAssets: (IBCAsset & {
      /** URL if the asset requires a custom deposit external link. Must include `https://...`. */
      depositUrlOverride?: string;

      /** URL if the asset requires a custom withdrawal external link. Must include `https://...`. */
      withdrawUrlOverride?: string;

      /** Alternative chain name to display as the source chain */
      sourceChainNameOverride?: string;
    })[],
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

        return {
          balance: bal,
          fiatValue: this.priceStore.calculatePrice(bal),
        };
      });
  }

  @computed
  get ibcBalances(): ((IBCBalance | IBCCW20ContractBalance) & {
    depositingSrcMinDenom?: string;
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
    sourceChainNameOverride?: string;
  })[] {
    return this.ibcAssets
      .filter((ibcAsset) => (this.showUnverified ? true : ibcAsset.isVerified))
      .map((ibcAsset) => {
        const chainInfo = this.chainStore.getChain(
          ibcAsset.counterpartyChainId
        );
        let ibcDenom = makeIBCMinimalDenom(
          ibcAsset.sourceChannelId,
          ibcAsset.coinMinimalDenom
        );

        const originCurrency = chainInfo.currencies.find((cur) => {
          if (ibcAsset.coinMinimalDenom.startsWith("cw20:")) {
            return cur.coinMinimalDenom.startsWith(ibcAsset.coinMinimalDenom);
          }

          return cur.coinMinimalDenom === ibcAsset.coinMinimalDenom;
        });

        if (!originCurrency) {
          throw new Error(
            `Unknown currency ${ibcAsset.coinMinimalDenom} for ${ibcAsset.counterpartyChainId}`
          );
        }

        // If this is a multihop ibc, need to special case because the denom on osmosis
        // isn't H(source_denom), but rather H(ibc_path)
        let sourceDenom: string | undefined;
        if (ibcAsset.ibcTransferPathDenom) {
          ibcDenom = makeIBCMinimalDenom(
            ibcAsset.sourceChannelId,
            ibcAsset.ibcTransferPathDenom
          );
          sourceDenom = ibcAsset.coinMinimalDenom;
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
                channelId: ibcAsset.sourceChannelId,
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
          chainInfo: chainInfo,
          balance,
          fiatValue: balance.toDec().isZero()
            ? new PricePretty(
                this.priceStore.getFiatCurrency(
                  this.priceStore.defaultVsCurrency
                )!,
                0
              )
            : this.priceStore.calculatePrice(balance),
          sourceChannelId: ibcAsset.sourceChannelId,
          destChannelId: ibcAsset.destChannelId,
          isUnstable: ibcAsset.isUnstable,
          depositingSrcMinDenom: sourceDenom,
          depositUrlOverride: ibcAsset.depositUrlOverride,
          withdrawUrlOverride: ibcAsset.withdrawUrlOverride,
          sourceChainNameOverride: ibcAsset.sourceChainNameOverride,
          originBridgeInfo: ibcAsset.originBridgeInfo,
          fiatRamps: ibcAsset.fiatRamps,
        };

        if (ibcAsset.ics20ContractAddress) {
          return {
            ...ibcBalance,
            ics20ContractAddress: ibcAsset.ics20ContractAddress,
          } as IBCCW20ContractBalance;
        } else {
          return ibcBalance;
        }
      });
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

  public calcValueOf = computedFn((balances: CoinPretty[]): PricePretty => {
    const fiat = this.priceStore.getFiatCurrency(
      this.priceStore.defaultVsCurrency
    )!;
    let fiatValue = new PricePretty(fiat, new Dec(0));
    for (const balance of balances) {
      if (balance.currency.coinMinimalDenom.startsWith("gamm/pool/")) {
        const poolId = balance.currency.coinMinimalDenom.replace(
          "gamm/pool/",
          ""
        );
        const pool = this.queries.osmosis?.queryPools.getPool(poolId);
        if (pool) {
          const tvl = pool.computeTotalValueLocked(this.priceStore);
          const totalShare = pool.totalShare;
          if (tvl.toDec().gt(new Dec(0)) && totalShare.toDec().gt(new Dec(0))) {
            const value = tvl.mul(balance.quo(totalShare));
            fiatValue = fiatValue.add(value);
          }
        }
      } else {
        const price = this.priceStore.calculatePrice(balance);
        if (price) {
          fiatValue = fiatValue.add(price);
        }
      }
    }
    return fiatValue;
  });
}

export * from "~/stores/assets/transfer-ui-config";
export * from "~/stores/assets/types";
