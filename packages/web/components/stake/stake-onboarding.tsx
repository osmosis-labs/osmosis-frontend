import { CoinPretty } from "@keplr-wallet/unit";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { EventName } from "~/config";
import {
  useAmountConfig,
  useAmplitudeAnalytics,
  useDisclosure,
  useFakeFeeConfig,
  useGetApr,
  useLocalStorageState,
} from "~/hooks";
import { FiatOnrampSelectionModal } from "~/modals/fiat-on-ramp-selection";
import { StakeIntroModal } from "~/modals/stake-intro-modal";
import { useStore } from "~/stores";

interface StakeOnboardingProps {
  address: string;
  isWalletConnected: boolean;
}

const getDefaultLocalStorageKey = (key: string, defaultValue = true) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  const item = window.localStorage.getItem(key);
  if (item === null) {
    return defaultValue;
  }

  try {
    return JSON.parse(item);
  } catch (error) {
    console.error("Error parsing localStorage item:", error);
    return defaultValue;
  }
};

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

  const router = useRouter();

  const localStorageKey = `show-stake-modal-intro-${address}`;

  const defaultValue = getDefaultLocalStorageKey(localStorageKey, true);

  const [showStakeModalForWalletAddress, setShowStakeModalForWalletAddress] =
    useLocalStorageState(localStorageKey, defaultValue);

  const { logEvent } = useAmplitudeAnalytics({});

  useEffect(() => {
    if (showStakeModalForWalletAddress) {
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

  const handleClose = () => {
    () => setShowStakeIntroModal(false);
    router.push("/stake");
  };

  return (
    <>
      <StakeIntroModal
        isOpen={showStakeIntroModal}
        onRequestClose={handleClose}
        isWalletConnected={isWalletConnected}
        balance={amountConfig.balance || new CoinPretty(osmo, 0)}
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
