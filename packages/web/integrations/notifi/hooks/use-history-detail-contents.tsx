import dayjs from "dayjs";
import DOMPurify from "dompurify";
import { useMemo } from "react";

import { DepositCompleteIcon } from "~/components/assets/notifi-alerts/deposit-complete";
import { NewTokenIcon } from "~/components/assets/notifi-alerts/new-token";
import { PositionOutOfRangeIcon } from "~/components/assets/notifi-alerts/position-out-of-range";
import { SwapFailedIcon } from "~/components/assets/notifi-alerts/swap-failed";
import { SwapSuccessIcon } from "~/components/assets/notifi-alerts/swap-success";
import { TeamUpdateIcon } from "~/components/assets/notifi-alerts/team-update";
import { useTranslation } from "~/hooks";
import { HistoryRowData } from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-rows";

type UseHistoryDetailContents = (
  historyRowData: HistoryRowData | DummyRow,
  displayingView: DisplayingView
) => {
  title: string;
  timestamp: string;
  message: string;
  cta: string | JSX.Element;
  emoji: string | JSX.Element;
  popOutUrl: string;
};

export enum DisplayingView {
  HistoryRows = "HistoryRows",
  HistoryDetail = "HistoryDetail",
}

export const useHistoryDetailContents: UseHistoryDetailContents = (
  historyRowData,
  displayingView
) => {
  const { t } = useTranslation();
  const { title, timestamp, message, cta, emoji, popOutUrl } = useMemo(() => {
    if (historyRowData.__typename === "DummyRow") {
      return {
        title: historyRowData.title,
        timestamp: historyRowData.timestamp,
        message: DOMPurify.sanitize(historyRowData.message),
        emoji: historyRowData.emoji,
        cta: historyRowData.cta,
        popOutUrl: "",
      };
    }

    const day = dayjs(historyRowData.createdDate);
    const isToday = day.isAfter(dayjs(Date.now()).subtract(1, "day"));
    const isYesterday =
      day.isAfter(dayjs(Date.now()).subtract(2, "day")) && !isToday;

    const timestamp = isToday
      ? day.format("h:mm A")
      : isYesterday
      ? "Yesterday"
      : day.format("MMMM D");
    let title = t("notifi.unsupportedHistoryTitle");
    let message = t("notifi.unsupportedHistoryMessage");
    let emoji: string | JSX.Element = <TeamUpdateIcon />;
    let cta = "";
    let popOutUrl = "";

    switch (historyRowData.detail?.__typename) {
      case "BroadcastMessageEventDetails":
        title = historyRowData.detail.subject || t("notifi.emptyHistoryTitle");
        message = historyRowData.detail.messageHtml
          ? DOMPurify.sanitize(
              overrideMarkdownHtmlStyle(
                historyRowData.detail.messageHtml,
                displayingView
              ),
              { ADD_ATTR: ["target"] }
            )
          : historyRowData.detail.message || t("notifi.emptyHistoryMessage");
        cta = "View";
        break;

      case "GenericEventDetails":
        const jsonDetail: undefined | EventDetailsJson =
          historyRowData.detail.eventDetailsJson &&
          JSON.parse(historyRowData.detail.eventDetailsJson);
        const eventTypeId = jsonDetail?.NotifiData?.EventTypeId;
        switch (eventTypeId) {
          case EVENT_TYPE_ID.TRANSACTION_STATUSES:
            const poolEventDetailsJson = jsonDetail as
              | StatusesEventDetailsJson
              | undefined;
            const poolId = poolEventDetailsJson?.EventData?.pool?.poolId;

            if (poolEventDetailsJson?.EventData.isAssetTransfer) {
              const txHash =
                poolEventDetailsJson?.EventData.assetTransfer?.transaction
                  ?.hash;
              const blockHeight =
                poolEventDetailsJson?.EventData.assetTransfer?.transaction
                  ?.height;
              const token =
                poolEventDetailsJson?.EventData.assetTransfer?.denomMetadata?.display?.toUpperCase() ??
                "UNKNOWN";
              const amount =
                poolEventDetailsJson?.EventData.assetTransfer
                  ?.transferAmountFormatted;
              title = t("notifi.outboundTransferHistoryTitle");
              emoji = <SwapSuccessIcon />;
              message = `${t("notifi.outboundTransferHistoryMessage")}: ${
                parseInt(amount || "") > 999999 ? ">1,000,000" : amount
              } ${token}`;
              txHash &&
                (popOutUrl = `https://www.mintscan.io/osmosis/txs/${txHash}?height=${blockHeight}`);
            }
            if (poolEventDetailsJson?.EventData.isPoolExited) {
              const txHash =
                poolEventDetailsJson?.EventData?.pool?.transaction?.hash;
              const blockHeight =
                poolEventDetailsJson?.EventData?.pool?.transaction?.height;
              title = `${t("notifi.poolExitedHistoryTitle")}: ${poolId}`;
              message = `${t("notifi.poolExitedHistoryMessage")}: ${poolId}`;
              emoji = <SwapFailedIcon />;
              txHash &&
                (popOutUrl = `https://www.mintscan.io/osmosis/txs/${txHash}?height=${blockHeight}`);
            }
            if (poolEventDetailsJson?.EventData.isPoolJoined) {
              const tokens = poolEventDetailsJson?.EventData?.pool?.tokens.map(
                (token) => token.denom.toUpperCase()
              );
              title = t("notifi.poolJoinedHistoryTitle");
              message = `${t("notifi.poolJoinedHistoryMessage")}${
                (tokens ?? []).length > 1 ? "s" : ""
              }: ${tokens?.join(", ")}`;
              emoji = <NewTokenIcon />;
              popOutUrl = `${process.env.NEXT_PUBLIC_BASEPATH}/pool/${poolId}`;
            }
            if (poolEventDetailsJson?.EventData.isTokenSwapped) {
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
                poolEventDetailsJson.EventData?.tokenSwapped
                  ?.amountOutFormatted;
              const tokenIn =
                poolEventDetailsJson?.EventData?.tokenSwapped?.denomIn?.toUpperCase() ??
                "UNKNOWN";
              const tokenOut =
                poolEventDetailsJson?.EventData?.tokenSwapped?.denomOut?.toUpperCase() ??
                "UNKNOWN";
              title = t("notifi.swapHistoryTitle");
              message = ` ${
                parseInt(amountIn || "") > 999999 ? ">1,000,000" : amountIn
              } ${tokenIn} ${t("notifi.swapHistoryMessage")} ${
                parseInt(amountOut || "") > 999999 ? ">1,000,000" : amountOut
              } ${tokenOut}`;
              emoji = <SwapSuccessIcon />;
              txHash &&
                (popOutUrl = `https://www.mintscan.io/osmosis/txs/${txHash}?height=${blockHeight}`);
            }
            break;

          case EVENT_TYPE_ID.ASSETS_RECEIVED:
            const transferEventDetailsJson = jsonDetail as
              | TransferEventDetailsJson
              | undefined;
            const txHash =
              transferEventDetailsJson?.EventData?.transaction?.hash ??
              transferEventDetailsJson?.EventData?.txHash;
            const blockHeight =
              transferEventDetailsJson?.EventData.transaction?.height;
            const token =
              transferEventDetailsJson?.EventData.denomMetadata?.display?.toUpperCase() ??
              transferEventDetailsJson?.EventData.denomFormatted?.toLowerCase() ??
              "UNKNOWN";
            const amount =
              transferEventDetailsJson?.EventData.transferAmountFormatted;
            title = `${t("notifi.assetReceivedHistoryTitle")}: ${token}`;
            message = `${t("notifi.assetReceivedHistoryMessage")}: ${
              parseInt(amount || "") > 999999 ? ">1,000,000" : amount
            } ${token}`;
            emoji = <DepositCompleteIcon />;
            popOutUrl = `https://www.mintscan.io/osmosis/txs/${txHash}?height=${blockHeight}`;
            break;

          case EVENT_TYPE_ID.POSITION_OUT_OF_RANGE:
            const positionEventDetailsJson = jsonDetail as
              | PositionEventDetailsJson
              | undefined;
            const asset0 =
              positionEventDetailsJson?.EventData?.token0DisplayDenom.toUpperCase() ??
              "UNKNOWN";
            const asset1 =
              positionEventDetailsJson?.EventData?.token1DisplayDenom.toUpperCase() ??
              "UNKNOWN";
            const positionPoolId =
              positionEventDetailsJson?.EventData?.position?.position?.poolId;
            title = `${t("notifi.positionOutOfRangeHistoryTitle")}`;
            message = `${t(
              "notifi.positionOutOfRangeHistoryMessage"
            )} [${asset0}/${asset1}]`;
            emoji = <PositionOutOfRangeIcon />;
            popOutUrl = `${process.env.NEXT_PUBLIC_BASEPATH}/pool/${positionPoolId}`;
            break;

          default:
            title = "Not supported source";
        }
        break;
    }
    return { title, timestamp, message, cta, emoji, popOutUrl };
  }, [historyRowData, displayingView]);
  return { title, timestamp, message, cta, emoji, popOutUrl };
};

// Utils

const overrideMarkdownHtmlStyle = (
  htmlMessage: string,
  displayingView: DisplayingView
) => {
  let markdownHtmlAttrs: Record<string, string> = {
    a: "class='cursor-pointer text-wosmongton-300 transition-all duration-[0.2s] hover:text-osmoverse-200' target='_blank' ",
    li: "class='list-disc list-inside'",
  };
  switch (displayingView) {
    case DisplayingView.HistoryRows:
      markdownHtmlAttrs = {
        ...markdownHtmlAttrs,
        p: "style='margin: 0px; padding: 0px; display: inline'",
      };
      break;
    case DisplayingView.HistoryDetail:
      markdownHtmlAttrs = {
        ...markdownHtmlAttrs,
        p: "style='margin: 0px; padding: 0px;'",
      };

    default:
      // Intentionally left blank
      break;
  }

  let updatedHtmlMessage = htmlMessage;
  Object.keys(markdownHtmlAttrs).forEach((tag) => {
    updatedHtmlMessage = updatedHtmlMessage.replace(
      new RegExp(`<${tag}`, "g"),
      `<${tag} ${markdownHtmlAttrs[tag as keyof typeof markdownHtmlAttrs]}`
    );
  });
  return updatedHtmlMessage;
};

export type DummyRow = {
  __typename: "DummyRow";
  emoji: string | JSX.Element;
  title: string;
  message: string;
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
    txHash: string;
    transaction: Transaction;
    recipient: string;
    sender: string;
    // deprecated, migrated to denomFormatted
    denomMetadata?: DenomMetadata;
    denomFormatted?: string;
    recipientBalanceFormatted: string;
    transferAmountFormatted: string;
    date: string;
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
