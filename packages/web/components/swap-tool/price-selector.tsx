import { Menu, Transition } from "@headlessui/react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MaybeUserAssetCoin } from "@osmosis-labs/server";
import { Asset } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import React, { Fragment, useEffect, useMemo } from "react";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { AssetLists } from "~/config/generated/asset-lists";
import { useDisclosure, useTranslation } from "~/hooks";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";
import { AddFundsModal } from "~/modals/add-funds";
import { useStore } from "~/stores";
import { formatFiatPrice } from "~/utils/formatter";
import { api } from "~/utils/trpc";

type AssetWithBalance = Asset & MaybeUserAssetCoin;

const UI_DEFAULT_QUOTES = ["USDC", "USDT"];

const VALID_QUOTES = [
  ...UI_DEFAULT_QUOTES,
  "USDC.sol.axl",
  "USDC.sol.wh",
  "USDC.eth.grv",
  "USDC.eth.wh",
  "USDC.matic.axl",
  "USDC.avax.axl",
  "USDC.eth.axl",
  "USDT.sol.axl",
  "USDT.eth.grv",
  "USDT.eth.wh",
  "USDT.matic.axl",
  "USDT.avax.axl",
  "USDT.kava",
  "USDT.eth.pica",
  "USDT.sol.pica",
];

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

export const PriceSelector = observer(() => {
  const { t } = useTranslation();

  const [tab, setTab] = useQueryState("tab");
  const [quote] = useQueryState("quote", parseAsString.withDefault("USDC"));
  const [base, setBase] = useQueryState(
    "from",
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

  const { selectableQuoteDenoms, isLoading: denomsLoading } =
    useOrderbookSelectableDenoms();

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

  const { data: userQuotes, isLoading: balancesLoading } =
    api.edge.assets.getUserAssets.useQuery(
      { userOsmoAddress: wallet?.address },
      {
        enabled: !!wallet?.address,
        select: (data) =>
          data.items
            .map((walletAsset) => {
              if (
                !(tab === "sell" ? UI_DEFAULT_QUOTES : VALID_QUOTES).includes(
                  walletAsset.coinDenom
                )
              ) {
                return undefined;
              }

              const asset = getAssetFromAssetList({
                assetLists: AssetLists,
                symbol: walletAsset.coinDenom,
              });

              // Extrapolate the rawAsset and return the amount and usdValue
              const returnAsset: AssetWithBalance = {
                ...asset!.rawAsset,
                amount: walletAsset.amount,
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
        ({ amount, symbol }) =>
          amount?.toDec().gt(new Dec(0)) ?? UI_DEFAULT_QUOTES.includes(symbol)
      ) ?? [],
    [userQuotes]
  );

  const selectableQuotes = useMemo(() => {
    if (!wallet?.address) {
      return defaultQuotes;
    }

    return tab === "sell"
      ? userQuotesWithoutBalances
      : defaultQuotesWithBalances;
  }, [
    defaultQuotesWithBalances,
    tab,
    userQuotesWithoutBalances,
    defaultQuotes,
    wallet,
  ]);

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
            <Menu.Button
              className="flex items-center justify-between"
              disabled={denomsLoading}
            >
              <div className="flex w-full items-center justify-between">
                {quoteAsset && (
                  <div
                    className={classNames(
                      "flex items-center gap-1 transition-opacity"
                    )}
                  >
                    <span className="body2 text-osmoverse-300">
                      {tab === "buy"
                        ? t("limitOrders.payWith")
                        : t("limitOrders.receive")}
                    </span>
                    <div className="flex items-center gap-2 py-1 pl-1 pr-3">
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
                      <span className="md:caption body2 text-left">
                        {quoteAsset.symbol}
                      </span>
                      <Icon
                        id="chevron-down"
                        className={classNames(
                          "h-[7px] w-3 text-wosmongton-200 transition-transform",
                          {
                            "rotate-180": open,
                          }
                        )}
                      />
                    </div>
                  </div>
                )}
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
              <Menu.Items className="absolute right-0 z-50 flex w-[384px] origin-top-left flex-col rounded-xl border border-solid border-osmoverse-700 bg-osmoverse-800">
                <div className="flex max-h-[336px] flex-col overflow-y-auto border-b border-osmoverse-700 p-2">
                  <SelectableQuotes
                    selectableQuotes={selectableQuotes}
                    userQuotes={userQuotes}
                    balancesLoading={balancesLoading}
                  />
                </div>
                <div className="flex flex-col px-5 py-2">
                  {wallet?.isWalletConnected && tab === "buy" && (
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
});

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
    balancesLoading,
  }: {
    selectableQuotes?: AssetWithBalance[];
    userQuotes?: AssetWithBalance[];
    balancesLoading: boolean;
  }) => {
    const { t } = useTranslation();
    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const [base] = useQueryState("from", parseAsString.withDefault("OSMO"));
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
                    <SkeletonLoader isLoaded={!balancesLoading}>
                      <p className="inline-flex flex-col items-end gap-1 text-osmoverse-300">
                        <span
                          className={classNames({
                            "text-white-full": availableBalance.gt(new Dec(0)),
                          })}
                        >
                          {formatFiatPrice(
                            new PricePretty(
                              DEFAULT_VS_CURRENCY,
                              availableBalance
                            )
                          )}
                        </span>
                        <span className="body2 font-light">
                          {t("pool.available").toLowerCase()}
                        </span>
                      </p>
                    </SkeletonLoader>
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
