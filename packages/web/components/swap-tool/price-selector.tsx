import { Menu, Transition } from "@headlessui/react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MaybeUserAssetCoin } from "@osmosis-labs/server";
import { Asset } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import React, { Fragment, memo, useEffect, useMemo } from "react";

import { Icon } from "~/components/assets";
import { Disableable } from "~/components/types";
import { AssetLists } from "~/config/generated/asset-lists";
import { useDisclosure, useTranslation } from "~/hooks";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";
import { AddFundsModal } from "~/modals/add-funds";
import { useStore } from "~/stores";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { api } from "~/utils/trpc";

interface PriceSelectorProps {
  tokenSelectionAvailable: boolean;
  showQuoteBalance: boolean;
}

type AssetWithBalance = Asset & MaybeUserAssetCoin;

const UI_DEFAULT_QUOTES = ["USDC", "USDT"];

function sortByAmount(
  assetA?: MaybeUserAssetCoin,
  assetB?: MaybeUserAssetCoin
) {
  return (assetA?.amount?.toDec() ?? new Dec(0)).gt(
    assetB?.amount?.toDec() ?? new Dec(0)
  )
    ? -1
    : 1;
}

export const PriceSelector = memo(
  ({
    tokenSelectionAvailable,
    disabled,
    showQuoteBalance,
  }: PriceSelectorProps & Disableable) => {
    const { t } = useTranslation();

    const [tab, setTab] = useQueryState("tab");
    const [quote] = useQueryState("quote", parseAsString.withDefault("USDC"));
    const [base, setBase] = useQueryState(
      "base",
      parseAsString.withDefault("OSMO")
    );
    const [_, setSellOpen] = useQueryState(
      "sellOpen",
      parseAsBoolean.withDefault(false)
    );

    const [__, setBuyOpen] = useQueryState(
      "buyOpen",
      parseAsBoolean.withDefault(false)
    );

    const { selectableQuoteDenoms } = useOrderbookSelectableDenoms();

    const quoteAsset = useMemo(
      () =>
        getAssetFromAssetList({ assetLists: AssetLists, symbol: quote })
          ?.rawAsset as Asset | undefined,
      [quote]
    );

    useEffect(() => {
      if (quote === base) {
        setBase("OSMO");
      }
    }, [base, quote, setBase]);

    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const defaultQuotes = useMemo(
      () =>
        UI_DEFAULT_QUOTES.map(
          (symbol) =>
            getAssetFromAssetList({
              assetLists: AssetLists,
              symbol,
            })?.rawAsset
        ).filter(Boolean) as Asset[],
      []
    );

    const { data: userQuotes } = api.edge.assets.getUserAssets.useQuery(
      { userOsmoAddress: wallet?.address },
      {
        enabled: Boolean(wallet?.address),
        select: (data) =>
          data.items
            .map((walletAsset) => {
              const asset = getAssetFromAssetList({
                assetLists: AssetLists,
                symbol: walletAsset.coinDenom,
              });

              // Extrapolate the rawAsset and return the amount and usdValue
              const returnAsset: AssetWithBalance = {
                ...asset!.rawAsset,
                amount: walletAsset.amount,
                usdValue: walletAsset.usdValue,
              };

              // In the future, we might want to pass every coin instead of just stables.
              return asset?.rawAsset.categories.includes("stablecoin")
                ? returnAsset
                : undefined;
            })
            .filter(Boolean)
            .toSorted(sortByAmount)
            .toSorted((assetA) => {
              const isAssetAAvailable = selectableQuoteDenoms[base]?.some(
                (asset) => asset.coinDenom === assetA?.symbol
              );

              return isAssetAAvailable ? -1 : 1;
            }) as AssetWithBalance[],
      }
    );

    const userQuotesWithoutBalances = useMemo(
      () =>
        (userQuotes ?? [])
          .map(({ amount, usdValue, ...props }) => ({ ...props }))
          .filter(Boolean) as Asset[],
      [userQuotes]
    );

    /**
     * Stablecoin balances or Add funds CTA not shown in Sell trade mode.
     * Sell trades limited to canonical USDC and alloyed USDT.
     */
    const defaultQuotesWithBalances = useMemo(
      () =>
        userQuotes?.filter(
          ({ amount }) => amount?.toDec().gt(new Dec(0)) ?? false
        ) ?? [],
      [userQuotes]
    );

    const selectableQuotes = useMemo(() => {
      return tab === "sell"
        ? userQuotesWithoutBalances
        : defaultQuotesWithBalances;
    }, [defaultQuotesWithBalances, tab, userQuotesWithoutBalances]);

    const quoteAssetWithBalance = useMemo(
      () => userQuotes?.find(({ symbol }) => symbol === quote),
      [quote, userQuotes]
    );

    /**
     * Default selection is highest balance stable.
     * When user changes selection, app should persist
     * selection across both Buy and Sell trade modes.
     */
    //TODO: FIGURE OUT A WAY TO READD THIS
    // useEffect(() => {
    //   if (userQuotes && userQuotes.length > 0) {
    //     setQuote(userQuotes[0].symbol);
    //   }
    // }, [setQuote, userQuotes]);

    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();

    return (
      <>
        <Menu as="div" className="relative inline-block">
          {({ open }) => (
            <>
              <Menu.Button className="flex w-full items-center justify-between rounded-b-2xl border-t border-t-osmoverse-700 bg-osmoverse-850 p-5 md:justify-start">
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
                        {tab === "buy"
                          ? t("limitOrders.payWith")
                          : t("limitOrders.receive")}
                      </span>
                      {quoteAsset.logoURIs && (
                        <div className="h-6 w-6 shrink-0 rounded-full md:h-7 md:w-7">
                          <Image
                            src={
                              quoteAsset.logoURIs.svg ||
                              quoteAsset.logoURIs.png ||
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
                    {showQuoteBalance &&
                      quoteAssetWithBalance &&
                      quoteAssetWithBalance.usdValue && (
                        <span className="body2 inline-flex text-osmoverse-300">
                          {formatPretty(quoteAssetWithBalance.usdValue, {
                            minimumFractionDigits: 5,
                          })}{" "}
                          {t("pool.available").toLowerCase()}
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
                <Menu.Items className="absolute left-0 z-50 flex w-[384px] origin-top-left flex-col rounded-xl border border-solid border-osmoverse-700 bg-osmoverse-800">
                  <div className="no-scrollbar flex max-h-[336px] flex-col overflow-y-auto border-b border-osmoverse-700 p-2">
                    <SelectableQuotes
                      selectableQuotes={selectableQuotes}
                      userQuotes={userQuotes}
                    />
                  </div>
                  <div className="flex flex-col px-5 py-2">
                    {tab === "buy" && (
                      <button
                        type="button"
                        onClick={openAddFundsModal}
                        className="flex w-full items-center justify-between py-3"
                      >
                        <span className="subtitle1 text-left font-semibold text-wosmongton-200">
                          {t("limitOrders.addFunds")}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="relative flex items-center">
                            {/** Here we just display default quotes */}
                            {defaultQuotes.map(({ symbol, logoURIs }, i) => {
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
                    )}
                    <button
                      onClick={() => {
                        if (tab === "buy") {
                          setSellOpen(true);
                        } else {
                          setBuyOpen(true);
                        }
                        setTab("swap");
                      }}
                      className="flex w-full items-center justify-between py-3"
                    >
                      <span className="subtitle1 max-w-[200px] text-left font-semibold text-wosmongton-200">
                        {tab === "buy"
                          ? t("limitOrders.swapFromAnotherAsset")
                          : t("limitOrders.swapToAnotherAsset")}
                      </span>
                      <div className="flex items-center gap-1">
                        {wallet?.address ? (
                          <HighestBalanceAssetsIcons
                            userOsmoAddress={wallet.address}
                          />
                        ) : (
                          <Image
                            src={"/images/quote-swap-from-another-asset.png"}
                            alt=""
                            width={176}
                            height={48}
                            className="h-6 w-[88px]"
                          />
                        )}
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
        <AddFundsModal
          isOpen={isAddFundsModalOpen}
          onRequestClose={closeAddFundsModal}
          from="buy"
        />
      </>
    );
  }
);

function HighestBalanceAssetsIcons({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}) {
  const { data: userSortedAssets } = api.edge.assets.getUserAssets.useQuery(
    { userOsmoAddress },
    {
      select: ({ items }) => {
        return items.sort(sortByAmount).slice(0, 5).reverse();
      },
    }
  );

  return (
    <div className="relative flex h-6 w-[88px] items-center">
      {userSortedAssets?.map(({ coinImageUrl }, i) =>
        coinImageUrl ? (
          <Image
            key={coinImageUrl}
            src={coinImageUrl}
            alt={coinImageUrl}
            width={24}
            height={24}
            className="absolute rounded-full"
            style={{
              right: i * 16,
            }}
          />
        ) : null
      )}
    </div>
  );
}

const SelectableQuotes = observer(
  ({
    selectableQuotes = [],
    userQuotes = [],
  }: {
    selectableQuotes?: AssetWithBalance[];
    userQuotes?: AssetWithBalance[];
  }) => {
    const { t } = useTranslation();
    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const [base] = useQueryState("base", parseAsString.withDefault("OSMO"));
    const [quote, setQuote] = useQueryState(
      "quote",
      parseAsString.withDefault("USDC")
    );
    const [type] = useQueryState("type", parseAsString.withDefault("market"));

    const { selectableQuoteDenoms } = useOrderbookSelectableDenoms();

    return selectableQuotes.map(({ symbol, name, logoURIs }) => {
      const isSelected = quote === symbol;
      const availableBalance =
        userQuotes &&
        (userQuotes.find((u) => u?.symbol === symbol)?.amount?.toDec() ??
          new Dec(0));
      const isDisabled =
        type === "limit" &&
        !selectableQuoteDenoms[base]?.some(
          (asset) => asset.coinDenom === symbol
        );
      return (
        <Menu.Item key={name}>
          {({ active }) => (
            <button
              onClick={() => setQuote(symbol)}
              className={classNames(
                "flex items-center justify-between rounded-lg py-2 px-3 transition-colors disabled:pointer-events-none",
                {
                  "bg-osmoverse-700": active || isSelected,
                  "opacity-50": isDisabled,
                }
              )}
              disabled={isDisabled}
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
                {isDisabled ? (
                  <div className="flex w-[80px] items-end gap-3">
                    <p className="inline-flex flex-col items-end justify-end gap-1 text-end text-osmoverse-300">
                      <span className="body2 font-light">
                        {t("limitOrders.unavailable", {
                          denom: base,
                        })}
                      </span>
                    </p>
                  </div>
                ) : (
                  wallet?.isWalletConnected &&
                  availableBalance &&
                  !availableBalance.isZero() &&
                  !isDisabled && (
                    <p className="inline-flex flex-col items-end gap-1 text-osmoverse-300">
                      <span
                        className={classNames({
                          "text-white-full": availableBalance.gt(new Dec(0)),
                        })}
                      >
                        {formatPretty(
                          new PricePretty(
                            DEFAULT_VS_CURRENCY,
                            availableBalance
                          ),
                          getPriceExtendedFormatOptions(availableBalance)
                        )}
                      </span>
                      <span className="body2 font-light">
                        {t("pool.available").toLowerCase()}
                      </span>
                    </p>
                  )
                )}
                <Icon
                  id="check-mark"
                  width={16}
                  height={16}
                  className={classNames(
                    "text-white h-[16px] w-[16px] rounded-full",
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
    });
  }
);
