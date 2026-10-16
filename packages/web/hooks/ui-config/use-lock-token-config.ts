import {
  prepareBeginUnlockingMsg,
  prepareBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock,
  prepareLockTokensMsg,
} from "@osmosis-labs/tx";
import { AppCurrency } from "@osmosis-labs/unit";
import { Duration } from "dayjs/plugin/duration";
import { useCallback } from "react";

import { useAmountInput } from "../input/use-amount-input";
import { useWallet } from "../use-wallet";

/** UI config for setting valid GAMM token amounts and un/locking them in a lock. */
export function useLockTokenConfig(sendCurrency?: AppCurrency | undefined): {
  config: ReturnType<typeof useAmountInput>;
  lockToken: (gaugeDuration: Duration) => Promise<void>;
  unlockTokens: (
    locks: { lockId: string; isSynthetic: boolean }[]
  ) => Promise<"synthetic" | "normal">;
} {
  const { wallet: account, signAndBroadcast, transactionContext } = useWallet();

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

          await prepareLockTokensMsg(
            transactionContext,
            lockDuration.asSeconds(),
            [
              {
                currency: sendCurrency,
                amount: config.amount.toCoin().amount,
              },
            ],
            undefined,
            () => resolve()
          ).then((prepared) => signAndBroadcast(...prepared));
        } catch (e) {
          console.error(e);
          reject();
        }
      });
    },
    [sendCurrency, config.amount, transactionContext, signAndBroadcast]
  );

  const unlockTokens = useCallback(
    (locks: { lockId: string; isSynthetic: boolean }[]) => {
      return new Promise<"synthetic" | "normal">(async (resolve, reject) => {
        if (!account) return reject();

        try {
          const isSuperfluidUnlock = locks.some((lock) => lock.isSynthetic);

          if (isSuperfluidUnlock) {
            // superfluid (synthetic) unlock
            await prepareBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
              transactionContext,
              locks,
              undefined,
              (tx) => {
                if (!Boolean(tx.code)) resolve("synthetic");
                else reject();
              }
            ).then((prepared) => signAndBroadcast(...prepared));
          } else {
            // normal unlock of available shares escrowed in lock
            const blockGasLimitLockIds = locks
              .slice(0, 10)
              .map(({ lockId }) => lockId);
            await prepareBeginUnlockingMsg(
              transactionContext,
              blockGasLimitLockIds,
              undefined,
              (tx) => {
                if (!Boolean(tx.code)) resolve("normal");
                else reject();
              }
            ).then((prepared) => signAndBroadcast(...prepared));
          }
        } catch (e) {
          console.error(e);
          reject();
        }
      });
    },
    [account, signAndBroadcast, transactionContext]
  );

  return { config, lockToken, unlockTokens };
}
