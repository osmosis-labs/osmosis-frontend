import { useCallback } from "react";
import { Duration } from "dayjs/plugin/duration";
import { AmountConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { useStore } from "../../stores";
import { useAmountConfig } from "./use-amount-config";

/** UI config for setting valid GAMM token amounts and locking them in a lock. */
export function useLockTokenConfig(sendCurrency?: AppCurrency | undefined): {
  config: AmountConfig;
  lockToken: (gaugeDuration: Duration) => Promise<void>;
  unlockTokens: (
    lockIds: string[],
    duration: Duration
  ) => Promise<"synthetic" | "normal">;
} {
  const { chainStore, queriesStore, accountStore } = useStore();

  const { chainId } = chainStore.osmosis;

  const account = accountStore.getAccount(chainId);
  const { bech32Address } = account;

  const config = useAmountConfig(
    chainStore,
    queriesStore,
    chainId,
    bech32Address,
    undefined,
    sendCurrency
  );

  const lockToken = useCallback(
    (lockDuration) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (!config.sendCurrency.coinMinimalDenom.startsWith("gamm")) {
            throw new Error("Tried to lock non-gamm token");
          }
          await account.osmosis.sendLockTokensMsg(
            lockDuration.asSeconds(),
            [
              {
                currency: config.sendCurrency,
                amount: config.amount,
              },
            ],
            undefined,
            resolve
          );
        } catch (e) {
          console.error(e);
          reject();
        }
      });
    },
    [account, config.sendCurrency, config.amount]
  );

  const queryOsmosis = queriesStore.get(chainId).osmosis!;

  const unlockTokens = useCallback(
    (lockIds: string[], duration: Duration) => {
      return new Promise<"synthetic" | "normal">(async (resolve, reject) => {
        try {
          const blockGasLimitLockIds = lockIds.slice(0, 4);

          // refresh locks
          for (const lockId of blockGasLimitLockIds) {
            await queryOsmosis.querySyntheticLockupsByLockId
              .get(lockId)
              .waitFreshResponse();
          }

          // make msg lock objects
          const locks = blockGasLimitLockIds.map((lockId) => ({
            lockId,
            isSyntheticLock:
              queryOsmosis.querySyntheticLockupsByLockId.get(lockId)
                .isSyntheticLock === true,
          }));

          const durations =
            queryOsmosis.queryLockableDurations.lockableDurations;
          const isSuperfluidDuration =
            duration.asSeconds() === durations[duration.length - 1].asSeconds();

          if (
            isSuperfluidDuration ||
            locks.some((lock) => lock.isSyntheticLock)
          ) {
            await account.osmosis.sendBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
              locks,
              undefined,
              () => resolve("synthetic")
            );
          } else {
            const blockGasLimitLockIds = lockIds.slice(0, 10);
            await account.osmosis.sendBeginUnlockingMsg(
              blockGasLimitLockIds,
              undefined,
              () => resolve("normal")
            );
          }
        } catch (e) {
          console.error(e);
          reject();
        }
      });
    },
    [queryOsmosis]
  );

  return { config, lockToken, unlockTokens };
}
