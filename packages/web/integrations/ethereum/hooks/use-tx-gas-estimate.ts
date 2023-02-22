import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useEffect, useState } from "react";

import { estimateTxGas } from "../tx/estimate-gas";
import { SendFn } from "../types";

/** Estimate gas cost of arbitrary EVM tx.
 * @param sendFn Function to carry out RPC call.
 * @param memoedParams Params to tx.
 * @param memoedCurrency Currency to use for gas cost.
 * @param costMultiplier Buffer to add to gas cost to handle high gas cost case (gas slippage).
 */
export function useTxGasEstimate(
  sendFn: SendFn,
  memoedParams?: unknown[],
  memoedCurrency?: Currency,
  costMultiplier = 2.2
): CoinPretty | null {
  const [cost, setCost] = useState<CoinPretty | null>(null);

  useEffect(() => {
    if (memoedParams && memoedCurrency) {
      let multiplier = costMultiplier ? new Dec(costMultiplier) : new Dec(0);

      estimateTxGas(sendFn, memoedParams).then((estimate) => {
        setCost(
          new CoinPretty(
            memoedCurrency,
            new Dec(estimate).mul(multiplier)
          ).hideDenom(true)
        );
      });
    }
  }, [sendFn, memoedParams, memoedCurrency]);

  return cost;
}
