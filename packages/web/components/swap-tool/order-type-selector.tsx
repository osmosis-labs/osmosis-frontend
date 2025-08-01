import classNames from "classnames";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import React, { useEffect, useMemo } from "react";

import {
  ATOM_BASE_DENOM,
  USDC_BASE_DENOM,
} from "~/components/place-limit-tool/defaults";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";
import { api } from "~/utils/trpc";

interface UITradeType {
  id: "market" | "limit";
  title: string;
  disabled: boolean;
}

interface OrderTypeSelectorProps {
  initialQuoteDenom?: string;
  initialBaseDenom?: string;
}

export const TRADE_TYPES = ["market", "limit"] as const;

export const OrderTypeSelector = ({
  initialQuoteDenom = USDC_BASE_DENOM,
  initialBaseDenom = ATOM_BASE_DENOM,
}: OrderTypeSelectorProps) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(TRADE_TYPES).withDefault("market")
  );
  const [base] = useQueryState(
    "from",
    parseAsString.withDefault(initialBaseDenom)
  );
  const [quote, setQuote] = useQueryState(
    "quote",
    parseAsString.withDefault(initialQuoteDenom)
  );

  const { selectableBaseAssets, selectableQuoteDenoms, isLoading } =
    useOrderbookSelectableDenoms();

  const hasOrderbook = useMemo(
    () => selectableBaseAssets.some((asset) => asset.coinMinimalDenom === base),
    [base, selectableBaseAssets]
  );

  const selectableQuotes = useMemo(() => {
    return selectableQuoteDenoms[base] ?? [];
  }, [base, selectableQuoteDenoms]);

  useEffect(() => {
    if (type === "limit" && !hasOrderbook && !isLoading) {
      setType("market");
    } else if (
      type === "limit" &&
      !selectableQuotes.some((asset) => asset.coinMinimalDenom === quote) &&
      selectableQuotes.length > 0
    ) {
      setQuote(selectableQuotes[0].coinMinimalDenom);
    }
  }, [
    hasOrderbook,
    setType,
    type,
    selectableQuotes,
    setQuote,
    quote,
    isLoading,
  ]);

  const { data: baseAsset } = api.edge.assets.getUserAsset.useQuery({
    findMinDenomOrSymbol: base,
  });

  useEffect(() => {
    switch (type) {
      case "market":
        logEvent([EventName.LimitOrder.marketOrderSelected]);
        break;
      case "limit":
        logEvent([EventName.LimitOrder.limitOrderSelected]);
        break;
    }
    /**
     * Dependencies are disabled for this hook as we only want to emit
     * events when the user changes order types.
     */

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const uiTradeTypes: UITradeType[] = useMemo(
    () => [
      {
        id: "market",
        title: t("limitOrders.market"),
        disabled: false,
      },
      {
        id: "limit",
        title: t("limitOrders.limit"),
        disabled: isLoading || !hasOrderbook,
      },
    ],
    [hasOrderbook, isLoading, t]
  );

  return (
    <div className="flex w-max items-center gap-px rounded-3xl border border-osmoverse-700">
      {uiTradeTypes.map(({ disabled, id, title }) => {
        const isSelected = type === id;

        return (
          <GenericDisclaimer
            disabled={!disabled}
            title={t("limitOrders.unavailable", {
              denom: baseAsset?.coinDenom ?? base,
            })}
            key={`order-type-selector-${id}`}
            containerClassName={classNames("!w-fit", {
              hidden: isLoading,
            })}
          >
            <button
              type="button"
              onClick={() => setType(id)}
              className={classNames(
                "sm:body2 -m-px rounded-[22px] px-4 py-3 transition-colors disabled:pointer-events-none disabled:opacity-50 sm:px-3 sm:py-1.5",
                {
                  "hover:bg-osmoverse-850": !isSelected,
                  "bg-osmoverse-700": isSelected,
                }
              )}
              disabled={disabled}
            >
              <p
                className={classNames("font-semibold", {
                  "text-wosmongton-100": !isSelected,
                })}
              >
                {title}
              </p>
            </button>
          </GenericDisclaimer>
        );
      })}
    </div>
  );
};
