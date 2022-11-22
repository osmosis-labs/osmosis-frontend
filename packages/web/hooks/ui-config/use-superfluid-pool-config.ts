import { useState, useEffect, useCallback } from "react";
import {
  ObservableQueryPoolDetails,
  ObservableQuerySuperfluidPool,
} from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { AmountConfig } from "@keplr-wallet/hooks";

/** When provided a pool details store (which may need to be loaded), will generate superfluid pool info and actions. */
export function useSuperfluidPoolConfig(
  poolDetails?: ObservableQueryPoolDetails
): {
  superfluidPoolConfig: ObservableQuerySuperfluidPool | undefined;
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

  const [superfluidPoolConfig, setSuperfluidPoolStore] =
    useState<ObservableQuerySuperfluidPool | null>(null);
  useEffect(() => {
    if (poolDetails && !superfluidPoolConfig) {
      setSuperfluidPoolStore(
        new ObservableQuerySuperfluidPool(
          fiat,
          poolDetails,
          queriesStore.get(chainId).cosmos.queryValidators,
          queriesStore.get(chainId).cosmos.queryInflation,
          queryOsmosis,
          priceStore
        )
      );
    }
  }, [poolDetails, fiat, queryOsmosis, priceStore]);

  useEffect(
    () => superfluidPoolConfig?.setBech32Address(bech32Address),
    [superfluidPoolConfig, bech32Address]
  );

  const superfluidDelegateToValidator = useCallback(
    (validatorAddress, lockLPTokensConfig) => {
      return new Promise<"delegated" | "locked-and-delegated">(
        async (resolve, reject) => {
          if (superfluidPoolConfig?.superfluid) {
            if (superfluidPoolConfig.superfluid.upgradeableLpLockIds) {
              // is delegating existing locked shares
              try {
                await account.osmosis.sendSuperfluidDelegateMsg(
                  superfluidPoolConfig.superfluid.upgradeableLpLockIds.lockIds,
                  validatorAddress,
                  undefined,
                  () => resolve("delegated")
                );
              } catch (e) {
                console.error(e);
                reject();
              }
            } else if (
              superfluidPoolConfig.superfluid.superfluidLpShares &&
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
    [
      superfluidPoolConfig?.superfluid,
      superfluidPoolConfig?.superfluid?.upgradeableLpLockIds,
      superfluidPoolConfig?.superfluid?.upgradeableLpLockIds?.lockIds,
      superfluidPoolConfig?.superfluid?.superfluidLpShares,
    ]
  );

  return {
    superfluidPoolConfig: superfluidPoolConfig ?? undefined,
    superfluidDelegateToValidator,
  };
}
