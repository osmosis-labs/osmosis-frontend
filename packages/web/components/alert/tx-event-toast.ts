import { ChainInfoInner } from "@keplr-wallet/stores";
import { isSlippageError, prettifyTxError } from "@osmosis-labs/stores";
import { ChainInfoWithExplorer } from "../../stores/chain";
import { displayToast } from "./toast";
import { ToastType } from "./types";

export function toastOnBroadcastFailed(
  getChain: (chainId: string) => ChainInfoInner<ChainInfoWithExplorer>
) {
  return (chainId: string, e?: Error) => {
    let caption: string = "Unknown error";
    if (e instanceof Error) {
      caption = e.message;
    } else if (typeof e === "string") {
      caption = e;
    }

    displayToast(
      {
        message: "Transaction Failed",
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
        message: "Transaction Broadcasting",
        caption: "Waiting for transaction to be included in the block",
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
          message: "Transaction Failed",
          caption: isSlippageError(tx)
            ? "Swap failed. Liquidity may not be sufficient. Try adjusting the allowed slippage."
            : prettifyTxError(tx.log, chainInfo.currencies) ?? tx.log,
        },
        ToastType.ERROR
      );
    } else {
      displayToast(
        {
          message: "Transaction Successful",
          learnMoreUrl: chainInfo.raw.explorerUrlToTx.replace(
            "{txHash}",
            tx.hash.toUpperCase()
          ),
          learnMoreUrlCaption: "View explorer",
        },
        ToastType.SUCCESS
      );
    }
  };
}
