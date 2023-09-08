import { IQueriesStore } from "@keplr-wallet/stores";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { computed, makeObservable, observable, runInAction } from "mobx";

import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
} from "../account";
import { DerivedDataStore } from "../derived-data";
import { IPriceStore } from "../price";
import { OsmosisQueries } from "../queries";

/** Upgrades for migrating from CFMM to CL pools. */
export type UserCfmmToClUpgrade = {
  cfmmPoolId: string;
  clPoolId: string;
  cfmmApr: RatePretty;
  clApr: RatePretty;
  sendUpgradeMsg: () => Promise<void>;
};

export type SuccessfulUserCfmmToClUpgrade = Omit<
  UserCfmmToClUpgrade,
  "sendUpgradeMsg" | "cfmmApr" | "clApr"
>;

/** Aggregates various upgrades users can take in their account. */
export class UserUpgradesConfig {
  @observable
  protected _successfullCfmmToClUpgrades: SuccessfulUserCfmmToClUpgrade[] = [];

  /** Available upgrades from CFMM pool to CL pool full range position. */
  @computed
  get availableCfmmToClUpgrades(): UserCfmmToClUpgrade[] {
    const userSharePoolIds = this.osmosisQueries.queryGammPoolShare.getOwnPools(
      this.accountAddress
    );

    // find migrations for every user pool that is linked to a CL pool
    const upgrades: UserCfmmToClUpgrade[] = [];
    userSharePoolIds.forEach((poolId) => {
      // cfmm pool link to cl pool
      const clPoolId =
        this.osmosisQueries.queryCfmmConcentratedPoolLinks.getLinkedConcentratedPoolId(
          poolId
        );

      if (typeof clPoolId === "string") {
        if (!this.osmosisQueries.queryPools.poolExists(clPoolId)) return;

        const { sharePoolDetail, poolBonding } =
          this.derivedDataStore.getForPool(poolId);

        // user's locks in cfmm pool
        const lockIds = sharePoolDetail.userLockedAssets
          .flatMap(({ lockIds }) => lockIds)
          .concat(
            sharePoolDetail.userUnlockingAssets.flatMap(
              ({ lockIds }) => lockIds
            )
          );

        const isDustValue = sharePoolDetail.userShareValue
          .toDec()
          .lte(new Dec(0.01)); // 1¢

        const userCanMigrate =
          (!sharePoolDetail.userAvailableShares.toDec().isZero() ||
            lockIds.length > 0) &&
          !isDustValue;

        if (userCanMigrate) {
          // lock IDs to be accepted by msg
          const msgLockIds: string[] = [];

          if (!sharePoolDetail.userAvailableShares.toDec().isZero()) {
            // use -1 to migrate available shares
            msgLockIds.push("-1");
          }
          msgLockIds.push(...lockIds);

          const cfmmApr =
            poolBonding.highestBondDuration?.aggregateApr ?? new RatePretty(0);
          // CL pools can expect a 5% increase in incentives
          const clApr = cfmmApr.mul(new Dec(1.05));

          const account = this.osmosisAccount;

          if (account) {
            upgrades.push({
              cfmmPoolId: poolId,
              clPoolId,
              cfmmApr,
              clApr,
              sendUpgradeMsg: () =>
                new Promise<void>(
                  (resolve, reject) =>
                    account
                      .sendMigrateSharesToFullRangeConcentratedPositionMsgs(
                        poolId,
                        msgLockIds,
                        undefined,
                        undefined,
                        (tx) => {
                          // fullfilled
                          if (tx.code) reject(tx.rawLog);
                          else {
                            resolve();
                            runInAction(() => {
                              this._successfullCfmmToClUpgrades.push({
                                cfmmPoolId: poolId,
                                clPoolId,
                              });
                            });
                          }
                        }
                      )
                      .catch(reject) // broadcast error
                ),
            });
          }
        }
      }
    });
    return upgrades;
  }

  /** Successful upgrades from cfmm to CL. */
  @computed
  get successfullCfmmToClUpgrades(): SuccessfulUserCfmmToClUpgrade[] {
    return this._successfullCfmmToClUpgrades;
  }

  /** Zips user's available CFMM to CL migrations, with past successful migrations in single list.
   *  Sorts by CFMM pool ID string to maintain order.
   */
  @computed
  get cfmmToClUpgrades(): (
    | UserCfmmToClUpgrade
    | SuccessfulUserCfmmToClUpgrade
  )[] {
    return (
      this.availableCfmmToClUpgrades as Array<
        UserCfmmToClUpgrade | SuccessfulUserCfmmToClUpgrade
      >
    )
      .concat(this.successfullCfmmToClUpgrades)
      .sort((a, b) => {
        return a.cfmmPoolId.localeCompare(b.cfmmPoolId);
      });
  }

  @computed
  get hasUpgradeAvailable(): boolean {
    return this.availableCfmmToClUpgrades.length > 0;
  }

  protected get osmosisQueries() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesStore.get(this.osmosisChainId).osmosis!;
  }

  protected get osmosisAccount() {
    return this.accountStore.getWallet(this.osmosisChainId)?.osmosis;
  }

  protected get accountAddress() {
    return this.accountStore.getWallet(this.osmosisChainId)?.address ?? "";
  }

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly accountStore: AccountStore<
      [OsmosisAccount, CosmosAccount, CosmwasmAccount]
    >,
    protected readonly derivedDataStore: DerivedDataStore,
    protected readonly priceStore: IPriceStore
  ) {
    makeObservable(this);
  }
}
