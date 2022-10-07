import { useCallback } from "react";
import { Duration } from "dayjs/plugin/duration";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AmountConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { useStore } from "../../stores";
import { useAmountConfig } from "./use-amount-config";

/** UI config for setting valid GAMM token amounts and locking them in a lock. */
export function useLockTokenConfig(
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  sendCurrency?: AppCurrency | undefined
): {
  config: AmountConfig;
  lockToken: (gaugeDuration: Duration) => Promise<void>;
} {
  const { accountStore } = useStore();

  const account = accountStore.getAccount(chainId);
  const { bech32Address } = account;

  const config = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    bech32Address,
    undefined,
    sendCurrency
  );

  const lockToken = useCallback(
    (gaugeDuration) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (!config.sendCurrency.coinMinimalDenom.startsWith("gamm")) {
            throw new Error("Tried to lock non-gamm token");
          }
          await account.osmosis.sendLockTokensMsg(
            gaugeDuration.asSeconds(),
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
          console.log("Locktokens config: rejected");
          reject();
        }
      });
    },
    [account, config.sendCurrency, config.amount]
  );

  return { config, lockToken };
}
