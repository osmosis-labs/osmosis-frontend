import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import {
  ComponentProps,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useFeatureFlags,
  useTransferConfig,
  useWindowSize,
} from "~/hooks";
import { FiatRampKey } from "~/integrations";
import {
  ActivateUnverifiedTokenConfirmation,
  BridgeTransferV1Modal,
  BridgeTransferV2Modal,
  FiatOnrampSelectionModal,
  FiatRampsModal,
  IbcTransferModal,
  PreTransferModal,
  SelectAssetSourceModal,
  TransferAssetSelectModal,
} from "~/modals";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { removeQueryParam } from "~/utils/url";

import { BridgeFlowProvider } from "./flow";

const TransactionTypeQueryParamKey = "transaction_type";
const DenomQueryParamKey = "denom";

/** Legacy deposit/withdraw flow to be replaced by immersive flow. */
export const LegacyBridgeFlow: FunctionComponent<BridgeFlowProvider> = observer(
  ({ Provider, children }) => {
    const { assetsStore, userSettings } = useStore();
    const router = useRouter();
    const transferConfig = useTransferConfig();
    const flags = useFeatureFlags();
    const { logEvent } = useAmplitudeAnalytics();
    const { isMobile } = useWindowSize();

    const [confirmUnverifiedCoin, setConfirmUnverifiedCoin] = useState<{
      coin: CoinPretty;
      direction: "deposit" | "withdraw";
    } | null>(null);

    const {
      isOpen: isFiatOnrampSelectionOpen,
      onOpen: onOpenFiatOnrampSelection,
      onClose: onCloseFiatOnrampSelection,
    } = useDisclosure();

    const showUnverifiedAssetsSetting =
      userSettings.getUserSettingById<UnverifiedAssetsState>(
        "unverified-assets"
      );
    const shouldDisplayUnverifiedAssets =
      showUnverifiedAssetsSetting?.state.showUnverifiedAssets;

    // mobile only - allow selection of asset before proceeding with transfer
    const [preTransferModalProps, setPreTransferModalProps] =
      useState<ComponentProps<typeof PreTransferModal> | null>(null);
    const launchPreTransferModal = useCallback(
      (coinDenom: string) => {
        // Assets should be verified at this point
        const ibcBalance = assetsStore.ibcBalances.find(
          (ibcBalance) => ibcBalance.balance.denom === coinDenom
        );

        if (!ibcBalance) {
          console.error("launchPreTransferModal: ibcBalance not found");
          return;
        }

        setPreTransferModalProps({
          isOpen: true,
          selectedToken: ibcBalance,
          tokens: assetsStore.ibcBalances.map(({ balance }) => balance),
          externalDepositUrl: ibcBalance.depositUrlOverride,
          externalWithdrawUrl: ibcBalance.withdrawUrlOverride,
          onSelectToken: launchPreTransferModal,
          onWithdraw: () => {
            transferConfig?.transferAsset(
              "withdraw",
              ibcBalance.chainInfo.chainId,
              coinDenom
            );
            setPreTransferModalProps(null);
          },
          onDeposit: () => {
            transferConfig?.transferAsset(
              "deposit",
              ibcBalance.chainInfo.chainId,
              coinDenom
            );
            setPreTransferModalProps(null);
          },
          onRequestClose: () => setPreTransferModalProps(null),
        });
      },
      [assetsStore.ibcBalances, transferConfig]
    );

    const startBridge = useCallback(
      (direction: "deposit" | "withdraw") => {
        transferConfig.startTransfer(direction);
      },
      [transferConfig]
    );

    const bridgeAsset = useCallback(
      (anyDenom: string, direction: "deposit" | "withdraw") => {
        const balance = assetsStore.unverifiedIbcBalances.find(
          ({ balance }) =>
            balance.denom === anyDenom ||
            balance.currency.coinMinimalDenom === anyDenom
        );

        if (!balance) {
          console.error("Balance not found:", anyDenom);
          return;
        }

        if (!shouldDisplayUnverifiedAssets && !balance.isVerified) {
          setConfirmUnverifiedCoin({
            coin: balance.balance,
            direction,
          });
          return;
        }

        if (isMobile) {
          launchPreTransferModal(balance.balance.denom);
          return;
        }

        transferConfig.transferAsset(
          direction,
          balance.chainInfo.chainId,
          balance.balance.denom
        );
      },
      [
        assetsStore.unverifiedIbcBalances,
        transferConfig,
        isMobile,
        shouldDisplayUnverifiedAssets,
        setConfirmUnverifiedCoin,
        launchPreTransferModal,
      ]
    );

    const fiatRamp = useCallback(
      (fiatRampKey: FiatRampKey, assetKey: string) => {
        transferConfig.launchFiatRampsModal(fiatRampKey, assetKey);
      },
      [transferConfig]
    );

    /** Trigger transfer modal when `transaction_type` and `denom` search params are provided */
    useEffect(() => {
      const direction = router.query[TransactionTypeQueryParamKey];
      const denom = router.query[DenomQueryParamKey];

      if (typeof direction !== "string" || typeof denom !== "string") {
        return;
      }

      if (direction !== "deposit" && direction !== "withdraw") {
        console.warn("Invalid transaction type ", direction);
        return;
      }

      const asset = assetsStore.unverifiedIbcBalances.find(
        ({ balance }) =>
          balance.currency.coinDenom?.toLowerCase() === denom?.toLowerCase() ||
          balance.currency.coinMinimalDenom?.toLowerCase() ===
            denom?.toLowerCase()
      );

      if (!asset) {
        console.warn(
          `Provided denom ${denom} for transaction type ${direction} is not found.}`
        );
        return;
      }

      bridgeAsset(asset.balance.denom, direction);
      removeQueryParam(TransactionTypeQueryParamKey);
      removeQueryParam(DenomQueryParamKey);
    }, [router.query, assetsStore.unverifiedIbcBalances, bridgeAsset]);

    return (
      <Provider
        value={{
          startBridge,
          bridgeAsset,
          fiatRamp,
          fiatRampSelection: onOpenFiatOnrampSelection,
        }}
      >
        {children}
        {isMobile && preTransferModalProps && (
          <PreTransferModal {...preTransferModalProps} />
        )}
        {confirmUnverifiedCoin && (
          <ActivateUnverifiedTokenConfirmation
            coinDenom={confirmUnverifiedCoin.coin.denom}
            coinImageUrl={confirmUnverifiedCoin.coin.currency.coinImageUrl}
            isOpen={Boolean(confirmUnverifiedCoin)}
            onConfirm={() => {
              showUnverifiedAssetsSetting?.setState({
                showUnverifiedAssets: true,
              });

              const balance = assetsStore.unverifiedIbcBalances.find(
                ({ balance }) =>
                  balance.denom === confirmUnverifiedCoin.coin.denom
              );

              if (!balance) {
                console.error(
                  "Balance not found:",
                  confirmUnverifiedCoin.coin.denom
                );
                return;
              }

              transferConfig.transferAsset(
                confirmUnverifiedCoin.direction,
                balance.chainInfo.chainId,
                balance.balance.denom
              );
            }}
            onRequestClose={() => {
              setConfirmUnverifiedCoin(null);
            }}
          />
        )}
        {transferConfig?.assetSelectModal && (
          <TransferAssetSelectModal {...transferConfig.assetSelectModal} />
        )}
        {transferConfig?.selectAssetSourceModal && (
          <SelectAssetSourceModal {...transferConfig.selectAssetSourceModal} />
        )}
        {transferConfig?.ibcTransferModal && (
          <IbcTransferModal {...transferConfig.ibcTransferModal} />
        )}
        {transferConfig?.bridgeTransferModal &&
          (!flags.multiBridgeProviders ||
          transferConfig?.bridgeTransferModal?.balance.originBridgeInfo // Show V1 for Nomic
            ?.bridge === "nomic" ? (
            <BridgeTransferV1Modal {...transferConfig.bridgeTransferModal} />
          ) : (
            <BridgeTransferV2Modal {...transferConfig.bridgeTransferModal} />
          ))}
        {transferConfig?.fiatRampsModal && (
          <FiatRampsModal {...transferConfig.fiatRampsModal} />
        )}
        <FiatOnrampSelectionModal
          isOpen={isFiatOnrampSelectionOpen}
          onRequestClose={onCloseFiatOnrampSelection}
          onSelectRamp={() => {
            logEvent([EventName.ProfileModal.buyTokensClicked]);
          }}
        />
      </Provider>
    );
  }
);
