import { AppCurrency } from "@keplr-wallet/types";
import { Duration } from "dayjs/plugin/duration";
import { useCallback } from "react";

import { useStore } from "~/stores";

import { useAmountInput } from "../input/use-amount-input";

/** UI config for setting valid GAMM token amounts and un/locking them in a lock. */
export function useLockTokenConfig(sendCurrency?: AppCurrency | undefined): {
  config: ReturnType<typeof useAmountInput>;
  lockToken: (gaugeDuration: Duration) => Promise<void>;
  unlockTokens: (
    locks: { lockId: string; isSynthetic: boolean }[]
  ) => Promise<"synthetic" | "normal">;
} {
  const { chainStore, accountStore } = useStore();

  const { chainId } = chainStore.osmosis;

  const account = accountStore.getWallet(chainId);

  const config = useAmountInput({
    currency: sendCurrency,
  });

  const lockToken = useCallback(
    (lockDuration: Duration) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (!sendCurrency || !config.amount)
            return reject("Invalid send currency or input amount");
          if (!sendCurrency.coinMinimalDenom.startsWith("gamm")) {
            return reject("Tried to lock non-gamm token");
          }

          await account?.osmosis.sendLockTokensMsg(
            lockDuration.asSeconds(),
            [
              {
                currency: sendCurrency,
                amount: config.amount.toCoin().amount,
              },
            ],
            undefined,
            () => resolve()
          );
        } catch (e) {
          console.error(e);
          reject();
        }
      });
    },
    [account, sendCurrency, config.amount]
  );

  const unlockTokens = useCallback(
    (locks: { lockId: string; isSynthetic: boolean }[]) => {
      return new Promise<"synthetic" | "normal">(async (resolve, reject) => {
        if (!account) return reject();

        try {
          const isSuperfluidUnlock = locks.some((lock) => lock.isSynthetic);

          if (isSuperfluidUnlock) {
            // superfluid (synthetic) unlock
            await account.osmosis.sendBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
              locks,
              undefined,
              (tx) => {
                if (!Boolean(tx.code)) resolve("synthetic");
                else reject();
              }
            );
          } else {
            // normal unlock of available shares escrowed in lock
            const blockGasLimitLockIds = locks
              .slice(0, 10)
              .map(({ lockId }) => lockId);
            await account.osmosis.sendBeginUnlockingMsg(
              blockGasLimitLockIds,
              undefined,
              (tx) => {
                if (!Boolean(tx.code)) resolve("normal");
                else reject();
              }
            );
          }
        } catch (e) {
          console.error(e);
          reject();
        }
      });
    },
    [account]
  );

  return { config, lockToken, unlockTokens };
}
