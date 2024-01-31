import { ChainInfoInner } from "@osmosis-labs/keplr-stores";
import { DeliverTxResponse, isSlippageError } from "@osmosis-labs/stores";
import type { AppCurrency, ChainInfoWithExplorer } from "@osmosis-labs/types";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";

import { prettifyTxError } from "./prettify";

export function toastOnBroadcastFailed(
  getChain: (chainId: string) => ChainInfoInner<ChainInfoWithExplorer>
) {
  return (chainId: string, e?: Error) => {
    let caption: string = "unknownError";
    if (typeof e === "string") {
      caption = e;
    } else if (e instanceof Error || (e && "message" in e)) {
      caption = e.message;
    }

    displayToast(
      {
        message: "transactionFailed",
        caption:
          prettifyTxError(caption, getChain(chainId).currencies) ?? caption,
      },
      ToastType.ERROR
    );
  };
}

export function toastOnBroadcast() {
  return () => {
    displayToast(
      {
        message: "transactionBroadcasting",
        caption: "waitingForTransaction",
      },
      ToastType.LOADING
    );
  };
}

export function toastOnFulfill(
  getChain: (chainId: string) => ChainInfoInner<ChainInfoWithExplorer>
) {
  return (chainId: string, tx: DeliverTxResponse) => {
    const chainInfo = getChain(chainId);
    if (tx.code) {
      displayToast(
        {
          message: "transactionFailed",
          caption: getErrorMessage(tx, chainInfo.currencies),
        },
        ToastType.ERROR
      );
    } else {
      displayToast(
        {
          message: "transactionSuccessful",
          learnMoreUrl: chainInfo.raw.explorerUrlToTx.replace(
            "{txHash}",
            tx.transactionHash.toUpperCase()
          ),
          learnMoreUrlCaption: "viewExplorer",
        },
        ToastType.SUCCESS
      );
    }
  };
}

// gets the error message depending on the transaction.
const getErrorMessage = (tx: DeliverTxResponse, currencies: AppCurrency[]) => {
  if (tx.code === 30) {
    return "errors.txTimedOutError";
  }

  return isSlippageError(tx)
    ? "swapFailed"
    : prettifyTxError(tx.rawLog ?? "", currencies) ?? tx.rawLog;
};
