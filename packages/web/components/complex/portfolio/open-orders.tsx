import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import React, { FunctionComponent } from "react";

import { FallbackImg } from "~/components/assets";
import { LinkButton } from "~/components/buttons/link-button";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation } from "~/hooks";
import { formatFiatPrice } from "~/utils/formatter";
import { formatPretty } from "~/utils/formatter";

const OPEN_ORDERS_LIMIT = 2;

const OpenOrdersSkeleton = () => {
  return (
    <>
      {Array.from({ length: OPEN_ORDERS_LIMIT }).map((_, index) => (
        <div key={index} className="-mx-2 flex justify-between gap-4 p-2">
          <Skeleton className="h-9 w-1/3 " />
          <Skeleton className="h-9 w-1/5" />
        </div>
      ))}
    </>
  );
};

export const OpenOrders: FunctionComponent<{
  orders?: MappedLimitOrder[];
}> = ({ orders }) => {
  const openOrders = orders
    ?.filter((order) => order.status === "open")
    .slice(0, OPEN_ORDERS_LIMIT);

  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col py-3">
      <div className="flex cursor-pointer items-center justify-between gap-3 py-3">
        <h6>Open Orders</h6>
        <LinkButton
          href="/transactions"
          className="-mx-2 text-osmoverse-400"
          label={t("portfolio.seeAll")}
          ariaLabel={t("portfolio.seeAll")}
          size="md"
        />
      </div>
      <div className="flex flex-col">
        {openOrders?.map(
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
            const baseAssetLogo =
              baseAsset?.rawAsset.logoURIs.svg ??
              baseAsset?.rawAsset.logoURIs.png ??
              "";

            // example: 0.01 OSMO
            const formattedBuySellToken = formatPretty(
              new CoinPretty(
                {
                  coinDecimals: baseAsset?.decimals ?? 0,
                  coinDenom: baseAsset?.symbol ?? "",
                  coinMinimalDenom: baseAsset?.coinMinimalDenom ?? "",
                },
                order_direction === "ask" ? placed_quantity : output
              )
            );

            // example: $0.01
            const formattedFiatPrice = formatFiatPrice(
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
                      new Dec(10).pow(new Int(quoteAsset?.decimals ?? 0))
                    )
              ),
              2
            );

            // example: 0.01 USDC
            const formattedQuotAsset = formatPretty(
              new CoinPretty(
                {
                  coinDecimals: quoteAsset?.decimals ?? 0,
                  coinDenom: quoteAsset?.symbol ?? "",
                  coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
                },
                order_direction === "ask" ? output : placed_quantity
              )
            );

            const buySellText =
              order_direction === "bid"
                ? t("limitOrders.buy")
                : t("limitOrders.sell");

            return (
              <div key={index} className="body2 -mx-2 flex w-full gap-3 p-2">
                <FallbackImg
                  src={baseAssetLogo}
                  alt={`${baseAsset?.symbol} icon`}
                  fallbacksrc="/icons/question-mark.svg"
                  width={32}
                  height={32}
                  className="inline-block"
                />
                <div className="flex h-full flex-col justify-between overflow-hidden whitespace-nowrap">
                  <span className="overflow-hidden overflow-ellipsis">
                    {buySellText} {baseAsset?.currency?.coinDenom}{" "}
                  </span>
                  <span className="caption overflow-hidden overflow-ellipsis text-osmoverse-300">
                    {formattedBuySellToken}
                  </span>
                </div>
                <div className="ooverflow-ellipsis ml-auto flex h-full flex-col justify-between whitespace-nowrap text-right">
                  {formattedFiatPrice}
                  <span className="caption text-osmoverse-300">
                    {formattedQuotAsset}
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};
