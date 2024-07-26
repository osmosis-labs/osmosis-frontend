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

{
  /* <Menu as="div" className="relative inline-block">
      <Menu.Button className="flex items-center gap-2 rounded-[48px] bg-osmoverse-825 py-3 px-4">
        <p className="font-semibold text-wosmongton-200">
          {type === "market" ? t("limitOrders.market") : t("limitOrders.limit")}
        </p>
        <div className="flex h-6 w-6 items-center justify-center">
          <Icon id="chevron-down" className="h-[7px] w-3 text-wosmongton-200" />
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 flex w-[280px] origin-top-right flex-col rounded-xl bg-osmoverse-800">
          <div className="flex items-center border-b border-osmoverse-700 py-3 px-4">
            <p className="text-subtitle1 font-semibold">
              {t("limitOrders.orderType")}
            </p>
          </div>
          <div className="flex flex-col gap-2 p-2">
            {uiTradeTypes.map(({ id, title, description, icon, disabled }) => {
              const isSelected = type === id;

              return (
                <Menu.Item key={title}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => setType(id)}
                      className={classNames(
                        "flex gap-3 rounded-lg py-2 px-3 transition-colors disabled:pointer-events-none",
                        { "bg-osmoverse-700": active || isSelected },
                        { "opacity-50": disabled }
                      )}
                      disabled={disabled}
                    >
                      <div className="flex h-6 w-6 items-center justify-center">
                        <Icon
                          id={icon}
                          className={classNames(
                            "h-6 w-6 text-osmoverse-400 transition-colors",
                            {
                              "text-white-full": active || isSelected,
                            }
                          )}
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <p>{title}</p>
                        <small className="text-sm leading-5 text-osmoverse-300">
                          {description}
                        </small>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu> */
}
