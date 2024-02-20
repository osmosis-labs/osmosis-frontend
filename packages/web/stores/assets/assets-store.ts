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
import { Asset, IbcTransferMethod } from "@osmosis-labs/types";
import { autorun, computed, makeObservable } from "mobx";

import { displayToast, ToastType } from "~/components/alert";
import { IBCAdditionalData } from "~/config/ibc-overrides";
import {
  CoinBalance,
  IBCBalance,
  IBCCW20ContractBalance,
} from "~/stores/assets/types";
import { UnverifiedAssetsState } from "~/stores/user-settings/unverified-assets";
import { UserSettings } from "~/stores/user-settings/user-settings-store";

const UnlistedAssetsKey = "show_unlisted_assets";

/**
 * Wrapper around IBC asset config and stores to provide memoized metrics about osmosis assets.
 */
export class ObservableAssets {
  private _verifiedAssets = new Set<string>();

  constructor(
    protected readonly assets: Asset[],
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

    autorun(() => {
      if (typeof window === "undefined") return true;

      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get(UnlistedAssetsKey) === "true" &&
        sessionStorage.getItem(UnlistedAssetsKey) !== "true"
      ) {
        displayToast(
          {
            message: "unlistedAssetsEnabled",
            caption: "unlistedAssetsEnabledForSession",
          },
          ToastType.SUCCESS
        );
        return sessionStorage.setItem(UnlistedAssetsKey, "true");
      }

      if (
        urlParams.get(UnlistedAssetsKey) === "false" &&
        sessionStorage.getItem(UnlistedAssetsKey) === "true"
      ) {
        displayToast(
          {
            message: "unlistedAssetsDisabled",
          },
          ToastType.SUCCESS
        );
        return sessionStorage.setItem(UnlistedAssetsKey, "false");
      }
    });
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
  get unverifiedNativeBalances(): (CoinBalance & { isVerified: boolean })[] {
    return this.chain.currencies
      .filter(
        (currency) =>
          currency.coinMinimalDenom.includes("factory") ||
          !currency.coinMinimalDenom.includes("/")
      )
      .filter((currency) => {
        if (typeof window === "undefined") return true;

        const assetListAsset = this.assets.find(
          (a) => a.symbol === currency.coinDenom
        );

        if (!assetListAsset) {
          throw new Error(`Unknown asset ${currency.coinDenom}`);
        }

        if (sessionStorage.getItem(UnlistedAssetsKey) === "true") {
          return true;
        }
        return !assetListAsset.preview;
      }) // Remove unlisted assets if preview assets is disabled
      .map((currency) => {
        const asset = this.assets.find(
          (asset) => asset.symbol === currency.coinDenom
        );
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.address ?? "")
          .getBalanceFromCurrency(currency);

        this._verifiedAssets.add(bal.currency.coinDenom);

        return {
          balance: bal,
          fiatValue: this.priceStore.calculatePrice(bal),
          isVerified: asset?.verified ?? false,
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
      .filter((asset) => asset.transferMethods.length > 0) // Filter osmosis native assets
      .filter((asset) => {
        if (typeof window === "undefined") return true;

        if (sessionStorage.getItem(UnlistedAssetsKey) === "true") {
          return true;
        }
        return !asset.preview;
      }) // Remove unlisted assets if preview assets is disabled
      .map((ibcAsset) => {
        const chainInfo = this.chainStore.getChain(
          ibcAsset.counterparty[0]?.chainId?.toString() ?? ""
        );

        const sourceDenom_ = ibcAsset.sourceDenom;
        const originCurrency = chainInfo.currencies.find((cur) => {
          if (typeof sourceDenom_ === "undefined") return false;

          if (sourceDenom_.startsWith("cw20:")) {
            /** Note: since we're searching on counterparty config, the coinMinimalDenom
             *  is not the Osmosis IBC denom, it's the source denom
             */
            return cur.coinMinimalDenom.startsWith(sourceDenom_);
          }
          return cur.coinMinimalDenom === sourceDenom_;
        });

        if (!originCurrency) {
          throw new Error(
            `Unknown currency ${sourceDenom_} for ${
              ibcAsset.counterparty![0].chainId
            }`
          );
        }

        const ibcTransferMethod = ibcAsset.transferMethods.find(
          ({ type }) => type === "ibc"
        ) as IbcTransferMethod | undefined;

        if (!ibcTransferMethod) {
          throw new Error(
            `Invalid IBC asset config: ${JSON.stringify(ibcAsset)}`
          );
        }

        const sourceChannelId = ibcTransferMethod.chain.channelId;
        const destChannelId = ibcTransferMethod.counterparty.channelId;
        const isVerified = !ibcAsset.verified;
        const isUnstable = ibcAsset.unstable;

        /**
         * If this is a multihop ibc, it's a special case because the denom on osmosis
         * isn't Hash(source_denom), but rather Hash(ibc_path).
         *
         * the ibcAsset.base will do this for us, but we still have to check if it's a multihop
         * to send the source denom for deposits.
         */
        let sourceDenom: string | undefined;
        if (
          (ibcTransferMethod.chain.path.match(/transfer/gi)?.length ?? 0) >= 2
        ) {
          sourceDenom = sourceDenom;
        }

        const balance = this.queries.queryBalances
          .getQueryBech32Address(this.address ?? "")
          .getBalanceFromCurrency({
            coinDecimals: originCurrency.coinDecimals,
            coinGeckoId: originCurrency.coinGeckoId,
            coinImageUrl: originCurrency.coinImageUrl,
            coinDenom: originCurrency.coinDenom,
            coinMinimalDenom: ibcAsset.coinMinimalDenom,
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
          isUnstable,
          ...IBCAdditionalData[
            ibcAsset.symbol as keyof typeof IBCAdditionalData
          ],
        };

        if (ibcBalance.isVerified) {
          this._verifiedAssets.add(balance.currency.coinDenom);
        }

        if (ibcTransferMethod.counterparty.sourceDenom.startsWith("cw20:")) {
          return {
            ...ibcBalance,
            ics20ContractAddress:
              ibcTransferMethod.counterparty.port.split(".")[1],
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

  get nativeBalances(): (CoinBalance & { isVerified: boolean })[] {
    return this.unverifiedNativeBalances.filter((bal) =>
      this.showUnverified ? true : bal.isVerified
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
