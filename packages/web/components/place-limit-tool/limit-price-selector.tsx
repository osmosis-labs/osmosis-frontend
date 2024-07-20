import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";
import { OrderDirection, PlaceLimitState } from "~/hooks/limit-orders";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { trimPlaceholderZeros } from "~/utils/number";

const percentAdjustmentOptions = [
  { value: new Dec(0.005), label: "0.5%" },
  { value: new Dec(0.02), label: "2%" },
  { value: new Dec(0.05), label: "5%" },
  { value: new Dec(0.1), label: "10%" },
];

interface LimitPriceSelectorProps {
  swapState: PlaceLimitState;
  orderDirection: OrderDirection;
}

enum InputMode {
  Percentage,
  Price,
}

export const LimitPriceSelector: FC<LimitPriceSelectorProps> = ({
  swapState,
  orderDirection,
}) => {
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const { priceState } = swapState;
  const [inputMode, setInputMode] = useState(InputMode.Percentage);

  const swapInputMode = useCallback(() => {
    setInputMode(
      inputMode === InputMode.Percentage
        ? InputMode.Price
        : InputMode.Percentage
    );

    if (input) input.focus();
  }, [inputMode, input]);

  useEffect(() => {
    swapState.priceState.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDirection]);

  useEffect(() => {
    if (
      priceState.spotPrice &&
      priceState.orderPrice.length > 0 &&
      inputMode === InputMode.Price
    ) {
      const percentAdjusted = new Dec(priceState.orderPrice)
        .quo(priceState.spotPrice)
        .sub(new Dec(1))
        .mul(new Dec(100));

      priceState._setPercentAdjustedUnsafe(
        percentAdjusted.isZero()
          ? ""
          : formatPretty(percentAdjusted.abs(), {
              maxDecimals: 2,
            }).toString()
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceState.spotPrice, priceState.orderPrice, inputMode]);

  const priceLabel = useMemo(() => {
    if (inputMode === InputMode.Percentage) {
      return formatPretty(
        priceState.priceFiat,
        getPriceExtendedFormatOptions(priceState.priceFiat.toDec())
      );
    }
    return priceState.percentAdjusted.isZero()
      ? t("limitOrders.marketPrice")
      : `${formatPretty(priceState.percentAdjusted.mul(new Dec(100)).abs())}%`;
  }, [inputMode, priceState.percentAdjusted, priceState.priceFiat, t]);

  const inputSuffix = useMemo(() => {
    return inputMode === InputMode.Price
      ? `= 1 ${swapState.baseAsset?.coinDenom}`
      : priceState.percentAdjusted.isZero()
      ? `${
          orderDirection === "bid"
            ? t("limitOrders.below")
            : t("limitOrders.above")
        } ${t("limitOrders.currentPrice")}`
      : `${
          priceState.percentAdjusted.isNegative()
            ? t("limitOrders.below")
            : t("limitOrders.above")
        } ${t("limitOrders.currentPrice")}`;
  }, [
    inputMode,
    swapState.baseAsset?.coinDenom,
    t,
    priceState.percentAdjusted,
    orderDirection,
  ]);

  const TooltipContent = useMemo(() => {
    const translationId =
      orderDirection === "bid"
        ? "limitOrders.aboveMarket"
        : "limitOrders.belowMarket";
    return (
      <div>
        <div className="text-caption">{t(`${translationId}.title`)}</div>
        <span className="text-caption text-osmoverse-300">
          {t(`${translationId}.description`)}
        </span>
      </div>
    );
  }, [orderDirection, t]);

  return (
    <div className="flex w-full flex-col items-start justify-start rounded-2xl bg-osmoverse-1000 py-3 px-5">
      <label
        className="inline-flex w-full items-center justify-between gap-1 py-3"
        htmlFor="price-input"
      >
        <span className="body2 text-osmoverse-300">
          {t("limitOrders.whenDenomPriceIs", {
            denom: swapState.baseAsset?.coinDenom ?? "",
          })}{" "}
        </span>

        <div className="flex items-center justify-center">
          <SkeletonLoader
            isLoaded={priceState.spotPrice && !priceState.isLoading}
          >
            <div
              className={classNames("flex items-center justify-center", {
                "animate-pulse": swapState.priceState.isAssetPriceRefetching,
              })}
            >
              {inputMode === InputMode.Price &&
                !swapState.priceState.percentAdjusted.isZero() && (
                  <Icon
                    id="triangle-down"
                    width={12}
                    height={6}
                    className={classNames("mr-1 scale-75", {
                      "text-rust-400":
                        swapState.priceState.isBeyondOppositePrice ||
                        swapState.priceState.percentAdjusted.isNegative(),
                      "rotate-180 text-bullish-400":
                        swapState.priceState.percentAdjusted.isPositive(),
                    })}
                  />
                )}
              <div
                className={classNames(
                  "body2 inline-flex items-center gap-1 font-body2",
                  {
                    "text-rust-400": swapState.priceState.isBeyondOppositePrice,
                    "text-osmoverse-300":
                      !swapState.priceState.isBeyondOppositePrice,
                  }
                )}
              >
                <span>{priceLabel}</span>
              </div>
            </div>
          </SkeletonLoader>
          {swapState.priceState.isBeyondOppositePrice && (
            <span className="body2 ml-2 text-rust-400">
              <Tooltip
                content={TooltipContent}
                rootClassNames="!bg-osmoverse-1000 border border-[#E4E1FB33] rounded-2xl"
              >
                <Icon id="alert-circle-filled" width={16} height={16} />
              </Tooltip>
            </span>
          )}
        </div>
      </label>
      <div className="flex w-full items-center justify-between">
        <div className="inline-flex items-end gap-1 py-3 text-h6 font-h6">
          <SkeletonLoader
            isLoaded={priceState.spotPrice && !priceState.isLoading}
          >
            {inputMode === InputMode.Price && <span>$</span>}
            {inputMode === InputMode.Price ? (
              <AutosizeInput
                id="price-input"
                type="number"
                min={0}
                extraWidth={0}
                inputClassName="bg-transparent text-white-full"
                value={swapState.priceState.orderPrice}
                placeholder={formatPretty(
                  swapState.priceState.price,
                  getPriceExtendedFormatOptions(swapState.priceState.price)
                )}
                onChange={(e) => swapState.priceState.setPrice(e.target.value)}
                inputRef={setInput}
              />
            ) : (
              <AutosizeInput
                id="price-input"
                type="string"
                extraWidth={0}
                inputClassName="bg-transparent text-white-full"
                value={swapState.priceState.manualPercentAdjusted}
                placeholder={trimPlaceholderZeros(
                  swapState.priceState.percentAdjusted
                    .mul(new Dec(100))
                    .abs()
                    .toString()
                )}
                inputRef={setInput}
                onChange={(e) =>
                  swapState.priceState.setPercentAdjusted(
                    e.target.value.replace("%", "")
                  )
                }
              />
            )}
            {inputMode === InputMode.Percentage && (
              <span className="text-white-full">%</span>
            )}
          </SkeletonLoader>
          {priceState.spotPrice && !priceState.isLoading && (
            <span className="body2 text-osmoverse-400">{inputSuffix}</span>
          )}
        </div>

        <div className="rounded-full border-[1px] border-osmoverse-700 text-wosmongton-300">
          <button
            onClick={swapInputMode}
            disabled={priceState.isLoading || priceState.isBeyondOppositePrice}
            className="flex h-8 w-8 items-center justify-center disabled:opacity-50"
          >
            <Icon id="switch" width={16} height={16} />
          </button>
        </div>
      </div>
      <div className="grid w-full grid-cols-4 items-center justify-around gap-2 py-2">
        {percentAdjustmentOptions.map(({ label, value }) => (
          <button
            className="mr-1 flex h-8 w-full items-center justify-center rounded-5xl border border-osmoverse-700 px-3 disabled:opacity-50"
            key={`limit-price-adjust-${label}`}
            onClick={() => {
              priceState.setPrice("");
              priceState.setPercentAdjusted(
                formatPretty(value.mul(new Dec(100)))
              );
            }}
            disabled={!priceState.spotPrice || priceState.isLoading}
          >
            <span className="text-wosmongton-200">
              {label !== "0%" && (orderDirection === "bid" ? "-" : "+")}
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
