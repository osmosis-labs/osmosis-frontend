import type { BondDuration } from "@osmosis-labs/server";
import {
  prepareLockAndSuperfluidDelegateMsg,
  prepareSuperfluidDelegateMsg,
} from "@osmosis-labs/tx";
import { useCallback } from "react";

import { api } from "~/utils/trpc";

import { useAmountInput } from "../input/use-amount-input";
import { useWallet } from "../use-wallet";

/** Superfluid pool actions. */
export function useSuperfluidPool(bondDurations?: BondDuration[]): {
  delegateSharesToValidator: (
    poolId: string,
    validatorAddress: string,
    lockLPTokensConfig?: ReturnType<typeof useAmountInput>
  ) => Promise<"delegated" | "locked-and-delegated">;
} {
  const { wallet: account, signAndBroadcast, transactionContext } = useWallet();
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
                await prepareSuperfluidDelegateMsg(
                  transactionContext,
                  delegateableLocks.map((lock) => lock.lockId),
                  validatorAddress,
                  undefined,
                  () => resolve("delegated")
                ).then((prepared) => signAndBroadcast(...prepared));
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

                await prepareLockAndSuperfluidDelegateMsg(
                  transactionContext,
                  [
                    {
                      currency: sendCurrency,
                      amount: amount,
                    },
                  ],
                  validatorAddress,
                  undefined,
                  () => resolve("locked-and-delegated")
                ).then((prepared) => signAndBroadcast(...prepared));
              } catch (e) {
                console.error(e);
                reject();
              }
            }
          }
        }
      );
    },
    [
      account?.address,
      bondDurations,
      apiUtils.edge.pools.getSharePoolBondDurations,
      transactionContext,
      signAndBroadcast,
    ]
  );

  return { delegateSharesToValidator };
}
