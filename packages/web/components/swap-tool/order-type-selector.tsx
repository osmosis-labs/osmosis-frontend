import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import React, { Fragment, useEffect, useMemo } from "react";

import { Icon } from "~/components/assets";
import { SpriteIconId } from "~/config";
import { useTranslation } from "~/hooks";
import { useOrderbook } from "~/hooks/limit-orders/use-orderbook";

interface UITradeType {
  // id: "market" | "limit" | "recurring";
  id: "market" | "limit";
  title: string;
  description: string;
  icon: SpriteIconId;
  disabled: boolean;
}

// const TRADE_TYPES = ["market", "limit", "recurring"] as const;
export const TRADE_TYPES = ["market", "limit"] as const;

export const OrderTypeSelector = () => {
  const { t } = useTranslation();

  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(TRADE_TYPES).withDefault("market")
  );
  const [base] = useQueryState("base", parseAsString.withDefault("OSMO"));
  const [quote] = useQueryState("quote", parseAsString.withDefault("USDC"));
  const [tab] = useQueryState("tab", parseAsString.withDefault("swap"));

  const { orderbook } = useOrderbook({ baseDenom: base, quoteDenom: quote });

  useEffect(() => {
    if (type === "limit" && !orderbook) {
      setType("market");
    }
  }, [orderbook, setType, type]);

  const uiTradeTypes: UITradeType[] = useMemo(
    () => [
      {
        id: "market",
        title: t("limitOrders.marketOrder.title"),
        description:
          tab === "buy"
            ? t("limitOrders.marketOrder.description.buy")
            : t("limitOrders.marketOrder.description.sell"),
        icon: "exchange",
        disabled: false,
      },
      {
        id: "limit",
        title: t("limitOrders.limitOrder.title"),
        description: !orderbook
          ? t("limitOrders.limitOrder.description.disabled", {
              denom: base,
              quoteDenom: quote,
            })
          : tab === "buy"
          ? t("limitOrders.limitOrder.description.buy", { denom: base })
          : t("limitOrders.limitOrder.description.sell", { denom: base }),
        icon: "trade",
        disabled: !orderbook,
      },
      // {
      //   id: "recurring",
      //   title: t("limitOrders.recurringOrder.title"),
      //   description: t("limitOrders.recurringOrder.description"),
      //   icon: "history-uncolored",
      // },
    ],
    [base, orderbook, t, tab]
  );

  return (
    <Menu as="div" className="relative inline-block">
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
    </Menu>
  );
};
