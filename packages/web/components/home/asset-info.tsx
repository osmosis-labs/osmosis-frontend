import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import Link from "next/link";
import React from "react";

import { Icon } from "~/components/assets";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

interface AssetInfoProps {
  assetPrice: any;
  denom: string;
  color?: string;
}

export const AssetInfo = ({ assetPrice, denom, color }: AssetInfoProps) => {
  const isNumberPositive = assetPrice?.priceChange24h?.toDec().isPositive();
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
      <h4>{formatPretty(assetPrice?.currentPrice ?? new Dec(0))}</h4>
      <span
        className={isNumberPositive ? "text-bullish-400" : "text-osmoverse-500"}
      >
        {isNumberPositive ? "↗️ " : "↘ "}
        {assetPrice?.priceChange24h
          ?.maxDecimals(2)
          .inequalitySymbol(false)
          .toString() ?? ""}
      </span>
    </div>
  );
};
