import { Dec } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import classNames from "classnames";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  ATOM_BASE_DENOM,
  USDC_BASE_DENOM,
} from "~/components/place-limit-tool/defaults";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { EventName } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import {
  useAmplitudeAnalytics,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import {
  clearJustCreatedOrderbook,
  useCreateOrderbook,
  wasOrderbookJustCreated,
} from "~/hooks/limit-orders/use-create-orderbook";
import { useOrderbookSelectableDenoms } from "~/hooks/limit-orders/use-orderbook";
import { CreateOrderbookModal } from "~/modals/create-orderbook";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface UITradeType {
  id: "market" | "limit";
  title: string;
  disabled: boolean;
}

interface OrderTypeSelectorProps {
  initialQuoteDenom?: string;
  initialBaseDenom?: string;
}

export const TRADE_TYPES = ["market", "limit"] as const;

export const OrderTypeSelector = ({
  initialQuoteDenom = USDC_BASE_DENOM,
  initialBaseDenom = ATOM_BASE_DENOM,
}: OrderTypeSelectorProps) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { onOpenWalletSelect } = useWalletSelect();

  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(TRADE_TYPES).withDefault("market")
  );
  const [base] = useQueryState(
    "from",
    parseAsString.withDefault(initialBaseDenom)
  );
  const [quote, setQuote] = useQueryState(
    "quote",
    parseAsString.withDefault(initialQuoteDenom)
  );

  // The "from"/"quote" URL params hold either a symbol (?from=ATOM) or a
  // minimal denom (?from=ibc/...). Every orderbook decision must key on
  // minimal denoms: a raw symbol here made hasOrderbook and the server-side
  // verification miss existing orderbooks (offering creation for pairs that
  // already have one) and would have put the literal symbol into the
  // instantiate message. Unresolvable params stay undefined and creation is
  // not offered (fail closed).
  const baseMinimalDenom = useMemo(
    () =>
      getAssetFromAssetList({
        assetLists: AssetLists,
        coinMinimalDenom: base,
        symbol: base,
      })?.coinMinimalDenom,
    [base]
  );
  const quoteMinimalDenom = useMemo(
    () =>
      getAssetFromAssetList({
        assetLists: AssetLists,
        coinMinimalDenom: quote,
        symbol: quote,
      })?.coinMinimalDenom,
    [quote]
  );

  const { selectableBaseAssets, selectableQuoteDenoms, isLoading } =
    useOrderbookSelectableDenoms();

  const hasOrderbook = useMemo(
    () =>
      selectableBaseAssets.some(
        (asset) => asset.coinMinimalDenom === baseMinimalDenom
      ),
    [baseMinimalDenom, selectableBaseAssets]
  );

  const selectableQuotes = useMemo(() => {
    return baseMinimalDenom
      ? selectableQuoteDenoms[baseMinimalDenom] ?? []
      : [];
  }, [baseMinimalDenom, selectableQuoteDenoms]);

  // Registry entries and creation messages are keyed on resolved minimal
  // denoms; the empty-string fallback matches nothing and the creation hook
  // refuses it, so an unresolvable pair fails closed everywhere.
  const resolvedBase = baseMinimalDenom ?? "";
  const resolvedQuote = quoteMinimalDenom ?? "";

  useEffect(() => {
    if (
      hasOrderbook &&
      justCreatedPairRef.current === `${resolvedBase}:${resolvedQuote}`
    ) {
      // Cache has caught up — safe to allow the reset effect again.
      justCreatedPairRef.current = null;
    }
    const quoteSelectable = selectableQuotes.some(
      (asset) => asset.coinMinimalDenom === quoteMinimalDenom
    );
    if (quoteSelectable) {
      // Canonical pools list reflects the pair — re-arm the quote reset.
      clearJustCreatedOrderbook(resolvedBase, resolvedQuote);
    }
    if (type === "limit" && !hasOrderbook && !isLoading) {
      if (
        justCreatedPairRef.current === `${resolvedBase}:${resolvedQuote}` ||
        wasOrderbookJustCreated(resolvedBase, resolvedQuote)
      )
        return;
      setType("market");
    } else if (
      type === "limit" &&
      !quoteSelectable &&
      selectableQuotes.length > 0 &&
      // Suppress while a just-created orderbook (from either the Limit tab or
      // the Pay With / Receive dropdown) is waiting for the canonical pools
      // list to catch up, or the user's fresh selection would be undone.
      !wasOrderbookJustCreated(resolvedBase, resolvedQuote)
    ) {
      setQuote(selectableQuotes[0].coinMinimalDenom);
    }
  }, [
    hasOrderbook,
    setType,
    type,
    selectableQuotes,
    setQuote,
    quoteMinimalDenom,
    resolvedBase,
    resolvedQuote,
    isLoading,
  ]);

  const { data: baseAsset } = api.edge.assets.getUserAsset.useQuery({
    findMinDenomOrSymbol: base,
  });

  const { data: quoteAsset } = api.edge.assets.getUserAsset.useQuery({
    findMinDenomOrSymbol: quote,
  });

  useEffect(() => {
    switch (type) {
      case "market":
        logEvent([EventName.LimitOrder.marketOrderSelected]);
        break;
      case "limit":
        logEvent([EventName.LimitOrder.limitOrderSelected]);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const is18DecimalBase =
    baseAsset?.coinDecimals === 18 && quoteAsset?.coinDecimals === 6;

  const { data: basePrice, isLoading: isBasePriceLoading } =
    api.edge.assets.getAssetPrice.useQuery(
      { coinMinimalDenom: resolvedBase },
      { enabled: is18DecimalBase && !!baseMinimalDenom }
    );
  const { data: quotePrice, isLoading: isQuotePriceLoading } =
    api.edge.assets.getAssetPrice.useQuery(
      { coinMinimalDenom: resolvedQuote },
      { enabled: is18DecimalBase && !!quoteMinimalDenom }
    );

  const is18DecimalMismatch =
    is18DecimalBase &&
    (isBasePriceLoading ||
      isQuotePriceLoading ||
      basePrice === undefined ||
      quotePrice === undefined ||
      quotePrice.toDec().isZero() ||
      basePrice.toDec().quo(quotePrice.toDec()).lt(new Dec(100)));

  // Verify whether this is a real missing orderbook vs. an endpoint failure.
  // Use fetchStatus instead of isLoading — isLoading is true even when the query
  // is disabled (no data yet), which would permanently grey out the tab for tokens
  // that do have an orderbook. fetchStatus === "fetching" is only true when a
  // request is actually in-flight.
  const {
    data: orderbookVerification,
    isLoading: isVerifying,
    fetchStatus: verifyFetchStatus,
  } = api.edge.orderbooks.verifyOrderbookCreation.useQuery(
    { baseDenom: resolvedBase, quoteDenom: resolvedQuote },
    {
      enabled:
        !isLoading &&
        !hasOrderbook &&
        !!baseMinimalDenom &&
        !!quoteMinimalDenom,
    }
  );

  const isVerifyingInFlight = isVerifying && verifyFetchStatus === "fetching";

  const uiTradeTypes: UITradeType[] = useMemo(
    () => [
      {
        id: "market",
        title: t("limitOrders.market"),
        disabled: false,
      },
      {
        id: "limit",
        title: t("limitOrders.limit"),
        disabled: isLoading || isVerifyingInFlight || !hasOrderbook,
      },
    ],
    [hasOrderbook, isLoading, isVerifyingInFlight, t]
  );

  // The 18-decimal ratio guard can only run once both assets' metadata has
  // loaded; until then its verdict is unknown, so the create affordance must
  // stay hidden or a fast click lands before the guard can say no (and the
  // tooltip would show the raw minimal denom instead of the symbol).
  const isPairMetadataLoading =
    baseAsset === undefined || quoteAsset === undefined;

  const showCreateOption =
    !isLoading &&
    !isPairMetadataLoading &&
    // Both params resolved to listed assets, so the creation message and all
    // gating below key on real minimal denoms.
    !!baseMinimalDenom &&
    !!quoteMinimalDenom &&
    !hasOrderbook &&
    !isVerifyingInFlight &&
    !is18DecimalMismatch &&
    orderbookVerification !== undefined &&
    !orderbookVerification.orderbookExists &&
    orderbookVerification.endpointFunctional &&
    // A pair created this session counts as existing even while the
    // verification data is still catching up, or the UI would invite a
    // duplicate pool-creation tx.
    !wasOrderbookJustCreated(resolvedBase, resolvedQuote);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acknowledgeFee, setAcknowledgeFee] = useState(false);
  // Prevents the !hasOrderbook reset effect from firing immediately after
  // creation while the getPools cache is still catching up. Holds the pair
  // it was created for — a plain boolean would leak the suppression onto
  // other bases if the user switches tokens before the cache refreshes.
  const justCreatedPairRef = useRef<string | null>(null);

  const {
    createOrderbook,
    isCreating,
    error: createError,
    resetError: resetCreateError,
  } = useCreateOrderbook({
    baseDenom: resolvedBase,
    quoteDenom: resolvedQuote,
  });

  const handleConfirmCreate = async () => {
    if (!account?.isWalletConnected) {
      setIsModalOpen(false);
      // Same reset as the other close paths, or the acknowledgement would
      // carry over to the next pair the modal opens for.
      setAcknowledgeFee(false);
      onOpenWalletSelect({
        walletOptions: [
          { walletType: "cosmos", chainId: accountStore.osmosisChainId },
        ],
      });
      return;
    }
    // Re-check the ratio guard at confirm time: the modal can sit open while
    // asset/price data finishes loading, and a guard verdict that arrives
    // after the click must still block the broadcast.
    if (isPairMetadataLoading || is18DecimalMismatch) {
      setIsModalOpen(false);
      setAcknowledgeFee(false);
      return;
    }
    try {
      await createOrderbook();
      setIsModalOpen(false);
      setAcknowledgeFee(false);
      // Optimistically activate limit tab — orderbook exists on-chain even if
      // SQS / server cache hasn't caught up yet. The ref suppresses the
      // !hasOrderbook reset effect until the cache refreshes.
      justCreatedPairRef.current = `${resolvedBase}:${resolvedQuote}`;
      setType("limit");
    } catch {
      // createOrderbook sets error state internally; keep modal open so user sees it
    }
  };

  return (
    <>
      <div className="flex w-max items-center gap-px rounded-3xl border border-osmoverse-700">
        {uiTradeTypes.map(({ disabled, id, title }) => {
          const isSelected = type === id;
          const isLimitWithCreate = id === "limit" && showCreateOption;

          const button = (
            <button
              type="button"
              onClick={() => {
                if (isLimitWithCreate) {
                  setIsModalOpen(true);
                } else {
                  setType(id);
                }
              }}
              className={classNames(
                "sm:body2 -m-px rounded-[22px] px-4 py-3 transition-colors sm:px-3 sm:py-1.5",
                {
                  "hover:bg-osmoverse-850": !isSelected,
                  "bg-osmoverse-700": isSelected,
                  // Greyed out but pointer-events enabled when create option available
                  "opacity-50": disabled && !isLimitWithCreate,
                  "pointer-events-none": disabled && !isLimitWithCreate,
                  "cursor-pointer opacity-50": isLimitWithCreate,
                }
              )}
              disabled={disabled && !isLimitWithCreate}
            >
              <p
                className={classNames("font-semibold", {
                  "text-wosmongton-100": !isSelected,
                })}
              >
                {title}
              </p>
            </button>
          );

          if (isLimitWithCreate) {
            return (
              <GenericDisclaimer
                key={`order-type-selector-${id}`}
                title={t("limitOrders.noOrderbookExists", {
                  denom: baseAsset?.coinDenom ?? base,
                })}
                body={t("limitOrders.clickToCreateOrderbook")}
                containerClassName="!w-fit"
              >
                {button}
              </GenericDisclaimer>
            );
          }

          return (
            <GenericDisclaimer
              disabled={!disabled}
              title={t("limitOrders.unavailable", {
                denom: baseAsset?.coinDenom ?? base,
              })}
              key={`order-type-selector-${id}`}
              containerClassName={classNames("!w-fit", {
                // Also hide while the base asset's metadata loads: the label
                // would otherwise fall back to the raw minimal denom.
                hidden: isLoading || baseAsset === undefined,
              })}
            >
              {button}
            </GenericDisclaimer>
          );
        })}
      </div>

      <CreateOrderbookModal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setAcknowledgeFee(false);
          // The hook outlives the modal, so a failure from this attempt would
          // otherwise still be showing when the modal next opens.
          resetCreateError();
        }}
        baseDenom={base}
        baseSymbol={baseAsset?.coinDenom ?? base}
        quoteDenom={quote}
        quoteSymbol={quoteAsset?.coinDenom ?? quote}
        baseCoinImageUrl={baseAsset?.coinImageUrl}
        quoteCoinImageUrl={quoteAsset?.coinImageUrl}
        isCreating={isCreating}
        error={createError}
        acknowledgeFee={acknowledgeFee}
        onAcknowledgeFee={setAcknowledgeFee}
        onConfirm={handleConfirmCreate}
      />
    </>
  );
};
