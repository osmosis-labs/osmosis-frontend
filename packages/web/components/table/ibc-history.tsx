import Image from "next/image";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinPretty } from "@keplr-wallet/unit";
import {
  IBCTransferHistory,
  IBCTransferHistoryStatus,
  UncommitedHistory,
} from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { Table, BaseCell } from ".";
import { Breakpoint, CustomClasses } from "../types";
import { truncateString } from "../utils";
import { useWindowSize } from "../../hooks";

export const IbcHistoryTable: FunctionComponent<CustomClasses> = observer(
  ({ className }) => {
    const { chainStore, ibcTransferHistoryStore, accountStore } = useStore();

    const { chainId } = chainStore.osmosis;
    const { bech32Address } = accountStore.getAccount(chainId);

    const histories =
      ibcTransferHistoryStore.getHistoriesAndUncommitedHistoriesByAccount(
        bech32Address
      );

    return histories.length > 0 ? (
      <>
        <div className="text-h5 font-h5 md:text-h6 md:font-h6 mt-8">
          Transfer History
        </div>
        <Table<BaseCell & (IBCTransferHistory | UncommitedHistory)>
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
              value:
                ChainIdHelper.parse(chainId).identifier ===
                ChainIdHelper.parse(history.destChainId).identifier
                  ? "Deposit"
                  : "Withdraw",
            },
            {
              // Amount
              value: new CoinPretty(
                history.amount.currency,
                history.amount.amount
              )
                .moveDecimalPointRight(history.amount.currency.coinDecimals)
                .maxDecimals(6)
                .trim(true)
                .toString(),
            },
            { ...history }, // Status
          ])}
        />
      </>
    ) : null;
  }
);

const TxHashDisplayCell: FunctionComponent<
  BaseCell & { sourceChainId?: string }
> = ({ value, sourceChainId }) => {
  const { chainStore } = useStore();
  const { isMobile } = useWindowSize();

  return value && sourceChainId ? (
    <a
      className="flex items-center gap-2"
      href={chainStore
        .getChain(sourceChainId)
        .raw.explorerUrlToTx.replace("{txHash}", value.toUpperCase())}
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
  BaseCell & { status?: IBCTransferHistoryStatus }
> = ({ status }) => {
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
    default:
      return <></>;
  }
};
