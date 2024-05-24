import { ChainInfoInner } from "@osmosis-labs/keplr-stores";
import { DeliverTxResponse, isSlippageError } from "@osmosis-labs/stores";
import type { AppCurrency, ChainInfoWithExplorer } from "@osmosis-labs/types";
import { toast } from "react-toastify";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";

import { prettifyTxError } from "./prettify";

// Error code for timeout height reached in Cosmos SDK.
// https://github.com/cosmos/cosmos-sdk/blob/8f6a94cd1f9f1c6bf1ad83a751da86270db92e02/types/errors/errors.go#L129
const txTimeoutHeightReachedErrorCode = 30;

const BROADCASTING_TOAST_ID = "broadcast-failed";

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
        titleTranslationKey: "transactionFailed",
        captionTranslationKey:
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
        titleTranslationKey: "transactionBroadcasting",
        captionTranslationKey: "waitingForTransaction",
      },
      ToastType.LOADING,
      {
        toastId: BROADCASTING_TOAST_ID,
      }
    );
  };
}

export function toastOnFulfill(
  getChain: (chainId: string) => ChainInfoInner<ChainInfoWithExplorer>
) {
  return (chainId: string, tx: DeliverTxResponse) => {
    const chainInfo = getChain(chainId);
    toast.dismiss(BROADCASTING_TOAST_ID);
    if (tx.code) {
      displayToast(
        {
          titleTranslationKey: "transactionFailed",
          captionTranslationKey: getErrorMessage(tx, chainInfo.currencies),
        },
        ToastType.ERROR
      );
    } else {
      displayToast(
        {
          titleTranslationKey: "transactionSuccessful",
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
  if (tx.code === txTimeoutHeightReachedErrorCode) {
    return "errors.txTimedOutError";
  }

  return isSlippageError(tx)
    ? "swapFailed"
    : prettifyTxError(tx.rawLog ?? "", currencies) ?? tx.rawLog;
};
