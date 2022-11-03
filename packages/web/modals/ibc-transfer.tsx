import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { Transfer } from "../components/complex/transfer";
import {
  IbcTransfer,
  useIbcTransfer,
  useConnectWalletModalRedirect,
  useAmplitudeAnalytics,
} from "../hooks";
import { EventName } from "../config";
import { ModalBase, ModalBaseProps } from ".";
import { useTranslation } from "react-multi-lang";

export const IbcTransferModal: FunctionComponent<ModalBaseProps & IbcTransfer> =
  observer((props) => {
    const { currency, counterpartyChainId, isWithdraw } = props;
    const t = useTranslation();
    const {
      chainStore,
      queriesStore,
      queriesExternalStore,
      ibcTransferHistoryStore,
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

    const { showModalBase, accountActionButton, walletConnected } =
      useConnectWalletModalRedirect(
        {
          className: "md:mt-4 mt-6 hover:opacity-75",
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
                ibcTransferHistoryStore.pushPendingHistory(txFullfillEvent);
                props.onRequestClose();
              },
              (txBroadcastEvent) => {
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
                ibcTransferHistoryStore.pushUncommitedHistory(txBroadcastEvent);
              }
            );
          },
          children: isWithdraw
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
                  undefined,
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
                  undefined,
                  {
                    address: account.bech32Address,
                    networkName: chainStore.getChain(osmosisChainId).chainName,
                    iconUrl: "/tokens/osmo.svg",
                  },
                ]
          }
          ibcStatus={
            isWithdraw
              ? queriesExternalStore.queryIbcWithdrawStatuses
                  .get(counterpartyChainId)
                  .getIbcStatus(counterpartyChainId)
              : queriesExternalStore.queryIbcDepositStatuses
                  .get(counterpartyChainId)
                  .getIbcStatus(counterpartyChainId)
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
          disablePanel={!walletConnected}
          toggleIsMax={() => amountConfig.toggleIsMax()}
          currentValue={amountConfig.amount}
          onInput={(value) => amountConfig.setAmount(value)}
          waitTime={t("assets.ibcTransfer.waitTime")}
        />
        {accountActionButton}
      </ModalBase>
    );
  });
