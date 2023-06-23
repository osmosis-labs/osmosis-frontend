import {
  CosmosQueries,
  HasMapStore,
  IAccountStore,
  IQueriesStore,
  Staking,
} from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { OsmosisQueries } from "../../queries/store";
import { ObservableConcentratedPoolDetails } from "./concentrated";
import { ObservableSharePoolDetails } from "./share-pool-details";

/** Convenience store getting common superfluid data for a pool via superfluid stores. */
export class ObservableSuperfluidPoolDetail {
  protected readonly _fiatCurrency: FiatCurrency;

  constructor(
    protected readonly poolId: string,
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly accountStore: IAccountStore,
    protected readonly sharePoolDetails: ObservableSharePoolDetails,
    protected readonly concentratedPoolDetails: ObservableConcentratedPoolDetails,
    protected readonly priceStore: IPriceStore
  ) {
    const fiat = this.priceStore.getFiatCurrency(
      this.priceStore.defaultVsCurrency
    );

    if (!fiat)
      throw new Error("Could not find fiat currency from price store.");

    this._fiatCurrency = fiat;

    makeObservable(this);
  }

  protected get bech32Address() {
    return this.accountStore.getAccount(this.osmosisChainId).bech32Address;
  }

  protected get querySharePoolDetails() {
    return this.sharePoolDetails.get(this.poolId);
  }

  protected get queryConcentratedPoolDetails() {
    return this.concentratedPoolDetails.get(this.poolId);
  }

  protected get cosmosQueries() {
    return this.queriesStore.get(this.osmosisChainId).cosmos;
  }

  @computed
  protected get osmosisQueries() {
    const osmosisQueries = this.queriesStore.get(this.osmosisChainId).osmosis;
    if (!osmosisQueries) throw Error("Did not supply Osmosis chain ID");
    return osmosisQueries;
  }

  get isSuperfluid() {
    return this.osmosisQueries.querySuperfluidPools.isSuperfluidPool(
      this.poolId
    );
  }

  /** Superfluid staked positions, with API and relevant validator info. */
  @computed
  get superfluidStakedPositionInfos() {
    return this.osmosisQueries.querySuperfluidPositionsPerPools
      .getQueryUserPositionsPerPool(this.bech32Address, this.poolId)
      .stakedPositions.map((stakedPositionInfo) => {
        const superfluidApr = new RatePretty(
          this.cosmosQueries.queryInflation.inflation
            .mul(
              this.osmosisQueries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                this.poolId
              )
            )
            .moveDecimalPointLeft(2)
        );

        return {
          ...stakedPositionInfo,
          superfluidApr,
          ...this.getValidatorInfo(stakedPositionInfo.validatorAddress),
        };
      });
  }

  /** Superfluid staked position by ID, with API and relevant validator info. */
  readonly getSuperfluidStakedPositionInfo = computedFn((positionId) => {
    return this.superfluidStakedPositionInfos.find(
      (info) => info.positionId === positionId
    );
  });

  /** Wraps `gauges` member of pool detail store with potential superfluid APR info. */
  @computed
  get gaugesWithSuperfluidApr() {
    return this.querySharePoolDetails.internalGauges.map((gaugeInfo) => {
      const lastDuration = this.querySharePoolDetails.longestDuration;
      return {
        ...gaugeInfo,
        superfluidApr:
          gaugeInfo.duration.asSeconds() === lastDuration?.asSeconds() &&
          this.osmosisQueries.querySuperfluidPools.isSuperfluidPool(this.poolId)
            ? new RatePretty(
                this.cosmosQueries.queryInflation.inflation
                  .mul(
                    this.osmosisQueries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                      this.poolId
                    )
                  )
                  .moveDecimalPointLeft(2)
              )
            : undefined,
      };
    });
  }

  @computed
  get superfluidApr() {
    if (!this.isSuperfluid) return new RatePretty(new Dec(0));

    return new RatePretty(
      this.cosmosQueries.queryInflation.inflation
        .mul(
          this.osmosisQueries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
            this.poolId
          )
        )
        .moveDecimalPointLeft(2)
    );
  }

  /** Superfluid and share pool only: the lock IDs that are eligible for superfluid staking; "Go Superfluid" */
  @computed
  get userUpgradeableSharePoolLockIds():
    | {
        amount: CoinPretty;
        lockIds: string[];
      }
    | undefined {
    if (this.isSuperfluid && this.querySharePoolDetails.longestDuration) {
      let upgradeableLpLockIds:
        | {
            amount: CoinPretty;
            lockIds: string[];
          }
        | undefined;
      if (this.querySharePoolDetails.lockableDurations.length > 0) {
        upgradeableLpLockIds = this.osmosisQueries.queryAccountLocked
          .get(this.bech32Address)
          .getLockedCoinWithDuration(
            this.querySharePoolDetails.poolShareCurrency,
            this.querySharePoolDetails.longestDuration
          );
      }

      const undelegatedLockedLpShares =
        (this.osmosisQueries.querySuperfluidDelegations
          .getQuerySuperfluidDelegations(this.bech32Address)
          .getDelegations(this.querySharePoolDetails.poolShareCurrency)
          ?.length === 0 &&
          upgradeableLpLockIds &&
          upgradeableLpLockIds.lockIds.length > 0) ??
        false;

      if (undelegatedLockedLpShares) {
        return upgradeableLpLockIds;
      }
    }
  }

  /** If share superfluid pool: get's user's one or more share delegation validator info and amount. */
  @computed
  get userSharesDelegations():
    | {
        validatorName: string | undefined;
        validatorCommission: RatePretty | undefined;
        validatorImgSrc: string | undefined;
        inactive: "jailed" | "inactive" | undefined;
        apr: RatePretty;
        equivalentOsmoAmount: CoinPretty;
      }[]
    | undefined {
    if (this.isSuperfluid && this.querySharePoolDetails.longestDuration) {
      // share pool delegations
      return this.osmosisQueries.querySuperfluidDelegations
        .getQuerySuperfluidDelegations(this.bech32Address)
        .getDelegations(this.querySharePoolDetails.poolShareCurrency)
        ?.map(({ validator_address, amount }) => {
          let superfluidApr = this.cosmosQueries.queryInflation.inflation.mul(
            this.osmosisQueries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
              this.poolId
            )
          );

          if (
            this.querySharePoolDetails.lockableDurations.length > 0 &&
            this.querySharePoolDetails.longestDuration
          ) {
            const poolApr =
              this.osmosisQueries.queryIncentivizedPools.computeApr(
                this.poolId,
                this.querySharePoolDetails.longestDuration,
                this.priceStore,
                this._fiatCurrency
              );
            superfluidApr = superfluidApr.add(
              poolApr.moveDecimalPointRight(2).toDec()
            );
          }

          return {
            ...this.getValidatorInfo(validator_address),
            apr: new RatePretty(superfluidApr.moveDecimalPointLeft(2)),
            equivalentOsmoAmount:
              this.osmosisQueries.querySuperfluidOsmoEquivalent.calculateOsmoEquivalent(
                amount
              ),
          };
        });
    }
  }

  /** IF  */
  @computed
  get userSharesUndelegations():
    | {
        validatorName: string | undefined;
        inactive: "jailed" | "inactive" | undefined;
        amount: CoinPretty;
        endTime: Date;
      }[]
    | undefined {
    if (this.isSuperfluid && this.querySharePoolDetails.longestDuration) {
      return this.osmosisQueries.querySuperfluidUndelegations
        .getQuerySuperfluidDelegations(this.bech32Address)
        .getUndelegations(this.querySharePoolDetails.poolShareCurrency)
        ?.map(({ validator_address, amount, end_time }) => ({
          ...this.getValidatorInfo(validator_address),
          amount,
          endTime: end_time,
        }));
    }
  }

  readonly getValidatorInfo = computedFn(
    (
      validatorBech32Address: string
    ): {
      validatorName: string | undefined;
      validatorCommission: RatePretty | undefined;
      validatorImgSrc: string | undefined;
      inactive: "jailed" | "inactive" | undefined;
    } => {
      let jailed = false;
      let inactive = false;
      let validator = this.cosmosQueries.queryValidators
        .getQueryStatus(Staking.BondStatus.Bonded)
        .getValidator(validatorBech32Address);

      if (!validator) {
        validator = this.cosmosQueries.queryValidators
          .getQueryStatus(Staking.BondStatus.Unbonded)
          .getValidator(validatorBech32Address);
        inactive = true;
        if (validator?.jailed) jailed = true;
      }

      let thumbnail: string | undefined;
      if (validator) {
        thumbnail = this.cosmosQueries.queryValidators
          .getQueryStatus(
            inactive ? Staking.BondStatus.Unbonded : Staking.BondStatus.Bonded
          )
          .getValidatorThumbnail(validatorBech32Address);
      }

      const commissionRateRaw = validator?.commission.commission_rates.rate;

      return {
        validatorName: validator?.description.moniker,
        validatorCommission: commissionRateRaw
          ? new RatePretty(new Dec(commissionRateRaw))
          : undefined,
        validatorImgSrc: thumbnail,
        inactive: jailed ? "jailed" : inactive ? "inactive" : undefined,
      };
    }
  );
}

export class ObservableSuperfluidPoolDetails extends HasMapStore<ObservableSuperfluidPoolDetail> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly accountStore: IAccountStore,
    protected readonly sharePoolDetails: ObservableSharePoolDetails,
    protected readonly concentratedPoolDetails: ObservableConcentratedPoolDetails,
    protected readonly priceStore: IPriceStore
  ) {
    super(
      (poolId: string) =>
        new ObservableSuperfluidPoolDetail(
          poolId,
          this.osmosisChainId,
          this.queriesStore,
          this.accountStore,
          this.sharePoolDetails,
          this.concentratedPoolDetails,
          this.priceStore
        )
    );
  }

  get(poolId: string): ObservableSuperfluidPoolDetail {
    return super.get(poolId);
  }
}
