import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import type {
  GetTransferStatusParams,
  TransferFailureReason,
  TransferStatus,
} from "@osmosis-labs/bridge";
import { IBCTransferHistory } from "@osmosis-labs/stores";
import { ChainIdHelper, isNumeric } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";
import { useStore } from "~/stores";

export type RecentTransfer = {
  txHash: string;
  createdAtMs: number;
  explorerUrl: string;
  amount: string;
  reason?: TransferFailureReason;
  status: TransferStatus;
  isWithdraw: boolean;
};

const osmosisChainId = ChainList[0].chain_id;

/** Gets recent (pending and recent) bridge transfers from history stores. Requires caller to wrap in `observer`. */
export function useRecentTransfers(address?: string): RecentTransfer[] {
  const { ibcTransferHistoryStore, transferHistoryStore } = useStore();

  if (!address) {
    return [];
  }

  console.log(
    "transferHistoryStore  .getHistoriesByAccount(address): ",
    transferHistoryStore.getHistoriesByAccount(address)
  );

  // reconcile histories from IBC and non-IBC history stores
  return transferHistoryStore
    .getHistoriesByAccount(address)
    .map(
      ({
        key,
        explorerUrl,
        createdAt,
        amount,
        status,
        reason,
        isWithdraw,
      }) => ({
        txHash: key.startsWith("{")
          ? (JSON.parse(key) as GetTransferStatusParams).sendTxHash
          : key,
        createdAtMs: createdAt.getTime(),
        explorerUrl,
        amount,
        reason,
        status,
        isWithdraw,
      })
    )
    .concat(
      ibcTransferHistoryStore
        .getHistoriesAndUncommitedHistoriesByAccount(address)
        .map((history) => {
          const { txHash, createdAt, amount, sourceChainId, destChainId } =
            history;
          let status: TransferStatus = "pending";
          const ibcStatus =
            typeof (history as IBCTransferHistory).status !== "undefined"
              ? (history as IBCTransferHistory).status
              : "pending";
          if (ibcStatus === "complete") {
            status = "success";
          } else if (ibcStatus === "timeout") {
            status = "refunded";
          } else {
            status = ibcStatus;
          }

          const counterpartyExplorerUrl = ChainList.find(
            (chain) => chain.chain_id === sourceChainId
          )?.explorers[0]?.tx_page;

          return {
            txHash,
            createdAtMs: new Date(createdAt).getTime(),
            explorerUrl:
              counterpartyExplorerUrl?.replace(
                "{txHash}",
                txHash.toUpperCase()
              ) ?? "",
            amount: isNumeric(amount.amount)
              ? new CoinPretty(
                  amount.currency,
                  new Dec(amount.amount).mul(
                    DecUtils.getTenExponentN(amount.currency.coinDecimals)
                  )
                )
                  .trim(true)
                  .toString()
              : "-",
            reason: undefined,
            status,
            isWithdraw:
              ChainIdHelper.parse(osmosisChainId).identifier !==
              ChainIdHelper.parse(destChainId).identifier,
          };
        })
    )
    .sort((a, b) => b.createdAtMs - a.createdAtMs); // descending by most recent
}
