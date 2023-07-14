import { useFlags } from "launchdarkly-react-client-sdk";

import { useWindowSize } from "./window";

type AvailableFlags = "concentratedLiquidity" | "staking" | "swapsAdBanner";

export const useFeatureFlags = () => {
  const launchdarklyFlags: Record<AvailableFlags, boolean> = useFlags();
  const { isMobile } = useWindowSize();

  return {
    ...launchdarklyFlags,
    concentratedLiquidity: Boolean(
      !isMobile && launchdarklyFlags.concentratedLiquidity
    ),
  } as Record<AvailableFlags, boolean>;
};
