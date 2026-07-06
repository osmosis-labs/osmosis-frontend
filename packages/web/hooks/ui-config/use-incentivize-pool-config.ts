import { AppCurrency } from "@keplr-wallet/types";
import { useCallback, useState } from "react";

import { useStore } from "~/stores";

import { useAmountInput } from "../input/use-amount-input";

/** UI config for funding external incentive gauges on a pool: a reward
 *  amount for a selectable currency, plus create and top-up senders that
 *  resolve when the tx lands. */
export function useIncentivizePoolConfig(): {
  selectedCurrency: AppCurrency | undefined;
  setSelectedCurrency: (currency: AppCurrency | undefined) => void;
  config: ReturnType<typeof useAmountInput>;
  createGauge: (params: {
    distributeTo:
      | { type: "byDuration"; denom: string; durationSeconds: number }
      | { type: "noLock"; poolId: string };
    numEpochs: number;
  }) => Promise<void>;
  addToGauge: (gaugeId: string) => Promise<void>;
} {
  const { chainStore, accountStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);

  const [selectedCurrency, setSelectedCurrency] = useState<AppCurrency>();
  const config = useAmountInput({ currency: selectedCurrency });

  const createGauge = useCallback(
    (params: {
      distributeTo:
        | { type: "byDuration"; denom: string; durationSeconds: number }
        | { type: "noLock"; poolId: string };
      numEpochs: number;
    }) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (!selectedCurrency || !config.amount)
            return reject("Invalid reward currency or input amount");

          await account?.osmosis.sendCreateGaugeMsg(
            params.distributeTo,
            [
              {
                currency: selectedCurrency,
                amount: config.amount.toCoin().amount,
              },
            ],
            // Emissions begin at the first epoch after this time.
            new Date(),
            params.numEpochs,
            false,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else resolve();
            }
          );
        } catch (e) {
          console.error(e);
          reject(e instanceof Error ? e.message : e);
        }
      });
    },
    [account, selectedCurrency, config.amount]
  );

  const addToGauge = useCallback(
    (gaugeId: string) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (!selectedCurrency || !config.amount)
            return reject("Invalid reward currency or input amount");

          await account?.osmosis.sendAddToGaugeMsg(
            gaugeId,
            [
              {
                currency: selectedCurrency,
                amount: config.amount.toCoin().amount,
              },
            ],
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else resolve();
            }
          );
        } catch (e) {
          console.error(e);
          reject(e instanceof Error ? e.message : e);
        }
      });
    },
    [account, selectedCurrency, config.amount]
  );

  return {
    selectedCurrency,
    setSelectedCurrency,
    config,
    createGauge,
    addToGauge,
  };
}
