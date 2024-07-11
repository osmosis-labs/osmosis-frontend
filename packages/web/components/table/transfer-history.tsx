import type {
  TransferFailureReason,
  TransferStatus,
} from "@osmosis-labs/bridge";
import { truncateString } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { BaseCell, Table } from "~/components/table";
import { CustomClasses } from "~/components/types";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";
import { useStore } from "~/stores";

import {
  RecentTransfer,
  useRecentTransfers,
} from "../transactions/use-recent-transfers";

export const TransferHistoryTable: FunctionComponent<CustomClasses> = observer(
  ({ className }) => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const address =
      accountStore.getWallet(accountStore.osmosisChainId)?.address ?? "";

    const histories = useRecentTransfers(address);

    return histories.length > 0 ? (
      <>
        <div className="mt-8 text-h5 font-h5 md:text-h6 md:font-h6">
          {t("assets.historyTable.title")}
        </div>
        <Table<BaseCell & RecentTransfer>
          className={classNames("w-full", className)}
          headerTrClassName="!h-12 body2 md:caption"
          tBodyClassName="body2 md:caption"
          columnDefs={[
            {
              display: t("assets.historyTable.colums.transactionHash"),
              className: "md:!pl-2",
              displayCell: TxHashDisplayCell,
            },
            {
              display: t("assets.historyTable.colums.type"),
              className: "text-left",
            },
            {
              display: t("assets.historyTable.colums.amount"),
              className: "text-left",
            },
            {
              display: t("assets.historyTable.colums.status"),
              collapseAt: Breakpoint.sm,
              className: "md:!pr-2",
              displayCell: StatusDisplayCell,
            },
          ]}
          data={histories.map((history) => [
            { ...history, value: history.txHash }, // Tx Hash
            {
              // Type
              value: history.isWithdraw
                ? t("assets.historyTable.colums.withdraw")
                : t("assets.historyTable.colums.deposit"),
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
      <Icon
        aria-label="external link"
        id="external-link"
        height={12}
        width={12}
      />
    </a>
  ) : (
    <></>
  );
};

const reasonToTranslationKey: Record<TransferFailureReason, string> = {
  insufficientFee: "assets.historyTable.errors.insufficientFee",
};

const StatusDisplayCell: FunctionComponent<
  BaseCell & {
    status?: TransferStatus;
    reason?: TransferFailureReason;
  }
> = ({ status, reason }) => {
  const { t } = useTranslation();
  if (status == null) {
    // Uncommitted history has no status.
    // Show pending for uncommitted history..
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 animate-spin">
          <Image
            alt="loading"
            src="/icons/loading-blue.svg"
            width={24}
            height={24}
          />
        </div>
        {t("assets.historyTable.pending")}
      </div>
    );
  }

  switch (status) {
    case "success":
      return (
        <div className="flex items-center gap-2">
          <Image
            alt="success"
            src="/icons/check-circle.svg"
            width={24}
            height={24}
          />
          <span className="md:hidden">{t("assets.historyTable.success")}</span>
        </div>
      );
    case "pending":
      return (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin">
            <Image
              alt="loading"
              src="/icons/loading-blue.svg"
              width={24}
              height={24}
            />
          </div>
          <span className="md:hidden">{t("assets.historyTable.pending")}</span>
        </div>
      );
    case "refunded":
      return (
        <div className="flex items-center gap-2">
          <Image alt="failed" src="/icons/error-x.svg" width={24} height={24} />
          <span className="md:hidden">{t("assets.historyTable.refunded")}</span>
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center gap-2">
          <Image alt="failed" src="/icons/error-x.svg" width={24} height={24} />
          <span className="md:hidden">
            {reason
              ? t("assets.historyTable.failedWithReason", {
                  reason: t(reasonToTranslationKey[reason]),
                })
              : t("assets.historyTable.failed")}
          </span>
        </div>
      );
    case "connection-error":
      return (
        <div className="flex items-center gap-2">
          <Image alt="failed" src="/icons/error-x.svg" width={24} height={24} />
          <span className="md:hidden">
            {reason
              ? t("assets.historyTable.failedWithReason", {
                  reason: t(reasonToTranslationKey[reason]),
                })
              : t("assets.historyTable.connectionError")}
          </span>
        </div>
      );
    default:
      return <></>;
  }
};
