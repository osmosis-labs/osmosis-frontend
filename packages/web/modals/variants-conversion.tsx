import type { AssetVariant } from "@osmosis-labs/server";
import { InsufficientBalanceForFeeError } from "@osmosis-labs/stores";
import { Dec, PricePretty, RatePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAsync } from "react-use";
import { create } from "zustand";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { EntityImage } from "~/components/ui/entity-image";
import { Skeleton } from "~/components/ui/skeleton";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useAssetVariantsToast,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import {
  getConvertVariantMessages,
  useConvertVariant,
} from "~/hooks/use-convert-variant";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useAssetVariantsModalStore = create<{
  isOpen: boolean;
  variantCoinMinimalDenom?: string;
  setIsOpen: (value: boolean) => void;
  setIsOpenForVariant: (variantCoinMinimalDenom: string | undefined) => void;
}>((set) => ({
  isOpen: false,
  variantCoinMinimalDenom: undefined,
  setIsOpen: (value: boolean) =>
    // Reset variantCoinMinimalDenom when modal is closed or opened
    set({ isOpen: value, variantCoinMinimalDenom: undefined }),
  setIsOpenForVariant: (variantCoinMinimalDenom: string | undefined) =>
    set({ isOpen: true, variantCoinMinimalDenom }),
}));

const FeeContent: React.FC<{
  isLoading: boolean;
  convertFee?: PricePretty;
  swapFee?: RatePretty;
  isUnavailable: boolean;
  simulation: { loading: boolean };
}> = ({ isLoading, convertFee, swapFee, isUnavailable, simulation }) => {
  const { t } = useTranslation();

  if (isLoading || !convertFee || !swapFee || simulation.loading)
    return <SkeletonLoader className="h-4 w-20" />;

  if (isUnavailable)
    return (
      <span className="caption text-rust-300">
        {t("assetVariantsConversion.unavailable")}
      </span>
    );

  // Free
  if (swapFee.toDec().isZero()) {
    return (
      <>
        {`${t("assetVariantsConversion.conversionFees")}: `}
        <span className="text-bullish-400">
          {t("assetVariantsConversion.free")}
        </span>
      </>
    );
  }

  /**
   * Put an upper bound on the convert fee since
   * low liq variants can have wildly high prices if the pool is imbalanced.
   */
  const showConvertFee =
    convertFee.toDec().isPositive() && convertFee.toDec().lt(new Dec(10_000));

  // Fees
  return (
    <>
      {`${t("assetVariantsConversion.conversionFees")}: `}
      {showConvertFee && (
        <>
          <span className="text-white-100">{`${convertFee}`}</span>{" "}
        </>
      )}
      <span className="text-osmoverse-500">
        {showConvertFee
          ? `(${swapFee.maxDecimals(2)})`
          : swapFee.maxDecimals(2).toString()}
      </span>
    </>
  );
};

export const AssetVariantsConversionModal = observer(() => {
  const { logEvent } = useAmplitudeAnalytics();
  const { isOpen, variantCoinMinimalDenom, setIsOpen } =
    useAssetVariantsModalStore();
  useAssetVariantsToast();

  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { isMobile } = useWindowSize();
  const { t } = useTranslation();

  // Lift fee-token availability from row-level simulations: if any row's
  // estimateFee throws InsufficientBalanceForFeeError, show a single shared
  // banner at the top of the modal instead of repeating it per row (the cause
  // is the wallet's fee balance, not the variant).
  //
  // Tracked per-row in a denom-keyed map so that a row clearing its error
  // (e.g. user adds OSMO to cover gas) flips the banner off correctly. A flat
  // boolean wouldn't, since rows only ever set true and the modal-level reset
  // only fires on close.
  const [insufficientFeeByDenom, setInsufficientFeeByDenom] = useState<
    Record<string, boolean>
  >({});
  const hasInsufficientFeeTokens = Object.values(insufficientFeeByDenom).some(
    Boolean
  );

  useEffect(() => {
    if (!isOpen) setInsufficientFeeByDenom({});
  }, [isOpen]);

  const reportInsufficientFeeTokens = useCallback(
    (coinMinimalDenom: string, hasInsufficient: boolean) => {
      setInsufficientFeeByDenom((prev) => {
        if (prev[coinMinimalDenom] === hasInsufficient) return prev;
        return { ...prev, [coinMinimalDenom]: hasInsufficient };
      });
    },
    []
  );

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
      select: (data) => {
        // If the modal is open for a specific variant, filter the assets to only include that variant
        if (variantCoinMinimalDenom) {
          return {
            ...data,
            assetVariants: data.assetVariants.filter(
              (variant) =>
                variant.amount.currency.coinMinimalDenom ===
                variantCoinMinimalDenom
            ),
          };
        }

        return data;
      },
    }
  );

  // Use effect to close modal when no variants left
  // This method, after testing, is more immediate than using tanstack's select
  useEffect(() => {
    if (
      portfolioAssetsData &&
      portfolioAssetsData.assetVariants.length === 0 &&
      isOpen
    ) {
      setIsOpen(false);
    }
  }, [portfolioAssetsData, isOpen, setIsOpen]);

  // Log when opened
  useEffect(() => {
    if (isOpen) {
      logEvent([EventName.ConvertVariants.startFlow]);
    }
  }, [isOpen, logEvent]);

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
          {t("assetVariantsConversion.title")}
        </h6>
      }
      className="bg-osmoverse-900"
    >
      <div className={classNames("overflow-y-auto mt-4 flex w-full flex-col")}>
        <p className="body1 text-center text-osmoverse-300">
          {t("assetVariantsConversion.description")}{" "}
          <a
            href="https://forum.osmosis.zone/t/alloyed-assets-on-osmosis-unifying-ux-and-solving-liquidity-fragmentation/2624"
            className="text-wosmongton-300 hover:underline cursor-pointer"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("assetVariantsConversion.learnMore")}
          </a>
        </p>
        {hasInsufficientFeeTokens && (
          <div className="flex gap-3 border border-osmoverse-700 p-4 rounded-2xl mt-4">
            <Icon
              id="alert-triangle"
              width={20}
              height={20}
              className="text-rust-600 min-w-[20px] mt-1"
            />
            <div className="flex flex-col gap-1">
              <span className="body2 text-base text-rust-500">
                {t("errors.insufficientFeeTokens.title")}
              </span>
              <span className="subtitle2 text-osmoverse-400">
                {t("errors.insufficientFeeTokens.body")}
              </span>
            </div>
          </div>
        )}
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
                  onInsufficientFeeTokens={reportInsufficientFeeTokens}
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
  // Row reports its own coinMinimalDenom alongside the boolean so the parent
  // can pass a single stable callback (e.g. a `useCallback`-ed setter) without
  // having to re-bind the denom in a fresh inline arrow on every render —
  // which would force every row's reporter effect to re-fire on every parent
  // render and rely on the parent's `prev === next` guard alone to prevent
  // cascading state updates.
  onInsufficientFeeTokens?: (
    coinMinimalDenom: string,
    hasInsufficient: boolean
  ) => void;
}> = observer(
  ({ variant, showBottomBorder = true, onInsufficientFeeTokens }) => {
    const { t } = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const {
      onConvert,
      quote,
      convertFee,
      isLoading,
      isError,
      isConvertingVariant,
      isConvertingThisVariant,
    } = useConvertVariant(variant);

    /**
     * Check for error when estimating, in case this variant
     * has very low liquidity and would fail on chain for some reason.
     * If so, block the user from sending tx.
     */
    const simulation = useAsync(async () => {
      if (!account || !quote || !account?.address) return;

      const messages = await getConvertVariantMessages(
        variant,
        quote,
        account.address
      );

      if (!Array.isArray(messages)) return;

      await accountStore
        .estimateFee({ wallet: account, messages })
        .catch((e) => {
          logEvent([
            EventName.ConvertVariants.variantUnavailable,
            { fromToken: variant.amount.currency.coinDenom },
          ]);

          throw e;
        });
    });

    const isUnavailable = Boolean(simulation?.error) || isError;

    // Track the last value reported up to the modal so we can clear the row's
    // contribution on unmount only when it was set to `true`. Using a ref
    // (rather than a cleanup on the reporter effect itself) keeps the cleanup
    // out of the per-dep-change path, avoiding an unnecessary
    // `true -> false -> true` flicker through the parent's per-denom map
    // every time `simulation.error` changes.
    const lastReportedInsufficientRef = useRef(false);

    useEffect(() => {
      // Always report current state (true OR false) so the modal-level banner
      // reflects the latest simulation outcome rather than getting stuck on
      // true once any simulation has ever errored. simulation.loading is
      // ignored deliberately: we only want to reset on a real result, not
      // momentarily flicker the banner off mid-refetch.
      if (simulation.loading) return;
      const hasInsufficient =
        simulation?.error instanceof InsufficientBalanceForFeeError;
      lastReportedInsufficientRef.current = hasInsufficient;
      onInsufficientFeeTokens?.(
        variant.amount.currency.coinMinimalDenom,
        hasInsufficient
      );
    }, [
      simulation?.error,
      simulation.loading,
      onInsufficientFeeTokens,
      variant.amount.currency.coinMinimalDenom,
    ]);

    // Unmount-only: clear this row's contribution to the parent map so a row
    // that unmounts while reporting `true` (e.g. the variant list shrinks, or
    // the modal closes mid-error) doesn't leave a stale `true` entry stuck in
    // `insufficientFeeByDenom` until the modal's own reset effect fires.
    useEffect(() => {
      return () => {
        if (lastReportedInsufficientRef.current) {
          onInsufficientFeeTokens?.(
            variant.amount.currency.coinMinimalDenom,
            false
          );
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const conversionDisabled =
      isLoading ||
      isError ||
      isConvertingVariant ||
      simulation.loading ||
      Boolean(simulation?.error);

    const isButtonLoading = isConvertingThisVariant || simulation.loading;

    return (
      <>
        <div className="flex flex-col justify-between gap-3 rounded-2xl py-4">
          <div className="grid w-full grid-cols-[1fr_1.5rem_1fr_1.5rem] items-center gap-3 py-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <EntityImage
                  logoURIs={
                    variant.amount.currency.coinImageUrl
                      ? {
                          svg: variant.amount.currency.coinImageUrl.replace(
                            /\.(png|svg)$/,
                            ".svg"
                          ),
                          png: variant.amount.currency.coinImageUrl.replace(
                            /\.(png|svg)$/,
                            ".png"
                          ),
                        }
                      : {}
                  }
                  name={variant.amount.currency.coinDenom ?? ""}
                  symbol={variant.amount.currency.coinDenom ?? ""}
                  height={40}
                  width={40}
                />
              </div>
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
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <EntityImage
                  logoURIs={
                    variant?.canonicalAsset?.coinImageUrl
                      ? {
                          svg: variant.canonicalAsset.coinImageUrl.replace(
                            /\.(png|svg)$/,
                            ".svg"
                          ),
                          png: variant.canonicalAsset.coinImageUrl.replace(
                            /\.(png|svg)$/,
                            ".png"
                          ),
                        }
                      : {}
                  }
                  name={variant?.canonicalAsset?.coinDenom ?? ""}
                  symbol={variant?.canonicalAsset?.coinDenom ?? ""}
                  height={40}
                  width={40}
                />
              </div>
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
            <div className="body2 text-osmoverse-300">
              <FeeContent
                isLoading={isLoading}
                convertFee={convertFee}
                swapFee={quote?.swapFee}
                isUnavailable={isUnavailable}
                simulation={simulation}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="md"
                className={classNames("!h-12 !w-fit", {
                  "rounded-full !bg-osmoverse-850/60": isButtonLoading,
                })}
                disabled={conversionDisabled}
                isLoading={isButtonLoading}
                onClick={() =>
                  onConvert().catch((e) => {
                    console.error("Failed to convert", e);
                  })
                }
              >
                {isButtonLoading ? "" : t("assetVariantsConversion.convert")}
              </Button>
            </div>
          </div>
        </div>
        {showBottomBorder && <div className="h-px w-full bg-osmoverse-700" />}
      </>
    );
  }
);

const AllocationSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
  </div>
);
