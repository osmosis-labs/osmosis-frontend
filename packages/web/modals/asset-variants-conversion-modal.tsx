import { Dec } from "@keplr-wallet/unit";
import { AssetVariant } from "@osmosis-labs/server/src/queries/complex/portfolio/allocation";
import { useQueries } from "@tanstack/react-query";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { create } from "zustand";

import { Icon } from "~/components/assets";
import { FallbackImg } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation, useWindowSize } from "~/hooks";
import { getSwapMessages, QuoteType } from "~/hooks/use-swap";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useAssetVariantsModalStore = create<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}>((set) => ({
  isOpen: false,
  // isOpen: true,
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
    const { accountStore, chainStore } = useStore();
    const osmosisChainId = chainStore.osmosis.chainId;

    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const { isMobile } = useWindowSize();
    const [checkedVariants, setCheckedVariants] = useState<AssetVariant[]>([]);
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
        onSuccess: (data) => {
          if (data?.assetVariants) {
            setCheckedVariants(
              data?.assetVariants?.map((variant) => variant ?? {}) ?? []
            );
          }
        },
      }
    );

    const prepareRouteInputs = useMemo(
      () =>
        allocationData?.assetVariants?.map((variant) => ({
          tokenInDenom: variant.asset?.coinMinimalDenom ?? "",
          tokenInAmount: variant.amount.toCoin().amount,
          tokenOutDenom: variant.canonicalAsset?.coinMinimalDenom ?? "",
        })) ?? [],
      [allocationData]
    );

    const apiUtils = api.useUtils();

    const quotes = useQueries({
      queries: prepareRouteInputs.map(
        ({ tokenInDenom, tokenInAmount, tokenOutDenom }) => ({
          queryKey: [
            "routeTokenOutGivenIn",
            tokenInDenom,
            tokenInAmount,
            tokenOutDenom,
          ],
          queryFn: () =>
            apiUtils.local.quoteRouter.routeTokenOutGivenIn.fetch(
              {
                tokenInDenom,
                tokenInAmount,
                tokenOutDenom,
              },
              {}
            ),
          staleTime: Infinity,
        })
      ),
    });

    const isLoadingQuotes = quotes.some((result) => result.isLoading);

    const dataQuotes = quotes.map((result) => result.data);

    const convertSelectedAssets = async () => {
      const allSwapMessages = [];

      for (const quote of dataQuotes) {
        console.log("quote", quote);
        if (!quote) continue;

        let slippage = new Dec(0.05);
        // if it's an alloy, or CW pool, let's assume it's a 1:1 swap
        // so, let's remove slippage to convert more of the asset
        if (
          quote.split.length === 1 &&
          quote.split[0].pools.length === 0 &&
          quote.split[0].pools[0].type.startsWith("cosmwasm")
        ) {
          slippage = new Dec(0);
        }

        const swapMessagesConfig = {
          quote: quote,
          // TODO - refactor this to be cleaner
          tokenOutCoinMinimalDenom: quote.amount.currency.coinMinimalDenom,
          tokenOutCoinDecimals: quote.amount.currency.coinDecimals,
          tokenInCoinDecimals:
            checkedVariants.find(
              (variant) =>
                variant.canonicalAsset?.coinMinimalDenom ===
                quote.amount.currency.coinMinimalDenom
            )?.asset?.coinDecimals ?? 0,
          tokenInCoinMinimalDenom:
            checkedVariants.find(
              (variant) =>
                variant.canonicalAsset?.coinMinimalDenom ===
                quote.amount.currency.coinMinimalDenom
            )?.asset?.coinMinimalDenom ?? "",
          maxSlippage: slippage.toString(),
          // coinAmount: quote.amount.toCoin().amount,
          coinAmount: quote.split[0].initialAmount.toString(),
          userOsmoAddress: account?.address ?? "",
          quoteType: "out-given-in" as QuoteType,
        };

        const swapMessages = await getSwapMessages(swapMessagesConfig);
        swapMessages && allSwapMessages.push(...swapMessages);
      }

      console.log("allSwapMessages", allSwapMessages);

      accountStore
        .signAndBroadcast(
          osmosisChainId,
          "convertAssetVariants",
          allSwapMessages,
          undefined,
          undefined,
          undefined,
          (tx) => {
            console.log("tx", tx);
          }
        )
        .catch((e: any) => {
          console.error("Error converting variants", e);
        });
    };

    // should close toast if screen size changes to mobile while shown
    useEffect(() => {
      if (isMobile) {
        // Use timeout to avoid the maximum update depth exceeded error
        setTimeout(onRequestClose, 0);
      }
    }, [isMobile, onRequestClose]);

    const handleSelectAll = () => {
      setCheckedVariants(
        allocationData?.assetVariants?.map((variant) => variant ?? {}) ?? []
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
              isAllocationLoading ||
              checkedVariants.length === allocationData?.assetVariants?.length
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
                <div className="flex w-[262px] min-w-[262px] max-w-[262px] items-center gap-3 py-2 px-4">
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
        <div className="my-3 flex w-full flex-col gap-2">
          <div className="flex w-full">
            <span className="body2 flex flex-1 items-center text-osmoverse-300">
              Conversion fees
            </span>
            <p className="body2 text-white-full">TBD</p>
          </div>
        </div>
        <div className="mt-4 flex w-full">
          <Button
            onClick={() => {
              convertSelectedAssets();
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
            }}
            disabled={checkedVariants.length === 0 || isLoadingQuotes}
            className="w-full"
          >
            {t("assetVariantsConversion.convertSelected")}
          </Button>
        </div>
      </div>
    );
  }
);
