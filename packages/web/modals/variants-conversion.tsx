import { Dec } from "@keplr-wallet/unit";
import type { AssetVariant } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useAsync } from "react-use";
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

export const AssetVariantsConversionModal = observer(() => {
  const { logEvent } = useAmplitudeAnalytics();
  const { isOpen, variantCoinMinimalDenom, setIsOpen } =
    useAssetVariantsModalStore();
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
                  onDoneConverting={() => setIsOpen(false)}
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
  onDoneConverting: () => void;
}> = observer(({ variant, showBottomBorder = true, onDoneConverting }) => {
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

    await accountStore.estimateFee({ wallet: account, messages }).catch((e) => {
      logEvent([
        EventName.ConvertVariants.variantUnavailable,
        { fromToken: variant.amount.currency.coinDenom },
      ]);

      throw e;
    });
  });

  const isUnavailable = Boolean(simulation?.error) || isError;

  const conversionDisabled =
    isLoading ||
    isError ||
    isConvertingVariant ||
    simulation.loading ||
    Boolean(simulation?.error);

  const isButtonLoading = isConvertingThisVariant || simulation.loading;

  // Extracted to add spans to style/differentiate fee details
  const FeeContent = () => {
    if (isLoading || !convertFee || !quote?.swapFee || simulation.loading)
      return <SkeletonLoader className="h-4 w-20" />;

    if (isUnavailable)
      return (
        <span className="caption text-rust-300">
          {t("assetVariantsConversion.unavailable")}
        </span>
      );

    // Free
    if (quote.swapFee.toDec().isZero()) {
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
            ? `(${quote.swapFee.maxDecimals(2)})`
            : quote.swapFee.maxDecimals(2).toString()}
        </span>
      </>
    );
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
          <div className="body2 text-osmoverse-300">{FeeContent()}</div>
          <div className="flex items-center gap-2">
            <Button
              size="md"
              className={classNames("!h-12 !w-fit", {
                "rounded-full !bg-osmoverse-850/60": isButtonLoading,
              })}
              disabled={conversionDisabled}
              isLoading={isButtonLoading}
              onClick={() => onConvert().catch(() => onDoneConverting)}
            >
              {isButtonLoading ? "" : t("assetVariantsConversion.convert")}
            </Button>
          </div>
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
