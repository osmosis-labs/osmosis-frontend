import { Menu, Transition } from "@headlessui/react";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import React, { Fragment, useMemo } from "react";

import { Icon } from "~/components/assets";
import { Disableable } from "~/components/types";
import { AssetLists } from "~/config/generated/asset-lists";
import { SwapAsset } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

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

const UI_DEFAULT_STABLES = ["USDC", "USDT"];

export default function PriceSelector({
  tokenSelectionAvailable,
  disabled,
  showQuoteBalance,
}: PriceSelectorProps & Disableable) {
  const [tab] = useQueryState("tab");
  const [quote, setQuote] = useQueryState(
    "quote",
    parseAsString.withDefault("USDC")
  );

  const quoteAsset = useMemo(
    () => getAssetFromAssetList({ assetLists: AssetLists, symbol: quote }),
    [quote]
  );

  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const defaultStables = useMemo(
    () =>
      UI_DEFAULT_STABLES.map((symbol) =>
        getAssetFromAssetList({
          assetLists: AssetLists,
          symbol,
        })
      ).filter(Boolean),
    []
  );

  const { data: userStables } = api.edge.assets.getUserAssets.useQuery(
    { userOsmoAddress: wallet?.address },
    {
      enabled: !!wallet?.address,
      select: (data) =>
        data.items.filter(({ coinDenom }) => {
          const asset = getAssetFromAssetList({
            assetLists: AssetLists,
            symbol: coinDenom,
          });

          /**
           * TEMP
           *
           * Waiting for fix on the assetlist for USDC not
           * having "stablecoin" value in the "categories" array
           */
          if (asset?.symbol === "USDC") return true;

          return asset?.rawAsset.categories.includes("stablecoin");
        }),
    }
  );

  const quoteAssetWithBalance = useMemo(
    () => userStables?.find(({ coinDenom }) => coinDenom === quote),
    [quote, userStables]
  );

  const userDefaultStablesBalances = useMemo(() => {
    return defaultStables
      .map((defStable) => {
        const defInUserStables = userStables?.find(
          ({ coinDenom }) => defStable!.symbol === coinDenom
        );

        if (!defInUserStables) return;

        return defInUserStables;
      })
      .filter(Boolean)
      .sort((a, b) =>
        a?.usdValue?.toDec().gt(b?.usdValue?.toDec()!) ? 1 : -1
      );
  }, [defaultStables, userStables]);

  // const selectableStablecoins = useMemo(() => {
  //   if (!wallet?.isWalletConnected) return defaultStables;

  //   if (userStables && userHasDefaultStablesBalance) {
  //   }
  // }, [defaultStables, userStables, wallet?.isWalletConnected]);

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
                  {quoteAsset.rawAsset.logoURIs && (
                    <div className="h-6 w-6 shrink-0 rounded-full md:h-7 md:w-7">
                      <Image
                        src={
                          quoteAsset.rawAsset.logoURIs.svg ||
                          quoteAsset.rawAsset.logoURIs.png ||
                          ""
                        }
                        alt={`${quoteAsset.symbol} icon`}
                        width={24}
                        height={24}
                        priority
                      />
                    </div>
                  )}
                  <span className="md:caption body2 w-32 truncate text-left">
                    {quoteAsset.symbol}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                {showQuoteBalance && quoteAssetWithBalance && (
                  <span className="body2 inline-flex text-osmoverse-300">
                    {formatPretty(quoteAssetWithBalance.usdValue!, {
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
            <Menu.Items className="absolute left-0 z-50 mt-3 flex w-[384px] origin-top-left flex-col rounded-xl border border-solid border-osmoverse-700 bg-osmoverse-800">
              <div className="flex flex-col border-b border-osmoverse-700 p-2">
                {defaultStables.map((stable) => {
                  const {
                    symbol,
                    rawAsset: { name, logoURIs },
                  } = stable!;
                  const isSelected = quote === symbol;
                  const availableBalance =
                    userDefaultStablesBalances.find(
                      (u) => u?.coinDenom === stable?.symbol
                    )?.usdValue ?? new PricePretty(DEFAULT_VS_CURRENCY, 0);

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
                              src={logoURIs.svg || logoURIs.png || ""}
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
                          <div className="flex items-center gap-3">
                            {wallet?.isWalletConnected && (
                              <p className="inline-flex flex-col items-end gap-1 text-osmoverse-300">
                                <span
                                  className={classNames({
                                    "text-white-full": availableBalance
                                      .toDec()
                                      .gt(new Dec(0)),
                                  })}
                                >
                                  {formatPretty(availableBalance)}
                                </span>
                                <span className="body2 font-light">
                                  available
                                </span>
                              </p>
                            )}
                            <Icon
                              id="check-mark-circle"
                              className={classNames(
                                "h-4 w-4 rounded-full text-[#CC54C2]",
                                {
                                  "opacity-0": !isSelected,
                                }
                              )}
                            />
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                  );
                })}
              </div>
              <div className="flex flex-col px-5 py-2">
                <button className="flex w-full items-center justify-between py-3">
                  <span className="subtitle1 font-semibold text-wosmongton-200">
                    Add funds
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="relative flex items-center">
                      {defaultStables.map((stable, i) => {
                        const {
                          symbol,
                          rawAsset: { logoURIs },
                        } = stable!;

                        return (
                          <Image
                            key={`${symbol}-logo`}
                            alt=""
                            src={logoURIs.svg || logoURIs.png || ""}
                            width={24}
                            height={24}
                            className={classNames("h-6 w-6", {
                              "-ml-2": i > 0,
                            })}
                          />
                        );
                      })}
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center">
                      <Icon
                        id="chevron-right"
                        className="h-3 w-[7px] text-osmoverse-300"
                      />
                    </div>
                  </div>
                </button>
                <button className="flex w-full items-center justify-between py-3">
                  <span className="subtitle1 font-semibold text-wosmongton-200">
                    Swap from another asset
                  </span>
                  <div className="flex items-center gap-1">
                    <Image
                      src={"/images/quote-swap-from-another-asset.png"}
                      alt=""
                      width={176}
                      height={48}
                      className="h-6 w-[88px]"
                    />
                    <div className="flex h-6 w-6 items-center justify-center">
                      <Icon
                        id="chevron-right"
                        className="h-3 w-[7px] text-osmoverse-300"
                      />
                    </div>
                  </div>
                </button>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
