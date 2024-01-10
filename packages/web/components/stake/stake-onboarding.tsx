import { Dec } from "@keplr-wallet/unit";
import { AmountConfig } from "@osmosis-labs/keplr-hooks";
import { useEffect, useState } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useDisclosure } from "~/hooks/use-disclosure";
import { useLocalStorageState } from "~/hooks/window/use-localstorage-state";
import { FiatOnrampSelectionModal } from "~/modals/fiat-on-ramp-selection";
import { StakeIntroModal } from "~/modals/stake-intro-modal";

interface StakeOnboardingProps {
  address: string;
  isWalletConnected: boolean;
  stakingAPR: Dec;
  amountConfig: AmountConfig;
}

const StakeOnboarding: React.FC<StakeOnboardingProps> = ({
  address,
  isWalletConnected,
  stakingAPR,
  amountConfig,
}) => {
  const [showStakeIntroModal, setShowStakeIntroModal] = useState(false);

  const {
    isOpen: isFiatOnrampSelectionOpen,
    onOpen: onOpenFiatOnrampSelection,
    onClose: onCloseFiatOnrampSelection,
  } = useDisclosure();

  const localStorageKey = `show-stake-modal-intro-${address}`;

  const defaultValue =
    typeof window !== "undefined"
      ? JSON.parse(window.localStorage.getItem(localStorageKey) || "true")
      : true;

  const [showStakeModalForWalletAddress, setShowStakeModalForWalletAddress] =
    useLocalStorageState(localStorageKey, defaultValue);

  const { logEvent } = useAmplitudeAnalytics({});

  useEffect(() => {
    if (isWalletConnected && address && showStakeModalForWalletAddress) {
      setShowStakeIntroModal(true);
      setShowStakeModalForWalletAddress(false);
    }
  }, [
    isWalletConnected,
    setShowStakeModalForWalletAddress,
    showStakeModalForWalletAddress,
    address,
  ]);

  return (
    <>
      <StakeIntroModal
        isOpen={showStakeIntroModal}
        onRequestClose={() => setShowStakeIntroModal(false)}
        isWalletConnected={isWalletConnected}
        balance={amountConfig.balance}
        stakingApr={stakingAPR}
        onOpenFiatOnrampSelection={onOpenFiatOnrampSelection}
      />
      <FiatOnrampSelectionModal
        isOpen={isFiatOnrampSelectionOpen}
        onRequestClose={onCloseFiatOnrampSelection}
        onSelectRamp={(ramp) => {
          if (ramp !== "transak") return;

          logEvent([EventName.Sidebar.buyOsmoClicked]);
        }}
      />
    </>
  );
};

export default StakeOnboarding;
