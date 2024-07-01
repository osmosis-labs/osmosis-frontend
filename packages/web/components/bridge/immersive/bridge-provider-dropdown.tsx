import { Menu } from "@headlessui/react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { Bridge } from "@osmosis-labs/bridge";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import Image from "next/image";
import { useMemo } from "react";

import { Icon } from "~/components/assets";
import { useBridgeQuote } from "~/components/bridge/immersive/use-bridge-quote";
import { useTranslation } from "~/hooks";

interface Props {
  selectedQuote: NonNullable<
    ReturnType<typeof useBridgeQuote>["selectedQuote"]
  >;
  quotes: ReturnType<typeof useBridgeQuote>["successfulQuotes"];
  onSelect: (bridge: Bridge) => void;
}

export const BridgeProviderDropdown = ({
  selectedQuote,
  quotes,
  onSelect,
}: Props) => {
  const { t } = useTranslation();
  const fastestQuote = useMemo(
    () =>
      quotes.reduce((prev, current) =>
        prev.data.estimatedTime.asMilliseconds() <
        current.data.estimatedTime.asMilliseconds()
          ? prev
          : current
      ),
    [quotes]
  );
  return (
    <Menu>
      {({ open }) => (
        <div className="relative">
          <Menu.Button className="flex items-center gap-2">
            <span>{selectedQuote.provider.id}</span>{" "}
            <Icon
              id="chevron-down"
              width={12}
              height={12}
              className={classNames(
                "text-osmoverse-300 transition-transform duration-150",
                {
                  "rotate-180": open,
                }
              )}
            />
          </Menu.Button>
          <Menu.Items className="absolute top-full right-0 z-[1000] mt-3 flex max-h-64 min-w-[285px] flex-col gap-1 overflow-auto rounded-2xl bg-osmoverse-825 px-2 py-2">
            {quotes.map(
              (
                {
                  data: {
                    provider,
                    estimatedTime,
                    transferFeeFiat,
                    gasCostFiat,
                    expectedOutputFiat,
                  },
                },
                index
              ) => {
                const totalFee = transferFeeFiat
                  ?.add(
                    gasCostFiat ??
                      new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
                  )
                  .toString();
                return (
                  <Menu.Item key={provider.id}>
                    {({ active }) => {
                      const isSelected =
                        selectedQuote.provider.id === provider.id;
                      return (
                        <button
                          className={classNames(
                            "flex w-full justify-between gap-2 rounded-lg py-2 px-3",
                            {
                              "bg-osmoverse-700": active || isSelected,
                              "hover:bg-osmoverse-800": !isSelected,
                            }
                          )}
                          onClick={() => onSelect(provider.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={provider.logoUrl}
                              alt={`${provider.id} logo`}
                              width={32}
                              height={32}
                            />
                            <div className="flex flex-col items-start">
                              <span className="body1">{provider.id}</span>
                              <div className="flex items-center gap-2">
                                <span className="body2 text-osmoverse-300">
                                  {estimatedTime.humanize()}
                                </span>
                                {/* First quote is the cheapest */}
                                {index === 0 && (
                                  <span className="body2 text-bullish-400">
                                    Cheapest
                                  </span>
                                )}
                                {/* Fastest quote */}
                                {index !== 0 &&
                                  fastestQuote.data.provider.id ===
                                    provider.id && (
                                    <span className="body2 text-ammelia-400">
                                      Fastest
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col text-start">
                            <p className="body1">
                              {expectedOutputFiat.toString()}
                            </p>
                            <p className="body2 whitespace-nowrap text-osmoverse-200">
                              ~{totalFee} {t("transfer.fee")}
                            </p>
                          </div>
                        </button>
                      );
                    }}
                  </Menu.Item>
                );
              }
            )}
          </Menu.Items>
        </div>
      )}
    </Menu>
  );
};
