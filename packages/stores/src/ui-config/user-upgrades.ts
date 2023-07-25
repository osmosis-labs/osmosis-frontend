import { IQueriesStore } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
} from "../account";
import { DerivedDataStore } from "../derived-data";
import { OsmosisQueries } from "../queries";

/** Upgrades for migrating from CFMM to CL pools. */
export type UserCfmmToClUpgrade = {
  cfmmPoolId: string;
  clPoolId: string;
  upgrade: () => Promise<void>;
};

/** Aggregates various upgrades users can take in their account. */
export class UserUpgrades {
  @computed
  get cfmmToClUpgrades(): UserCfmmToClUpgrade[] {
    const userPoolIds = this.osmosisQueries.queryGammPoolShare.getOwnPools(
      this.accountAddress
    );

    // find migrations for every user pool that is linked to a CL pool
    const upgrades: UserCfmmToClUpgrade[] = [];
    userPoolIds.forEach((poolId) => {
      // cfmm pool link to cl pool
      const clPoolId =
        this.osmosisQueries.queryCfmmToConcentratedLiquidityPoolLinks.get(
          poolId
        ).concentratedLiquidityPoolId;

      if (clPoolId) {
        const { sharePoolDetail } = this.derivedDataStore.getForPool(clPoolId);

        // user's locks in cfmm pool
        const lockIds = sharePoolDetail.userLockedAssets
          .flatMap(({ lockIds }) => lockIds)
          .concat(
            sharePoolDetail.userUnlockingAssets.flatMap(
              ({ lockIds }) => lockIds
            )
          );

        const userCanMigrate =
          !sharePoolDetail.userAvailableShares.toDec().isZero() ||
          lockIds.length > 0;

        if (userCanMigrate) {
          // lock IDs to be accepted by msg
          const msgLockIds: string[] = [];

          if (!sharePoolDetail.userAvailableShares.toDec().isZero()) {
            // use -1 to migrate available shares
            msgLockIds.push("-1");
          }
          msgLockIds.push(...lockIds);

          const account = this.osmosisAccount;

          if (account) {
            upgrades.push({
              cfmmPoolId: poolId,
              clPoolId,
              upgrade: () =>
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
                          else resolve();
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
    protected readonly derivedDataStore: DerivedDataStore
  ) {
    makeObservable(this);
  }
}
