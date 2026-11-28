import { Transition } from "@headlessui/react";
import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { prepareMultiExecuteContractMsg } from "@osmosis-labs/tx";
import { CoinPretty, Dec, Int, PricePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import dayjs from "dayjs";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "~/components/assets";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/button";
import { EntityImage } from "~/components/ui/entity-image";
import { RecapRow } from "~/components/ui/recap-row";
import { t } from "~/hooks";
import { useWallet } from "~/hooks/use-wallet";
import { ModalBase } from "~/modals";
import { theme } from "~/tailwind.config";
import { formatDateTime } from "~/utils/date";
import {
  formatFiatPrice,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";
import { getLogoURIs } from "~/utils/logo-uri";

interface OrderModalProps {
  order?: MappedLimitOrder;
  onRequestClose: () => void;
  /** Called after a successful claim or cancel, to refresh the orders list. */
  onRequestRefresh?: () => void;
}

export const OrderModal = memo(
  ({ order, onRequestClose, onRequestRefresh }: OrderModalProps) => {
    return (
      <ModalBase
        isOpen={!!order}
        onRequestClose={onRequestClose}
        className="!px-0 !pb-0 !pt-2 sm:h-full sm:max-h-[100vh] sm:!rounded-none"
      >
        <OrderDetails
          key={order && `${order.orderbookAddress}-${order.order_id}`}
          order={order}
          isModal={true}
          onRequestClose={onRequestClose}
          onRequestRefresh={onRequestRefresh}
        />
      </ModalBase>
    );
  }
);

/** Shows the order's details beside the table on large screens, like the trade history's slideover. */
export const OrderDetailsSlideover = ({
  order,
  open,
  onRequestClose,
  onRequestRefresh,
  afterLeave,
}: OrderModalProps & {
  open: boolean;
  /** Called once the panel has slid out, so the order can be cleared then. */
  afterLeave: () => void;
}) => {
  if (!order) return null;
  return (
    <Transition
      show={open}
      appear
      as="div"
      enter="transition-all ease-out duration-300"
      enterFrom="w-0 opacity-0"
      enterTo="w-[512px] opacity-100"
      leave="transition-all ease-out duration-300"
      leaveFrom="w-[512px] opacity-100"
      leaveTo="w-0 opacity-0"
      afterLeave={afterLeave}
    >
      <OrderDetails
        key={`${order.orderbookAddress}-${order.order_id}`}
        order={order}
        isModal={false}
        onRequestClose={onRequestClose}
        onRequestRefresh={onRequestRefresh}
      />
    </Transition>
  );
};

interface OrderDetailsProps {
  order?: MappedLimitOrder;
  isModal: boolean;
  onRequestClose: () => void;
  onRequestRefresh?: () => void;
}

const OrderDetails = ({
  order,
  isModal,
  onRequestClose,
  onRequestRefresh,
}: OrderDetailsProps) => {
  const { wallet: account, signAndBroadcast, transactionContext } = useWallet();
  const [broadcasting, setBroadcasting] = useState(false);
  // The details are keyed by order, so they unmount when another order is
  // selected. An action still signing then mustn't close that order's details.
  const isShown = useRef(false);
  useEffect(() => {
    isShown.current = true;
    return () => {
      isShown.current = false;
    };
  }, []);

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
  // The payouts are what reached the wallet after the claim bot's fee, so prefer them to quantity × price.
  const paidOut = order?.claims?.length
    ? order.claims.reduce((sum, { amount }) => sum.add(amount), new Dec(0))
    : undefined;
  const shownOutput =
    paidOut ??
    (isPartlyFilledPastOrder
      ? order.output.mul(order.percentFilled)
      : order?.output);
  // Like the table, show a fill under 1% as 1% so it never reads "0% filled".
  const percentFilledOfPastOrder = isPartlyFilledPastOrder
    ? order.percentFilled.lt(new Dec(0.01))
      ? new Int(1)
      : order.percentFilled.mul(new Dec(100)).truncate()
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

  // The mapper stores 0 when Numia has no place time, so leave it blank rather than show 1 Jan 1970.
  const formattedDate = order?.placed_at
    ? formatDateTime(dayjs.unix(order.placed_at))
    : undefined;

  const transactions = [
    ...(order?.placed_tx
      ? [
          {
            label: t("limitOrders.placed"),
            tx: order.placed_tx,
            at: order.placed_at || undefined,
            sign: "−",
            token: tokenIn,
            amount: order.placed_quantity,
          },
        ]
      : []),
    ...(order?.claims ?? []).map(({ tx, claimed_at, amount }) => ({
      label: t("limitOrders.paidOut"),
      tx,
      at: claimed_at,
      sign: "+",
      token: tokenOut,
      amount,
    })),
    ...(order?.cancel_tx && order.cancelled_at
      ? [
          {
            label: t("limitOrders.cancelled"),
            tx: order.cancel_tx,
            at: order.cancelled_at,
            sign: "+",
            token: tokenIn,
            // The cancel returns what was left unfilled.
            amount: order.quantity,
          },
        ]
      : []),
  ];

  const statusComponent = (() => {
    if (!order) return;

    switch (order.status) {
      case "open":
      case "partiallyFilled":
        return t("limitOrders.open");
      case "cancelled":
        return (
          <>
            {percentFilledOfPastOrder && (
              <>
                <span className="text-bullish-400">
                  {t("limitOrders.filledPercent", {
                    percent: percentFilledOfPastOrder.toString(),
                  })}
                </span>
                {" · "}
              </>
            )}
            {t("limitOrders.cancelled")}
          </>
        );
      case "filled":
        return (
          <span className="text-bullish-300">{t("limitOrders.claimable")}</span>
        );
      case "fullyClaimed":
        return (
          <span className="text-bullish-400">{t("limitOrders.filled")}</span>
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
      // Refresh so the list drops the just-cancelled/claimed order instead of
      // showing it as Open until the next poll.
      onRequestRefresh?.();
      if (isShown.current) onRequestClose();
    } catch (error) {
      console.error(error);
      setBroadcasting(false);
    }
  }, [
    order,
    account,
    transactionContext,
    onRequestClose,
    onRequestRefresh,
    signAndBroadcast,
  ]);

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
      className={classNames("flex flex-col overflow-y-auto", {
        // 4.5rem is the height of the navbar. The padding matches the trade details panel's.
        "sticky top-[4.5rem] ml-4 h-[calc(100vh_-_4.5rem)] w-[480px] pl-8 pr-4 pt-3 pb-8":
          !isModal,
        "w-full bg-osmoverse-850 !py-6 !px-8 sm:top-0 sm:rounded-none sm:!px-4":
          isModal,
      })}
    >
      {!isModal && (
        <div className="py-4">
          <IconButton
            aria-label="Close"
            variant="ghost"
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
            <div className="text-h5">
              {order?.order_direction === "bid"
                ? t("limitOrders.buyLimitOrder")
                : t("limitOrders.sellLimitOrder")}
            </div>
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
        <div className="flex flex-col py-3">
          <RecapRow
            className="sm:py-0"
            left={
              <span className="subtitle1 sm:caption">
                {t("limitOrders.price")}
              </span>
            }
            right={
              <span className="body2 sm:caption">
                1 {order?.baseAsset?.symbol} ={" "}
                {formatPretty(
                  new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    order?.price ?? new Dec(0)
                  ),
                  getPriceExtendedFormatOptions(order?.price ?? new Dec(0))
                )}
              </span>
            }
          />
          <RecapRow
            className="sm:py-0"
            left={
              <span className="subtitle1 sm:caption">
                {t("limitOrders.status")}
              </span>
            }
            right={
              <span className="body2 sm:caption text-osmoverse-300">
                {statusComponent}
              </span>
            }
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
        {transactions.length > 0 && (
          <div className="flex flex-col py-3">
            <div className="mb-2 flex items-center gap-1 border-b border-osmoverse-700">
              <span className="body2 sm:caption text-osmoverse-300">
                {t("limitOrders.activity")}
              </span>
              <GenericDisclaimer
                title={t("limitOrders.howPayoutsWork")}
                body={t("limitOrders.payoutNote")}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-osmoverse-800">
                  <Icon
                    id="question"
                    className="h-4 w-4 text-wosmongton-200"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  />
                </div>
              </GenericDisclaimer>
            </div>
            {transactions.map(({ label, tx, at, sign, token, amount }) => (
              <a
                key={`${label}-${tx}`}
                className="-mx-2 flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-osmoverse-800"
                rel="noopener noreferrer"
                target="_blank"
                href={`https://www.mintscan.io/osmosis/txs/${tx}`}
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <EntityImage
                    logoURIs={getLogoURIs(token?.currency.coinImageUrl)}
                    name={token?.sourceDenom ?? ""}
                    symbol={token?.sourceDenom ?? ""}
                    height={32}
                    width={32}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="body2">{label}</span>
                  <span className="caption text-osmoverse-300">
                    {at
                      ? formatDateTime(dayjs.unix(at))
                      : t("transactions.viewOnExplorer")}{" "}
                    &#x2197;
                  </span>
                </div>
                <span
                  className={classNames("body2 ml-auto text-right", {
                    "text-bullish-400": sign === "+",
                  })}
                >
                  {sign}
                  {formatPretty(
                    new CoinPretty(
                      {
                        coinDecimals: token?.decimals ?? 0,
                        coinDenom: token?.symbol ?? "",
                        coinMinimalDenom: token?.coinMinimalDenom ?? "",
                      },
                      amount
                    )
                  )}
                </span>
              </a>
            ))}
          </div>
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
    </div>
  );
};
