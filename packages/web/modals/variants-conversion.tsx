import type { AssetVariant } from "@osmosis-labs/server";
import { getSwapMessages, QuoteOutGivenIn } from "@osmosis-labs/tx";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { useEffect } from "react";
import { create } from "zustand";

// Import useTranslation
import { Icon } from "~/components/assets";
import { FallbackImg } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useAssetVariantsToast, useTranslation, useWindowSize } from "~/hooks";
import { useCoinFiatValue } from "~/hooks/queries/assets/use-coin-fiat-value";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useAssetVariantsModalStore = create<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}>((set) => ({
  isOpen: false,
  setIsOpen: (value: boolean) => set({ isOpen: value }),
}));

export const AssetVariantsConversionModal = observer(() => {
  const { isOpen, setIsOpen } = useAssetVariantsModalStore();
  useAssetVariantsToast();

  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { isMobile } = useWindowSize();
  const { t } = useTranslation();

  const {
    data: portfolioAssetsData,
    error: portfolioAssetsError,
    isLoading: isPortfolioAssetsLoading,
  } = api.local.portfolio.getPortfolioAssets.useQuery(
    {
      address: account?.address ?? "",
    },
    {
      enabled: !!account?.address,
    }
  );

  // should close toast if screen size changes to mobile while shown
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen, isMobile, setIsOpen]);

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      title={
        <h6 className="h6 mt-1 w-full self-center text-center">
          Standardize Assets
        </h6>
      }
      className="bg-osmoverse-900"
    >
      <div className={classNames("overflow-y-auto, mt-4 flex w-full flex-col")}>
        <p className="body1 text-center text-osmoverse-300">
          {t("assetVariantsConversion.description")}{" "}
          <Link
            href="/learn/asset-variants"
            className="text-wosmongton-300 hover:underline"
          >
            {t("assetVariantsConversion.learnMore")}
          </Link>
        </p>
        <div className="mt-4 flex flex-col">
          {isPortfolioAssetsLoading ? (
            <AllocationSkeleton />
          ) : portfolioAssetsError ? (
            <p className="caption mx-auto text-osmoverse-300">
              {t("assetVariantsConversion.errorLoading")}
            </p>
          ) : (
            portfolioAssetsData?.assetVariants.map(
              (variant, index, variants) => (
                <AssetVariantRow
                  key={variant.amount.currency.coinMinimalDenom}
                  variant={variant}
                  showBottomBorder={index !== variants.length - 1}
                />
              )
            )
          )}
        </div>
      </div>
    </ModalBase>
  );
});

const AssetVariantRow: React.FC<{
  variant: AssetVariant;
  showBottomBorder?: boolean;
}> = observer(({ variant, showBottomBorder = true }) => {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const transactionIdentifier = "convertVariant";
  const variantTransactionIdentifier = `${transactionIdentifier}-${variant.amount.currency.coinMinimalDenom}`;

  const amount = variant.amount.toCoin().amount;

  const {
    data: quote,
    isError: isQuoteError,
    isLoading: isQuoteLoading,
  } = api.local.quoteRouter.routeTokenOutGivenIn.useQuery(
    {
      tokenInDenom: variant.amount.currency.coinMinimalDenom,
      tokenInAmount: amount,
      tokenOutDenom: variant.canonicalAsset?.coinMinimalDenom ?? "",
    },
    {
      enabled:
        !!variant.amount.currency.coinMinimalDenom &&
        !!variant.canonicalAsset?.coinMinimalDenom,
    }
  );

  const { fiatValue: feeFiatValue } = useCoinFiatValue(quote?.feeAmount);

  const isLoading =
    isQuoteLoading ||
    account?.txTypeInProgress.startsWith(transactionIdentifier);

  const conversionDisabled =
    isLoading ||
    isQuoteError ||
    !quote ||
    variant.amount.toDec().isZero() ||
    Boolean(account?.txTypeInProgress);

  const onConvert = async () => {
    if (!account?.address) {
      console.error("Cannot convert variant, no account address");
      return;
    }
    if (!quote) {
      console.error("Cannot convert variant, no quote");
      return;
    }

    const messages = await getConvertVariantMessages(
      variant,
      quote,
      amount,
      account.address
    ).catch((e) => (e instanceof Error ? e.message : "Unknown error"));
    if (!messages || typeof messages === "string") {
      console.error(
        "Cannot convert variant, problem getting messages for transaction",
        messages
      );
      return;
    }

    accountStore
      .signAndBroadcast(
        accountStore.osmosisChainId,
        variantTransactionIdentifier,
        messages
      )
      .catch((e) => {
        console.error("Error broadcasting transaction", e);
      });
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-3 rounded-2xl py-4">
        <div className="grid w-full grid-cols-[1fr_1.5rem_1fr_1.5rem] items-center gap-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <FallbackImg
              src={variant.amount.currency.coinImageUrl ?? ""}
              alt={variant.amount.currency.coinDenom ?? ""}
              fallbacksrc="/icons/question-mark.svg"
              height={40}
              width={40}
            />
            <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
              <span className="subtitle1 truncate">{variant.name}</span>
              <span className="body2 truncate text-osmoverse-300">
                {variant.amount.currency.coinDenom ?? ""}
              </span>
            </div>
          </div>
          <Icon
            id="arrow"
            height={24}
            width={24}
            className="text-osmoverse-700"
          />
          <div className="flex grow items-center gap-3 py-2 px-4">
            <FallbackImg
              src={variant?.canonicalAsset?.coinImageUrl ?? ""}
              alt={variant?.canonicalAsset?.coinDenom ?? ""}
              fallbacksrc="/icons/question-mark.svg"
              height={40}
              width={40}
            />
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="subtitle1 truncate">
                {variant.canonicalAsset?.coinName}
              </span>
              <span className="body2 truncate text-osmoverse-300">
                {variant?.canonicalAsset?.coinDenom ?? ""}
              </span>
            </div>
          </div>
          {variant.canonicalAsset?.isAlloyed && (
            <div className="flex items-center justify-center">
              <Tooltip
                arrow={true}
                content={
                  <div className="flex gap-3">
                    <div>
                      <Icon
                        id="alloyed"
                        height={16}
                        width={16}
                        className="text-ammelia-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="caption">
                        {t("assetVariantsConversion.tooltipTitle", {
                          coinName: variant.canonicalAsset?.coinName ?? "",
                        })}
                      </span>
                      <span className="caption text-osmoverse-300">
                        {t("assetVariantsConversion.tooltipDescription", {
                          coinDenom: variant.canonicalAsset?.coinDenom ?? "",
                        })}
                      </span>
                    </div>
                  </div>
                }
              >
                <Icon
                  id="alloyed"
                  height={24}
                  width={24}
                  className="text-osmoverse-alpha-700"
                />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex place-content-between items-center gap-2">
          <span className="body2 text-osmoverse-300">
            {feeFiatValue && quote?.swapFee ? (
              t("assetVariantsConversion.conversionFees", {
                fees: quote?.swapFee?.toDec().isZero()
                  ? "0"
                  : `${feeFiatValue} (${quote?.swapFee?.maxDecimals(2)})`,
              })
            ) : (
              <SkeletonLoader className="h-4 w-20" />
            )}
          </span>
          <Button
            size="md"
            className="!h-12"
            disabled={conversionDisabled}
            isLoading={
              account?.txTypeInProgress === variantTransactionIdentifier
            }
            onClick={onConvert}
          >
            {t("assetVariantsConversion.convert")}
          </Button>
        </div>
      </div>
      {showBottomBorder && <div className="h-px w-full bg-osmoverse-700" />}
    </>
  );
});

/**
 * Converts a variant asset to its canonical form by creating a swap message.
 *
 * @param variant - The asset variant to convert, containing source and destination asset details
 * @param quote - The swap quote containing route and pricing information
 * @param amount - The amount of the source asset to convert
 * @param address - The user's Osmosis address
 * @returns Promise resolving to swap messages, or undefined if conversion not possible
 * @throws Error if token denoms are missing or no quote is found
 */
async function getConvertVariantMessages(
  variant: AssetVariant,
  quote: QuoteOutGivenIn,
  amount: string,
  address: string
) {
  const tokenInDenom = variant.amount.currency.coinMinimalDenom;
  const tokenOutDenom = variant.canonicalAsset?.coinMinimalDenom;

  if (!tokenInDenom || !tokenOutDenom) {
    throw new Error("Missing token denoms");
  }
  if (!quote) {
    throw new Error("No quote found");
  }

  // if it's an alloy, or CW pool, let's assume it's a 1:1 swap
  // so, let's remove slippage to convert more of the asset
  const isAlloyPoolSwap =
    quote.split.length === 1 &&
    quote.split[0].pools.length === 0 &&
    quote.split[0].pools[0].type.startsWith("cosmwasm");

  return await getSwapMessages({
    coinAmount: amount,
    maxSlippage: isAlloyPoolSwap ? "0" : "0.05",
    quote,
    tokenInCoinMinimalDenom: tokenInDenom,
    tokenOutCoinMinimalDenom: tokenOutDenom,
    tokenOutCoinDecimals: variant.canonicalAsset?.coinDecimals ?? 0,
    tokenInCoinDecimals: variant.amount.currency?.coinDecimals ?? 0,
    userOsmoAddress: address,
  });
}

const AllocationSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
  </div>
);
