import { Menu, Transition } from "@headlessui/react";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import React, { Fragment } from "react";

import { Icon } from "~/components/assets";
import { Disableable } from "~/components/types";
import { SwapAsset } from "~/hooks/use-swap";
import { formatPretty } from "~/utils/formatter";

interface PriceSelectorProps {
  quoteAsset: SwapAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  tokenSelectionAvailable: boolean;
  showQuoteBalance: boolean;
  quoteFiatBalance: PricePretty;
}

const UI_DEFAULT_STABLES = [
  {
    name: "USDC",
    symbol: "USDC",
    logoURIs: {
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
    },
  },
  {
    name: "Tether",
    symbol: "USDT",
    logoURIs: {
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdt.svg",
    },
  },
];

export default function PriceSelector({
  quoteAsset,
  tokenSelectionAvailable,
  disabled,
  showQuoteBalance,
  quoteFiatBalance,
}: PriceSelectorProps & Disableable) {
  const [tab] = useQueryState("tab");
  const [quote, setQuote] = useQueryState(
    "quote",
    parseAsString.withDefault("USDC")
  );

  return (
    <Menu as="div" className="relative inline-block">
      {({ open }) => (
        <>
          <Menu.Button className="flex w-full items-center justify-between rounded-b-xl border-t border-t-osmoverse-700 bg-osmoverse-850 p-5 md:justify-start">
            <div className="flex w-full items-center justify-between">
              {quoteAsset && (
                <div
                  className={classNames(
                    "flex items-center gap-2 transition-opacity",
                    tokenSelectionAvailable
                      ? "cursor-pointer"
                      : "cursor-default",
                    {
                      "opacity-40": disabled,
                    }
                  )}
                >
                  <span className="body2 text-osmoverse-300">
                    {tab === "buy" ? "Pay with" : "Receive"}
                  </span>
                  {quoteAsset.coinImageUrl && (
                    <div className="h-6 w-6 shrink-0 rounded-full md:h-7 md:w-7">
                      <Image
                        src={quoteAsset.coinImageUrl}
                        alt="token icon"
                        width={24}
                        height={24}
                        priority
                      />
                    </div>
                  )}
                  <span className="md:caption body2 w-32 truncate text-left">
                    {quoteAsset.coinDenom}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                {showQuoteBalance && (
                  <span className="body2 inline-flex text-osmoverse-300">
                    {formatPretty(quoteFiatBalance, {
                      minimumFractionDigits: 5,
                    })}{" "}
                    available
                  </span>
                )}
                <div className="flex h-6 w-6 items-center justify-center">
                  <Icon
                    id="chevron-down"
                    className={classNames(
                      "h-[7px] w-3 text-osmoverse-300 transition-transform",
                      {
                        "rotate-180": open,
                      }
                    )}
                  />
                </div>
              </div>
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
            <Menu.Items className="absolute left-0 z-50 mt-3 flex w-[280px] origin-top-left flex-col rounded-xl bg-osmoverse-800">
              <div className="flex flex-col gap-2 p-2">
                {UI_DEFAULT_STABLES.map(({ name, symbol, logoURIs }) => {
                  const isSelected = quote === symbol;

                  return (
                    <Menu.Item key={name}>
                      {({ active }) => (
                        <button
                          onClick={() => setQuote(symbol)}
                          className={classNames(
                            "flex items-center justify-between rounded-lg py-2 px-3 transition-colors",
                            { "bg-osmoverse-700": active || isSelected }
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src={logoURIs.svg}
                              alt={`${name} logo`}
                              className="h-10 w-10"
                              width={40}
                              height={40}
                            />
                            <div className="flex flex-col gap-1 text-left">
                              <p>{name}</p>
                              <small className="text-sm leading-5 text-osmoverse-300">
                                {symbol}
                              </small>
                            </div>
                          </div>
                          {isSelected && (
                            <Icon
                              id="check-mark-circle"
                              className="h-4 w-4 text-[#CC54C2]"
                            />
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  );
                })}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
