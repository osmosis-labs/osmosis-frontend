import { useFlags } from "launchdarkly-react-client-sdk";

import { useWindowSize } from "./window";

export const useIsConcentratedLiquidityEnabled = () => {
  const featureFlags = useFlags();
  const { isMobile } = useWindowSize();

  return {
    isConcentratedLiquidityEnabled: Boolean(
      !isMobile && featureFlags.concentratedLiquidity
    ),
  };
};
