import { AssetVariant } from "@osmosis-labs/server/src/queries/complex/portfolio/allocation";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { useEffect } from "react";
import { create } from "zustand";

// Import useTranslation
import { Icon } from "~/components/assets";
import { FallbackImg } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useSlippageConfig, useTranslation, useWindowSize } from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useAssetVariantsModalStore = create<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}>((set) => ({
  isOpen: true,
  // isOpen: false,
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

const AssetVariantRow: React.FC<{
  variant: AssetVariant;
}> = ({ variant }) => {
  const { t } = useTranslation();

  // const {
  //   data: routeData,
  //   error: routeError,
  //   isLoading: isRouteLoading,
  // } = api.local.quoteRouter.routeTokenOutGivenIn.useQuery(
  //   {
  //     tokenInDenom: variant.asset?.coinMinimalDenom ?? "",
  //     tokenInAmount: variant.amount.truncate().toString(),
  //     tokenOutDenom: variant.canonicalAsset?.coinMinimalDenom ?? "",
  //     forcePoolId: undefined,
  //   },
  //   {
  //     enabled: !!variant,
  //     refetchOnWindowFocus: false,
  //   }
  // );

  const slippageConfig = useSlippageConfig({
    defaultSlippage: "0.5",
    selectedIndex: 0,
  });

  const swapState = useSwap({
    initialFromDenom: variant.asset?.coinMinimalDenom ?? "",
    initialToDenom: variant.canonicalAsset?.coinMinimalDenom ?? "",
    useQueryParams: false,
    maxSlippage: slippageConfig.slippage.toDec(),
    quoteType: "out-given-in",
  });

  // useEffect(() => {
  //   swapState.inAmountInput.setAmount(variant.amount.truncate().toString());
  // }, [variant.amount, swapState.inAmountInput]);

  // console.log("swapState: ", swapState);

  return (
    <div className="-mx-4 flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-4">
      <div className="flex w-[262px] min-w-[262px] max-w-[262px] items-center gap-3 py-2 px-4">
        <FallbackImg
          src={variant?.asset?.coinImageUrl ?? ""}
          alt={variant?.asset?.coinDenom ?? ""}
          fallbacksrc="/icons/question-mark.svg"
          height={40}
          width={40}
        />
        <div className="flex flex-col gap-1 overflow-hidden">
          <span className="subtitle1 truncate">{variant.asset?.coinName}</span>
          <span className="body2 truncate text-osmoverse-300">
            {variant?.asset?.coinDenom ?? ""}
          </span>
          <span className="caption text-osmoverse-200">
            Amount: {variant.amount.toString()}
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
      <div className="max-w-[96px]">
        <Button
          size="md"
          className="w-full"
          onClick={() => {
            swapState.inAmountInput.setAmount(variant.amount.toString());
            swapState.sendTradeTokenInTx();
          }}
        >
          Convert
        </Button>
      </div>
    </div>
  );
};

const AssetVariantsConversion = observer(
  ({ onRequestClose }: AssetVariantsConversionProps) => {
    const { accountStore } = useStore();
    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const { isMobile } = useWindowSize();
    const { t } = useTranslation();

    const {
      data: allocationData,
      error: allocationError,
      isLoading: isAllocationLoading,
    } = api.local.portfolio.getAllocation.useQuery(
      {
        address: account?.address ?? "",
      },
      {
        enabled: !!account?.address,
        refetchOnWindowFocus: false,
      }
    );

    console.log("allocationData: ", allocationData);

    // console.log("routeData: ", routeData);

    // console.log("Route Data: ", routeData);
    // console.log("Route Error: ", routeError);
    // console.log("Is Route Loading: ", isRouteLoading);

    // should close toast if screen size changes to mobile while shown
    useEffect(() => {
      if (isMobile) {
        // Use timeout to avoid the maximum update depth exceeded error
        setTimeout(onRequestClose, 0);
      }
    }, [isMobile, onRequestClose]);

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
        <div className="mt-4 flex flex-col">
          {isAllocationLoading ? (
            <div className="flex flex-col gap-3">
              {" "}
              <Skeleton className="h-[90px] w-full" />
              <Skeleton className="h-[90px] w-full" />
            </div>
          ) : allocationError ? (
            <p>{t("assetVariantsConversion.errorLoading")}</p>
          ) : (
            allocationData?.assetVariants?.map((variant) => (
              <AssetVariantRow
                key={variant?.asset?.coinMinimalDenom}
                variant={variant ?? {}}
              />
            ))
          )}
        </div>
      </div>
    );
  }
);
