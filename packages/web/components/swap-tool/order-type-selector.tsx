import classNames from "classnames";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import React, { useEffect, useMemo } from "react";

import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";

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
  initialQuoteDenom,
  initialBaseDenom,
}: OrderTypeSelectorProps) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(TRADE_TYPES).withDefault("market")
  );
  const [base] = useQueryState(
    "from",
    parseAsString.withDefault(!!initialBaseDenom ? initialBaseDenom : "ATOM")
  );
  const [quote, setQuote] = useQueryState(
    "quote",
    parseAsString.withDefault(!!initialQuoteDenom ? initialQuoteDenom : "USDC")
  );

  const { selectableBaseAssets, selectableQuoteDenoms, isLoading } =
    useOrderbookSelectableDenoms();

  const hasOrderbook = useMemo(
    () => selectableBaseAssets.some((asset) => asset.coinDenom === base),
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
      !selectableQuotes.some((asset) => asset.coinDenom === quote) &&
      selectableQuotes.length > 0
    ) {
      setQuote(selectableQuotes[0].coinDenom);
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
    <div className="flex w-max items-center gap-px rounded-3xl border border-osmoverse-700 ">
      {uiTradeTypes.map(({ disabled, id, title }) => {
        const isSelected = type === id;

        return (
          <GenericDisclaimer
            disabled={!disabled}
            title={t("limitOrders.unavailable", { denom: base })}
            key={`order-type-selector-${id}`}
            containerClassName={classNames("!w-fit", {
              hidden: isLoading,
            })}
          >
            <button
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
