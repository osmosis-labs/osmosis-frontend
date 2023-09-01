import { useFlags } from "launchdarkly-react-client-sdk";

import { useWindowSize } from "~/hooks";

type AvailableFlags =
  | "concentratedLiquidity"
  | "staking"
  | "swapsAdBanner"
  | "notifications"
  | "convertToStake"
  | "mobileNotifications"
  | "upgrades";

export const useFeatureFlags = () => {
  const launchdarklyFlags: Record<AvailableFlags, boolean> = useFlags();
  const { isMobile } = useWindowSize();

  return {
    ...launchdarklyFlags,
    concentratedLiquidity: Boolean(
      !isMobile && launchdarklyFlags.concentratedLiquidity
    ),
    notifications: isMobile
      ? launchdarklyFlags.mobileNotifications
      : launchdarklyFlags.notifications,
  } as Record<Exclude<AvailableFlags, "mobileNotifications">, boolean>;
};
