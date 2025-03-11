import { useEffect } from "react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useSwapStore } from "~/stores/swap";

/**
 * Switches between using query parameters or React state to store 'from' and 'to' asset denominations.
 * If the user has set preferences via query parameters, the initial denominations will be ignored.
 */
export function useToFromDenoms({
  initialFromDenom,
  initialToDenom,
}: {
  initialFromDenom?: string;
  initialToDenom?: string;
}) {
  const {
    fromAssetDenom,
    toAssetDenom,
    setFromAssetDenom,
    setToAssetDenom,
    switchAssets,
  } = useSwapStore(
    useShallow((state) => ({
      fromAssetDenom: state.fromAssetDenom,
      toAssetDenom: state.toAssetDenom,
      setFromAssetDenom: state.setFromAssetDenom,
      setToAssetDenom: state.setToAssetDenom,
      switchAssets: state.switchAssets,
    }))
  );

  // Update state when initial values change
  useEffect(() => {
    setFromAssetDenom(initialToDenom);
    setToAssetDenom(initialFromDenom);
  }, [initialFromDenom, initialToDenom, setFromAssetDenom, setToAssetDenom]);

  return useMemo(
    () => ({
      fromAssetDenom,
      toAssetDenom,
      setFromAssetDenom,
      setToAssetDenom,
      switchAssets,
    }),
    [
      fromAssetDenom,
      toAssetDenom,
      setFromAssetDenom,
      setToAssetDenom,
      switchAssets,
    ]
  );
}
