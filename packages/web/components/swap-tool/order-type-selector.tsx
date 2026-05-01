import { Dec } from "@osmosis-labs/unit";
import classNames from "classnames";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  ATOM_BASE_DENOM,
  USDC_BASE_DENOM,
} from "~/components/place-limit-tool/defaults";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { useCreateOrderbook } from "~/hooks/limit-orders/use-create-orderbook";
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

  const { selectableBaseAssets, selectableQuoteDenoms, isLoading } =
    useOrderbookSelectableDenoms();

  const hasOrderbook = useMemo(
    () => selectableBaseAssets.some((asset) => asset.coinMinimalDenom === base),
    [base, selectableBaseAssets]
  );

  const selectableQuotes = useMemo(() => {
    return selectableQuoteDenoms[base] ?? [];
  }, [base, selectableQuoteDenoms]);

  useEffect(() => {
    if (hasOrderbook) {
      // Cache has caught up — safe to allow the reset effect again.
      justCreatedRef.current = false;
    }
    if (type === "limit" && !hasOrderbook && !isLoading) {
      if (justCreatedRef.current) return;
      setType("market");
    } else if (
      type === "limit" &&
      !selectableQuotes.some((asset) => asset.coinMinimalDenom === quote) &&
      selectableQuotes.length > 0
    ) {
      setQuote(selectableQuotes[0].coinMinimalDenom);
    }
  }, [
    hasOrderbook,
    setType,
    type,
    selectableQuotes,
    setQuote,
    quote,
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
      { coinMinimalDenom: base },
      { enabled: is18DecimalBase }
    );
  const { data: quotePrice, isLoading: isQuotePriceLoading } =
    api.edge.assets.getAssetPrice.useQuery(
      { coinMinimalDenom: quote },
      { enabled: is18DecimalBase }
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
    { baseDenom: base, quoteDenom: quote },
    { enabled: !isLoading && !hasOrderbook }
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

  const showCreateOption =
    !isLoading &&
    !hasOrderbook &&
    !isVerifyingInFlight &&
    !is18DecimalMismatch &&
    orderbookVerification !== undefined &&
    !orderbookVerification.orderbookExists &&
    orderbookVerification.endpointFunctional;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acknowledgeFee, setAcknowledgeFee] = useState(false);
  // Prevents the !hasOrderbook reset effect from firing immediately after
  // creation while the getPools cache is still catching up.
  const justCreatedRef = useRef(false);

  const { createOrderbook, isCreating } = useCreateOrderbook({
    baseDenom: base,
    quoteDenom: quote,
  });

  const handleConfirmCreate = async () => {
    if (!account?.isWalletConnected) {
      setIsModalOpen(false);
      onOpenWalletSelect({
        walletOptions: [
          { walletType: "cosmos", chainId: accountStore.osmosisChainId },
        ],
      });
      return;
    }
    try {
      await createOrderbook();
      setIsModalOpen(false);
      setAcknowledgeFee(false);
      // Optimistically activate limit tab — orderbook exists on-chain even if
      // SQS / server cache hasn't caught up yet. The ref suppresses the
      // !hasOrderbook reset effect until the cache refreshes.
      justCreatedRef.current = true;
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
                hidden: isLoading,
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
        }}
        baseDenom={base}
        baseSymbol={baseAsset?.coinDenom ?? base}
        quoteDenom={quote}
        quoteSymbol={quoteAsset?.coinDenom ?? quote}
        baseCoinImageUrl={baseAsset?.coinImageUrl}
        quoteCoinImageUrl={quoteAsset?.coinImageUrl}
        isCreating={isCreating}
        acknowledgeFee={acknowledgeFee}
        onAcknowledgeFee={setAcknowledgeFee}
        onConfirm={handleConfirmCreate}
      />
    </>
  );
};
