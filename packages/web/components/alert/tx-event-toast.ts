import { ChainInfoInner } from "@keplr-wallet/stores";
import {
  ChainInfoWithExplorer,
  DeliverTxResponse,
  isSlippageError,
  prettifyTxError,
} from "@osmosis-labs/stores";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";

export function toastOnBroadcastFailed(
  getChain: (chainId: string) => ChainInfoInner<ChainInfoWithExplorer>
) {
  return (chainId: string, e?: Error) => {
    let caption: string = "unknownError";
    if (e instanceof Error || (e && "message" in e)) {
      caption = e.message;
    } else if (typeof e === "string") {
      caption = e;
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
          caption: isSlippageError(tx)
            ? "swapFailed"
            : prettifyTxError(tx.rawLog ?? "", chainInfo.currencies) ??
              tx.rawLog,
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
