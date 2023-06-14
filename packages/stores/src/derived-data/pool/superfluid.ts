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

import { IPriceStore } from "../../price";
import { OsmosisQueries } from "../../queries/store";
import { ObservablePoolDetails } from "./details";

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
    protected readonly poolDetails: ObservablePoolDetails,
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

  protected get queryPoolDetails() {
    return this.poolDetails.get(this.poolId);
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

  /** Wraps `gauges` member of pool detail store with potential superfluid APR info. */
  @computed
  get gaugesWithSuperfluidApr() {
    return this.queryPoolDetails.internalGauges.map((gaugeInfo) => {
      const lastDuration = this.queryPoolDetails.longestDuration;
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
      upgradeableLpLockIds = this.osmosisQueries.queryAccountLocked
        .get(this.bech32Address)
        .getLockedCoinWithDuration(
          this.queryPoolDetails.poolShareCurrency,
          this.queryPoolDetails.longestDuration
        );
    }

    const undelegatedLockedLpShares =
      (this.osmosisQueries.querySuperfluidDelegations
        .getQuerySuperfluidDelegations(this.bech32Address)
        .getDelegations(this.queryPoolDetails.poolShareCurrency)?.length ===
        0 &&
        upgradeableLpLockIds &&
        upgradeableLpLockIds.lockIds.length > 0) ??
      false;

    return undelegatedLockedLpShares
      ? { upgradeableLpLockIds }
      : {
          delegations: this.osmosisQueries.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.bech32Address)
            .getDelegations(this.queryPoolDetails.poolShareCurrency)
            ?.map(({ validator_address, amount }) => {
              let jailed = false;
              let inactive = false;
              let validator = this.cosmosQueries.queryValidators
                .getQueryStatus(Staking.BondStatus.Bonded)
                .getValidator(validator_address);

              if (!validator) {
                validator = this.cosmosQueries.queryValidators
                  .getQueryStatus(Staking.BondStatus.Unbonded)
                  .getValidator(validator_address);
                inactive = true;
                if (validator?.jailed) jailed = true;
              }

              let thumbnail: string | undefined;
              if (validator) {
                thumbnail = this.cosmosQueries.queryValidators
                  .getQueryStatus(
                    inactive
                      ? Staking.BondStatus.Unbonded
                      : Staking.BondStatus.Bonded
                  )
                  .getValidatorThumbnail(validator_address);
              }

              let superfluidApr =
                this.cosmosQueries.queryInflation.inflation.mul(
                  this.osmosisQueries.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                    this.poolId
                  )
                );

              if (
                this.queryPoolDetails.lockableDurations.length > 0 &&
                this.queryPoolDetails.longestDuration
              ) {
                const poolApr =
                  this.osmosisQueries.queryIncentivizedPools.computeApr(
                    this.poolId,
                    this.queryPoolDetails.longestDuration,
                    this.priceStore,
                    this._fiatCurrency
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
                  this.osmosisQueries.querySuperfluidOsmoEquivalent.calculateOsmoEquivalent(
                    amount
                  ),
              };
            }),
          undelegations: this.osmosisQueries.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.bech32Address)
            .getUndelegations(this.queryPoolDetails.poolShareCurrency)
            ?.map(({ validator_address, amount, end_time }) => {
              let jailed = false;
              let inactive = false;
              let validator = this.cosmosQueries.queryValidators
                .getQueryStatus(Staking.BondStatus.Bonded)
                .getValidator(validator_address);

              if (!validator) {
                validator = this.cosmosQueries.queryValidators
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
          superfluidLpShares: this.osmosisQueries.queryAccountLocked
            .get(this.bech32Address)
            .getLockedCoinWithDuration(
              this.queryPoolDetails.poolShareCurrency,
              this.queryPoolDetails.longestDuration
            ),
        };
  }
}

export class ObservableSuperfluidPoolDetails extends HasMapStore<ObservableSuperfluidPoolDetail> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly accountStore: IAccountStore,
    protected readonly poolDetails: ObservablePoolDetails,
    protected readonly priceStore: IPriceStore
  ) {
    super(
      (poolId: string) =>
        new ObservableSuperfluidPoolDetail(
          poolId,
          this.osmosisChainId,
          this.queriesStore,
          this.accountStore,
          this.poolDetails,
          this.priceStore
        )
    );
  }

  get(poolId: string): ObservableSuperfluidPoolDetail {
    return super.get(poolId);
  }
}
