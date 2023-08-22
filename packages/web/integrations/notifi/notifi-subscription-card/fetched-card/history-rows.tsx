import { NotifiFrontendClient } from "@notifi-network/notifi-frontend-client";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback, useMemo } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { DepositCompleteIcon } from "~/components/assets/notifi-alerts/deposit-complete";
import { NewTokenIcon } from "~/components/assets/notifi-alerts/new-token";
import { PositionOutOfRangeIcon } from "~/components/assets/notifi-alerts/position-out-of-range";
import { SwapFailedIcon } from "~/components/assets/notifi-alerts/swap-failed";
import { SwapSuccessIcon } from "~/components/assets/notifi-alerts/swap-success";
import { TeamUpdateIcon } from "~/components/assets/notifi-alerts/team-update";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";

export type HistoryRowData = Awaited<
  ReturnType<NotifiFrontendClient["getNotificationHistory"]>
>["nodes"][number];

export const HistoryRows: FunctionComponent<{
  rows: ReadonlyArray<HistoryRowData>;
}> = ({ rows }) => {
  const t = useTranslation();
  const dummyRows: DummyRow[] = [
    {
      emoji: <TeamUpdateIcon />,
      __typename: "DummyRow",
      title: t("notifi.getStartedHistoryTitle1"),
      message: t("notifi.getStartedHistoryMessage1"),
      cta: "Buy",
      timestamp: "",
      onCtaClick: () => {
        window.open(
          "https://osmosis.zone/blog/layerswap-a-new-on-ramp-and-cross-chain-service-for-osmosis",
          "_blank"
        );
      },
    },
    {
      emoji: <TeamUpdateIcon />,
      __typename: "DummyRow",
      title: t("notifi.getStartedHistoryTitle2"),
      message: t("notifi.getStartedHistoryMessage2"),
      cta: "Learn",
      timestamp: "",
      onCtaClick: () => {
        window.open(
          "https://support.osmosis.zone/tutorials/trading-on-osmosis",
          "_blank"
        );
      },
    },
    {
      emoji: <TeamUpdateIcon />,
      __typename: "DummyRow",
      title: t("notifi.getStartedHistoryTitle3"),
      message: t("notifi.getStartedHistoryMessage3"),
      cta: "Learn",
      timestamp: "",
      onCtaClick: () => {
        window.open(
          "https://support.osmosis.zone/tutorials/deposits",
          "_blank"
        );
      },
    },
  ];
  return (
    <ul>
      {rows.map((row, key) => {
        return <HistoryRow key={key} row={row} />;
      })}

      {dummyRows.map((row, key) => (
        <HistoryRow row={row} key={key} />
      ))}
    </ul>
  );
};

interface RowProps {
  row: HistoryRowData | DummyRow;
  dummyRow?: DummyRow;
}

const validateHistoryRow = (
  row: HistoryRowData | DummyRow
): row is HistoryRowData => {
  return row.__typename !== "DummyRow";
};

export const HistoryRow: FunctionComponent<RowProps> = ({ row }) => {
  const { renderView, selectedHistoryEntry, setSelectedHistoryEntry } =
    useNotifiModalContext();
  const router = useRouter();
  const t = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const { emoji, title, message, cta, timestamp, popOutUrl } = useMemo(() => {
    if (row.__typename !== "DummyRow") {
      const day = dayjs(row.createdDate);
      const isToday = day.isAfter(dayjs(Date.now()).subtract(1, "day"));
      const isYesterday =
        day.isAfter(dayjs(Date.now()).subtract(2, "day")) && !isToday;
      const timestamp = isToday
        ? day.format("h:mm A")
        : isYesterday
        ? "Yesterday"
        : day.format("MMMM D");

      const rowProps = {
        emoji: <SwapFailedIcon />,
        title: t("notifi.unsupportedHistoryTitle"),
        message: t("notifi.unsupportedHistoryMessage"),
        cta: "",
        timestamp,
        popOutUrl: "",
      };

      if (row.detail?.__typename === "BroadcastMessageEventDetails") {
        rowProps.emoji = <TeamUpdateIcon />;
        rowProps.title = row.detail.subject || t("notifi.emptyHistoryTitle");
        rowProps.message =
          row.detail.message || t("notifi.emptyHistoryMessage");
        rowProps.cta = "View";
      }

      if (row.detail?.__typename === "GenericEventDetails") {
        rowProps.cta = "View";
        rowProps.message = "";
        rowProps.title = "";
        rowProps.popOutUrl = "";
        const jsonDetail: undefined | EventDetailsJson =
          row.detail.eventDetailsJson &&
          JSON.parse(row.detail.eventDetailsJson);
        const eventTypeId = jsonDetail?.NotifiData?.EventTypeId;
        switch (eventTypeId) {
          case EVENT_TYPE_ID.TRANSACTION_STATUSES:
            const poolEventDetailsJson = jsonDetail as StatusesEventDetailsJson;
            const poolId = poolEventDetailsJson?.EventData?.pool?.poolId;

            if (poolEventDetailsJson.EventData.isAssetTransfer) {
              const txHash =
                poolEventDetailsJson?.EventData.assetTransfer?.transaction.hash;
              const blockHeight =
                poolEventDetailsJson?.EventData.assetTransfer?.transaction
                  .height;
              const token =
                poolEventDetailsJson?.EventData.assetTransfer?.denomMetadata
                  .display;
              const amount =
                poolEventDetailsJson?.EventData.assetTransfer
                  ?.transferAmountFormatted;
              rowProps.title = t("notifi.outboundTransferHistoryTitle");
              rowProps.emoji = <SwapSuccessIcon />;
              rowProps.message = `${t(
                "notifi.outboundTransferHistoryMessage"
              )}: ${
                parseInt(amount || "") > 999999 ? ">1,000,000" : amount
              } ${token}`;
              txHash &&
                (rowProps.popOutUrl = `https://www.mintscan.io/cosmos/txs/${txHash}?height=${blockHeight}`);
            }
            if (poolEventDetailsJson.EventData.isPoolExited) {
              const txHash =
                poolEventDetailsJson?.EventData?.pool?.transaction?.hash;
              const blockHeight =
                poolEventDetailsJson?.EventData?.pool?.transaction?.height;
              rowProps.title = `${t(
                "notifi.poolExitedHistoryTitle"
              )}: ${poolId}`;
              rowProps.message = `${t(
                "notifi.poolExitedHistoryMessage"
              )}: ${poolId}`;
              rowProps.emoji = <SwapFailedIcon />;
              txHash &&
                (rowProps.popOutUrl = `https://www.mintscan.io/cosmos/txs/${txHash}?height=${blockHeight}`);
            }
            if (poolEventDetailsJson.EventData.isPoolJoined) {
              const tokens = poolEventDetailsJson?.EventData?.pool?.tokens.map(
                (token) => token.denom
              );
              rowProps.title = t("notifi.poolJoinedHistoryTitle");
              rowProps.message = `${t("notifi.poolJoinedHistoryMessage")}${
                (tokens ?? []).length > 1 ? "s" : ""
              }: ${tokens?.join(", ")}`;
              rowProps.emoji = <NewTokenIcon />;
              rowProps.popOutUrl = `/pool/${poolId}`;
            }
            if (poolEventDetailsJson.EventData.isTokenSwapped) {
              const txHash =
                poolEventDetailsJson?.EventData?.tokenSwapped?.transaction
                  ?.hash;
              const blockHeight =
                poolEventDetailsJson?.EventData?.tokenSwapped?.transaction
                  ?.height;
              const amountIn =
                poolEventDetailsJson?.EventData?.tokenSwapped
                  ?.amountInFormatted;
              const amountOut =
                poolEventDetailsJson?.EventData?.tokenSwapped
                  ?.amountOutFormatted;
              const tokenIn =
                poolEventDetailsJson?.EventData?.tokenSwapped?.denomIn;
              const tokenOut =
                poolEventDetailsJson?.EventData?.tokenSwapped?.denomOut;
              rowProps.title = t("notifi.swapHistoryTitle");
              rowProps.message = ` ${
                parseInt(amountIn || "") > 999999 ? ">1,000,000" : amountIn
              } ${tokenIn} ${t("notifi.swapHistoryMessage")} ${
                parseInt(amountOut || "") > 999999 ? ">1,000,000" : amountOut
              } ${tokenOut}`;
              rowProps.emoji = <SwapSuccessIcon />;
              txHash &&
                (rowProps.popOutUrl = `https://www.mintscan.io/cosmos/txs/${txHash}?height=${blockHeight}`);
            }
            break;

          case EVENT_TYPE_ID.ASSETS_RECEIVED:
            const transferEventDetailsJson =
              jsonDetail as TransferEventDetailsJson;
            const txHash = transferEventDetailsJson?.EventData.transaction.hash;
            const blockHeight =
              transferEventDetailsJson?.EventData.transaction.height;
            const token =
              transferEventDetailsJson?.EventData.denomMetadata.display;
            const amount =
              transferEventDetailsJson?.EventData.transferAmountFormatted;
            rowProps.title = `${t(
              "notifi.assetReceivedHistoryTitle"
            )}: ${token}`;
            rowProps.message = `${t("notifi.assetReceivedHistoryMessage")}: ${
              parseInt(amount || "") > 999999 ? ">1,000,000" : amount
            } ${token}`;
            rowProps.emoji = <DepositCompleteIcon />;
            rowProps.popOutUrl = `https://www.mintscan.io/cosmos/txs/${txHash}?height=${blockHeight}`;
            break;

          case EVENT_TYPE_ID.POSITION_OUT_OF_RANGE:
            const positionEventDetailsJson =
              jsonDetail as PositionEventDetailsJson;
            const asset0 =
              positionEventDetailsJson?.EventData?.token0DisplayDenom;
            const asset1 =
              positionEventDetailsJson?.EventData?.token1DisplayDenom;
            const positionPoolId =
              positionEventDetailsJson?.EventData?.position?.position?.poolId;
            rowProps.title = `${t("notifi.positionOutOfRangeHistoryTitle")}`;
            rowProps.message = `${t(
              "notifi.positionOutOfRangeHistoryMessage"
            )} [${asset0}/${asset1}]`;
            rowProps.emoji = <PositionOutOfRangeIcon />;
            rowProps.popOutUrl = `/pool/${positionPoolId}`;
            break;

          default:
            rowProps.title = "Not supported source";
        }
      }
      return rowProps;
    }
    return {
      emoji: row.emoji,
      title: row.title,
      message: row.message,
      cta: row.cta,
      timestamp: row.timestamp,
      popOutUrl: "",
    };
  }, [row]);

  const handleClick = useCallback(() => {
    if (popOutUrl) {
      popOutUrl.startsWith("/")
        ? router.push(popOutUrl)
        : window.open(popOutUrl, "_blank");
      return;
    }

    if (validateHistoryRow(row)) {
      setSelectedHistoryEntry(row);
      renderView("historyDetail");
      return;
    }
    // Dummy Row
    row.onCtaClick();
  }, [renderView, popOutUrl, selectedHistoryEntry]);

  return (
    <li className="item-center flex flex-row border-b border-osmoverse-700 px-[2rem] py-[1.125rem]">
      <div className="m-auto mr-[1.25rem] flex-1 ">{emoji}</div>
      <div className="flex w-full flex-col">
        <div className="mb-[0.25rem] flex w-full justify-between">
          <div className="max-w-sm text-subtitle1">{title}</div>
          <div
            className="flex h-[1.5rem] max-w-[5.5625rem] cursor-pointer items-center text-wosmongton-200 transition-all duration-[0.2s] hover:scale-[105%] hover:text-osmoverse-200"
            onClick={() => {
              logEvent([EventName.Notifications.alertClicked]);

              handleClick();
            }}
          >
            <div className="text-button font-[700] ">{cta}</div>
            <Icon
              id={"arrow-right"}
              className=" scale-[60%] "
              height={24}
              width={24}
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-between text-caption font-[500]">
          <div className="max-w-[13.75rem] text-osmoverse-200">{message}</div>
          <div className="col-span-1 text-right text-osmoverse-200">
            {timestamp}
          </div>
        </div>
      </div>
    </li>
  );
};

export type DummyRow = {
  __typename: "DummyRow";
  emoji: string | JSX.Element;
  title: string;
  message: string | JSX.Element;
  cta: string | JSX.Element;
  timestamp: string;
  onCtaClick: () => void;
};

type EventDetailsJson =
  | StatusesEventDetailsJson
  | TransferEventDetailsJson
  | PositionEventDetailsJson;

type StatusesEventDetailsJson = {
  EventData: {
    isAssetTransfer: boolean;
    isPoolExited: boolean;
    isPoolJoined: boolean;
    isTokenSwapped: boolean;
    AlertData: Object;
    pool?: {
      address: string;
      module: string;
      poolId: string;
      tokens: FormattedToken[];
      transaction: Transaction;
    };
    assetTransfer?: {
      transaction: Transaction;
      recipient: string;
      sender: string;
      denomMetadata: DenomMetadata;
      recipientBalanceFormatted: string;
      transferAmountFormatted: string;
    };
    tokenSwapped?: TokenSwapped;
  };
  NotifiData: Object & { EventTypeId: string };
};

type FormattedToken = {
  amountFormatted: string;
  denomMetadata: DenomMetadata;
  denom: string;
};

type TransferEventDetailsJson = {
  unsubscribe_url: string;
  historyRowData: Object;
  AlertData: Object;
  NotifiData: Object & { EventTypeId: string };
  EventData: {
    transaction: Transaction;
    recipient: string;
    sender: string;
    denomMetadata: DenomMetadata;
    recipientBalanceFormatted: string;
    transferAmountFormatted: string;
  };
};

type PositionEventDetailsJson = {
  AlertData: Object;
  NotifiData: Object & { EventTypeId: string };
  EventData: {
    position: UserPosition;
    address: string;
    currentTick: string;
    currentPrice: string;
    lowerPriceBound: string;
    upperPriceBound: string;
    token0DisplayDenom: string;
    token1DisplayDenom: string;
  };
};

type Position = {
  positionId: number;
  address: string;
  poolId: number;
  lowerTick: number;
  upperTick: number;
  joinTime: Date | undefined;
  liquidity: string;
};

type UserPosition = {
  position: Position | undefined;
  asset0: Coin | undefined;
  asset1: Coin | undefined;
  claimableSpreadRewards: Coin[];
  claimableIncentives: Coin[];
  forfeitedIncentives: Coin[];
};

type Coin = {
  denom: string;
  amount: string;
};

type Transaction = {
  hash: string;
  height: string;
  index: number;
  tx: string;
  tx_result: Object;
};

type DenomMetadata = {
  base: string;
  description: string;
  display: string;
  symbol: string;
  denomUnits: Object[];
};

interface TokenSwapped {
  transaction: Transaction;
  module: PoolModule;
  denomIn: string;
  denomOut: string;
  amountInFormatted: string;
  amountOutFormatted: string;
  denomInMetadata: DenomMetadata;
  denomOutMetadata: DenomMetadata;
}

enum PoolModule {
  CL = "CONCENTRATED LIQUIDITY",
  GAMM = "GENERIC AUTOMATED MARKET MAKER",
}

export enum EVENT_TYPE_ID {
  TRANSACTION_STATUSES = "efc0083ec881431f975a33a00ba48265",
  ASSETS_RECEIVED = "e6bda7e9bca54619ae8f12658fa6efdb",
  POSITION_OUT_OF_RANGE = "e69cbdc6fc6a4177b4041786194d0665",
}
