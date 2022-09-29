import Image from "next/image";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinPretty } from "@keplr-wallet/unit";
import {
  IBCTransferHistory,
  IBCTransferHistoryStatus,
} from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { Table, BaseCell } from ".";
import { Breakpoint, CustomClasses } from "../types";
import { truncateString } from "../utils";
import { useWindowSize } from "../../hooks";

type History = {
  txHash: string;
  createdAtMs: number;
  explorerUrl: string;
  amount: string;
  reason?: string;
  status: IBCTransferHistoryStatus | "failed";
  isWithdraw: boolean;
};

export const TransferHistoryTable: FunctionComponent<CustomClasses> = observer(
  ({ className }) => {
    const {
      chainStore,
      nonIbcBridgeHistoryStore,
      ibcTransferHistoryStore,
      accountStore,
    } = useStore();

    const { chainId } = chainStore.osmosis;
    const { bech32Address } = accountStore.getAccount(chainId);

    const histories: History[] = nonIbcBridgeHistoryStore
      .getHistoriesByAccount(bech32Address)
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
          txHash: key,
          createdAtMs: createdAt.getTime(),
          explorerUrl,
          amount,
          reason,
          status: (status === "success" ? "complete" : status) as
            | IBCTransferHistoryStatus
            | "failed",
          isWithdraw,
        })
      )
      .concat(
        ibcTransferHistoryStore
          .getHistoriesAndUncommitedHistoriesByAccount(bech32Address)
          .map((history) => {
            const { txHash, createdAt, amount, sourceChainId, destChainId } =
              history;
            const status =
              typeof (history as IBCTransferHistory).status !== "undefined"
                ? (history as IBCTransferHistory).status
                : ("pending" as IBCTransferHistoryStatus);
            return {
              txHash,
              createdAtMs: new Date(createdAt).getTime(),
              explorerUrl: chainStore
                .getChain(sourceChainId)
                .raw.explorerUrlToTx.replace("{txHash}", txHash.toUpperCase()),
              amount: new CoinPretty(amount.currency, amount.amount)
                .moveDecimalPointRight(amount.currency.coinDecimals)
                .maxDecimals(6)
                .trim(true)
                .toString(),
              reason: undefined,
              status,
              isWithdraw:
                ChainIdHelper.parse(chainId).identifier !==
                ChainIdHelper.parse(destChainId).identifier,
            };
          })
      )
      .sort((a, b) => b.createdAtMs - a.createdAtMs); // descending by most recent

    return histories.length > 0 ? (
      <>
        <div className="text-h5 font-h5 md:text-h6 md:font-h6 mt-8">
          Transfer History
        </div>
        <Table<BaseCell & History>
          className={classNames("w-full", className)}
          headerTrClassName="!h-12 body2 md:caption"
          tBodyClassName="body2 md:caption"
          columnDefs={[
            {
              display: "Transaction Hash",
              className: "md:!pl-2",
              displayCell: TxHashDisplayCell,
            },
            { display: "Type" },
            { display: "Amount" },
            {
              display: "Status",
              collapseAt: Breakpoint.SM,
              className: "md:!pr-2",
              displayCell: StatusDisplayCell,
            },
          ]}
          data={histories.map((history) => [
            { ...history, value: history.txHash }, // Tx Hash
            {
              // Type
              value: history.isWithdraw ? "Withdraw" : "Deposit",
            },
            {
              // Amount
              value: history.amount,
            },
            { ...history }, // Status
          ])}
        />
      </>
    ) : null;
  }
);

const TxHashDisplayCell: FunctionComponent<
  BaseCell & { explorerUrl?: string }
> = ({ value, explorerUrl }) => {
  const { isMobile } = useWindowSize();

  return value && explorerUrl ? (
    <a
      className="flex items-center gap-2"
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {truncateString(value, isMobile ? 4 : 8)}{" "}
      <Image
        alt="external link"
        src="/icons/link-deco.svg"
        width={12}
        height={12}
      />
    </a>
  ) : (
    <></>
  );
};

const StatusDisplayCell: FunctionComponent<
  BaseCell & { status?: IBCTransferHistoryStatus | "failed"; reason?: string }
> = ({ status, reason }) => {
  if (status == null) {
    // Uncommitted history has no status.
    // Show pending for uncommitted history..
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 animate-spin">
          <Image
            alt="loading"
            src="/icons/loading-blue.svg"
            width={24}
            height={24}
          />
        </div>
        Pending
      </div>
    );
  }

  switch (status) {
    case "complete":
      return (
        <div className="flex items-center gap-2">
          <Image
            alt="success"
            src="/icons/check-circle.svg"
            width={24}
            height={24}
          />
          <span className="md:hidden">Success</span>
        </div>
      );
    case "pending":
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 animate-spin">
            <Image
              alt="loading"
              src="/icons/loading-blue.svg"
              width={24}
              height={24}
            />
          </div>
          <span className="md:hidden">Pending</span>
        </div>
      );
    case "refunded":
      return (
        <div className="flex items-center gap-2">
          <Image alt="failed" src="/icons/error-x.svg" width={24} height={24} />
          <span className="md:hidden">Refunded</span>
        </div>
      );
    case "timeout":
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 animate-spin">
            <Image
              alt="loading"
              src="/icons/loading-blue.svg"
              width={24}
              height={24}
            />
          </div>
          <span className="md:hidden">Failed: Pending refund</span>
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center gap-2">
          <Image alt="failed" src="/icons/error-x.svg" width={24} height={24} />
          <span className="md:hidden">Failed{reason && `: ${reason}`}</span>
        </div>
      );
    default:
      return <></>;
  }
};
