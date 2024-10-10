import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { memo, useState } from "react";

// Import useTranslation
import { Icon } from "~/components/assets";
import { FallbackImg } from "~/components/assets";
import { Tooltip } from "~/components/tooltip"; // Ensure Tooltip is imported
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton"; // Ensure Skeleton is imported
import { useTranslation } from "~/hooks";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface AssetVariantsConversionModalProps {
  onRequestClose: () => void;
  isOpen: boolean;
}

export const AssetVariantsConversionModal = memo(
  ({ onRequestClose, isOpen }: AssetVariantsConversionModalProps) => {
    return (
      <ModalBase
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        title={
          <h6 className="h6 mt-1 w-full self-center text-center">
            Standardize Assets
          </h6>
        }
        className="bg-osmoverse-900" // Added pink background color
      >
        <AssetVariantsConversion onRequestClose={onRequestClose} />
      </ModalBase>
    );
  }
);

interface AssetVariantsConversionProps {
  onRequestClose: () => void;
}

const AssetVariantsConversion = observer(
  ({ onRequestClose }: AssetVariantsConversionProps) => {
    const { accountStore } = useStore();
    console.log("onRequestClose: ", onRequestClose);

    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const [checkedVariants, setCheckedVariants] = useState<string[]>([]);

    const { t } = useTranslation();

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
                data?.assetVariants?.map(
                  (variant) => variant?.asset?.coinMinimalDenom ?? ""
                ) ?? []
              );
            }
          },
        }
      );

    const handleSelectAll = () => {
      setCheckedVariants(
        data?.assetVariants?.map(
          (variant) => variant?.asset?.coinMinimalDenom ?? ""
        ) ?? []
      );
    };

    const handleVariantCheck = (coinMinimalDenom: string) => {
      setCheckedVariants((prevState) =>
        prevState.includes(coinMinimalDenom)
          ? prevState.filter((variant) => variant !== coinMinimalDenom)
          : [...prevState, coinMinimalDenom]
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
            className="text-wosmongton-200" // Added h-14 for 56px height
            onClick={handleSelectAll}
          >
            {t("assetVariantsConversion.selectAll")}
          </Button>
        </div>
        <div className="flex flex-col">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {" "}
              {/* Added gap for spacing */}
              <Skeleton className="h-[90px] w-full" /> {/* First skeleton */}
              <Skeleton className="h-[90px] w-full" /> {/* Second skeleton */}
            </div>
          ) : error ? (
            <p>{t("assetVariantsConversion.errorLoading")}</p>
          ) : (
            data?.assetVariants?.map((variant) => (
              <div
                key={variant?.asset?.coinMinimalDenom}
                className="-mx-4 flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 hover:bg-osmoverse-alpha-850" // Added cursor-pointer for better UX
                onClick={() =>
                  handleVariantCheck(variant?.asset?.coinMinimalDenom ?? "")
                }
              >
                <Checkbox
                  // note - check change occurs when row is clicked, not checkbox
                  checked={checkedVariants.includes(
                    variant?.asset?.coinMinimalDenom ?? ""
                  )}
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
                {variant.canonicalAsset?.isAlloyed && ( // Use the isAlloyed function
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
              // TODO: Implement select all functionality
            }}
            className="w-full"
          >
            {t("assetVariantsConversion.convertSelected")}
          </Button>
        </div>
      </div>
    );
  }
);
