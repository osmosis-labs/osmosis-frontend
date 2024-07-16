import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { ReactNode, useCallback, useMemo } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { useTranslation } from "~/hooks";
import { OrderDirection, PlaceLimitState } from "~/hooks/limit-orders";
import { ModalBase } from "~/modals/base";
import { formatPretty } from "~/utils/formatter";

export interface ReviewLimitOrderModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  placeLimitState: PlaceLimitState;
  orderDirection: OrderDirection;
  makerFee: Dec;
}

export const ReviewLimitOrderModal: React.FC<ReviewLimitOrderModalProps> = ({
  isOpen,
  onRequestClose,
  placeLimitState,
  orderDirection,
  makerFee,
}) => {
  const { t } = useTranslation();

  const fee = useMemo(() => {
    if (placeLimitState.isMarket) {
      const marketFee = placeLimitState.marketState.totalFee;
      return marketFee;
    }

    return (
      placeLimitState.paymentFiatValue?.mul(makerFee) ??
      new PricePretty(DEFAULT_VS_CURRENCY, 0)
    );
  }, [
    placeLimitState.paymentFiatValue,
    makerFee,
    placeLimitState.isMarket,
    placeLimitState.marketState,
  ]);

  const total = useMemo(() => {
    if (
      placeLimitState.paymentFiatValue &&
      !placeLimitState.paymentFiatValue?.toDec().isZero()
    ) {
      return placeLimitState.paymentFiatValue!.sub(fee);
    }
    return new PricePretty(DEFAULT_VS_CURRENCY, 0);
  }, [placeLimitState.paymentFiatValue, fee]);

  const price = useMemo(() => {
    if (placeLimitState.isMarket) {
      const priceState = placeLimitState.priceState;
      const price =
        orderDirection === "bid"
          ? priceState.askSpotPrice
          : priceState.bidSpotPrice;
      return price ?? new Dec(0);
    }
    return placeLimitState.priceState.price;
  }, [placeLimitState.isMarket, placeLimitState.priceState, orderDirection]);

  const [orderType] = useQueryState("type");

  const onConfirm = useCallback(async () => {
    await placeLimitState.placeLimit();
    placeLimitState.reset();
    onRequestClose();
  }, [placeLimitState, onRequestClose]);

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      hideCloseButton
      className="flex w-[512px] flex-col rounded-2xl bg-osmoverse-850 !p-0"
    >
      <div className="relative flex h-20 w-full items-center justify-center p-4">
        <h6>
          {orderDirection === "bid"
            ? t("portfolio.buy")
            : t("limitOrders.sell")}{" "}
          {placeLimitState.baseAsset?.coinName}
        </h6>
        <button
          onClick={onRequestClose}
          className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800"
        >
          <Icon id="thin-x" className="text-wosmongton-200" />
        </button>
      </div>
      <div className="flex flex-col px-8 pb-8">
        {placeLimitState.baseAsset && (
          <div className="flex flex-col gap-4 pb-3">
            <div className="flex w-full justify-center">
              <Image
                width={48}
                height={48}
                src={placeLimitState.baseAsset.coinImageUrl!}
                alt={placeLimitState.baseAsset.coinDenom}
              />
            </div>
            <div className="flex w-full flex-col items-center justify-center">
              <h5>
                {placeLimitState.isMarket && "≈"}{" "}
                {placeLimitState.expectedTokenAmountOut
                  ? formatPretty(placeLimitState.expectedTokenAmountOut)
                  : "0"}
              </h5>
              <span className="text-body1 text-osmoverse-300">
                {t("limitOrders.at")} ${formatPretty(price ?? new Dec(0))}
              </span>
            </div>
          </div>
        )}
        <div className="flex w-full flex-col pt-3">
          {placeLimitState.quoteAsset && orderDirection === "bid" && (
            <RecapRow
              left={t("limitOrders.payWith")}
              right={
                <span className="text-osmoverse-100">
                  <Image
                    width={24}
                    height={24}
                    src={placeLimitState.quoteAsset.coinImageUrl!}
                    alt={placeLimitState.quoteAsset.coinDenom}
                    className="inline"
                  />{" "}
                  {placeLimitState.quoteAsset.coinDenom}
                </span>
              }
            />
          )}
          <RecapRow
            left={t("limitOrders.value")}
            right={
              <span className="text-osmoverse-100">
                ~{total ? formatPretty(total) : "$0"}
              </span>
            }
          />
          <RecapRow
            left={t("limitOrders.totalEstimatedFees")}
            right={<>~{formatPretty(fee)}</>}
          />
          <hr className="my-2 text-osmoverse-700" />
          <RecapRow
            left={t("limitOrders.receive")}
            right={<>{formatPretty(placeLimitState.expectedTokenAmountOut)}</>}
          />
          {placeLimitState.isMarket && placeLimitState.marketState.quote && (
            <RecapRow
              left={t("limitOrders.receiveMin")}
              right={
                <span className="body2 text-osmoverse-100">
                  {formatPretty(placeLimitState.expectedTokenAmountOut)}{" "}
                  <span className="text-osmoverse-300">
                    (~
                    {formatPretty(placeLimitState.expectedFiatAmountOut)})
                  </span>
                </span>
              }
            />
          )}
          {placeLimitState.quoteAsset && orderDirection === "ask" && (
            <RecapRow
              left={t("limitOrders.receiveAsset")}
              right={
                <span className="text-osmoverse-100">
                  <Image
                    width={24}
                    height={24}
                    src={placeLimitState.quoteAsset.coinImageUrl!}
                    alt={placeLimitState.quoteAsset.coinDenom}
                    className="inline"
                  />{" "}
                  {placeLimitState.quoteAsset.coinDenom}
                </span>
              }
            />
          )}
          <RecapRow
            left={t("limitOrders.orderType")}
            right={
              <span className="text-osmoverse-100">
                {orderType === "limit"
                  ? t("limitOrders.limitOrder.title")
                  : t("limitOrders.marketOrder.title")}
              </span>
            }
          />
          {orderType !== "limit" && (
            <RecapRow
              left={t("assets.table.price")}
              right={
                <span className="text-osmoverse-100">
                  {price ? `$${formatPretty(price)}` : "$0"}
                </span>
              }
            />
          )}
          {orderType === "limit" && (
            <RecapRow
              left={t("limitOrders.limitPrice")}
              right={
                <div className="flex  items-center justify-center text-osmoverse-100">
                  <div className="mr-2 flex items-center justify-between rounded-xl border border-osmoverse-700 px-3 py-1 text-caption text-osmoverse-300">
                    {!placeLimitState.priceState.percentAdjusted.isZero() && (
                      <Icon
                        id="triangle-down"
                        width={10}
                        height={6}
                        className={classNames("mr-1", {
                          "rotate-180 text-bullish-400":
                            placeLimitState.priceState.percentAdjusted.isPositive(),
                          "rotate-0 text-rust-500":
                            placeLimitState.priceState.percentAdjusted.isNegative(),
                        })}
                      />
                    )}
                    <div>
                      {formatPretty(
                        placeLimitState.priceState.percentAdjusted
                          .mul(new Dec(100))
                          .abs()
                      )}
                      %
                    </div>
                  </div>
                  <div> ${formatPretty(placeLimitState.priceState.price)}</div>
                </div>
              }
            />
          )}
          {/* {orderType !== "limit" && (
            <div className="body2 flex h-8 w-full items-center justify-between">
              <span className="text-osmoverse-300">
                {t("limitOrders.moreDetails")}
              </span>
              <span className="cursor-pointer text-wosmongton-300">
                {t("swap.autoRouterToggle.show")}
              </span>
            </div>
          )} */}
          {/* <div className="body2 mt-3 flex h-[38px] w-full items-center justify-center">
            <span className="text-caption text-osmoverse-300">
              Disclaimer lorem ipsum.{" "}
              <a className="text-wosmongton-300">Learn more</a>
            </span>
          </div> */}
          <div className="body2 flex w-full justify-between gap-3 pt-3">
            <Button
              mode="unstyled"
              onClick={onRequestClose}
              className="rounded-2xl border border-osmoverse-700"
            >
              <h6 className="text-wosmongton-200">
                {t("unstableAssetsWarning.buttonCancel")}
              </h6>
            </Button>
            <Button onClick={onConfirm}>
              <h6>{t("limitOrders.confirm")}</h6>
            </Button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

export function RecapRow({
  left,
  right,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "body2 flex h-8 w-full items-center justify-between",
        className
      )}
    >
      <span className="text-osmoverse-300">{left}</span>
      {right}
    </div>
  );
}
