import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import Link from "next/link";
import React from "react";

import { Icon } from "~/components/assets";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

interface AssetInfoProps {
  assetPrice?: PricePretty;
  priceChange24h?: RatePretty;
  denom?: string;
  color?: string;
}

export const AssetInfo = ({
  assetPrice,
  denom,
  color,
  priceChange24h,
}: AssetInfoProps) => {
  const isNumberPositive = priceChange24h?.toDec().isPositive();
  return (
    <div className="flex flex-col gap-1">
      <Link
        href={`/assets/${denom}`}
        className="inline-flex items-center gap-1"
      >
        <h6
          className={classNames({ "text-wosmongton-200": !color })}
          style={{ color }}
        >
          {denom}
        </h6>
        <Icon
          id="chevron-right"
          color={color ?? theme.colors.wosmongton[200]}
          className="h-4 w-4"
        />
      </Link>
      <h4>{formatPretty(assetPrice ?? new Dec(0))}</h4>
      <span className={isNumberPositive ? "text-bullish-400" : "text-rust-500"}>
        {isNumberPositive ? "↗️ " : "↘ "}
        {priceChange24h
          ?.maxDecimals(2)
          .inequalitySymbol(false)
          .mul(isNumberPositive ? new Dec(1) : new Dec(-1))
          .toString() ?? ""}
      </span>
    </div>
  );
};
