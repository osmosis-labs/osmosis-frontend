import { CoinPretty } from "@keplr-wallet/unit";
import { useCallback, useMemo } from "react";

import { useStore } from "~/stores";

type MigrationParam = { cfmmShares: CoinPretty } | { lockIds: string[] };

/** To avoid tx gas limit, only migrate 3 locks or shares at once. */
const GAS_NUM_LOCKS_OR_SHARES = 3;

/** Use for sending CFMM to CL migration messages if applicable.
 *  If not provided a cfmmPoolId, will attempt to find the first user pool that is linked to a CL pool.
 */
export function useCfmmToClMigration(cfmmPoolId?: string): {
  isLinked: boolean;
  userCanMigrate: boolean;
  linkedClPoolId: string | null;
  /** Migrates all forms of shares (available in bank, bonded or staked in locks) */
  migrate: () => Promise<void>;
} {
  const {
    queriesStore,
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    derivedDataStore,
  } = useStore();

  const account = accountStore.getWallet(chainId);
  const osmosisAccount = account?.osmosis;
  const osmosisQueries = queriesStore.get(chainId).osmosis!;

  const userPoolIds = osmosisQueries.queryGammPoolShare.getOwnPools(
    account?.address ?? ""
  );

  const firstClLinkedUserPoolId = userPoolIds.find((poolId) =>
    Boolean(
      osmosisQueries.queryCfmmToConcentratedLiquidityPoolLinks.get(poolId)
        .concentratedLiquidityPoolId
    )
  );

  const cfmmPoolId_ = cfmmPoolId ?? firstClLinkedUserPoolId ?? "";

  const { sharePoolDetail } = derivedDataStore.getForPool(
    cfmmPoolId_ ?? firstClLinkedUserPoolId
  );

  const userCanMigrate =
    (Boolean(cfmmPoolId_) &&
      !sharePoolDetail.userAvailableShares.toDec().isZero()) ||
    sharePoolDetail.userLockedAssets.flatMap(({ lockIds }) => lockIds).length >
      0 ||
    sharePoolDetail.userUnlockingAssets.flatMap(({ lockIds }) => lockIds)
      .length > 0;

  const concentratedPoolLink =
    osmosisQueries.queryCfmmToConcentratedLiquidityPoolLinks.get(
      cfmmPoolId_
    ).concentratedLiquidityPoolId;

  /** Collected migration params:
   - User has available shares
   - User has locked shares in lock identified by lockID */
  const migrationParams = useMemo(() => {
    const migrations = [] as MigrationParam[];
    if (!sharePoolDetail.userAvailableShares.toDec().isZero()) {
      migrations.push({ cfmmShares: sharePoolDetail.userAvailableShares });
    }
    const lockIds = sharePoolDetail.userLockedAssets
      .flatMap(({ lockIds }) => lockIds)
      .concat(
        sharePoolDetail.userUnlockingAssets.flatMap(({ lockIds }) => lockIds)
      );
    if (lockIds.length > 0) {
      migrations.push({ lockIds });
    }
    return migrations;
  }, [
    sharePoolDetail.userAvailableShares,
    sharePoolDetail.userLockedAssets,
    sharePoolDetail.userUnlockingAssets,
  ]);

  const migrate = useCallback(() => {
    if (!userCanMigrate) {
      console.error("User cannot migrate");
      return Promise.reject("User cannot migrate");
    }
    if (!osmosisAccount) {
      console.error("Account not found");
      return Promise.reject("Account not found");
    }

    const lockIds = migrationParams.reduce((lockIds, param) => {
      // for gas reasons, limit number of locks or shares that can be migrated
      if (lockIds.length >= GAS_NUM_LOCKS_OR_SHARES) return lockIds;

      if ("lockIds" in param) {
        lockIds.push(...param.lockIds);
      } else if ("cfmmShares" in param) {
        // chain will consider -1 lock as available shares in that pool
        lockIds.push("-1");
      }
      return lockIds;
    }, [] as string[]);

    return new Promise<void>(
      (resolve, reject) =>
        osmosisAccount
          .sendMigrateSharesToFullRangeConcentratedPositionMsgs(
            cfmmPoolId_,
            lockIds,
            undefined,
            undefined,
            (tx) => {
              // fullfilled
              if (tx.code) reject(tx.rawLog);
              else resolve();
            }
          )
          .catch(reject) // broadcast error
    );
  }, [userCanMigrate, osmosisAccount, migrationParams, cfmmPoolId_]);

  return useMemo(
    () => ({
      isLinked: Boolean(concentratedPoolLink),
      userCanMigrate,
      linkedClPoolId: concentratedPoolLink || null,
      migrate,
    }),
    [concentratedPoolLink, userCanMigrate, migrate]
  );
}
