import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import classNames from "classnames";
import React, { FunctionComponent, useEffect, useState } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";
import { formatFiatPrice } from "~/utils/formatter";
import { formatPretty } from "~/utils/formatter";

export const OpenOrders: FunctionComponent<{
  orders?: MappedLimitOrder[];
}> = ({ orders }) => {
  const openOrders = orders?.filter((order) => order.status === "open");

  console.log("openOrders", openOrders);

  const { width } = useWindowSize();

  const [isOpen, setIsOpen] = useState(true);

  const { t } = useTranslation();

  useEffect(() => {
    if (width > Breakpoint.xl) {
      setIsOpen(true);
    }
  }, [width]);

  if (!openOrders) return null;

  return (
    <div className="flex w-full flex-col py-3">
      <div
        className="flex cursor-pointer items-center justify-between py-3"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h6>Open Orders</h6>
        {width > Breakpoint.xl && (
          <Icon
            id="chevron-down"
            className={classNames("transition-transform", {
              "rotate-180": isOpen,
            })}
          />
        )}
      </div>
      {isOpen && (
        <>
          <div className="flex flex-col space-y-3">
            {openOrders.map(
              (
                {
                  baseAsset,
                  quoteAsset,
                  quantity,
                  price,
                  order_direction,
                  output,
                  placed_quantity,
                },
                index
              ) => {
                const assetAmount = new Dec(quantity).toString();
                const assetDenom = baseAsset?.symbol;
                const fiatValue = new Dec(quantity).mul(price).toString();

                const baseAssetLogo =
                  baseAsset?.rawAsset.logoURIs.svg ??
                  baseAsset?.rawAsset.logoURIs.png ??
                  "";

                return (
                  <div
                    key={baseAsset?.symbol}
                    className="body2 flex w-full justify-between space-x-3"
                  >
                    <div className="flex items-center space-x-1">
                      <FallbackImg
                        src={baseAssetLogo}
                        alt={`${baseAsset?.symbol} icon`}
                        fallbacksrc="/icons/question-mark.svg"
                        width={32}
                        height={32}
                        className="inline-block"
                      />
                      <div className="flex flex-col">
                        <span>
                          {order_direction === "bid"
                            ? t("limitOrders.buy")
                            : t("limitOrders.sell")}{" "}
                          {baseAsset?.currency?.coinDenom}
                        </span>
                        <span className="text-osmoverse-400">
                          {formatPretty(
                            new CoinPretty(
                              {
                                coinDecimals: baseAsset?.decimals ?? 0,
                                coinDenom: baseAsset?.symbol ?? "",
                                coinMinimalDenom:
                                  baseAsset?.coinMinimalDenom ?? "",
                              },
                              order_direction === "ask"
                                ? placed_quantity
                                : output
                            )
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span>
                        {formatFiatPrice(
                          new PricePretty(
                            DEFAULT_VS_CURRENCY,
                            order_direction === "bid"
                              ? placed_quantity /
                                Number(
                                  new Dec(10)
                                    .pow(new Int(quoteAsset?.decimals ?? 0))
                                    .toString()
                                )
                              : output.quo(
                                  new Dec(10).pow(
                                    new Int(quoteAsset?.decimals ?? 0)
                                  )
                                )
                          ),
                          2
                        )}
                      </span>

                      <span>
                        {formatPretty(
                          new CoinPretty(
                            {
                              coinDecimals: quoteAsset?.decimals ?? 0,
                              coinDenom: quoteAsset?.symbol ?? "",
                              coinMinimalDenom:
                                quoteAsset?.coinMinimalDenom ?? "",
                            },
                            order_direction === "ask" ? output : placed_quantity
                          )
                        )}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </>
      )}
    </div>
  );
};
