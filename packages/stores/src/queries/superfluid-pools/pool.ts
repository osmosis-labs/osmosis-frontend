import { computed, makeObservable } from "mobx";
import { FiatCurrency } from "@keplr-wallet/types";
import {
  ObservableQueryValidators,
  ObservableQueryInflation,
  Staking,
} from "@keplr-wallet/stores";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { ObservableQueryPool } from "../pools";
import { ObservableQueryGammPoolShare } from "../pool-share";
import {
  ObservableQueryLockableDurations,
  ObservableQueryIncentivizedPools,
} from "../pool-incentives";
import { ObservableQueryAccountLocked } from "../lockup";
import {
  ObservableQuerySuperfluidPools,
  ObservableQuerySuperfluidDelegations,
  ObservableQuerySuperfluidUndelegations,
  ObservableQuerySuperfluidOsmoEquivalent,
} from "../superfluid-pools";

/** Convenience store getting common superfluid data for a pool via superfluid stores. */
export class ObservableQuerySuperfluidPool {
  constructor(
    protected readonly bech32Address: string,
    protected readonly fiatCurrency: FiatCurrency,
    protected readonly queryPool: ObservableQueryPool,
    protected readonly queryValidators: ObservableQueryValidators,
    protected readonly queryInflation: ObservableQueryInflation,
    protected readonly queries: {
      queryGammPoolShare: ObservableQueryGammPoolShare;
      queryLockableDurations: ObservableQueryLockableDurations;
      queryIncentivizedPools: ObservableQueryIncentivizedPools;
      querySuperfluidPools: ObservableQuerySuperfluidPools;
      queryAccountLocked: ObservableQueryAccountLocked;
      querySuperfluidDelegations: ObservableQuerySuperfluidDelegations;
      querySuperfluidUndelegations: ObservableQuerySuperfluidUndelegations;
      querySuperfluidOsmoEquivalent: ObservableQuerySuperfluidOsmoEquivalent;
    },
    protected readonly priceStore: IPriceStore
  ) {
    makeObservable(this);
  }

  @computed
  get poolShareCurrency() {
    return this.queries.queryGammPoolShare.getShareCurrency(this.queryPool.id);
  }

  @computed
  get isSuperfluid() {
    return this.queries.querySuperfluidPools.isSuperfluidPool(
      this.queryPool.id
    );
  }

  @computed
  get lockableDurations() {
    return this.queries.queryLockableDurations.lockableDurations;
  }

  @computed
  get lockupGauges() {
    return this.queries.queryLockableDurations.lockableDurations.map(
      (duration, index, durations) => {
        const apr = this.queries.queryIncentivizedPools.computeAPY(
          this.queryPool.id,
          duration,
          this.priceStore,
          this.fiatCurrency
        );

        return {
          id: index.toString(),
          apr,
          duration,
          superfluidApr:
            index === durations.length - 1 &&
            this.queries.querySuperfluidPools.isSuperfluidPool(
              this.queryPool.id
            )
              ? new RatePretty(
                  this.queryInflation.inflation
                    .mul(
                      this.queries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                        this.queryPool.id
                      )
                    )
                    .moveDecimalPointLeft(2)
                )
              : undefined,
        };
      }
    );
  }

  @computed
  get superfluidApr() {
    if (!this.isSuperfluid) return new RatePretty(new Dec(0));

    return new RatePretty(
      this.queryInflation.inflation
        .mul(
          this.queries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
            this.queryPool.id
          )
        )
        .moveDecimalPointLeft(2)
    );
  }

  @computed
  get upgradeableLpLockIds() {
    if (!this.isSuperfluid || !this.notDelegatedLockedSfsLpShares) return;

    return this.lockableDurations.length > 0
      ? this.queries.queryAccountLocked
          .get(this.bech32Address)
          .getLockedCoinWithDuration(
            this.poolShareCurrency,
            this.lockableDurations[this.lockableDurations.length - 1]
          )
      : undefined;
  }

  @computed
  get notDelegatedLockedSfsLpShares() {
    if (!this.isSuperfluid) return;

    return (
      (this.queries.querySuperfluidDelegations
        .getQuerySuperfluidDelegations(this.bech32Address)
        .getDelegations(this.poolShareCurrency)?.length === 0 &&
        this.upgradeableLpLockIds &&
        this.upgradeableLpLockIds.lockIds.length > 0) ??
      false
    );
  }

  @computed
  get superfluid() {
    if (!this.isSuperfluid) return;

    const upgradeableLpLockIds = this.upgradeableLpLockIds;

    return this.notDelegatedLockedSfsLpShares
      ? { upgradeableLpLockIds }
      : {
          delegations: this.queries.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.bech32Address)
            .getDelegations(this.poolShareCurrency)
            ?.map(({ validator_address, amount }) => {
              let jailed = false;
              let inactive = false;
              let validator = this.queryValidators
                .getQueryStatus(Staking.BondStatus.Bonded)
                .getValidator(validator_address);

              if (!validator) {
                validator = this.queryValidators
                  .getQueryStatus(Staking.BondStatus.Unbonded)
                  .getValidator(validator_address);
                inactive = true;
                if (validator?.jailed) jailed = true;
              }

              let thumbnail: string | undefined;
              if (validator) {
                thumbnail = this.queryValidators
                  .getQueryStatus(
                    inactive
                      ? Staking.BondStatus.Unbonded
                      : Staking.BondStatus.Bonded
                  )
                  .getValidatorThumbnail(validator_address);
              }

              let superfluidApr = this.queryInflation.inflation.mul(
                this.queries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                  this.queryPool.id
                )
              );

              const lockableDurations =
                this.queries.queryLockableDurations.lockableDurations;

              if (lockableDurations.length > 0) {
                const poolApr = this.queries.queryIncentivizedPools.computeAPY(
                  this.queryPool.id,
                  lockableDurations[lockableDurations.length - 1],
                  this.priceStore,
                  this.fiatCurrency
                );
                superfluidApr = superfluidApr.add(
                  poolApr.moveDecimalPointRight(2).toDec()
                );
              }

              const commissionRateRaw =
                validator?.commission.commission_rates.rate;

              return {
                validatorName: validator?.description.moniker,
                validatorCommission: commissionRateRaw
                  ? new RatePretty(new Dec(commissionRateRaw))
                  : undefined,
                validatorImgSrc: thumbnail,
                inactive: jailed ? "jailed" : inactive ? "inactive" : undefined,
                apr: new RatePretty(superfluidApr.moveDecimalPointLeft(2)),
                amount:
                  this.queries.querySuperfluidOsmoEquivalent.calculateOsmoEquivalent(
                    amount
                  ),
              };
            }),
          undelegations: this.queries.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.bech32Address)
            .getUndelegations(this.poolShareCurrency)
            ?.map(({ validator_address, amount, end_time }) => {
              let jailed = false;
              let inactive = false;
              let validator = this.queryValidators
                .getQueryStatus(Staking.BondStatus.Bonded)
                .getValidator(validator_address);

              if (!validator) {
                validator = this.queryValidators
                  .getQueryStatus(Staking.BondStatus.Unbonded)
                  .getValidator(validator_address);
                inactive = true;
                if (validator?.jailed) jailed = true;
              }

              return {
                validatorName: validator?.description.moniker,
                inactive: jailed ? "jailed" : inactive ? "inactive" : undefined,
                amount,
                endTime: end_time,
              };
            }),
          superfluidLPShares: this.queries.queryAccountLocked
            .get(this.bech32Address)
            .getLockedCoinWithDuration(
              this.poolShareCurrency,
              this.lockableDurations[this.lockableDurations.length - 1]
            ),
        };
  }
}
