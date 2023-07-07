import { CoinPretty } from "@keplr-wallet/unit";
import { useCallback, useMemo } from "react";

import { useStore } from "~/stores";

export type MigrationParams = (
  | { cfmmShares: CoinPretty }
  | { lockIds: string[] }
)[];

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

  const osmosisAccount = accountStore.getWallet(chainId)?.osmosis;
  const osmosisQueries = queriesStore.get(chainId).osmosis!;
  const { sharePoolDetail } = derivedDataStore.getForPool(cfmmPoolId);

  const userCanMigrate =
    !sharePoolDetail.userAvailableShares.toDec().isZero() ||
    sharePoolDetail.userLockedAssets.flatMap(({ lockIds }) => lockIds).length >
      0 ||
    sharePoolDetail.userUnlockingAssets.flatMap(({ lockIds }) => lockIds)
      .length > 0;

  const concentratedPoolLink =
    osmosisQueries.queryCfmmToConcentratedLiquidityPoolLinks.get(
      cfmmPoolId
    ).concentratedLiquidityPoolId;

  const migrate = useCallback(
    (params: MigrationParams) => {
      if (!userCanMigrate) throw new Error("User cannot migrate");

      const lockIds = params.reduce((acc, param) => {
        if ("lockIds" in param) {
          acc.push(...param.lockIds);
        } else if ("cfmmShares" in param) {
          acc.push("-1");
        }
        return acc;
      }, [] as string[]);

      if ("cfmmShares" in params) {
        return new Promise<void>(
          (resolve, reject) =>
            osmosisAccount
              ?.sendMigrateSharesToFullRangeConcentratedPositionMsgs(
                cfmmPoolId,
                undefined,
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
      } else if ("lockIds" in params) {
        return new Promise<void>(
          (resolve, reject) =>
            osmosisAccount
              ?.sendMigrateSharesToFullRangeConcentratedPositionMsgs(
                cfmmPoolId,
                params.lockIds.slice(0, 1),
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
