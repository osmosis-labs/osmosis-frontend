import { ChainInfoInner } from "@keplr-wallet/stores";
import { isSlippageError, prettifyTxError } from "@osmosis-labs/stores";

import { ChainInfoWithExplorer } from "../../stores/chain";
import { displayToast } from "./toast";
import { ToastType } from "./types";

export function toastOnBroadcastFailed(
  getChain: (chainId: string) => ChainInfoInner<ChainInfoWithExplorer>
) {
  return (chainId: string, e?: Error) => {
    let caption: string = "unknownError";
    if (e instanceof Error) {
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
  return (chainId: string, tx: any) => {
    const chainInfo = getChain(chainId);
    if (tx.code) {
      displayToast(
        {
          message: "transactionFailed",
          caption: isSlippageError(tx)
            ? "swapFailed"
            : prettifyTxError(tx.log, chainInfo.currencies) ?? tx.log,
        },
        ToastType.ERROR
      );
    } else {
      displayToast(
        {
          message: "transactionSuccessful",
          learnMoreUrl: chainInfo.raw.explorerUrlToTx.replace(
            "{txHash}",
            tx.hash.toUpperCase()
          ),
          learnMoreUrlCaption: "viewExplorer",
        },
        ToastType.SUCCESS
      );
    }
  };
}
