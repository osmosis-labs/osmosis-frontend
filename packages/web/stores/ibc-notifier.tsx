import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useState } from "react";

import { displayToast, ToastType } from "../components/alert";
import { useStore } from ".";

/**
 * IBCHistoryNotifier hook tracks the changes of the IBC Transfer history on the IBCTransferHistoryStore.
 * And, if the changes are detected, this will notify the success or failure to the users, and update the balances.
 * XXX: `IBCHistoryNotifier` doesn't render anything.
 */
export const IbcNotifier: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, ibcTransferHistoryStore, accountStore } =
    useStore();
  const { chainId } = chainStore.osmosis;
  const [historyHandlerAdded, setHistoryHandlerAdded] = useState(false);

  useEffect(() => {
    if (!historyHandlerAdded) {
      ibcTransferHistoryStore.addHistoryChangedHandler((history) => {
        if (chainStore.hasChain(history.destChainId)) {
          const transferAmount = new CoinPretty(
            history.amount.currency,
            new Dec(history.amount.amount)
          ).moveDecimalPointRight(history.amount.currency.coinDecimals);
          const isWithdraw =
            ChainIdHelper.parse(chainId).identifier !==
            ChainIdHelper.parse(history.destChainId).identifier;

          if (history.status === "complete") {
            displayToast(
              {
                message: "IBC Transfer Complete",
                caption: isWithdraw
                  ? `${transferAmount
                      .maxDecimals(6)
                      .trim(true)
                      .shrink(true)} has been successfully withdrawn`
                  : `${transferAmount
                      .maxDecimals(6)
                      .trim(true)
                      .shrink(true)} has been successfully deposited`,
              },
              ToastType.SUCCESS
            );
          } else if (history.status === "timeout") {
            displayToast(
              {
                message: "IBC Transfer Timeout",
                caption: isWithdraw
                  ? `${transferAmount
                      .maxDecimals(6)
                      .trim(true)
                      .shrink(true)} has failed to withdraw`
                  : `${transferAmount
                      .maxDecimals(6)
                      .trim(true)
                      .shrink(true)} has failed to deposit`,
              },
              ToastType.ERROR
            );
          } else if (history.status === "refunded") {
            displayToast(
              {
                message: "IBC Transfer Refunded",
                caption: `${transferAmount
                  .maxDecimals(6)
                  .trim(true)
                  .shrink(true)} has been successfully refunded`,
              },
              ToastType.SUCCESS
            );
          }

          const account = accountStore.getWallet(chainId);
          if (
            history.sender === account?.address ||
            history.recipient === account?.address
          ) {
            if (history.status === "complete") {
              queriesStore
                .get(history.destChainId)
                .queryBalances.getQueryBech32Address(history.recipient)
                .fetch();
            } else if (history.status === "refunded") {
              queriesStore
                .get(history.sourceChainId)
                .queryBalances.getQueryBech32Address(history.recipient)
                .fetch();
            }
          }
        }
      });
      setHistoryHandlerAdded(true);
    }
  }, [
    ibcTransferHistoryStore,
    chainId,
    queriesStore,
    accountStore,
    chainStore,
    historyHandlerAdded,
    setHistoryHandlerAdded,
  ]);

  return null;
});
