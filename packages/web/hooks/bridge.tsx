import { PropsWithChildren } from "react";

import { ImmersiveBridgeFlow } from "~/components/bridge/immersive";
import { LegacyBridgeFlow } from "~/components/bridge/legacy";
import { FiatRampKey } from "~/integrations";
import { createContext } from "~/utils/react-context";

import { useFeatureFlags } from "./use-feature-flags";

export type BridgeContext = {
  /** Start bridging without knowing the asset to bridge yet. */
  startBridge: (direction: "deposit" | "withdraw") => void;
  /** Start bridging a specified asset of coinMinimalDenom or symbol/denom. */
  bridgeAsset: (anyDenom: string, direction: "deposit" | "withdraw") => void;
  /** Open a specified fiat on ramp given a specific fiat ramp key and asset key. */
  fiatRamp: (fiatRampKey: FiatRampKey, assetKey: string) => void;
  /** Open fiat ramp selection. */
  fiatRampSelection: () => void;
};

const [BridgeInnerProvider, useBridge] = createContext<BridgeContext>();

export { useBridge };

/** Provides a globally accessible bridge UX that is initiated via the `useBridge` hook. */
export const BridgeProvider = ({ children }: PropsWithChildren) => {
  const featureFlags = useFeatureFlags();

  if (!featureFlags._isInitialized)
    return <LoadingContext>{children}</LoadingContext>;
  if (featureFlags.newDepositWithdrawFlow)
    return (
      <ImmersiveBridgeFlow Provider={BridgeInnerProvider}>
        {children}
      </ImmersiveBridgeFlow>
    );
  else
    return (
      <LegacyBridgeFlow Provider={BridgeInnerProvider}>
        {children}
      </LegacyBridgeFlow>
    );
};

/** Context that provides no actions or state in bridge context while context is loading. */
export const LoadingContext = ({ children }: PropsWithChildren) => {
  const warn = (action: string) => () =>
    console.warn("Bridge context not loaded yet.", action);

  return (
    <BridgeInnerProvider
      value={{
        startBridge: warn("startBridge"),
        bridgeAsset: warn("bridgeAsset"),
        fiatRamp: warn("fiatRamp"),
        fiatRampSelection: warn("fiatRampSelection"),
      }}
    >
      {children}
    </BridgeInnerProvider>
  );
};
