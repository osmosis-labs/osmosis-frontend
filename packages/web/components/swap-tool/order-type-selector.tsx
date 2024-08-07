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
        disabled: !hasOrderbook,
      },
    ],
    [hasOrderbook, t]
  );

  return (
    <div className="flex w-max items-center rounded-3xl border border-osmoverse-700">
      {uiTradeTypes.map(({ disabled, id, title }) => {
        const isSelected = type === id;

        return (
          <GenericDisclaimer
            disabled={!disabled}
            title={`Limit orders unavailable for ${base}`}
            key={`order-type-selector-${id}`}
            containerClassName="!w-fit"
          >
            <button
              onClick={() => setType(id)}
              className={classNames(
                "rounded-[22px] px-4 py-3 transition-colors disabled:pointer-events-none disabled:opacity-50",
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
