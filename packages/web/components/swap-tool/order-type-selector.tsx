import classNames from "classnames";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import React, { useEffect, useMemo } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";

interface UITradeType {
  // id: "market" | "limit" | "recurring";
  id: "market" | "limit";
  title: string;
  disabled: boolean;
}

// const TRADE_TYPES = ["market", "limit", "recurring"] as const;
export const TRADE_TYPES = ["market", "limit"] as const;

export const OrderTypeSelector = () => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(TRADE_TYPES).withDefault("market")
  );
  const [base] = useQueryState("from", parseAsString.withDefault("ATOM"));
  const [quote, setQuote] = useQueryState(
    "quote",
    parseAsString.withDefault("USDC")
  );
  const [tab] = useQueryState("tab", parseAsString.withDefault("swap"));

  const { selectableBaseAssets, selectableQuoteDenoms } =
    useOrderbookSelectableDenoms();

  const hasOrderbook = useMemo(
    () => selectableBaseAssets.some((asset) => asset.coinDenom === base),
    [base, selectableBaseAssets]
  );

  const selectableQuotes = useMemo(() => {
    return selectableQuoteDenoms[base] ?? [];
  }, [base, selectableQuoteDenoms]);

  useEffect(() => {
    if (type === "limit" && !hasOrderbook) {
      setType("market");
    } else if (
      type === "limit" &&
      !selectableQuotes.some((asset) => asset.coinDenom === quote) &&
      selectableQuotes.length > 0
    ) {
      setQuote(selectableQuotes[0].coinDenom);
    }
  }, [hasOrderbook, setType, type, selectableQuotes, setQuote, quote]);

  useEffect(() => {
    switch (type) {
      case "market":
        logEvent([EventName.LimitOrder.marketOrderSelected]);
        break;
      case "limit":
        logEvent([EventName.LimitOrder.limitOrderSelected]);
        break;
    }
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
        disabled: !hasOrderbook,
      },
      // {
      //   id: "recurring",
      //   title: t("limitOrders.recurringOrder.title"),
      //   description: t("limitOrders.recurringOrder.description"),
      //   icon: "history-uncolored",
      // },
    ],
    [hasOrderbook, t]
  );

  return (
    <div className="flex w-max items-center rounded-3xl border border-osmoverse-700">
      {uiTradeTypes.map(({ disabled, id, title }) => {
        const isSelected = type === id;

        return (
          <button
            key={`order-type-selecto-${id}`}
            onClick={() => setType(id)}
            className={classNames(
              "rounded-3xl px-4 py-3 transition-colors disabled:pointer-events-none disabled:opacity-50",
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
        );
      })}
    </div>
  );
};
