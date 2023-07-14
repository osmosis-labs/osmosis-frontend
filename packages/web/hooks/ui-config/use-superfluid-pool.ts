import { AmountConfig } from "@keplr-wallet/hooks";
import { useCallback } from "react";

import { useStore } from "~/stores";

/** Superfluid pool actions. */
export function useSuperfluidPool(): {
  delegateSharesToValidator: (
    poolId: string,
    validatorAddress: string,
    lockLPTokensConfig?: AmountConfig
  ) => Promise<"delegated" | "locked-and-delegated">;
} {
  const { chainStore, derivedDataStore, accountStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const account = accountStore.getWallet(chainId);

  const delegateSharesToValidator = useCallback(
    (poolId: any, validatorAddress: any, lockLPTokensConfig: any) => {
      return new Promise<"delegated" | "locked-and-delegated">(
        async (resolve, reject) => {
          const superfluidPoolDetail =
            derivedDataStore.superfluidPoolDetails.get(poolId);
          if (superfluidPoolDetail.isSuperfluid) {
            if (superfluidPoolDetail.userUpgradeableSharePoolLockIds) {
              // is delegating existing locked shares
              try {
                await account?.osmosis.sendSuperfluidDelegateMsg(
                  superfluidPoolDetail.userUpgradeableSharePoolLockIds.lockIds,
                  validatorAddress,
                  undefined,
                  () => resolve("delegated")
                );
              } catch (e) {
                console.error(e);
                reject();
              }
            } else if (lockLPTokensConfig) {
              try {
                await account?.osmosis.sendLockAndSuperfluidDelegateMsg(
                  [
                    {
                      currency: lockLPTokensConfig.sendCurrency,
                      amount: lockLPTokensConfig.amount,
                    },
                  ],
                  validatorAddress,
                  undefined,
                  () => resolve("locked-and-delegated")
                );
              } catch (e) {
                console.error(e);
                reject();
              }
            } else {
              console.warn(
                "Superfluid delegate: amount config for use in sendLockAndSuperfluidDelegateMsg missing"
              );
            }
          }
        }
      );
    },
    [account?.osmosis, derivedDataStore.superfluidPoolDetails]
  );

  return { delegateSharesToValidator };
}
