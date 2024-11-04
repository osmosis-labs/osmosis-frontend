import type { AssetVariant } from "@osmosis-labs/server";
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
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useAssetVariantsToast,
  useLocalStorageState,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { useConvertVariant } from "~/hooks/use-convert-variant";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const CONVERT_VARIANT_MODAL_SEEN = "convert-variant-modal-seen";

export const useAssetVariantsModalStore = create<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}>((set) => ({
  isOpen: false,
  setIsOpen: (value: boolean) => set({ isOpen: value }),
}));

export const AssetVariantsConversionModal = observer(() => {
  const { logEvent } = useAmplitudeAnalytics();
  const { isOpen, setIsOpen } = useAssetVariantsModalStore();
  useAssetVariantsToast();

  const [, setIsShown] = useLocalStorageState(
    CONVERT_VARIANT_MODAL_SEEN,
    false
  );

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
    if (isOpen) {
      setIsShown(true);
      logEvent([EventName.ConvertVariants.startFlow]);
    }
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen, isMobile, setIsOpen, setIsShown, logEvent]);

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

  const {
    onConvert,
    quote,
    convertFee,
    isLoading,
    isError,
    isConvertingVariant,
    isConvertingThisVariant,
  } = useConvertVariant(variant);

  const conversionDisabled = isLoading || isError || isConvertingVariant;

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
            {convertFee && quote?.swapFee ? (
              t("assetVariantsConversion.conversionFees", {
                fees: quote?.swapFee?.toDec().isZero()
                  ? "0"
                  : `${convertFee} (${quote?.swapFee?.maxDecimals(2)})`,
              })
            ) : (
              <SkeletonLoader className="h-4 w-20" />
            )}
          </span>
          <Button
            size="md"
            className="!h-12"
            disabled={conversionDisabled}
            isLoading={isConvertingThisVariant}
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

const AllocationSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[90px] w-full" />
  </div>
);
