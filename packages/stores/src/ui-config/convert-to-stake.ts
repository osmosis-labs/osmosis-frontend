import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { action, computed, makeObservable, observable, reaction } from "mobx";

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
import { ObservableQueryPriceRangeAprs } from "../queries-external";

/** Information about a user's pool assets or position that are suggested to convert to stake. */
export type SuggestedConvertToStakeAssets = {
  poolId: string;
  /** If a CL position, the ID of that position will be included. */
  positionId?: string;
  totalValue: PricePretty;
  userPoolAssets: CoinPretty[];
  currentApr: RatePretty;
};

/** Aggregates user balancer shares or positions are available to be staked for a higher APR.
 *  Manages the state for the selection process, with selections keyed by pool ID. */
export class UserConvertToStakeConfig {
  @observable
  protected _selectedConversionPoolIds = new Set<string>();

  @observable
  protected _selectedConversionPositionIds = new Set<string>();

  get selectedConversionPoolIds() {
    return this._selectedConversionPoolIds;
  }

  get selectedConversionPositionIds() {
    return this._selectedConversionPositionIds;
  }

  protected get totalSelectedCount() {
    return (
      this._selectedConversionPoolIds.size +
      this._selectedConversionPositionIds.size
    );
  }

  /** For each user owned pool, this provides a breakdown of shares
   *  that are of lesser returns than the staking inflationary returns. */
  @computed
  get convertibleBalancerSharesPerPool(): SuggestedConvertToStakeAssets[] {
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
  get convertiblePositions(): SuggestedConvertToStakeAssets[] {
    const { positions } = this.osmosisQueries.queryAccountsPositions.get(
      this.accountAddress
    );
    const { stakeCurrency } = this.chainGetter.getChain(this.osmosisChainId);

    return positions.reduce<SuggestedConvertToStakeAssets[]>(
      (found, { poolId, id, lowerTick, upperTick, quoteAsset, baseAsset }) => {
        if (!poolId || !lowerTick || !upperTick || !quoteAsset || !baseAsset)
          return found;

        // Must contain stake currency (OSMO)
        if (
          quoteAsset.currency.coinMinimalDenom !==
            stakeCurrency.coinMinimalDenom &&
          baseAsset.currency.coinMinimalDenom !== stakeCurrency.coinMinimalDenom
        )
          return found;

        const { superfluidPoolDetail } =
          this.derivedDataStore.getForPool(poolId);

        // position is superfluid delegated
        const isPositionDelegated = Boolean(
          superfluidPoolDetail.getDelegatedPositionInfo(id)
        );
        if (isPositionDelegated) return found;

        // position is unbonding
        const unbondInfo = this.osmosisQueries.queryAccountsUnbondingPositions
          .get(this.accountAddress)
          .getPositionUnbondingInfo(id);
        if (Boolean(unbondInfo)) return found;

        // must not have dust, but can still be out of range
        const quoteIsDust =
          quoteAsset.toDec().isPositive() &&
          this.priceStore
            .calculatePrice(quoteAsset, "usd")
            ?.toDec()
            .lte(this.usdDustThreshold);
        const baseIsDust =
          baseAsset.toDec().isPositive() &&
          this.priceStore
            .calculatePrice(baseAsset, "usd")
            ?.toDec()
            .lte(this.usdDustThreshold);
        if (quoteIsDust || baseIsDust) return found;

        const { apr } = this.queriesExternal.queryPriceRangeAprs.get(
          poolId,
          lowerTick,
          upperTick
        );

        // only include if better opportunity
        if (!apr || apr.toDec().mul(new Dec(100)).gt(this.stakeApr.toDec()))
          return found;

        const totalValue =
          this.priceStore
            .calculatePrice(quoteAsset)
            ?.add(
              this.priceStore.calculatePrice(baseAsset) ??
                new PricePretty(this.fiatCurrency, 0)
            ) ?? new PricePretty(this.fiatCurrency, 0);

        found.push({
          poolId,
          positionId: id,
          totalValue,
          userPoolAssets: [quoteAsset, baseAsset],
          currentApr: apr,
        });

        return found;
      },
      []
    );
  }

  @computed
  get isConvertToStakeFeatureRelevantToUser() {
    return (
      this.convertibleBalancerSharesPerPool.length > 0 ||
      this.convertiblePositions.length > 0
    );
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
  get canSelectMore() {
    return (
      this.selectedConversionPoolIds.size +
        this.selectedConversionPositionIds.size <
      this.maxSelectedCount
    );
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

  protected _disposers: (() => void)[] = [];

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
    protected readonly queriesExternal: {
      readonly queryPriceRangeAprs: ObservableQueryPriceRangeAprs;
    },
    protected readonly priceStore: IPriceStore,
    /** Max number of items that can be selected at once. */
    readonly maxSelectedCount = 1,
    readonly usdDustThreshold = new Dec(0.01)
  ) {
    makeObservable(this);

    // remove selections if they are no longer convertible
    this._disposers.push(
      reaction(
        () => this.convertibleBalancerSharesPerPool,
        (convertibleShares) => {
          this._selectedConversionPoolIds.forEach((poolId) => {
            if (!convertibleShares.some((share) => share.poolId === poolId)) {
              this.deselectConversionPoolId(poolId);
            }
          });
        }
      )
    );
    this._disposers.push(
      reaction(
        () => this.convertiblePositions,
        (convertiblePositions) => {
          this._selectedConversionPositionIds.forEach((positionId) => {
            if (
              !convertiblePositions.some(
                (share) => share.positionId === positionId
              )
            ) {
              this.deselectConversionPositionId(positionId);
            }
          });
        }
      )
    );
  }

  dispose() {
    this._disposers.forEach((dispose) => dispose());
  }

  /** Add pool to list of pools to be converted, max count not selected. */
  @action
  selectConversionPoolId(poolId: string) {
    if (this.totalSelectedCount >= this.maxSelectedCount) return;
    this._selectedConversionPoolIds.add(poolId);
  }

  /** Remove pool from list of pools to be converted. */
  @action
  deselectConversionPoolId(poolId: string) {
    this._selectedConversionPoolIds.delete(poolId);
  }

  /** Add position to list of positions to be converted, max count not selected. */
  @action
  selectConversionPositionId(positionId: string) {
    if (this.totalSelectedCount >= this.maxSelectedCount) return;
    this._selectedConversionPositionIds.add(positionId);
  }

  /** Remove position from list of positions to be converted. */
  @action
  deselectConversionPositionId(positionId: string) {
    this._selectedConversionPositionIds.delete(positionId);
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

    // Share pools to convert
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

    // Positions to convert
    this._selectedConversionPositionIds.forEach((positionId) => {
      assetsToConvert.push({ positionId });
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
