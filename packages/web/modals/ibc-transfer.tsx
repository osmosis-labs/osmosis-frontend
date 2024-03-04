import { WalletStatus } from "@cosmos-kit/core";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useState } from "react";

import { Transfer } from "~/components/complex/transfer";
import { UnstableAssetWarning } from "~/components/complex/unstable-assets-warning";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import {
  IbcTransfer,
  useAmplitudeAnalytics,
  useConnectWalletModalRedirect,
  useIbcTransfer,
} from "~/hooks";
import { useWalletSelect } from "~/hooks/wallet-select";
import { ModalBase, ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

export const IbcTransferModal: FunctionComponent<ModalBaseProps & IbcTransfer> =
  observer((props) => {
    const { currency, counterpartyChainId, isWithdraw } = props;
    const { t } = useTranslation();
    const {
      chainStore,
      queriesStore,
      ibcTransferHistoryStore,
      queriesExternalStore,
      accountStore,
      assetsStore,
    } = useStore();
    const { chainId: osmosisChainId } = chainStore.osmosis;

    const { onOpenWalletSelect, isLoading: isWalletSelectLoading } =
      useWalletSelect();

    const { logEvent } = useAmplitudeAnalytics();

    const [
      account,
      counterpartyAccount,
      amountConfig,
      inTransit,
      transfer,
      customCounterpartyConfig,
    ] = useIbcTransfer(props);

    const [didAckWithdrawRisk, setDidAckWithdrawRisk] = useState(false);

    const isCustomWithdrawValid =
      !customCounterpartyConfig ||
      customCounterpartyConfig?.bech32Address === "" || // if not changed, it's valid since it's from Keplr
      (customCounterpartyConfig.isValid && didAckWithdrawRisk);

    const chainStatusQuery = queriesExternalStore.queryChainStatus;

    const chainStatus = chainStatusQuery.getIbcStatus(
      isWithdraw ? "withdraw" : "deposit",
      isWithdraw ? props.sourceChannelId : props.destChannelId,
      counterpartyChainId
    );

    const isChainBlockedOrCongested =
      chainStatus === "congested" || chainStatus === "blocked";
    const isUnsupportedChain = !Boolean(
      accountStore.connectedWalletSupportsChain(counterpartyChainId)?.value ??
        true
    );

    const { showModalBase, accountActionButton, walletConnected, resetState } =
      useConnectWalletModalRedirect(
        {
          className: "md:mt-4 mt-6 hover:opacity-75",
          mode: isChainBlockedOrCongested ? "primary-warning" : "primary",
          disabled:
            !account?.isReadyToSendTx ||
            !counterpartyAccount?.isReadyToSendTx ||
            account?.txTypeInProgress !== "" ||
            counterpartyAccount?.txTypeInProgress !== "" ||
            amountConfig.error != undefined ||
            inTransit ||
            !isCustomWithdrawValid,
          onClick: () => {
            logEvent([
              isWithdraw
                ? EventName.Assets.withdrawAssetStarted
                : EventName.Assets.depositAssetStarted,
              {
                tokenName: amountConfig.sendCurrency.coinDenom,
                tokenAmount: Number(amountConfig.amount),
                bridge: "IBC",
              },
            ]);
            // failure events are handled by the root store
            transfer(
              (txFullfillEvent) => {
                // success
                logEvent([
                  isWithdraw
                    ? EventName.Assets.withdrawAssetCompleted
                    : EventName.Assets.depositAssetCompleted,
                  {
                    tokenName: amountConfig.sendCurrency.coinDenom,
                    tokenAmount: Number(amountConfig.amount),
                    bridge: "IBC",
                  },
                ]);
                ibcTransferHistoryStore.pushPendingHistory(txFullfillEvent);
                props.onRequestClose();
              },
              (txBroadcastEvent) => {
                ibcTransferHistoryStore.pushUncommitedHistory(txBroadcastEvent);
              },
              (txHash) => {
                ibcTransferHistoryStore.removeUncommittedHistory(txHash);
              }
            );
          },
          children: isUnsupportedChain
            ? t("assetNotCompatible")
            : chainStatus === "blocked" || chainStatus === "congested"
            ? isWithdraw
              ? t("assets.ibcTransfer.channelCongestedWithdraw")
              : t("assets.ibcTransfer.channelCongestedDeposit")
            : isWithdraw
            ? t("assets.ibcTransfer.titleWithdraw", {
                coinDenom: currency.coinDenom,
              })
            : t("assets.ibcTransfer.titleDeposit", {
                coinDenom: currency.coinDenom,
              }),
        },
        props.onRequestClose
      );

    const areWalletsConnected =
      walletConnected &&
      counterpartyAccount?.walletStatus === WalletStatus.Connected;

    const availableBalance = isWithdraw
      ? queriesStore
          .get(osmosisChainId)
          .queryBalances.getQueryBech32Address(account?.address ?? "")
          .getBalanceFromCurrency(currency)
      : queriesStore
          .get(counterpartyChainId)
          .queryBalances.getQueryBech32Address(
            counterpartyAccount?.address ?? ""
          )
          .getBalanceFromCurrency(currency.originCurrency!);

    const { ibcBalances } = assetsStore;

    const coinDenom = availableBalance?.currency.coinDenom;

    // find matching balance from asset list
    const ibcBalance = ibcBalances.find(
      ({ balance }) => balance.currency.coinDenom === coinDenom
    );

    const isUnstable = ibcBalance?.isUnstable;
    const prettyChainName =
      ibcBalance?.chainInfo.prettyChainName || currency.coinDenom;

    const [showIsUnstableWarning, setShowIsUnstableWarning] =
      useState(isUnstable);

    const getTitle = useCallback(() => {
      if (showIsUnstableWarning) {
        return isWithdraw
          ? t("unstableAssetsWarning.titleWithdraw", {
              coinDenom: currency.coinDenom,
            })
          : t("unstableAssetsWarning.titleDeposit", {
              coinDenom: currency.coinDenom,
            });
      } else {
        return isWithdraw
          ? t("assets.ibcTransfer.titleWithdraw", {
              coinDenom: currency.coinDenom,
            })
          : t("assets.ibcTransfer.titleDeposit", {
              coinDenom: currency.coinDenom,
            });
      }
    }, [showIsUnstableWarning, isWithdraw, t, currency.coinDenom]);

    return (
      <ModalBase
        {...props}
        isOpen={props.isOpen && showModalBase}
        title={getTitle()}
      >
        {showIsUnstableWarning ? (
          <UnstableAssetWarning
            onContinue={() => setShowIsUnstableWarning(false)}
            onCancel={props.onRequestClose}
            prettyChainName={prettyChainName}
          />
        ) : (
          <>
            <Transfer
              isWithdraw={isWithdraw}
              transferPath={
                isWithdraw
                  ? [
                      {
                        address: account?.address ?? "",
                        networkName:
                          chainStore.getChain(osmosisChainId).prettyChainName,
                        iconUrl: "/tokens/osmo.svg",
                        source: "account" as const,
                      },
                      {
                        address: counterpartyAccount?.address ?? "",
                        networkName:
                          chainStore.getChain(counterpartyChainId)
                            .prettyChainName,
                        iconUrl: currency.coinImageUrl,
                        source: "counterpartyAccount" as const,
                      },
                    ]
                  : [
                      {
                        address: counterpartyAccount?.address ?? "",
                        networkName:
                          chainStore.getChain(counterpartyChainId)
                            .prettyChainName,
                        iconUrl: currency.coinImageUrl,
                        source: "counterpartyAccount" as const,
                      },
                      {
                        address: account?.address ?? "",
                        networkName:
                          chainStore.getChain(osmosisChainId).prettyChainName,
                        iconUrl: "/tokens/osmo.svg",
                        source: "account" as const,
                      },
                    ]
              }
              isOsmosisAccountLoaded={walletConnected}
              availableBalance={availableBalance}
              editWithdrawAddrConfig={
                customCounterpartyConfig
                  ? {
                      customAddress: customCounterpartyConfig.bech32Address,
                      isValid: customCounterpartyConfig.isValid,
                      setCustomAddress:
                        customCounterpartyConfig.setBech32Address,
                      didAckWithdrawRisk,
                      setDidAckWithdrawRisk,
                    }
                  : undefined
              }
              disabled={!areWalletsConnected}
              toggleIsMax={() => amountConfig.toggleIsMax()}
              currentValue={amountConfig.amount}
              onInput={(value) => amountConfig.setAmount(value)}
              waitTime={t("assets.ibcTransfer.waitTime")}
              selectedWalletDisplay={
                isWalletSelectLoading
                  ? undefined
                  : {
                      iconUrl: counterpartyAccount?.walletInfo?.logo ?? "",
                      displayName:
                        counterpartyAccount?.walletInfo?.prettyName ?? "",
                    }
              }
              onRequestSwitchWallet={async (source) => {
                if (source === "account") {
                  await account?.disconnect(true);
                  onOpenWalletSelect(osmosisChainId);
                } else if (source === "counterpartyAccount") {
                  await counterpartyAccount?.disconnect(true);
                  onOpenWalletSelect(props.counterpartyChainId);
                }
                resetState();
              }}
            />
            {accountActionButton}
          </>
        )}
      </ModalBase>
    );
  });
