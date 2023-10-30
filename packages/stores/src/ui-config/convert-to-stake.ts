import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { action, computed, makeObservable, observable } from "mobx";

import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
  OsmosisAccountImpl,
} from "../account";
import { DerivedDataStore } from "../derived-data";
import { IPriceStore } from "../price";
import { OsmosisQueries } from "../queries";

/** Information about a user's pool assets that are suggested to convert to stake. */
export type SuggestedConvertToStakeAssets = {
  poolId: string;
  totalValue: PricePretty;
  userPoolAssets: CoinPretty[];
  currentApr: RatePretty;
};

/** Aggregates user balancer shares are available to be staked, preferably for a higher APR.
 *  Manages the state for the selection process, with selections keyed by pool ID. */
export class UserConvertToStakeConfig {
  @observable
  protected _selectedConversionPoolIds = new Set<string>();

  @computed
  get selectedConversionPoolIds() {
    return this._selectedConversionPoolIds;
  }

  @computed
  get selectedConversions() {
    return this.suggestedConvertibleAssetsPerPool.filter(({ poolId }) =>
      this.selectedConversionPoolIds.has(poolId)
    );
  }

  /** For each user owned pool, this provides a breakdown of shares
   *  that are of lesser returns than the staking inflationary returns. */
  @computed
  get suggestedConvertibleAssetsPerPool(): SuggestedConvertToStakeAssets[] {
    const ownedSharePoolIds = this.osmosisQueries.queryGammPoolShare
      .getOwnPools(this.accountAddress)
      .filter((poolId) => {
        // only share pools
        const queryPool = this.osmosisQueries.queryPools.getPool(poolId);
        if (Boolean(queryPool?.sharePool)) return true;
        return false;
      });

    const account = this.osmosisAccount;
    const stakeCurrency = this.chainGetter.getChain(
      this.osmosisChainId
    ).stakeCurrency;

    if (!account) return [];

    return ownedSharePoolIds.reduce<SuggestedConvertToStakeAssets[]>(
      (foundConversions: SuggestedConvertToStakeAssets[], sharePoolId) => {
        const { sharePoolDetail, superfluidPoolDetail, poolBonding } =
          this.derivedDataStore.getForPool(sharePoolId);

        // only include if contains stake currency
        if (
          !sharePoolDetail.querySharePool?.hasPoolAsset(
            stakeCurrency.coinMinimalDenom
          )
        )
          return foundConversions;

        // only include pools with > 1¢ value
        // TODO: temporarily only look at bonded value, since we can't serialize this case in the message
        if (
          !(
            sharePoolDetail.userStats?.bondedValue?.toDec().isPositive() ||
            sharePoolDetail.userUnlockingAssets.length > 0
          )
        )
          return foundConversions;

        const totalValue =
          sharePoolDetail.userStats?.totalShareValue ??
          new PricePretty(this.fiatCurrency, 0);
        const userPoolAssets = sharePoolDetail.userPoolAssets.map(
          ({ asset }) => asset
        );

        // only include if there's something without dust to convert
        if (
          ![
            sharePoolDetail.userAvailableShares,
            sharePoolDetail.userBondedShares,
            ...sharePoolDetail.userUnlockingAssets.map(({ amount }) => amount),
          ].some((amount) => {
            const usdValue = this.priceStore.calculatePrice(amount, "usd");
            return usdValue && usdValue.toDec().gt(this.usdDustThreshold);
          })
        ) {
          return foundConversions;
        }

        const currentApr =
          poolBonding.highestBondDuration?.aggregateApr ??
          superfluidPoolDetail.superfluidApr.add(sharePoolDetail.swapFeeApr);

        // only include if better opportunity
        if (currentApr.toDec().lte(this.stakeApr.toDec().quo(new Dec(100)))) {
          foundConversions.push({
            poolId: sharePoolId,
            totalValue,
            userPoolAssets,
            currentApr,
          });
        }
        return foundConversions;
      },
      []
    );
  }

  @computed
  get isConvertToStakeFeatureRelevantToUser() {
    return this.suggestedConvertibleAssetsPerPool.length > 0;
  }

  @computed
  get hasValidatorPreferences() {
    // TODO: returning false since we can't serialize this case in the message
    // this case prevents the message from containing an empty validator to defer to valset of delegations
    return false;

    // return this.osmosisQueries.queryUsersValidatorPreferences.get(
    //   this.accountAddress
    // ).hasValidatorPreferences;
  }

  /** Returns true if the user has at least some delegation in the SDK staking module. */
  @computed
  get hasDelegation() {
    // TODO: returning false since we can't serialize this case in the message
    // this case prevents the message from containing an empty validator to defer to valset of delegations
    return false;

    // return (
    //   this.cosmosQueries.queryDelegations.getQueryBech32Address(
    //     this.accountAddress
    //   ).delegations.length > 0
    // );
  }

  get stakeApr() {
    return this.cosmosQueries.queryInflation.inflation;
  }

  @computed
  get canSelectMorePools() {
    return this.selectedConversionPoolIds.size < this.maxPoolsSelectedCount;
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
    protected readonly chainGetter: ChainGetter,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly accountStore: AccountStore<
      [OsmosisAccount, CosmosAccount, CosmwasmAccount]
    >,
    protected readonly derivedDataStore: DerivedDataStore,
    protected readonly priceStore: IPriceStore,
    /** Max number of convertible pools that can be selected at once. */
    readonly maxPoolsSelectedCount = 5,
    readonly usdDustThreshold = new Dec(0.01)
  ) {
    makeObservable(this);
  }

  /** Add pool to list of pools to be converted, max count not selected. */
  @action
  selectConversionPoolId(poolId: string) {
    if (this._selectedConversionPoolIds.size >= this.maxPoolsSelectedCount)
      return;
    this._selectedConversionPoolIds.add(poolId);
  }

  /** Remove pool from list of pools to be converted. */
  @action
  deselectConversionPoolId(poolId: string) {
    this._selectedConversionPoolIds.delete(poolId);
  }

  /** Send the convert to stake message for all currently selected pools.
   *  If no validator address is provided, the user must have a validator preference and that will be used. */
  sendConvertToStakeMsg(stakingValidator?: string) {
    if (
      !this.hasValidatorPreferences &&
      !this.hasDelegation &&
      !stakingValidator
    )
      throw new Error(
        "Either valsetprefs or delegations should be associated with this account, or a new validator address should be provided."
      );

    type ConvertibleAsset = Parameters<
      (typeof OsmosisAccountImpl)["prototype"]["sendUnbondAndConvertToStakeMsgs"]
    >[0][0];
    const assetsToConvert: ConvertibleAsset[] = [];

    this._selectedConversionPoolIds.forEach((poolId) => {
      const { sharePoolDetail } = this.derivedDataStore.getForPool(poolId);

      const lockIds = (
        (sharePoolDetail.userLockedAssets ?? []) as {
          lockIds: string[];
          amount: CoinPretty;
        }[]
      )
        .concat(sharePoolDetail.userUnlockingAssets ?? [])
        .filter(({ amount }) => {
          const usdValue = this.priceStore.calculatePrice(amount, "usd");
          return usdValue && usdValue.toDec().gt(this.usdDustThreshold);
        })
        .flatMap(({ lockIds }) => lockIds);

      // TODO: these comments below are temporary, since we can't serialize this case in the message
      // the comments below prevent the case of available shares being migrated to stake

      // const userAvailableShares = sharePoolDetail.userAvailableShares;
      // const userAvailableUsdValue = this.priceStore.calculatePrice(
      //   userAvailableShares,
      //   "usd"
      // );

      const convertibleAssets = lockIds.map<ConvertibleAsset>((lockId) => ({
        lockId,
      }));
      // .concat(
      //   userAvailableShares?.toDec().isPositive() &&
      //     userAvailableUsdValue?.toDec().gt(this.usdDustThreshold)
      //     ? [{ availableGammShare: userAvailableShares }]
      //     : []
      // );

      assetsToConvert.push(...convertibleAssets);
    });

    if (!this.osmosisAccount) throw new Error("No account");

    return this.osmosisAccount
      .sendUnbondAndConvertToStakeMsgs(
        assetsToConvert,
        this.hasValidatorPreferences ? undefined : stakingValidator
      )
      .catch(console.error) as Promise<void>;
  }
}
