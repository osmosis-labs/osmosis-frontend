import type { BondDuration } from "@osmosis-labs/server";
import { useCallback } from "react";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { useAmountInput } from "../input/use-amount-input";

/** Superfluid pool actions. */
export function useSuperfluidPool(bondDurations?: BondDuration[]): {
  delegateSharesToValidator: (
    poolId: string,
    validatorAddress: string,
    lockLPTokensConfig?: ReturnType<typeof useAmountInput>
  ) => Promise<"delegated" | "locked-and-delegated">;
} {
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const apiUtils = api.useUtils();

  const delegateSharesToValidator = useCallback(
    (
      poolId: string,
      validatorAddress: string,
      lockLPTokensConfig?: ReturnType<typeof useAmountInput>
    ) => {
      return new Promise<"delegated" | "locked-and-delegated">(
        async (resolve, reject) => {
          const address = account?.address;

          if (!address) return reject("No account address");

          const bondDurations_ =
            bondDurations ??
            (await apiUtils.edge.pools.getSharePoolBondDurations.fetch({
              poolId,
              userOsmoAddress: address,
            }));

          const superfluidDuration = bondDurations_.find(({ superfluid }) =>
            Boolean(superfluid)
          );

          if (superfluidDuration) {
            const delegateableLocks = superfluidDuration.userLocks.filter(
              ({ isSynthetic }) => !isSynthetic
            );
            if (delegateableLocks.length > 0) {
              // is delegating existing locked shares
              try {
                await account?.osmosis.sendSuperfluidDelegateMsg(
                  delegateableLocks.map((lock) => lock.lockId),
                  validatorAddress,
                  undefined,
                  () => resolve("delegated")
                );
              } catch (e) {
                console.error(e);
                reject();
              }
            } else {
              try {
                const sendCurrency = lockLPTokensConfig?.amount?.currency;
                const amount = lockLPTokensConfig?.amount?.toCoin().amount;

                if (!sendCurrency) return reject("No send currency to lock");
                if (!amount) return reject("No amount to lock");

                await account?.osmosis.sendLockAndSuperfluidDelegateMsg(
                  [
                    {
                      currency: sendCurrency,
                      amount: amount,
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
            }
          }
        }
      );
    },
    [account?.osmosis, account?.address, bondDurations, apiUtils]
  );

  return { delegateSharesToValidator };
}
