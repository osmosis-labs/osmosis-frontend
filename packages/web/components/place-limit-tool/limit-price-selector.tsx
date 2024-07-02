import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import React, { FC, useCallback, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";
import { OrderDirection, PlaceLimitState } from "~/hooks/limit-orders";
import { formatPretty } from "~/utils/formatter";

const percentAdjustmentOptions = [
  { value: new Dec(0), label: "0%" },
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
  const { t } = useTranslation();
  const { priceState } = swapState;
  const [inputMode, setInputMode] = useState(InputMode.Percentage);

  const swapInputMode = useCallback(() => {
    setInputMode(
      inputMode === InputMode.Percentage
        ? InputMode.Price
        : InputMode.Percentage
    );
  }, [inputMode]);

  const priceLabel = useMemo(() => {
    if (inputMode === InputMode.Percentage) {
      return formatPretty(priceState.priceFiat);
    }
    return priceState.percentAdjusted.isZero()
      ? t("limitOrders.marketPrice")
      : `${
          priceState.percentAdjusted.isNegative()
            ? priceState.percentAdjusted
                .mul(new Dec(100))
                .truncate()
                .abs()
                .toString()
            : priceState.percentAdjusted
                .mul(new Dec(100))
                .abs()
                .round()
                .toString()
        }% ${
          priceState.percentAdjusted.isNegative()
            ? t("limitOrders.below")
            : t("limitOrders.above")
        } ${t("limitOrders.currentPrice")}`;
  }, [inputMode, priceState.percentAdjusted, priceState.priceFiat, t]);

  const inputSuffix = useMemo(() => {
    return inputMode === InputMode.Price
      ? `= 1 ${swapState.baseAsset?.coinDenom}`
      : `% ${
          orderDirection === "bid"
            ? t("limitOrders.below")
            : t("limitOrders.above")
        } ${t("limitOrders.currentPrice")}`;
  }, [inputMode, swapState.baseAsset?.coinDenom, orderDirection, t]);

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
    <>
      <div className="inline-flex w-full items-center justify-between gap-1 pt-6">
        <SkeletonLoader
          isLoaded={priceState.spotPrice && !priceState.isLoading}
        >
          <div>
            <span className="body2 text-osmoverse-300">
              {t("limitOrders.whenDenomPriceIs", {
                denom: swapState.baseDenom,
              })}{" "}
            </span>
            <button
              className={classNames("body2 inline-flex items-center gap-1", {
                "text-rust-400": swapState.priceState.isBeyondOppositePrice,
                "text-wosmongton-300":
                  !swapState.priceState.isBeyondOppositePrice,
              })}
              onClick={swapInputMode}
            >
              <span>{priceLabel}</span>
              <Icon
                id="arrows-swap-16"
                className="h-4 w-4"
                width={16}
                height={16}
              />
            </button>
          </div>
        </SkeletonLoader>
        <div>
          {swapState.priceState.isBeyondOppositePrice && (
            <span className="body2 text-rust-400">
              <Tooltip
                content={TooltipContent}
                rootClassNames="!bg-osmoverse-1000 border border-[#E4E1FB33] rounded-2xl"
              >
                <Icon id="alert-circle-filled" width={16} height={16} />
              </Tooltip>
            </span>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col items-start justify-start rounded-2xl bg-osmoverse-1000 py-3 px-5">
        <SkeletonLoader
          isLoaded={priceState.spotPrice && !priceState.isLoading}
        >
          <div className="inline-flex items-center gap-1 py-1">
            {/** TODO: Dynamic width */}
            {inputMode === InputMode.Price && <span>$</span>}
            {inputMode === InputMode.Price ? (
              <AutosizeInput
                type="number"
                min={0}
                extraWidth={0}
                inputClassName="bg-transparent text-white-full"
                value={swapState.priceState.orderPrice}
                placeholder={formatPretty(
                  swapState.priceState.spotPrice ?? new Dec(0)
                )}
                onChange={(e) => swapState.priceState.setPrice(e.target.value)}
              />
            ) : (
              <AutosizeInput
                type="number"
                min={0}
                extraWidth={0}
                inputClassName="bg-transparent text-white-full"
                value={swapState.priceState.manualPercentAdjusted}
                placeholder={formatPretty(
                  swapState.priceState.percentAdjusted.mul(new Dec(100)).abs()
                )}
                onChange={(e) =>
                  swapState.priceState.setPercentAdjusted(e.target.value)
                }
              />
            )}
            <span className="text-osmoverse-400">{inputSuffix}</span>
          </div>
        </SkeletonLoader>
        <div className="mt-1 flex items-center">
          {percentAdjustmentOptions.map(({ label, value }) => (
            <button
              className="mr-1 flex h-8 items-center rounded-5xl border border-osmoverse-700 px-3"
              key={`limit-price-adjust-${label}`}
              onClick={() =>
                swapState.priceState.setPercentAdjusted(
                  formatPretty(value.mul(new Dec(100)))
                )
              }
              disabled={!priceState.spotPrice || priceState.isLoading}
            >
              <span className="body2 text-wosmongton-200">
                {label !== "0%" && (orderDirection === "bid" ? "-" : "+")}
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
