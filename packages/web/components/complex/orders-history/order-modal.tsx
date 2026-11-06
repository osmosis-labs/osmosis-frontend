import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { prepareMultiExecuteContractMsg } from "@osmosis-labs/tx";
import {
  CoinPretty,
  Dec,
  Int,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";
import classNames from "classnames";
import dayjs from "dayjs";
import React, { memo, useCallback, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/button";
import { EntityImage } from "~/components/ui/entity-image";
import { RecapRow } from "~/components/ui/recap-row";
import { t } from "~/hooks";
import { useWallet } from "~/hooks/use-wallet";
import { ModalBase } from "~/modals";
import { theme } from "~/tailwind.config";
import {
  formatFiatPrice,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";
import { getLogoURIs } from "~/utils/logo-uri";

interface OrderModalProps {
  order?: MappedLimitOrder;
  onRequestClose: () => void;
}

export const OrderModal = memo(({ order, onRequestClose }: OrderModalProps) => {
  return (
    <ModalBase
      isOpen={!!order}
      onRequestClose={onRequestClose}
      className="!px-0 !pb-0 !pt-2 sm:h-full sm:max-h-[100vh] sm:!rounded-none"
    >
      <OrderDetails
        order={order}
        isModal={true}
        onRequestClose={onRequestClose}
      />
    </ModalBase>
  );
});

interface OrderDetailsProps {
  order?: MappedLimitOrder;
  isModal: boolean;
  onRequestClose: () => void;
}

const OrderDetails = ({
  order,
  isModal,
  onRequestClose,
}: OrderDetailsProps) => {
  const { wallet: account, signAndBroadcast, transactionContext } = useWallet();
  const [broadcasting, setBroadcasting] = useState(false);

  const isPastOrder =
    order?.status === "cancelled" || order?.status === "fullyClaimed";
  const isPartlyFilledPastOrder =
    isPastOrder &&
    order.percentFilled.isPositive() &&
    order.percentFilled.lt(new Dec(1));
  const isUnfilledCancel =
    order?.status === "cancelled" && order.percentFilled.isZero();
  // The conversion card shows a partly filled order's filled part, so "Bought" is what was received.
  const shownQuantity = isPartlyFilledPastOrder
    ? order.totalFilled
    : order?.placed_quantity;
  const shownOutput = isPartlyFilledPastOrder
    ? order.output.mul(order.percentFilled)
    : order?.output;
  // Like OrderProgressBar, show a fill under 1% as 1% so it never reads "0%" next to "Partly filled".
  const percentFilledOfPastOrder = isPartlyFilledPastOrder
    ? new RatePretty(
        order.percentFilled.lt(new Dec(0.01))
          ? new Dec(0.01)
          : order.percentFilled
      )
    : undefined;

  const alreadyReceived =
    order?.status === "partiallyFilled" && order.percentClaimed.isPositive()
      ? order.output.mul(order.percentClaimed)
      : undefined;

  const tokenIn = useMemo(() => {
    if (!order) return;

    return order.order_direction === "ask" ? order.baseAsset : order.quoteAsset;
  }, [order]);

  const tokenOut = useMemo(() => {
    if (!order) return;

    return order.order_direction === "ask" ? order.quoteAsset : order.baseAsset;
  }, [order]);

  const formattedMonth = dayjs
    .unix(order?.placed_at ?? 0)
    .format("MMMM")
    .slice(0, 3);

  const formattedDateDayYearHourMinute = dayjs
    .unix(order?.placed_at ?? 0)
    .format("DD, YYYY, HH:mm");

  const formattedDate = `${formattedMonth} ${formattedDateDayYearHourMinute}`;

  const statusComponent = (() => {
    if (!order) return;

    switch (order.status) {
      case "open":
      case "partiallyFilled":
        return (
          <div className="flex items-center justify-between">
            <span className="body2 sm:caption text-osmoverse-300">
              {t("limitOrders.open")}
            </span>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex items-center justify-between">
            <span className="body2 sm:caption text-osmoverse-300">
              {t("limitOrders.cancelled")}
              {isPartlyFilledPastOrder && (
                <>
                  {" · "}
                  <span className="text-bullish-400">
                    {t("limitOrders.partlyFilled")}
                  </span>
                </>
              )}
            </span>
          </div>
        );
      case "filled":
        return (
          <span className="body2 sm:caption text-bullish-300">
            {t("limitOrders.claimable")}
          </span>
        );
      case "fullyClaimed":
        return (
          <span className="body2 sm:caption text-bullish-400">
            {t("limitOrders.filled")}
          </span>
        );
      default:
        return;
    }
  })();

  const closeOrder = useCallback(async () => {
    if (!order) {
      console.error("Attempted to claim and close order that does not exist");
      return;
    }

    if (!account) {
      console.error(
        "Attempted to claim and close orders without wallet connected"
      );
      return;
    }

    const { tick_id, order_id, orderbookAddress } = order;
    const claimMsg = {
      msg: {
        claim_limit: { order_id, tick_id },
      },
      contractAddress: orderbookAddress,
      funds: [],
    };
    const cancelMsg = {
      msg: { cancel_limit: { order_id, tick_id } },
      contractAddress: orderbookAddress,
      funds: [],
    };
    const msgs = [];
    if (order.percentFilled > order.percentClaimed) {
      msgs.push(claimMsg);
    }

    if (order.percentFilled.lt(new Dec(1))) msgs.push(cancelMsg);

    try {
      setBroadcasting(true);
      await prepareMultiExecuteContractMsg(
        transactionContext,
        "executeWasm",
        msgs,
        undefined
      ).then((prepared) => signAndBroadcast(...prepared));
      // await refetch();
      onRequestClose();
    } catch (error) {
      console.error(error);
      setBroadcasting(false);
    }
  }, [order, account, transactionContext, onRequestClose, signAndBroadcast]);

  const buttonText = useMemo(() => {
    if (
      order?.status !== "open" &&
      order?.status !== "partiallyFilled" &&
      order?.status !== "filled"
    ) {
      return;
    }

    if (order?.status === "filled") {
      return "limitOrders.claim";
    }

    return order?.status === "open"
      ? "limitOrders.cancel"
      : order?.percentFilled > order?.percentClaimed
        ? "limitOrders.claimAndClose"
        : "limitOrders.close";
  }, [order]);

  const orderAmount = formatFiatPrice(
    new PricePretty(
      DEFAULT_VS_CURRENCY,
      order?.order_direction === "bid"
        ? (shownQuantity ?? 0) /
            Number(
              new Dec(10)
                .pow(new Int(order?.quoteAsset?.decimals ?? 0))
                .toString()
            )
        : (shownOutput?.quo(
            new Dec(10).pow(new Int(order?.quoteAsset?.decimals ?? 0))
          ) ?? new Dec(0))
    ),
    2
  );

  const [topText, bottomText] = (() => {
    if (!order) return ["", ""];

    if (
      order.status === "filled" ||
      order.status === "fullyClaimed" ||
      isPartlyFilledPastOrder
    ) {
      return [t("limitOrders.sold"), t("transactions.bought")];
    }

    if (isUnfilledCancel) {
      return [t("limitOrders.returnedUnfilled"), ""];
    }

    return [t("limitOrders.sell"), t("limitOrders.buy")];
  })();

  return (
    <div
      className={classNames(
        "flex w-full flex-col overflow-y-auto bg-osmoverse-850 !py-6 !px-8 sm:top-0 sm:rounded-none sm:!px-4"
      )}
    >
      {!isModal && (
        <div className="py-4">
          <IconButton
            aria-label="Close"
            className="h-12 w-12 cursor-pointer rounded-full py-0 text-osmoverse-400 hover:rounded-full hover:bg-osmoverse-850 hover:text-white-full"
            icon={<Icon id="close-small" width={24} height={24} />}
            onClick={onRequestClose}
          />
        </div>
      )}
      <div className="flex flex-col px-4 pb-8 md:p-0">
        <div className="flex flex-col items-center gap-4 pb-6 pt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825">
            <Icon
              id="coins"
              width={24}
              height={24}
              aria-label="coins icon"
              className={classNames({
                "text-bullish-400": order?.order_direction === "bid",
                "text-rust-400": order?.order_direction === "ask",
              })}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="text-h5">{t("limitOrders.limitOrder")}</div>
            <div className="body1 capitalize text-osmoverse-300">
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col rounded-2xl border border-osmoverse-700 p-2">
        <div className="flex justify-between p-2">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <EntityImage
                logoURIs={getLogoURIs(tokenIn?.currency.coinImageUrl)}
                name={tokenIn?.sourceDenom ?? ""}
                symbol={tokenIn?.sourceDenom ?? ""}
                height={40}
                width={40}
              />
            </div>
            <div className="flex flex-col">
              <div className="subtitle1 sm:body2">{topText}</div>
              <div className="body1 sm:body2 text-osmoverse-300">
                {tokenIn?.symbol}
              </div>
            </div>
          </div>
          <div className="flex-end flex flex-col text-right">
            <div className="subtitle1 sm:body2">
              {formatPretty(
                new CoinPretty(
                  {
                    coinDecimals: tokenIn?.decimals ?? 0,
                    coinDenom: tokenIn?.symbol ?? "",
                    coinMinimalDenom: tokenIn?.coinMinimalDenom ?? "",
                  },
                  shownQuantity ?? new Dec(0)
                )
              )}
            </div>
            <div className="body1 sm:body2 text-osmoverse-300">
              {orderAmount}
            </div>
          </div>
        </div>
        {!isUnfilledCancel && (
          <>
            <div className="flex h-10 w-14 items-center justify-center p-2">
              <Icon
                id="arrow-right"
                width={24}
                height={24}
                className="rotate-90"
                color={theme.colors.osmoverse[400]}
              />
            </div>
            <div className="flex justify-between p-2">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  <EntityImage
                    logoURIs={getLogoURIs(tokenOut?.currency.coinImageUrl)}
                    name={tokenOut?.sourceDenom ?? ""}
                    symbol={tokenOut?.sourceDenom ?? ""}
                    height={40}
                    width={40}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="subtitle1 sm:body2">{bottomText}</div>
                  <div className="body1 sm:body2 text-osmoverse-300">
                    {tokenOut?.symbol}
                  </div>
                </div>
              </div>
              <div className="flex-end flex flex-col text-right">
                <div className="subtitle1 sm:body2">
                  {/* // TODO - clean this up to match tokenConversion */}
                  {formatPretty(
                    new CoinPretty(
                      {
                        coinDecimals: tokenOut?.decimals ?? 0,
                        coinDenom: tokenOut?.symbol ?? "",
                        coinMinimalDenom: tokenOut?.coinMinimalDenom ?? "",
                      },
                      shownOutput ?? new Dec(0)
                    )
                  )}
                </div>
                <div className="body1 sm:body2 text-osmoverse-300">
                  {orderAmount !== "<$0.01" && "~"}
                  {orderAmount}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col py-2 px-4">
        <div className={classNames("flex flex-col py-3")}>
          <RecapRow
            className="sm:py-0"
            left={
              <span className="subtitle1 sm:caption">
                {t("limitOrders.price")}
              </span>
            }
            right={
              <div className="sm:caption body2 flex items-center justify-center">
                {formatPretty(
                  new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    order?.price ?? new Dec(0)
                  ),
                  getPriceExtendedFormatOptions(order?.price ?? new Dec(0))
                )}
              </div>
            }
          />
          <RecapRow
            className="sm:py-0"
            left={
              <span className="subtitle1 sm:caption">
                {t("limitOrders.status")}
              </span>
            }
            right={statusComponent}
          />
          {(order?.status === "open" ||
            order?.status === "partiallyFilled") && (
            <RecapRow
              className="sm:py-0"
              left={
                <span className="subtitle1 sm:caption">
                  {t("limitOrders.percentFilled")}
                </span>
              }
              right={
                <span className="body2 text-osmoverse-300">
                  <OrderProgressBar
                    order={order!}
                    totalPercentClassNames="xl:body1 sm:caption"
                  />
                </span>
              }
            />
          )}
          {isPartlyFilledPastOrder && (
            <RecapRow
              className="sm:py-0"
              left={
                <span className="subtitle1 sm:caption">
                  {t("limitOrders.returnedUnfilled")}
                </span>
              }
              right={
                <span className="body2 sm:caption">
                  {formatPretty(
                    new CoinPretty(
                      {
                        coinDecimals: tokenIn?.decimals ?? 0,
                        coinDenom: tokenIn?.symbol ?? "",
                        coinMinimalDenom: tokenIn?.coinMinimalDenom ?? "",
                      },
                      // What a cancelled order left unfilled was returned to the wallet.
                      order.quantity
                    )
                  )}
                </span>
              }
            />
          )}
          {percentFilledOfPastOrder && (
            <RecapRow
              className="sm:py-0"
              left={
                <span className="subtitle1 sm:caption">
                  {t("limitOrders.percentFilled")}
                </span>
              }
              right={
                <span className="body2 sm:caption">
                  {formatPretty(percentFilledOfPastOrder, { maxDecimals: 0 })}
                </span>
              }
            />
          )}
          {alreadyReceived && (
            <RecapRow
              className="sm:py-0"
              left={
                <span className="subtitle1 sm:caption">
                  {t("limitOrders.alreadyReceived")}
                </span>
              }
              right={
                <span className="body2 sm:caption">
                  {formatPretty(
                    new CoinPretty(
                      {
                        coinDecimals: tokenOut?.decimals ?? 0,
                        coinDenom: tokenOut?.symbol ?? "",
                        coinMinimalDenom: tokenOut?.coinMinimalDenom ?? "",
                      },
                      alreadyReceived
                    )
                  )}
                </span>
              }
            />
          )}
        </div>
        {!!order && order.status !== "open" && (
          <p className="caption text-osmoverse-300">
            {t("limitOrders.payoutNote")}
          </p>
        )}
      </div>
      {!!order && !!buttonText && (
        <div className="flex items-center justify-center gap-3 pt-3">
          <Button
            mode={buttonText === "limitOrders.cancel" ? "secondary" : "primary"}
            onClick={closeOrder}
            disabled={broadcasting}
            className="body2 sm:caption !rounded-2xl"
          >
            <span className="text-h6 font-h6">{t(buttonText)}</span>
          </Button>
        </div>
      )}
      {!!order && !!order.placed_tx && (
        <div className="flex items-center justify-center gap-3 pt-3">
          <Button mode="secondary" className="body2 sm:caption !rounded-2xl">
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={`https://www.mintscan.io/osmosis/txs/${order.placed_tx}`}
            >
              <span>{t("transactions.viewOnExplorer")} &#x2197;</span>
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};
