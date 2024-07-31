import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { Bridge } from "@osmosis-labs/bridge";
import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";
import { useMemo } from "react";

import { Icon } from "~/components/assets";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation, useWindowSize } from "~/hooks";

import { BridgeQuote } from "./use-bridge-quotes";

interface Props {
  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  quotes: BridgeQuote["successfulQuotes"];
  onSelect: (bridge: Bridge) => void;
}

/**
 * Allows user to select alternative bridge provider quotes, with some basic info
 * about the speed or cost of a quote.
 */
export const BridgeProviderDropdown = ({
  selectedQuote,
  quotes: allQuotes,
  onSelect,
}: Props) => {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const { logEvent } = useAmplitudeAnalytics();

  const quotes = useMemo(
    () =>
      allQuotes.sort((a) =>
        a.data.provider.id === selectedQuote.provider.id ? -1 : 1
      ),
    [allQuotes, selectedQuote]
  );

  const fastestQuote = useMemo(() => {
    const minTime = Math.min(
      ...quotes.map((q) => q.data.estimatedTime.asMilliseconds())
    );
    const uniqueFastestQuotes = quotes.filter(
      (q) => q.data.estimatedTime.asMilliseconds() === minTime
    );
    return uniqueFastestQuotes.length === 1
      ? uniqueFastestQuotes[0]
      : undefined;
  }, [quotes]);

  const cheapestQuote = useMemo(() => {
    const minFee = quotes
      .map((q) => q.data.transferFeeFiat?.toDec() ?? new Dec(0))
      .reduce((acc, fee) => {
        if (acc === null || fee.lt(acc)) {
          return fee;
        }
        return acc;
      }, null as Dec | null);

    const uniqueCheapestQuotes = quotes.filter((q) => {
      const feeDec = q.data.transferFeeFiat?.toDec();
      return !isNil(feeDec) && !isNil(minFee) && feeDec.equals(minFee);
    });

    return uniqueCheapestQuotes.length === 1
      ? uniqueCheapestQuotes[0]
      : undefined;
  }, [quotes]);

  return (
    <Menu>
      {({ open }) => (
        <div className="relative">
          <MenuButton
            className="flex items-center gap-2"
            disabled={quotes.length <= 1}
          >
            <Image
              src={selectedQuote.provider.logoUrl}
              alt={`${selectedQuote.provider.id} logo`}
              width={isMobile ? 18 : 20}
              height={isMobile ? 18 : 20}
            />
            <span>{selectedQuote.provider.id}</span>{" "}
            {quotes.length > 1 && (
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
            )}
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            className="z-[1000] mt-3 flex max-h-64 flex-col gap-1 overflow-auto rounded-2xl bg-osmoverse-825 px-2 py-2"
          >
            {quotes.map(
              ({
                data: {
                  provider,
                  estimatedTime,
                  transferFeeFiat,
                  gasCostFiat,
                  expectedOutputFiat,
                },
              }) => {
                const totalFee = transferFeeFiat
                  ?.add(
                    gasCostFiat ??
                      new PricePretty(transferFeeFiat.fiatCurrency, 0)
                  )
                  .toString();
                const isSelected = selectedQuote.provider.id === provider.id;
                const isCheapest =
                  cheapestQuote?.data.provider.id === provider.id;
                const isFastest =
                  fastestQuote?.data.provider.id === provider.id;

                return (
                  <MenuItem key={provider.id}>
                    <button
                      className={classNames(
                        "flex w-full justify-between gap-12 rounded-lg py-2 px-3 data-[active]:bg-osmoverse-700 md:gap-10",
                        {
                          "bg-osmoverse-700": isSelected,
                          "hover:bg-osmoverse-800": !isSelected,
                        }
                      )}
                      onClick={() => {
                        onSelect(provider.id);
                        logEvent([
                          EventName.DepositWithdraw.providerSelected,
                          { bridgeProviderName: provider.id },
                        ]);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={provider.logoUrl}
                          alt={`${provider.id} logo`}
                          width={32}
                          height={32}
                        />
                        <div className="flex flex-col items-start">
                          <span className="body1 md:body2">{provider.id}</span>
                          <div className="flex items-center gap-2">
                            <span className="body2 md:caption text-osmoverse-300">
                              {estimatedTime.humanize()}
                            </span>
                            {/* First quote is the cheapest */}
                            {isCheapest ? (
                              <span className="body2 md:caption text-bullish-400">
                                {t("transfer.cheapest")}
                              </span>
                            ) : isFastest ? (
                              <span className="body2 md:caption text-ammelia-400">
                                {t("transfer.fastest")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col text-end">
                        <p className="body1 md:body2">
                          {expectedOutputFiat.toString()}
                        </p>
                        <p className="body2 md:caption whitespace-nowrap text-osmoverse-200">
                          ~ {totalFee} {t("transfer.fee")}
                        </p>
                      </div>
                    </button>
                  </MenuItem>
                );
              }
            )}
          </MenuItems>
        </div>
      )}
    </Menu>
  );
};
