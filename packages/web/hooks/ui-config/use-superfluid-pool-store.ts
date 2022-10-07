import { useState, useEffect, useCallback } from "react";
import {
  ObservableQueryPoolDetails,
  ObservableQuerySuperfluidPool,
} from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { AmountConfig } from "@keplr-wallet/hooks";

/** When provided a pool details store (which may need to be loaded), will generate superfluid pool info and actions. */
export function useSuperfluidPoolStore(
  poolDetails?: ObservableQueryPoolDetails
): {
  superfluidPoolStore: ObservableQuerySuperfluidPool | undefined;
  superfluidDelegateToValidator: (
    validatorAddress: string,
    lockLPTokensConfig?: AmountConfig
  ) => Promise<"delegated" | "locked-and-delegated">;
} {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const account = accountStore.getAccount(chainId);
  const { bech32Address } = account;
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;

  const [superfluidPoolStore, setSuperfluidPoolStore] =
    useState<ObservableQuerySuperfluidPool | null>(null);
  useEffect(() => {
    if (poolDetails && !superfluidPoolStore) {
      setSuperfluidPoolStore(
        new ObservableQuerySuperfluidPool(
          bech32Address,
          fiat,
          poolDetails,
          queriesStore.get(chainId).cosmos.queryValidators,
          queriesStore.get(chainId).cosmos.queryInflation,
          queryOsmosis,
          priceStore
        )
      );
    }
  }, [poolDetails, bech32Address, fiat, queryOsmosis, priceStore]);

  const superfluidDelegateToValidator = useCallback(
    (validatorAddress, lockLPTokensConfig) => {
      return new Promise<"delegated" | "locked-and-delegated">(
        async (resolve, reject) => {
          if (superfluidPoolStore?.superfluid) {
            if (superfluidPoolStore.superfluid.upgradeableLpLockIds) {
              // is delegating existing locked shares
              try {
                await account.osmosis.sendSuperfluidDelegateMsg(
                  superfluidPoolStore.superfluid.upgradeableLpLockIds.lockIds,
                  validatorAddress,
                  undefined,
                  () => resolve("delegated")
                );
              } catch (e) {
                console.error(e);
                reject();
              }
            } else if (
              superfluidPoolStore.superfluid.superfluidLpShares &&
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
            }
          }
        }
      );
    },
    [
      superfluidPoolStore?.superfluid,
      superfluidPoolStore?.superfluid?.upgradeableLpLockIds,
      superfluidPoolStore?.superfluid?.upgradeableLpLockIds?.lockIds,
      superfluidPoolStore?.superfluid?.superfluidLpShares,
    ]
  );

  return {
    superfluidPoolStore: superfluidPoolStore ?? undefined,
    superfluidDelegateToValidator,
  };
}
