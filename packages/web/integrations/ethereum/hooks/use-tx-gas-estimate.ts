import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useEffect, useRef, useState } from "react";

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
  costMultiplier = 5.4
): CoinPretty | null {
  const [cost, setCost] = useState<CoinPretty | null>(null);

  const gasCostCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (memoedParams && memoedCurrency) {
      const cacheKey = `${JSON.stringify(memoedParams)}${JSON.stringify(
        memoedCurrency
      )}`;
      const cachedAmount = gasCostCache.current?.get(cacheKey);
      if (cachedAmount) {
        setCost(new CoinPretty(memoedCurrency, cachedAmount));
        return;
      }
      estimateTxGas(sendFn, memoedParams).then((estimate) => {
        const adjustedAmount = new Dec(estimate)
          .mul(new Dec(costMultiplier))
          .truncate();
        setCost(new CoinPretty(memoedCurrency, adjustedAmount));
        gasCostCache.current?.set(cacheKey, adjustedAmount.toString());
      });
    } else if (cost && !memoedCurrency) {
      setCost(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendFn, memoedParams, memoedCurrency]);

  return cost;
}
