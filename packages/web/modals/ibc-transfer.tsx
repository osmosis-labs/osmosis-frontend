import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Transfer } from "../components/complex/transfer";
import { EventName } from "../config";
import {
  IbcTransfer,
  useAmplitudeAnalytics,
  useConnectWalletModalRedirect,
  useIbcTransfer,
} from "../hooks";
import { useStore } from "../stores";
import { ModalBase, ModalBaseProps } from ".";

export const IbcTransferModal: FunctionComponent<ModalBaseProps & IbcTransfer> =
  observer((props) => {
    const { currency, counterpartyChainId, isWithdraw } = props;
    const t = useTranslation();
    const {
      chainStore,
      queriesStore,
      ibcTransferHistoryStore,
      queriesExternalStore,
    } = useStore();
    const { chainId: osmosisChainId } = chainStore.osmosis;

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
    const { showModalBase, accountActionButton, walletConnected } =
      useConnectWalletModalRedirect(
        {
          className: "md:mt-4 mt-6 hover:opacity-75",
          mode: isChainBlockedOrCongested ? "primary-warning" : "primary",
          disabled:
            !account.isReadyToSendTx ||
            !counterpartyAccount.isReadyToSendTx ||
            account.txTypeInProgress !== "" ||
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
          children:
            chainStatus === "blocked" || chainStatus === "congested"
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

    return (
      <ModalBase
        {...props}
        isOpen={props.isOpen && showModalBase}
        title={
          isWithdraw
            ? t("assets.ibcTransfer.titleWithdraw", {
                coinDenom: currency.coinDenom,
              })
            : t("assets.ibcTransfer.titleDeposit", {
                coinDenom: currency.coinDenom,
              })
        }
      >
        <Transfer
          isWithdraw={isWithdraw}
          transferPath={
            isWithdraw
              ? [
                  {
                    address: account.bech32Address,
                    networkName: chainStore.getChain(osmosisChainId).chainName,
                    iconUrl: "/tokens/osmo.svg",
                  },
                  {
                    address: counterpartyAccount.bech32Address,
                    networkName:
                      chainStore.getChain(counterpartyChainId).chainName,
                    iconUrl: currency.coinImageUrl,
                  },
                ]
              : [
                  {
                    address: counterpartyAccount.bech32Address,
                    networkName:
                      chainStore.getChain(counterpartyChainId).chainName,
                    iconUrl: currency.coinImageUrl,
                  },
                  {
                    address: account.bech32Address,
                    networkName: chainStore.getChain(osmosisChainId).chainName,
                    iconUrl: "/tokens/osmo.svg",
                  },
                ]
          }
          isOsmosisAccountLoaded={walletConnected}
          availableBalance={
            isWithdraw
              ? queriesStore
                  .get(osmosisChainId)
                  .queryBalances.getQueryBech32Address(account.bech32Address)
                  .getBalanceFromCurrency(currency)
              : queriesStore
                  .get(counterpartyChainId)
                  .queryBalances.getQueryBech32Address(
                    counterpartyAccount.bech32Address
                  )
                  .getBalanceFromCurrency(currency.originCurrency!)
          }
          editWithdrawAddrConfig={
            customCounterpartyConfig
              ? {
                  customAddress: customCounterpartyConfig.bech32Address,
                  isValid: customCounterpartyConfig.isValid,
                  setCustomAddress: customCounterpartyConfig.setBech32Address,
                  didAckWithdrawRisk,
                  setDidAckWithdrawRisk,
                }
              : undefined
          }
          disabled={!walletConnected}
          toggleIsMax={() => amountConfig.toggleIsMax()}
          currentValue={amountConfig.amount}
          onInput={(value) => amountConfig.setAmount(value)}
          waitTime={t("assets.ibcTransfer.waitTime")}
        />
        {accountActionButton}
      </ModalBase>
    );
  });
