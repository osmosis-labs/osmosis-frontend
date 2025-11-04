import { Menu, Transition } from "@headlessui/react";
import { DEFAULT_VS_CURRENCY, MaybeUserAssetCoin } from "@osmosis-labs/server";
import { Asset } from "@osmosis-labs/types";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import React, { Fragment, memo, useEffect, useMemo } from "react";

import { Icon } from "~/components/assets";
import {
  ATOM_BASE_DENOM,
  USDC_BASE_DENOM,
  USDT_BASE_DENOM,
} from "~/components/place-limit-tool/defaults";
import { EntityImage } from "~/components/ui/entity-image";
import { EventName } from "~/config";
import {
  AssetLists,
  MainnetAssetSymbols,
} from "~/config/generated/asset-lists";
import {
  Breakpoint,
  useAmplitudeAnalytics,
  useDisclosure,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";
import { AddFundsModal } from "~/modals/add-funds";
import { useStore } from "~/stores";
import { formatFiatPrice } from "~/utils/formatter";
import { api } from "~/utils/trpc";

type AssetWithBalance = Asset & MaybeUserAssetCoin;

const UI_DEFAULT_QUOTES: string[] = [USDC_BASE_DENOM, USDT_BASE_DENOM];

const VALID_QUOTES: string[] = [
  ...UI_DEFAULT_QUOTES,
  // "USDC.sol.wh",
  "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45",
  // "USDC.eth.grv",
  "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
  // "USDC.eth.wh",
  "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
  // "USDC.e.matic.axl",
  "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
  // "USDC.avax.axl",
  "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
  // "USDC.eth.axl",
  "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
  // "USDT.eth.grv",
  "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
  // "USDT.eth.wh",
  "ibc/2108F2D81CBE328F371AD0CEF56691B18A86E08C3651504E42487D9EE92DDE9C",
  // "USDT.kava",
  "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
  // "USDT.eth.pica",
  "ibc/078AD6F581E8115CDFBD8FFA29D8C71AFE250CE952AFF80040CBC64868D44AD3",
  // "USDT.sol.pica",
  "ibc/0233A3F2541FD43DBCA569B27AF886E97F5C03FC0305E4A8A3FAC6AC26249C7A",
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

interface PriceSelectorProps {
  initialBaseDenom: string;
  initialQuoteDenom: string;
}

export const PriceSelector = memo(
  ({
    initialBaseDenom = ATOM_BASE_DENOM,
    initialQuoteDenom = USDC_BASE_DENOM,
  }: PriceSelectorProps) => {
    const { t } = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();

    const [tab, setTab] = useQueryState("tab");
    const [quote, setQuote] = useQueryState(
      "quote",
      parseAsString.withDefault(initialQuoteDenom)
    );
    const [base, setBase] = useQueryState(
      "from",
      parseAsString.withDefault(initialBaseDenom)
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
        getAssetFromAssetList({
          assetLists: AssetLists,
          coinMinimalDenom: quote,
        })?.rawAsset as Asset | undefined,
      [quote]
    );

    useEffect(() => {
      if (quote === base) {
        setBase(ATOM_BASE_DENOM);
      }
    }, [base, quote, setBase]);

    useEffect(() => {
      if (!quoteAsset) {
        setQuote(USDC_BASE_DENOM);
      }
    }, [quoteAsset, setQuote]);

    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const defaultQuotes = useMemo(
      () =>
        UI_DEFAULT_QUOTES.map(
          (coinMinimalDenom) =>
            getAssetFromAssetList({
              assetLists: AssetLists,
              coinMinimalDenom,
            })?.rawAsset
        ).filter(Boolean) as Asset[],
      []
    );

    const { data: userQuotes } = api.edge.assets.getUserAssets.useQuery(
      { userOsmoAddress: wallet?.address },
      {
        enabled: !!wallet?.address,
        select: (data) =>
          data.items
            .map((walletAsset) => {
              if (
                !(tab === "sell" ? UI_DEFAULT_QUOTES : VALID_QUOTES).includes(
                  walletAsset.coinMinimalDenom
                )
              ) {
                return undefined;
              }

              const asset = getAssetFromAssetList({
                assetLists: AssetLists,
                coinMinimalDenom: walletAsset.coinMinimalDenom,
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
                (asset) => asset.coinMinimalDenom === assetA?.coinMinimalDenom
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
        userQuotes?.filter(({ amount, symbol }) => {
          if (UI_DEFAULT_QUOTES.includes(symbol as MainnetAssetSymbols))
            return true;
          return amount?.toDec().gt(new Dec(0)) ?? false;
        }) ?? [],
      [userQuotes]
    );

    const selectableQuotes = useMemo(() => {
      return wallet?.isWalletConnected
        ? tab === "sell"
          ? userQuotesWithoutBalances
          : defaultQuotesWithBalances
        : defaultQuotes;
    }, [
      defaultQuotes,
      defaultQuotesWithBalances,
      tab,
      userQuotesWithoutBalances,
      wallet?.isWalletConnected,
    ]);

    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();

    const { isMobile } = useWindowSize(Breakpoint.sm);

    return (
      <>
        <Menu as="div" className="relative inline-block">
          {({ open }) => (
            <>
              <Menu.Button className="flex items-center justify-between">
                <div className="flex flex-1 items-center justify-between">
                  {quoteAsset && (
                    <div className="flex items-center gap-1 transition-opacity sm:gap-0">
                      <span className="body2 sm:caption whitespace-nowrap text-osmoverse-300">
                        {tab === "buy"
                          ? t("limitOrders.payWith")
                          : t("limitOrders.receive")}
                      </span>
                      <div className="flex items-center gap-2 py-1 pl-1 pr-3 sm:gap-1 sm:py-1.5">
                        {quoteAsset.logoURIs && (
                          <EntityImage
                            width={isMobile ? 20 : 24}
                            height={isMobile ? 20 : 24}
                            logoURIs={quoteAsset.logoURIs}
                            name={quoteAsset.name}
                            symbol={quoteAsset.symbol}
                          />
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
                <Menu.Items className="absolute right-0 z-50 flex w-[384px] max-w-[calc(100vw-2.5rem)] origin-top-left flex-col rounded-xl border border-solid border-osmoverse-700 bg-osmoverse-800">
                  <div className="flex max-h-[336px] flex-col overflow-y-auto border-b border-osmoverse-700 p-2">
                    <SelectableQuotes
                      selectableQuotes={selectableQuotes}
                      userQuotes={userQuotes}
                    />
                  </div>
                  <div className="flex flex-col px-5 py-2">
                    {wallet?.isWalletConnected && tab === "buy" && (
                      <button
                        type="button"
                        onClick={() => {
                          logEvent([EventName.LimitOrder.addFunds]);
                          openAddFundsModal?.();
                        }}
                        className="flex w-full items-center justify-between py-3"
                      >
                        <span className="subtitle1 text-left font-semibold text-wosmongton-200">
                          {t("limitOrders.addFunds")}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="relative flex items-center">
                            {/** Here we just display default quotes */}
                            {defaultQuotes.map(
                              ({ symbol, logoURIs, name }, i) => {
                                return (
                                  <EntityImage
                                    key={`${symbol}-logo`}
                                    width={24}
                                    height={24}
                                    logoURIs={logoURIs}
                                    name={name}
                                    symbol={symbol}
                                    className={classNames("h-6 w-6", {
                                      "-ml-2": i > 0,
                                    })}
                                  />
                                );
                              }
                            )}
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
                      type="button"
                      onClick={() => {
                        logEvent([EventName.LimitOrder.swapFromAnotherAsset]);
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
      {userSortedAssets?.map(({ coinImageUrl, coinName }, i) => (
        <EntityImage
          key={coinImageUrl}
          width={24}
          height={24}
          logoURIs={{
            png: coinImageUrl,
            svg: coinImageUrl,
          }}
          name={coinName}
          symbol={coinName}
          className="absolute rounded-full"
          style={{
            right: i * 16,
          }}
        />
      ))}
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

    const [base] = useQueryState(
      "from",
      parseAsString.withDefault(ATOM_BASE_DENOM)
    );
    const [quote, setQuote] = useQueryState(
      "quote",
      parseAsString.withDefault(USDC_BASE_DENOM)
    );
    const [type] = useQueryState("type", parseAsString.withDefault("market"));

    const { selectableQuoteDenoms } = useOrderbookSelectableDenoms();

    const baseAsset = useMemo(
      () =>
        getAssetFromAssetList({
          assetLists: AssetLists,
          coinMinimalDenom: base,
        })?.rawAsset as Asset | undefined,
      [base]
    );

    return selectableQuotes.map(
      ({ name, logoURIs, symbol, coinMinimalDenom }) => {
        const isSelected = quote === coinMinimalDenom;
        const availableBalance =
          userQuotes &&
          (userQuotes
            .find((u) => u?.coinMinimalDenom === coinMinimalDenom)
            ?.amount?.toDec() ??
            new Dec(0));
        const isDisabled =
          type === "limit" &&
          !selectableQuoteDenoms[base]?.some(
            (asset) => asset.coinMinimalDenom === coinMinimalDenom
          );
        return (
          <Menu.Item key={name}>
            {({ active }) => (
              <button
                type="button"
                onClick={() => setQuote(coinMinimalDenom)}
                className={classNames(
                  "flex items-center justify-between rounded-lg py-2 px-3 transition-colors disabled:pointer-events-none",
                  {
                    "bg-osmoverse-700": active,
                    "opacity-50": isDisabled,
                  }
                )}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-3">
                  <EntityImage
                    width={40}
                    height={40}
                    logoURIs={logoURIs}
                    name={name}
                    symbol={symbol}
                    className="h-10 w-10"
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
                            denom: baseAsset?.symbol ?? base,
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
      }
    );
  }
);
