import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import React, { Fragment } from "react";

import { Icon } from "~/components/assets";
import { SpriteIconId } from "~/config";

interface UITradeType {
  id: "market" | "limit" | "recurring";
  title: string;
  description: string;
  icon: SpriteIconId;
}

export const uiTradeTypes: UITradeType[] = [
  {
    id: "market",
    title: "Market Order",
    description: "Buy immediately at best available price",
    icon: "exchange",
  },
  {
    id: "limit",
    title: "Limit Order",
    description: "Buy when BTC price decreases",
    icon: "trade",
  },
  {
    id: "recurring",
    title: "Recurring Order",
    description: "Buy at average price over time",
    icon: "history-uncolored",
  },
];

const TRADE_TYPES = ["market", "limit", "recurring"] as const;

export default function OrderTypeSelector() {
  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(TRADE_TYPES).withDefault("market")
  );

  return (
    <Menu as="div" className="relative inline-block">
      <Menu.Button className="flex items-center gap-2 rounded-[48px] bg-osmoverse-825 py-3 px-4">
        <p className="font-semibold text-wosmongton-200">Market</p>
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
        <Menu.Items className="absolute right-0 z-20 mt-3 flex w-[280px] origin-top-right flex-col rounded-xl bg-osmoverse-800">
          <div className="flex items-center border-b border-osmoverse-700 py-2 px-4">
            <p className="text-subtitle1 font-semibold">Order Type</p>
          </div>
          <div className="flex flex-col gap-2 p-2">
            {uiTradeTypes.map(({ id, title, description, icon }) => {
              const isSelected = type === id;

              return (
                <Menu.Item key={title}>
                  {({ active }) => (
                    <button
                      onClick={() => setType(id)}
                      className={classNames(
                        "flex gap-3 rounded-lg py-2 px-3 transition-colors",
                        { "bg-osmoverse-700": active || isSelected }
                      )}
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
}
