import { CoinPretty } from "@keplr-wallet/unit";
import { useCallback, useMemo } from "react";

import { useStore } from "~/stores";

export type MigrationParams = Partial<{
  cfmmShares: CoinPretty;
  lockIds: string[];
}>;

/** Use for sending CFMM to CL migration messages if applicable. */
export function useCfmmToClMigration(cfmmPoolId: string): {
  isLinked: boolean;
  userCanMigrate: boolean;
  linkedClPoolId: string | null;
  migrate: (params: MigrationParams) => Promise<void>;
} {
  const {
    queriesStore,
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    derivedDataStore,
  } = useStore();

  const osmosisAccount = accountStore.getAccount(chainId).osmosis;
  const osmosisQueries = queriesStore.get(chainId).osmosis!;
  const { poolDetail } = derivedDataStore.getForPool(cfmmPoolId);

  const userCanMigrate =
    !poolDetail.userAvailableShares.toDec().isZero() ||
    poolDetail.userLockedAssets.length > 0;

  const concentratedPoolLink =
    osmosisQueries.queryCfmmToConcentratedLiquidityPoolLinks.get(
      cfmmPoolId
    ).concentratedLiquidityPoolId;

  const migrate = useCallback(
    ({ cfmmShares, lockIds }: MigrationParams) => {
      if (!userCanMigrate) throw new Error("User cannot migrate");

      if (cfmmShares) {
        return new Promise<void>(
          (resolve, reject) =>
            osmosisAccount
              .sendMigrateUnlockedSharesToFullRangeConcentratedPositionMultiMsg(
                cfmmPoolId,
                {
                  currency: cfmmShares.currency,
                  amount: cfmmShares.toCoin().amount,
                },
                undefined,
                undefined,
                (tx) => {
                  // fullfilled
                  if (tx.code) reject(tx.log);
                  else resolve();
                }
              )
              .catch(reject) // broadcast error
        );
      } else if (lockIds) {
        return new Promise<void>(
          (resolve, reject) =>
            osmosisAccount
              .sendUnlockAndMigrateSharesToFullRangeConcentratedPositionMsg(
                cfmmPoolId,
                lockIds,
                undefined,
                (tx) => {
                  // fullfilled
                  if (tx.code) reject(tx.log);
                  else resolve();
                }
              )
              .catch(reject) // broadcast error
        );
      } else {
        throw new Error("CFMM shares or lock IDs are required");
      }
    },
    [userCanMigrate, osmosisAccount, cfmmPoolId]
  );

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
