import { AmountConfig } from "@keplr-wallet/hooks";
import { useCallback } from "react";

import { useStore } from "../../stores";

/** Superfluid pool actions. */
export function useSuperfluidPool(): {
  superfluidDelegateToValidator: (
    poolId: string,
    validatorAddress: string,
    lockLPTokensConfig?: AmountConfig
  ) => Promise<"delegated" | "locked-and-delegated">;
} {
  const {
    chainStore,
    oldAccountStore: accountStore,
    derivedDataStore,
  } = useStore();
  const { chainId } = chainStore.osmosis;

  const account = accountStore.getAccount(chainId);

  const superfluidDelegateToValidator = useCallback(
    (poolId, validatorAddress, lockLPTokensConfig) => {
      return new Promise<"delegated" | "locked-and-delegated">(
        async (resolve, reject) => {
          const superfluidPoolDetail =
            derivedDataStore.superfluidPoolDetails.get(poolId);
          if (superfluidPoolDetail?.superfluid) {
            if (superfluidPoolDetail.superfluid.upgradeableLpLockIds) {
              // is delegating existing locked shares
              try {
                await account.osmosis.sendSuperfluidDelegateMsg(
                  superfluidPoolDetail.superfluid.upgradeableLpLockIds.lockIds,
                  validatorAddress,
                  undefined,
                  () => resolve("delegated")
                );
              } catch (e) {
                console.error(e);
                reject();
              }
            } else if (
              superfluidPoolDetail.superfluid.superfluidLpShares &&
              lockLPTokensConfig
            ) {
              try {
                await account.osmosis.sendLockAndSuperfluidDelegateMsg(
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
    []
  );

  return {
    superfluidDelegateToValidator,
  };
}
