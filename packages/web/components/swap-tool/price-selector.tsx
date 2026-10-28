import { Menu, Transition } from "@headlessui/react";
import { DEFAULT_VS_CURRENCY, MaybeUserAssetCoin } from "@osmosis-labs/server";
import { Asset } from "@osmosis-labs/types";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import React, { Fragment, memo, useEffect, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import {
  ATOM_BASE_DENOM,
  deferQueryCorrection,
  getAllowedQuoteDenom,
  SELL_QUOTES,
  TRADE_PAIR_QUERY_OPTIONS,
  UI_DEFAULT_QUOTES,
  USDC_BASE_DENOM,
  VALID_QUOTES,
} from "~/components/place-limit-tool/defaults";
import { EntityImage } from "~/components/ui/entity-image";
import { AssetLists } from "~/config/generated/asset-lists";
import {
  Breakpoint,
  useDisclosure,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { wasOrderbookJustCreated } from "~/hooks/limit-orders/use-create-orderbook";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";
import { useOrderbookCreationFlow } from "~/hooks/limit-orders/use-orderbook-creation-flow";
import { useOrderbookRatioGuard } from "~/hooks/limit-orders/use-orderbook-ratio-guard";
import { useWallet } from "~/hooks/use-wallet";
import { AddFundsModal } from "~/modals/add-funds";
import { CreateOrderbookModal } from "~/modals/create-orderbook";
import { formatFiatPrice } from "~/utils/formatter";
import { api } from "~/utils/trpc";

type AssetWithBalance = Asset & MaybeUserAssetCoin;

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

/**
 * Joins bank balances onto the quote allowlist for the tab. Iterates the
 * allowlist, not the balances, so quotes the user holds none of stay listed
 * (the Buy tab always offers the defaults; the Sell tab offers every quote).
 */
export function getUserQuotes(
  balances: { denom: string; coin?: CoinPretty }[],
  tab: string | null
): AssetWithBalance[] {
  return (tab === "sell" ? SELL_QUOTES : VALID_QUOTES)
    .map((coinMinimalDenom) => {
      const asset = getAssetFromAssetList({
        assetLists: AssetLists,
        coinMinimalDenom,
      })?.rawAsset;
      // In the future, we might want to pass every coin instead of just stables.
      if (!asset?.categories.includes("stablecoin")) return undefined;

      const returnAsset: AssetWithBalance = {
        ...asset,
        amount: balances.find(({ denom }) => denom === coinMinimalDenom)?.coin,
      };
      return returnAsset;
    })
    .filter(Boolean)
    .toSorted(sortByAmount)
    .toSorted((a, b) => {
      const ai = UI_DEFAULT_QUOTES.indexOf(a!.coinMinimalDenom);
      const bi = UI_DEFAULT_QUOTES.indexOf(b!.coinMinimalDenom);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }) as AssetWithBalance[];
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

    const [tab, setTab] = useQueryState("tab");
    // Order type: "market" | "limit". Distinct from `tab` (buy | sell | swap).
    const [type] = useQueryState("type", parseAsString.withDefault("market"));
    const [quote, setQuote] = useQueryState(
      "quote",
      parseAsString
        .withDefault(initialQuoteDenom)
        .withOptions(TRADE_PAIR_QUERY_OPTIONS)
    );
    const [base, setBase] = useQueryState(
      "from",
      parseAsString
        .withDefault(initialBaseDenom)
        .withOptions(TRADE_PAIR_QUERY_OPTIONS)
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
        // "quote" may hold a symbol (?quote=USDT) or a minimal denom, like
        // "from" below; resolve either so a symbol-form quote is not mistaken
        // for an unknown asset and reset to USDC.
        getAssetFromAssetList({
          assetLists: AssetLists,
          coinMinimalDenom: quote,
          symbol: quote,
        })?.rawAsset as Asset | undefined,
      [quote]
    );
    const quoteMinimalDenom = quoteAsset?.coinMinimalDenom;

    const baseRawAsset = useMemo(
      () =>
        // "from" may hold a symbol (?from=ATOM) or a minimal denom; resolve
        // either so all orderbook logic below keys on real minimal denoms.
        getAssetFromAssetList({
          assetLists: AssetLists,
          coinMinimalDenom: base,
          symbol: base,
        })?.rawAsset as Asset | undefined,
      [base]
    );
    const baseMinimalDenom = baseRawAsset?.coinMinimalDenom;

    useEffect(() => {
      // Compare resolved denoms so a symbol-form param on one side and a
      // minimal denom on the other still count as the same asset.
      const sameAsset =
        quote === base ||
        (!!quoteMinimalDenom && quoteMinimalDenom === baseMinimalDenom);
      if (sameAsset) {
        return deferQueryCorrection(() => setBase(ATOM_BASE_DENOM));
      }
    }, [base, quote, baseMinimalDenom, quoteMinimalDenom, setBase]);

    // Reset a quote the pickers would not offer (unknown, or not on the
    // allowlist for this tab), so a link cannot select one.
    const isQuoteAllowed = !!getAllowedQuoteDenom(quote, tab);
    useEffect(() => {
      if (!isQuoteAllowed) {
        return deferQueryCorrection(() => setQuote(USDC_BASE_DENOM));
      }
    }, [isQuoteAllowed, setQuote]);

    const { address, isWalletConnected } = useWallet();

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

    // Bank balances rather than the unpaginated `assets.getUserAssets`, which
    // maps every asset listing and times out, leaving the dropdown empty.
    const { data: balances } = api.local.balances.getUserBalances.useQuery(
      { bech32Address: address ?? "" },
      { enabled: !!address }
    );

    const userQuotes = useMemo(
      () => balances && getUserQuotes(balances, tab),
      [balances, tab]
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
     * Sell trades limited to the canonical stables plus legacy Noble USDC
     * (see SELL_QUOTES).
     */
    const defaultQuotesWithBalances = useMemo(() => {
      const filtered =
        userQuotes?.filter(({ amount, coinMinimalDenom }) => {
          // UI_DEFAULT_QUOTES holds minimal denoms, so the zero-balance
          // exemption for the default quotes must compare denoms: comparing
          // the symbol never matched, which balance-gated the defaults and
          // would hide the new default from anyone not yet holding it.
          if (UI_DEFAULT_QUOTES.includes(coinMinimalDenom)) return true;
          return amount?.toDec().gt(new Dec(0)) ?? false;
        }) ?? [];

      // In limit mode, push orderbook-available quotes to the top only after
      // the orderbook data has loaded; avoids reordering before data arrives.
      // Keyed on `type` (market | limit), not `tab` (buy | sell | swap).
      if (
        type !== "limit" ||
        !baseMinimalDenom ||
        !selectableQuoteDenoms[baseMinimalDenom]
      )
        return filtered;

      // Rank-based comparator: sort() must compare both elements, and the
      // stable sort then preserves the incoming order within each group.
      const hasOrderbook = (quote: (typeof filtered)[number]) =>
        selectableQuoteDenoms[baseMinimalDenom]?.some(
          (asset) => asset.coinMinimalDenom === quote.coinMinimalDenom
        )
          ? 1
          : 0;
      return [...filtered].sort((a, b) => hasOrderbook(b) - hasOrderbook(a));
    }, [baseMinimalDenom, selectableQuoteDenoms, type, userQuotes]);

    const selectableQuotes = useMemo(() => {
      return isWalletConnected
        ? tab === "sell"
          ? userQuotesWithoutBalances
          : defaultQuotesWithBalances
        : defaultQuotes;
    }, [
      defaultQuotes,
      defaultQuotesWithBalances,
      tab,
      userQuotesWithoutBalances,
      isWalletConnected,
    ]);

    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();

    const { isMobile } = useWindowSize(Breakpoint.sm);

    // Orderbook creation modal — lives here so it survives Menu close/unmount
    const [pendingCreateQuote, setPendingCreateQuote] = useState<
      AssetWithBalance | undefined
    >();

    const creationFlow = useOrderbookCreationFlow({
      // Resolved minimal denom, never the raw "from" param: a symbol here
      // would end up inside the instantiate message.
      baseDenom: baseMinimalDenom ?? "",
      quoteDenom: pendingCreateQuote?.coinMinimalDenom ?? "",
      onCreated: () => {
        if (pendingCreateQuote) setQuote(pendingCreateQuote.coinMinimalDenom);
        setPendingCreateQuote(undefined);
      },
    });

    const handleOpenOrderbookModal = (asset: AssetWithBalance) => {
      setPendingCreateQuote(asset);
      creationFlow.open();
    };

    return (
      <>
        <Menu as="div" className="relative inline-block">
          {({ open, close }) => (
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
                          <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full md:h-6 md:w-6">
                            <EntityImage
                              width={isMobile ? 20 : 24}
                              height={isMobile ? 20 : 24}
                              logoURIs={quoteAsset.logoURIs}
                              name={quoteAsset.name}
                              symbol={quoteAsset.symbol}
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
                <Menu.Items className="absolute right-0 z-50 flex w-[384px] max-w-[calc(100vw-2.5rem)] origin-top-left flex-col rounded-xl border border-solid border-osmoverse-700 bg-osmoverse-800">
                  <div className="flex max-h-[336px] flex-col overflow-y-auto border-b border-osmoverse-700 p-2">
                    <SelectableQuotes
                      base={base}
                      quote={quote}
                      setQuote={setQuote}
                      selectableQuotes={selectableQuotes}
                      userQuotes={userQuotes}
                      onOpenCreate={(asset) => {
                        close();
                        handleOpenOrderbookModal(asset);
                      }}
                    />
                  </div>
                  <div className="flex flex-col px-5 py-2">
                    {isWalletConnected && tab === "buy" && (
                      <button
                        type="button"
                        onClick={() => {
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
                        {address ? (
                          <HighestBalanceAssetsIcons
                            userOsmoAddress={address}
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
        <CreateOrderbookModal
          {...creationFlow.modalProps}
          baseDenom={base}
          baseSymbol={baseRawAsset?.symbol ?? base}
          quoteDenom={pendingCreateQuote?.coinMinimalDenom ?? ""}
          quoteSymbol={pendingCreateQuote?.symbol ?? ""}
          baseCoinImageUrl={
            baseRawAsset?.logoURIs?.png ?? baseRawAsset?.logoURIs?.svg
          }
          quoteCoinImageUrl={
            pendingCreateQuote?.logoURIs?.png ??
            pendingCreateQuote?.logoURIs?.svg
          }
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
  const { data: userSortedAssets } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: userOsmoAddress },
      {
        select: (balances) =>
          balances
            .flatMap(({ denom, coin }) => {
              const asset = getAssetFromAssetList({
                assetLists: AssetLists,
                coinMinimalDenom: denom,
              })?.rawAsset;
              return asset && coin ? [{ ...asset, amount: coin }] : [];
            })
            .sort(sortByAmount)
            .slice(0, 5)
            .reverse(),
      }
    );

  return (
    <div className="relative flex h-6 w-[88px] items-center">
      {userSortedAssets?.map(
        ({ coinMinimalDenom, logoURIs, name, symbol }, i) => (
          <EntityImage
            key={coinMinimalDenom}
            width={24}
            height={24}
            logoURIs={logoURIs}
            name={name}
            symbol={symbol}
            className="absolute rounded-full"
            style={{
              right: i * 16,
            }}
          />
        )
      )}
    </div>
  );
}

/** Renders a single disabled quote row and exposes whether creation is possible. */
const CreatableQuoteItem = ({
  base,
  baseSymbol,
  baseDecimals,
  coinMinimalDenom,
  quoteDecimals,
  logoURIs,
  name,
  symbol,
  isSelected,
  onOpenCreate,
}: {
  base: string;
  baseSymbol?: string;
  baseDecimals?: number;
  coinMinimalDenom: string;
  quoteDecimals?: number;
  logoURIs?: Asset["logoURIs"];
  name: string;
  symbol: string;
  isSelected: boolean;
  onOpenCreate: () => void;
}) => {
  const { t } = useTranslation();

  const { data: orderbookVerification, isLoading: isVerifying } =
    api.edge.orderbooks.verifyOrderbookCreation.useQuery(
      {
        baseDenom: base,
        quoteDenom: coinMinimalDenom,
      },
      // An empty base means the "from" param did not resolve to a listed
      // asset; keep the row fail-closed (isVerifying stays true).
      { enabled: !!base }
    );

  // Decimals come from the parent's already-loaded asset data: one such row
  // renders per non-selectable quote, so per-row asset queries here would
  // multiply into a request burst every time the dropdown opens. The price
  // queries inside the guard only run for 18-decimal bases.
  const { isBlocked: is18DecimalMismatch } = useOrderbookRatioGuard({
    baseDenom: base,
    quoteDenom: coinMinimalDenom,
    baseDecimals,
    quoteDecimals,
  });

  const canCreate =
    !isVerifying &&
    !is18DecimalMismatch &&
    orderbookVerification !== undefined &&
    !orderbookVerification.orderbookExists &&
    orderbookVerification.endpointFunctional &&
    // A pair created this session counts as existing even while the
    // verification data is still catching up, or the row would invite a
    // duplicate pool-creation tx.
    !wasOrderbookJustCreated(base, coinMinimalDenom);

  return (
    // A Menu.Item (not a bare button) so Headless UI includes the row in
    // its roving keyboard focus list: without it, arrow-key users could
    // never reach the create affordance.
    <Menu.Item disabled={!canCreate}>
      {({ active }) => (
        <button
          type="button"
          onClick={() => {
            if (canCreate) onOpenCreate();
          }}
          className={classNames(
            // Greyed in both states, matching the Limit tab's create
            // affordance: dimmed like an unavailable row, clickable only when
            // creation is possible.
            "flex items-center justify-between rounded-lg py-2 px-3 opacity-50 transition-colors",
            {
              "pointer-events-none": !canCreate,
              "cursor-pointer": canCreate,
              "bg-osmoverse-600": active && canCreate,
            }
          )}
          disabled={!canCreate}
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
            <div className="flex w-[80px] items-end gap-3">
              <p className="inline-flex flex-col items-end justify-end gap-1 text-end text-osmoverse-300">
                <span className="body2 font-light">
                  {canCreate
                    ? t("limitOrders.clickToCreateOrderbook")
                    : t("limitOrders.unavailable", {
                        denom: baseSymbol ?? base,
                      })}
                </span>
              </p>
            </div>
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
};

/**
 * Takes the pair from PriceSelector rather than reading `from`/`quote` itself:
 * with its own hooks it fell back to ATOM when `from` wasn't in the URL (as on
 * asset pages), so limit mode enabled quotes that only ATOM's orderbooks
 * support.
 */
const SelectableQuotes = ({
  base,
  quote,
  setQuote,
  selectableQuotes = [],
  userQuotes = [],
  onOpenCreate,
}: {
  base: string;
  quote: string;
  setQuote: (quote: string) => void;
  selectableQuotes?: AssetWithBalance[];
  userQuotes?: AssetWithBalance[];
  onOpenCreate: (asset: AssetWithBalance) => void;
}) => {
  const { t } = useTranslation();
  const { isWalletConnected } = useWallet();

  const [type] = useQueryState("type", parseAsString.withDefault("market"));

  const { selectableQuoteDenoms } = useOrderbookSelectableDenoms();

  const baseAsset = useMemo(
    () =>
      // "from" may hold a symbol or a minimal denom; resolve either so the
      // creatable rows key on real minimal denoms (an unresolvable base
      // leaves the rows fail-closed).
      getAssetFromAssetList({
        assetLists: AssetLists,
        coinMinimalDenom: base,
        symbol: base,
      })?.rawAsset as Asset | undefined,
    [base]
  );
  const baseMinimalDenom = baseAsset?.coinMinimalDenom;
  // Same symbol-or-denom resolution for the quote, so the selected row
  // highlights correctly for symbol-form URLs (?quote=USDT).
  const quoteMinimalDenom = useMemo(
    () =>
      getAssetFromAssetList({
        assetLists: AssetLists,
        coinMinimalDenom: quote,
        symbol: quote,
      })?.rawAsset.coinMinimalDenom,
    [quote]
  );

  return selectableQuotes.map(
    ({ name, logoURIs, symbol, coinMinimalDenom, decimals }) => {
      const isSelected = (quoteMinimalDenom ?? quote) === coinMinimalDenom;
      const availableBalance =
        userQuotes &&
        (userQuotes
          .find((u) => u?.coinMinimalDenom === coinMinimalDenom)
          ?.amount?.toDec() ??
          new Dec(0));
      const isDisabled =
        type === "limit" &&
        !selectableQuoteDenoms[baseMinimalDenom ?? base]?.some(
          (asset) => asset.coinMinimalDenom === coinMinimalDenom
        );

      if (isDisabled) {
        return (
          <CreatableQuoteItem
            key={name}
            base={baseMinimalDenom ?? ""}
            baseSymbol={baseAsset?.symbol}
            baseDecimals={baseAsset?.decimals}
            coinMinimalDenom={coinMinimalDenom}
            quoteDecimals={decimals}
            logoURIs={logoURIs}
            name={name}
            symbol={symbol}
            isSelected={isSelected}
            onOpenCreate={() => {
              const asset = selectableQuotes.find(
                (q) => q.coinMinimalDenom === coinMinimalDenom
              );
              if (asset) onOpenCreate(asset);
            }}
          />
        );
      }

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
                }
              )}
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
                {isWalletConnected &&
                  availableBalance &&
                  !availableBalance.isZero() && (
                    <p className="inline-flex flex-col items-end gap-1 text-osmoverse-300">
                      <span
                        className={classNames({
                          "text-white-full": availableBalance.gt(new Dec(0)),
                        })}
                      >
                        {formatFiatPrice(
                          new PricePretty(DEFAULT_VS_CURRENCY, availableBalance)
                        )}
                      </span>
                      <span className="body2 font-light">
                        {t("pool.available").toLowerCase()}
                      </span>
                    </p>
                  )}
                <Icon
                  id="check-mark"
                  width={16}
                  height={16}
                  className={classNames(
                    "text-white h-[16px] w-[16px] rounded-full",
                    { "opacity-0": !isSelected }
                  )}
                />
              </div>
            </button>
          )}
        </Menu.Item>
      );
    }
  );
};
