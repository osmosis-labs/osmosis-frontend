import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useAmountInput } from "~/hooks/use-amount-input";
import { useSwapStore } from "~/stores/swap";

export type UseSwapAmountInputReturn = ReturnType<typeof useSwapAmountInput>;

export function useSwapAmountInput({ direction }: { direction: "in" | "out" }) {
  const gasAmount = useSwapStore((state) => state.gasAmount);
  const { fromAsset, toAsset } = useSwapStore(
    useShallow((state) => ({
      fromAsset: state.fromAsset,
      toAsset: state.toAsset,
    }))
  );

  const asset = useMemo(
    () => (direction === "in" ? fromAsset : toAsset),
    [direction, fromAsset, toAsset]
  );

  const inAmountInput = useAmountInput({
    currency: asset,
    gasAmount: gasAmount,
  });

  return inAmountInput;
}
