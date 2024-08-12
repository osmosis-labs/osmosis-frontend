import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import React, { memo, useCallback, useMemo, useState } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { IconButton } from "~/components/ui/button";
import { RecapRow } from "~/components/ui/recap-row";
import { t } from "~/hooks";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import {
  formatFiatPrice,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";

interface OrderModalProps {
  order?: MappedLimitOrder;
  onRequestClose: () => void;
}

export const OrderModal = memo(({ order, onRequestClose }: OrderModalProps) => {
  return (
    <ModalBase
      isOpen={!!order}
      onRequestClose={onRequestClose}
      className="xl:!px-0 xl:!pb-0 xl:!pt-2 sm:h-full sm:min-h-[100vh] sm:!rounded-none"
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

const OrderDetails = observer(
  ({ order, isModal, onRequestClose }: OrderDetailsProps) => {
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const [broadcasting, setBroadcasting] = useState(false);

    const tokenIn = useMemo(() => {
      if (!order) return;

      return order.order_direction === "ask"
        ? order.baseAsset
        : order.quoteAsset;
    }, [order]);

    const tokenOut = useMemo(() => {
      if (!order) return;

      return order.order_direction === "ask"
        ? order.quoteAsset
        : order.baseAsset;
    }, [order]);

    const formattedMonth = dayjs(order?.placed_at).format("MMMM").slice(0, 3);

    const formattedDateDayYearHourMinute = dayjs(order?.placed_at).format(
      "DD, YYYY, HH:mm"
    );

    const formattedDate = `${formattedMonth} ${formattedDateDayYearHourMinute}`;

    const statusComponent = (() => {
      if (!order) return;

      switch (order?.status) {
        case "open":
        case "partiallyFilled":
          return (
            <div className="flex items-center justify-between">
              <span className="text-osmoverse-300">Open</span>
            </div>
          );
        case "cancelled":
          return (
            <div className="flex items-center justify-between">
              <span className="text-osmoverse-300">Cancelled</span>
            </div>
          );
        case "filled":
          return <span className="body2 text-bullish-300">Claimable</span>;
        case "fullyClaimed":
          return <span className="body2 text-bullish-400">Filled</span>;
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
        await account.cosmwasm.sendMultiExecuteContractMsg(
          "executeWasm",
          msgs,
          undefined
        );
        // await refetch();
        onRequestClose();
      } catch (error) {
        console.error(error);
        setBroadcasting(false);
      }
    }, [account, order, onRequestClose]);

    const buttonText = useMemo(() => {
      if (
        order?.status !== "open" &&
        order?.status !== "partiallyFilled" &&
        order?.status !== "filled"
      ) {
        return;
      }

      if (order?.status === "filled") {
        return "Claim";
      }

      return order?.status === "open" ? "Cancel" : "Claim and Close";
    }, [order]);

    const orderAmount = useMemo(() => {
      return formatFiatPrice(
        new PricePretty(
          DEFAULT_VS_CURRENCY,
          order?.order_direction === "bid"
            ? order?.placed_quantity /
              Number(
                new Dec(10)
                  .pow(new Int(order?.quoteAsset?.decimals ?? 0))
                  .toString()
              )
            : order?.output.quo(
                new Dec(10).pow(new Int(order?.quoteAsset?.decimals ?? 0))
              ) ?? new Dec(0)
        ),
        2
      );
    }, [order]);

    return (
      <div
        className={classNames(
          "top-[4.5rem] flex w-full flex-col overflow-y-auto border-osmoverse-700 bg-osmoverse-900 xl:!py-6 xl:!px-8 sm:top-0 sm:h-full sm:!h-full sm:rounded-none sm:bg-osmoverse-850"
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
              <div className="text-h5">Limit Order</div>
              <div className="body1 capitalize text-osmoverse-300">
                {formattedDate}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-osmoverse-700 p-2">
          <div className="flex justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10">
                <FallbackImg
                  alt={tokenIn?.sourceDenom}
                  src={tokenIn?.currency.coinImageUrl}
                  fallbacksrc="/icons/question-mark.svg"
                  height={40}
                  width={40}
                />
              </div>
              <div className="flex flex-col">
                <div className="subtitle1">{t("transactions.sold")}</div>
                <div className="body1 text-osmoverse-300">
                  {tokenIn?.symbol}
                </div>
              </div>
            </div>
            <div className="flex-end flex flex-col text-right">
              <div className="subtitle1">
                {formatPretty(
                  new CoinPretty(
                    {
                      coinDecimals: tokenIn?.decimals ?? 0,
                      coinDenom: tokenIn?.symbol ?? "",
                      coinMinimalDenom: tokenIn?.coinMinimalDenom ?? "",
                    },
                    order?.placed_quantity ?? new Dec(0)
                  )
                )}
              </div>
              <div className="body1 text-osmoverse-300">{orderAmount}</div>
            </div>
          </div>
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
              <div className="h-10 w-10">
                <FallbackImg
                  alt={tokenOut?.sourceDenom}
                  src={tokenOut?.currency.coinImageUrl}
                  fallbacksrc="/icons/question-mark.svg"
                  height={40}
                  width={40}
                />
              </div>
              <div className="flex flex-col">
                <div className="subtitle1">{t("transactions.bought")}</div>
                <div className="body1 text-osmoverse-300">
                  {tokenOut?.symbol}
                </div>
              </div>
            </div>
            <div className="flex-end flex flex-col text-right">
              <div className="subtitle1">
                {/* // TODO - clean this up to match tokenConversion */}
                {formatPretty(
                  new CoinPretty(
                    {
                      coinDecimals: tokenOut?.decimals ?? 0,
                      coinDenom: tokenOut?.symbol ?? "",
                      coinMinimalDenom: tokenOut?.coinMinimalDenom ?? "",
                    },
                    order?.output ?? new Dec(0)
                  )
                )}
              </div>
              <div className="body1 text-osmoverse-300">
                {orderAmount !== "<$0.01" && "~"}
                {orderAmount}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col py-2 px-4">
          <div className={classNames("flex flex-col py-3")}>
            <RecapRow
              className="py-3"
              left={<span className="subtitle1">Price</span>}
              right={
                <div className="sm:body2 flex items-center justify-center">
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
              className="py-3"
              left={<span className="subtitle1">Status</span>}
              right={statusComponent}
            />
            {(order?.status === "open" ||
              order?.status === "partiallyFilled") && (
              <RecapRow
                className="py-3"
                left={<span className="subtitle1">Percent Filled</span>}
                right={
                  <span className="body2 text-osmoverse-300">
                    <OrderProgressBar order={order!} />
                  </span>
                }
              />
            )}
          </div>
        </div>
        {!!order && !!buttonText && (
          <div className="flex items-center justify-center gap-3 pt-3">
            <Button
              mode="primary"
              onClick={closeOrder}
              disabled={broadcasting}
              className="body2 sm:caption !rounded-2xl"
            >
              <span className="text-h6 font-h6">{buttonText}</span>
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
  }
);
