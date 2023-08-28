import { CosmosQueries, IQueriesStore } from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { action, computed, makeObservable, observable } from "mobx";
import { IPriceStore } from "src/price";

import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
  OsmosisAccountImpl,
} from "../account";
import { DerivedDataStore } from "../derived-data";
import { OsmosisQueries } from "../queries";
import { QueriesExternalStore } from "../queries-external";

export type SuggestedConvertToStakeAssets = {
  poolId: string;
  totalValue: PricePretty;
  userPoolAssets: CoinPretty[];
  currentApr: RatePretty;
  sendConvertToStakeMsg: (newValidatorAddress?: string) => Promise<void>;
};

/** Aggregates user balancer shares are available to be staked, preferably for a higher APR.
 *  Manages the state for the selection process, with selections keyed by pool ID.
 *  Then, provides async callbacks for converting that stake. */
export class UserConvertToStakeConfig {
  @observable
  protected _selectedConversionPoolId: string | null = null;

  @computed
  get selectedConversionPoolId() {
    return this._selectedConversionPoolId;
  }

  @computed
  get selectedConversion() {
    return this.suggestedConvertibleAssetsPerPool.find(
      ({ poolId }) => poolId === this.selectedConversionPoolId
    );
  }

  /** For each user owned pool, this provides a breakdown of shares
   *  that are of lesser returns than the staking inflationary returns.
   *
   *  Further, it provides a callback for converting those assets to stake via the
   *  given account store. This callback expects a validator address if the user
   *  has not yet selected a validator set preference. */
  @computed
  get suggestedConvertibleAssetsPerPool(): SuggestedConvertToStakeAssets[] {
    const ownedSharePoolIds =
      this.osmosisQueries.queryGammPoolShare.getOwnPools(this.accountAddress);

    const conversions: SuggestedConvertToStakeAssets[] = [];

    // calculate conversions for user's share pools
    ownedSharePoolIds.forEach((sharePoolId) => {
      const { sharePoolDetail, superfluidPoolDetail, poolBonding } =
        this.derivedDataStore.getForPool(sharePoolId);

      const totalValue =
        sharePoolDetail.userStats?.totalShareValue ??
        new PricePretty(this.fiatCurrency, 0);
      const userPoolAssets = sharePoolDetail.userPoolAssets.map(
        ({ asset }) => asset
      );

      const currentApr =
        poolBonding.highestBondDuration?.aggregateApr ??
        superfluidPoolDetail.superfluidApr.add(sharePoolDetail.swapFeeApr);

      // only include if better opportunity
      if (currentApr.toDec().lte(this.stakeApr.toDec().quo(new Dec(100)))) {
        conversions.push({
          poolId: sharePoolId,
          totalValue,
          userPoolAssets,
          currentApr,
          sendConvertToStakeMsg: (newlySelectedValidator) => {
            if (!this.hasValidatorPreferences && !newlySelectedValidator)
              throw new Error(
                "Either valsetprefs should be associated with this account, or a new validator address should be provided."
              );

            const lockIds = (
              (this.selectedPoolDetails?.sharePoolDetail.userLockedAssets ??
                []) as {
                lockIds: string[];
              }[]
            )
              .concat(
                this.selectedPoolDetails?.sharePoolDetail.userUnlockingAssets ??
                  []
              )
              .flatMap(({ lockIds }) => lockIds);
            const userAvailableShares =
              this.selectedPoolDetails?.sharePoolDetail.userAvailableShares;

            const convertibleAssets = lockIds
              .map<
                Parameters<
                  (typeof OsmosisAccountImpl)["prototype"]["sendUnbondAndConvertToStakeMsgs"]
                >[0][0]
              >((lockId) => ({ lockId }))
              .concat(
                userAvailableShares?.toDec().isPositive()
                  ? [{ availableGammShare: userAvailableShares }]
                  : []
              );

            return this.osmosisAccount
              ?.sendUnbondAndConvertToStakeMsgs(
                convertibleAssets,
                this.selectedConversionPoolId ?? undefined,
                this.hasValidatorPreferences
                  ? undefined
                  : newlySelectedValidator
              )
              .catch(console.error) as Promise<void>;
          },
        });
      }
    });

    return conversions;
  }

  @computed
  get canConvertToStake() {
    return this.suggestedConvertibleAssetsPerPool.length > 0;
  }

  @computed
  get hasValidatorPreferences() {
    return this.osmosisQueries.queryUsersValidatorPreferences.get(
      this.accountAddress
    ).hasValidatorPreferences;
  }

  get stakeApr() {
    return this.cosmosQueries.queryInflation.inflation;
  }

  @computed
  get selectedPoolDetails() {
    if (!this.selectedConversionPoolId) return;
    return this.derivedDataStore.getForPool(this.selectedConversionPoolId);
  }

  protected get osmosisQueries() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesStore.get(this.osmosisChainId).osmosis!;
  }

  protected get cosmosQueries() {
    return this.queriesStore.get(this.osmosisChainId).cosmos;
  }

  protected get osmosisAccount() {
    return this.accountStore.getWallet(this.osmosisChainId)?.osmosis;
  }

  protected get accountAddress() {
    return this.accountStore.getWallet(this.osmosisChainId)?.address ?? "";
  }

  protected get fiatCurrency() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)!;
  }

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly queriesExternalStore: QueriesExternalStore,
    protected readonly accountStore: AccountStore<
      [OsmosisAccount, CosmosAccount, CosmwasmAccount]
    >,
    protected readonly derivedDataStore: DerivedDataStore,
    protected readonly priceStore: IPriceStore
  ) {
    makeObservable(this);
  }

  @action
  selectConversionPoolId(poolId: string) {
    this._selectedConversionPoolId = poolId;
  }

  @action
  deselectConversionPoolId() {
    this._selectedConversionPoolId = null;
  }
}
