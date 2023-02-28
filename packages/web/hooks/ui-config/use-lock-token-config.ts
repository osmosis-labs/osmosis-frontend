import { AmountConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { useCallback, useEffect } from "react";

import { useStore } from "../../stores";
import { useAmountConfig } from "./use-amount-config";

/** UI config for setting valid GAMM token amounts and un/locking them in a lock. */
export function useLockTokenConfig(sendCurrency?: AppCurrency | undefined): {
  config: AmountConfig;
  lockToken: (gaugeDuration: Duration) => Promise<void>;
  unlockTokens: (
    lockIds: string[],
    duration: Duration
  ) => Promise<"synthetic" | "normal">;
} {
  const {
    chainStore,
    queriesStore,
    oldAccountStore: accountStore,
  } = useStore();

  const { chainId } = chainStore.osmosis;

  const account = accountStore.getAccount(chainId);
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
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
            duration.asSeconds() ===
            durations[durations.length - 1]?.asSeconds();

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
    [
      queryOsmosis,
      queryOsmosis.querySyntheticLockupsByLockId,
      queryOsmosis.queryLockableDurations.response,
    ]
  );

  // refresh query stores when an unbonding token happens to unbond with window open
  useEffect(() => {
    if (
      queryOsmosis.queryAccountLocked.get(bech32Address).isFetching ||
      bech32Address === ""
    )
      return;

    const unlockingTokens =
      queryOsmosis.queryAccountLocked.get(bech32Address).unlockingCoins;
    const now = dayjs().utc();
    let timeoutIds: NodeJS.Timeout[] = [];

    // set a timeout for each unlocking token to trigger a refresh at unbond time
    unlockingTokens.forEach(({ endTime }) => {
      const diffMs = dayjs(endTime).diff(now, "ms");
      const blockTime = 6_000; // allow one block to process unbond before querying

      timeoutIds.push(
        setTimeout(() => {
          queryOsmosis.queryGammPoolShare.fetch(bech32Address);
        }, diffMs + blockTime)
      );
    });

    return () => {
      timeoutIds.forEach((timeout) => clearTimeout(timeout));
    };
  }, [
    queryOsmosis.queryAccountLocked.get(bech32Address).response,
    bech32Address,
  ]);

  return { config, lockToken, unlockTokens };
}
