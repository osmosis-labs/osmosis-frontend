import { AssetVariant } from "@osmosis-labs/server/src/queries/complex/portfolio/allocation";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { create } from "zustand";

// Import useTranslation
import { Icon } from "~/components/assets";
import { FallbackImg } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation, useWindowSize } from "~/hooks";
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

export const AssetVariantsConversionModal = () => {
  const { isOpen, setIsOpen } = useAssetVariantsModalStore();

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
      <AssetVariantsConversion onRequestClose={() => setIsOpen(false)} />
    </ModalBase>
  );
};

interface AssetVariantsConversionProps {
  onRequestClose: () => void;
}

const AssetVariantsConversion = observer(
  ({ onRequestClose }: AssetVariantsConversionProps) => {
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const { isMobile } = useWindowSize();
    const [checkedVariants, setCheckedVariants] = useState<AssetVariant[]>([]);
    const { t } = useTranslation();

    console.log("checkedVariants: ", checkedVariants);

    const { data, error, isLoading } =
      api.local.portfolio.getAllocation.useQuery(
        {
          address: account?.address ?? "",
        },
        {
          enabled: !!account?.address,
          refetchOnWindowFocus: false,
          onSuccess: (data) => {
            if (data?.assetVariants) {
              setCheckedVariants(
                data?.assetVariants?.map((variant) => variant ?? {}) ?? []
              );
            }
          },
        }
      );

    console.log("data: ", data);

    // should close toast if screen size changes to mobile while shown
    useEffect(() => {
      if (isMobile) {
        // Use timeout to avoid the maximum update depth exceeded error
        setTimeout(onRequestClose, 0);
      }
    }, [isMobile, onRequestClose]);

    // const convertSelectedAssets = async () => {
    //     console.log("convertSelectedAssets", checkedVariants);

    //     // Iterate over each selected variant
    //     for (const variantDenom of checkedVariants) {
    //         const variant = data?.assetVariants?.find(v => v?.asset?.coinMinimalDenom === variantDenom);
    //         if (variant) {
    //             const canonicalAsset = variant.canonicalAsset; // Get the canonical asset

    //             // Call sendSwapExactAmountInMsg for the canonical asset
    //             try {
    //                 await account?.osmosis.sendSwapExactAmountInMsg(
    //                     // Assuming you need to pass pools and other parameters
    //                     [/* pools */], // Replace with actual pools
    //                     {
    //                         coinMinimalDenom: canonicalAsset?.coinMinimalDenom ?? "",
    //                         amount: /* amount to swap */, // Replace with actual amount
    //                     },
    //                     /* tokenOutMinAmount */ undefined, // Replace with actual min amount if needed
    //                     /* signOptions */ undefined // Replace with actual sign options if needed
    //                 );
    //             } catch (error) {
    //                 console.error("Error sending swap message:", error);
    //             }
    //         }
    //     }
    // };

    const handleSelectAll = () => {
      setCheckedVariants(
        data?.assetVariants?.map((variant) => variant ?? {}) ?? []
      );
    };

    const handleVariantCheck = (variant: AssetVariant) => {
      setCheckedVariants((prevState) =>
        prevState.includes(variant)
          ? prevState.filter((v) => v !== variant)
          : [...prevState, variant]
      );
    };

    return (
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
        <div className="-mx-3 mt-6 flex h-14 items-center">
          <Button
            disabled={
              isLoading ||
              checkedVariants.length === data?.assetVariants?.length
            }
            size="md"
            variant="ghost"
            className="text-wosmongton-200"
            onClick={handleSelectAll}
          >
            {t("assetVariantsConversion.selectAll")}
          </Button>
        </div>
        <div className="flex flex-col">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {" "}
              <Skeleton className="h-[90px] w-full" />
              <Skeleton className="h-[90px] w-full" />
            </div>
          ) : error ? (
            <p>{t("assetVariantsConversion.errorLoading")}</p>
          ) : (
            data?.assetVariants?.map((variant) => (
              <div
                key={variant?.asset?.coinMinimalDenom}
                className="-mx-4 flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 hover:bg-osmoverse-alpha-850" // Added cursor-pointer for better UX
                onClick={() => handleVariantCheck(variant ?? {})}
              >
                <Checkbox
                  // note - check change occurs when row is clicked, not checkbox
                  checked={checkedVariants.includes(variant ?? {})}
                  className="mr-2"
                />
                <div className="flex min-w-[262px] items-center gap-3 py-2 px-4">
                  <FallbackImg
                    src={variant?.asset?.coinImageUrl ?? ""}
                    alt={variant?.asset?.coinDenom ?? ""}
                    fallbacksrc="/icons/question-mark.svg"
                    height={40}
                    width={40}
                  />
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="subtitle1 truncate">
                      {variant.asset?.coinName}
                    </span>
                    <span className="body2 truncate text-osmoverse-300">
                      {variant?.asset?.coinDenom ?? ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Icon
                    id="arrow"
                    height={24}
                    width={24}
                    className="text-osmoverse-300"
                  />
                </div>
                <div className="flex w-[262px] items-center gap-3 py-2 px-4">
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
                                coinName:
                                  variant.canonicalAsset?.coinName ?? "",
                              })}
                            </span>
                            <span className="caption text-osmoverse-300">
                              {t("assetVariantsConversion.tooltipDescription", {
                                coinDenom:
                                  variant.canonicalAsset?.coinDenom ?? "",
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
            ))
          )}
        </div>
        <div className="mt-4 flex w-full">
          <Button
            onClick={() => {
              // convertSelectedAssets();
              // TODO: link up conversion local state logic
              // open modal
              // Convert All
              //   remind me later ✅
              //     in modal, convert all invokes setDoNotShowAgain(true)
              //   remind me later ❌
              //     in modal, convert all invokes setDoNotShowAgain(true)
              // Convert Selected
              //   remind me later ✅
              //     in modal, convert all invokes setDoNotShowAgain(true)
              //   remind me later ❌ (still has remaining alloyed assets)
              //     in modal, convert all invokes setDoNotShowAgain(false)

              // TODO - remove this
              setTimeout(() => {
                onRequestClose();
              }, 3000);
            }}
            disabled={checkedVariants.length === 0}
            className="w-full"
          >
            {t("assetVariantsConversion.convertSelected")}
          </Button>
        </div>
      </div>
    );
  }
);
