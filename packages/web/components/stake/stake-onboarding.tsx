import { useEffect, useState } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useAmountConfig, useFakeFeeConfig } from "~/hooks";
import { useGetApr } from "~/hooks/staking/use-get-apr";
import { useDisclosure } from "~/hooks/use-disclosure";
import { useLocalStorageState } from "~/hooks/window/use-localstorage-state";
import { FiatOnrampSelectionModal } from "~/modals/fiat-on-ramp-selection";
import { StakeIntroModal } from "~/modals/stake-intro-modal";
import { useStore } from "~/stores";

interface StakeOnboardingProps {
  address: string;
  isWalletConnected: boolean;
}

export const StakeOnboarding: React.FC<StakeOnboardingProps> = ({
  address,
  isWalletConnected,
}) => {
  const [showStakeIntroModal, setShowStakeIntroModal] = useState(false);

  const { accountStore, chainStore, queriesStore } = useStore();

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

  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);

  const osmo = chainStore.osmosis.stakeCurrency;

  const feeConfig = useFakeFeeConfig(
    chainStore,
    osmosisChainId,
    account?.osmosis.msgOpts.delegateToValidatorSet.gas || 0
  );

  const amountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    osmosisChainId,
    address,
    feeConfig,
    osmo
  );

  const { stakingAPR } = useGetApr();

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
