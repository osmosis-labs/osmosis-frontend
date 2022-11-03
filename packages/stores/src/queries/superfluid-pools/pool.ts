import { computed, makeObservable } from "mobx";
import { FiatCurrency } from "@keplr-wallet/types";
import {
  ObservableQueryValidators,
  ObservableQueryInflation,
  Staking,
} from "@keplr-wallet/stores";
import { Dec, RatePretty, CoinPretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { UserConfig } from "../../ui-config";
import { ObservableQueryPoolDetails } from "../pools";
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
export class ObservableQuerySuperfluidPool extends UserConfig {
  constructor(
    protected readonly fiatCurrency: FiatCurrency,
    protected readonly queryPoolDetails: ObservableQueryPoolDetails,
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
    super();
    makeObservable(this);
  }

  @computed
  get isSuperfluid() {
    return this.queries.querySuperfluidPools.isSuperfluidPool(
      this.queryPoolDetails.pool.id
    );
  }

  /** Wraps `gauges` member of pool detail store with potential superfluid APR info. */
  @computed
  get gaugesWithSuperfluidApr() {
    return this.queryPoolDetails.internalGauges.map((gaugeInfo) => {
      const lastDuration = this.queryPoolDetails.longestDuration;
      return {
        ...gaugeInfo,
        superfluidApr:
          gaugeInfo.duration.asSeconds() === lastDuration.asSeconds() &&
          this.queries.querySuperfluidPools.isSuperfluidPool(
            this.queryPoolDetails.pool.id
          )
            ? new RatePretty(
                this.queryInflation.inflation
                  .mul(
                    this.queries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                      this.queryPoolDetails.pool.id
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
      this.queryInflation.inflation
        .mul(
          this.queries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
            this.queryPoolDetails.pool.id
          )
        )
        .moveDecimalPointLeft(2)
    );
  }

  @computed
  get superfluid() {
    if (!this.isSuperfluid || !this.queryPoolDetails.longestDuration) return;

    let upgradeableLpLockIds:
      | {
          amount: CoinPretty;
          lockIds: string[];
        }
      | undefined;
    if (this.queryPoolDetails.lockableDurations.length > 0) {
      upgradeableLpLockIds = this.queries.queryAccountLocked
        .get(this.bech32Address)
        .getLockedCoinWithDuration(
          this.queryPoolDetails.poolShareCurrency,
          this.queryPoolDetails.longestDuration
        );
    }

    const undelegatedLockedLpShares =
      (this.queries.querySuperfluidDelegations
        .getQuerySuperfluidDelegations(this.bech32Address)
        .getDelegations(this.queryPoolDetails.poolShareCurrency)?.length ===
        0 &&
        upgradeableLpLockIds &&
        upgradeableLpLockIds.lockIds.length > 0) ??
      false;

    return undelegatedLockedLpShares
      ? { upgradeableLpLockIds }
      : {
          delegations: this.queries.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.bech32Address)
            .getDelegations(this.queryPoolDetails.poolShareCurrency)
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
                  this.queryPoolDetails.pool.id
                )
              );

              if (this.queryPoolDetails.lockableDurations.length > 0) {
                const poolApr = this.queries.queryIncentivizedPools.computeApr(
                  this.queryPoolDetails.pool.id,
                  this.queryPoolDetails.longestDuration,
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
            .getUndelegations(this.queryPoolDetails.poolShareCurrency)
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
          superfluidLpShares: this.queries.queryAccountLocked
            .get(this.bech32Address)
            .getLockedCoinWithDuration(
              this.queryPoolDetails.poolShareCurrency,
              this.queryPoolDetails.longestDuration
            ),
        };
  }
}
