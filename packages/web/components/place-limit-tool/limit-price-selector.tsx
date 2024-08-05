import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { parseAsString, useQueryState } from "nuqs";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { useTranslation } from "~/hooks";
import { OrderDirection, PlaceLimitState } from "~/hooks/limit-orders";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { trimPlaceholderZeros } from "~/utils/number";

const percentAdjustmentOptions = [
  { value: new Dec(0), label: "Market", defaultValue: true },
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
  const [tab] = useQueryState("tab", parseAsString.withDefault("swap"));
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const { priceState } = swapState;
  const [inputMode, setInputMode] = useState(InputMode.Price);

  const swapInputMode = useCallback(() => {
    setInputMode(
      inputMode === InputMode.Percentage
        ? InputMode.Price
        : InputMode.Percentage
    );

    if (inputMode === InputMode.Price) {
      priceState.setPriceLock(false);
    } else {
      priceState.setPriceLock(true);
    }

    if (priceState.isBeyondOppositePrice || !priceState.manualPercentAdjusted) {
      priceState.setPercentAdjusted("0");
    }

    if (input) input.focus();
  }, [inputMode, input, priceState]);

  // Adjust order price as spot price changes until user inputs a price
  useEffect(() => {
    if (inputMode === InputMode.Price && !priceState.priceLocked) {
      const formattedPrice = formatPretty(
        priceState.spotPrice,
        getPriceExtendedFormatOptions(priceState.spotPrice)
      ).replace(/,/g, "");
      priceState._setPriceUnsafe(formattedPrice);
      priceState._setPercentAdjustedUnsafe("0");
    }

    if (inputMode === InputMode.Percentage) {
      priceState.setPriceAsPercentageOfSpotPrice(
        new Dec(
          !!priceState.manualPercentAdjusted
            ? priceState.manualPercentAdjusted.replace(/,/g, "")
            : 0
        ).quo(new Dec(100)),
        false
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputMode,
    priceState.priceFiat,
    priceState.priceLocked,
    priceState.spotPrice,
  ]);

  const priceLabel = useMemo(() => {
    if (inputMode === InputMode.Percentage) {
      return formatPretty(
        priceState.priceFiat,
        getPriceExtendedFormatOptions(priceState.priceFiat.toDec())
      );
    }

    return priceState.percentAdjusted.isZero()
      ? t("limitOrders.marketPrice")
      : `${formatPretty(priceState.percentAdjusted.mul(new Dec(100)).abs(), {
          maxDecimals: 3,
          maximumSignificantDigits: 5,
        })}%`;
  }, [inputMode, priceState.percentAdjusted, priceState.priceFiat, t]);

  const percentageSuffix = useMemo(() => {
    return priceState.percentAdjusted.isZero()
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
  }, [t, priceState.percentAdjusted, orderDirection]);

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();

  const isPercentTooLarge = useMemo(() => {
    if (tab !== "buy") return false;

    const maxPercentage = new Dec(99.999);
    return priceState.percentAdjusted.abs().gt(maxPercentage);
  }, [priceState.percentAdjusted, tab]);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col items-start justify-start pb-4 pt-4.5"
    >
      <div
        className="absolute top-0 h-0.5 w-[512px] -translate-x-5 bg-[#3C356D4A]"
        style={{ width: width + 40 }}
      />
      <GenericDisclaimer
        disabled={!swapState.priceState.isBeyondOppositePrice}
        title={
          <span className="caption">
            {orderDirection === "bid"
              ? t(`limitOrders.aboveMarket.title`)
              : t(`limitOrders.belowMarket.title`)}
          </span>
        }
        body={
          <span className="text-caption text-osmoverse-300">
            {orderDirection === "bid"
              ? t(`limitOrders.aboveMarket.description`)
              : t(`limitOrders.belowMarket.description`)}
          </span>
        }
      >
        <button
          type="button"
          className="inline-flex min-h-[32px] w-full items-center gap-1"
          onClick={swapInputMode}
          disabled={priceState.isLoading}
        >
          <span className="body2 text-osmoverse-300">
            {t("limitOrders.whenDenomPriceIs", {
              denom: swapState.baseAsset?.coinDenom ?? "",
            })}{" "}
            <span
              className={classNames("body2 text-wosmongton-300", {
                "text-rust-400": swapState.priceState.isBeyondOppositePrice,
              })}
            >
              {priceLabel}
            </span>{" "}
            {inputMode === InputMode.Price &&
              +swapState.priceState.manualPercentAdjusted > 0 && (
                <span
                  className={classNames("body2 text-wosmongton-300", {
                    "text-rust-400": swapState.priceState.isBeyondOppositePrice,
                  })}
                >
                  {percentageSuffix}
                </span>
              )}
          </span>
          <Icon
            id="switch"
            className={classNames("text-wosmongton-300", {
              "text-rust-400": swapState.priceState.isBeyondOppositePrice,
            })}
            width={16}
            height={16}
          />
        </button>
      </GenericDisclaimer>
      <label className="flex w-full items-center justify-between">
        <div className="inline-flex items-end gap-1 py-3 text-h6 font-h6">
          <SkeletonLoader
            isLoaded={priceState.spotPrice && !priceState.isLoading}
          >
            {inputMode === InputMode.Price && (
              <span
                className={classNames("transition-colors", {
                  "text-osmoverse-600": swapState.priceState.orderPrice === "",
                })}
              >
                $
              </span>
            )}
            {inputMode === InputMode.Price ? (
              <input
                type="text"
                min={0}
                className="bg-transparent text-white-full transition-colors placeholder:text-osmoverse-600"
                value={swapState.priceState.orderPrice}
                placeholder={formatPretty(
                  priceState.priceFiat,
                  getPriceExtendedFormatOptions(priceState.priceFiat.toDec())
                ).replace("$", "")}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  swapState.priceState.setPrice(value);
                }}
              />
            ) : (
              <>
                {isPercentTooLarge && <span>{">"}</span>}
                <AutosizeInput
                  type="text"
                  extraWidth={0}
                  inputClassName="bg-transparent text-white-full transition-colors placeholder:text-osmoverse-600"
                  value={
                    isPercentTooLarge
                      ? "99.999"
                      : swapState.priceState.manualPercentAdjusted
                  }
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
              </>
            )}
            {inputMode === InputMode.Percentage && (
              <span className="inline-flex items-baseline gap-1">
                <span
                  className={classNames("text-white-full transition-colors", {
                    "!text-osmoverse-600":
                      swapState.priceState.manualPercentAdjusted === "",
                  })}
                >
                  %
                </span>
                <span className="body2 text-osmoverse-500">
                  {percentageSuffix}
                </span>
              </span>
            )}
          </SkeletonLoader>
        </div>
      </label>
      <div className="flex w-full items-center justify-between gap-2 pt-3 pb-2">
        {percentAdjustmentOptions.map(({ label, value, defaultValue }) => (
          <button
            type="button"
            className="flex h-8 w-full items-center justify-center rounded-5xl border border-[#6B62AD] px-3 py-1 text-wosmongton-200 transition hover:border-transparent hover:bg-osmoverse-alpha-800/[.54] hover:text-white-high disabled:opacity-50"
            key={`limit-price-adjust-${label}`}
            onClick={() => {
              if (inputMode === InputMode.Percentage) {
                priceState.setPercentAdjusted(
                  formatPretty(value.mul(new Dec(100)))
                );
              } else {
                priceState.setPriceAsPercentageOfSpotPrice(value);
                priceState._setPercentAdjustedUnsafe(
                  formatPretty(value.mul(new Dec(100)))
                );
              }
            }}
            disabled={!priceState.spotPrice || priceState.isLoading}
          >
            {!defaultValue && (
              <div className="flex h-4 w-4 items-center justify-center">
                {orderDirection === "ask" ? (
                  <Icon
                    id="triangle-down"
                    width={10}
                    height={6}
                    className="rotate-180  transition-transform"
                  />
                ) : (
                  <Icon
                    id="triangle-down"
                    width={10}
                    height={6}
                    className="transition-transform"
                  />
                )}
              </div>
            )}
            <span className="body2">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
