import { Dec, PricePretty } from "@keplr-wallet/unit";
import { FormattedQuote } from "@osmosis-labs/server";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { AssetVariant } from "@osmosis-labs/server/src/queries/complex/portfolio/allocation";
import { SignOptions } from "@osmosis-labs/stores";
import { useQueries } from "@tanstack/react-query";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useState } from "react";
import { create } from "zustand";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation, useWindowSize } from "~/hooks";
import { getSwapMessages, QuoteType } from "~/hooks/use-swap";
import { ModalBase } from "~/modals";
import { AssetVariantRow } from "~/modals/asset-variants-conversion/asset-variant-row";
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

const getSlippage = (quote: FormattedQuote) => {
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
  return slippage;
};

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
    const { isMobile } = useWindowSize();
    const { t } = useTranslation();

    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const apiUtils = api.useUtils();

    const [checkedVariants, setCheckedVariants] = useState<AssetVariant[]>([]);
    const [isConverting, setIsConverting] = useState(false);

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
        allocationData?.assetVariants?.map((variant) => {
          return {
            tokenInDenom: variant.asset?.coinMinimalDenom ?? "",
            tokenInAmount: variant.amount.toCoin().amount,
            tokenOutDenom: variant.canonicalAsset?.coinMinimalDenom ?? "",
          };
        }) ?? [],
      [allocationData]
    );

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

    const isFetchingQuotes = quotes.some((result) => result.isFetching);

    const dataQuotes = quotes.map((result) => result.data);

    console.log("dataQuotes", dataQuotes);

    const totalConversionFee: Dec = useMemo(() => {
      if (!dataQuotes || checkedVariants.length === 0) return new Dec(0);

      return dataQuotes.reduce((total, quote) => {
        const swapFee = quote?.swapFee;
        total.add(swapFee?.toDec() ?? new Dec(0));
        return total;
      }, new Dec(0));
    }, [dataQuotes, checkedVariants]);

    const convertSelectedAssets = async () => {
      setIsConverting(true);
      // filter out dataQuotes for unchecked asset variants
      const filteredDataQuotes = dataQuotes.reduce((acc, quote, index) => {
        const variant = allocationData?.assetVariants?.[index];
        if (
          variant &&
          checkedVariants.some(
            (checkedVariant) =>
              checkedVariant.asset?.coinMinimalDenom ===
              variant.asset?.coinMinimalDenom
          )
        ) {
          acc.push({ quote, checkedVariant: variant });
        }
        return acc;
      }, [] as { quote: FormattedQuote | undefined; checkedVariant: AssetVariant }[]);

      if (filteredDataQuotes.length === 0) {
        console.warn("No checked variants to convert");
        return;
      }

      console.log("filteredDataQuotes", filteredDataQuotes);

      for (const { quote, checkedVariant } of filteredDataQuotes) {
        if (!quote) continue;

        const slippage = getSlippage(quote);

        const swapMessagesConfig = {
          quote: quote,
          tokenOutCoinMinimalDenom: quote.amount.currency.coinMinimalDenom,
          tokenOutCoinDecimals: quote.amount.currency.coinDecimals,
          tokenInCoinDecimals: checkedVariant.asset?.coinDecimals ?? 0,
          tokenInCoinMinimalDenom: checkedVariant.asset?.coinMinimalDenom ?? "",
          maxSlippage: slippage.toString(),
          coinAmount: quote.split[0].initialAmount.toString(),
          userOsmoAddress: account?.address ?? "",
          quoteType: "out-given-in" as QuoteType,
        };

        console.log("swapMessagesConfig", swapMessagesConfig);

        const swapMessages = await getSwapMessages(swapMessagesConfig);
        if (!swapMessages) continue;

        const signOptions: SignOptions = {
          preferNoSetFee: true,
        };

        try {
          await accountStore.signAndBroadcast(
            accountStore.osmosisChainId,
            "convertAssetVariants",
            swapMessages,
            "Convert Asset Variants -",
            undefined,
            signOptions,
            (tx) => {
              console.log("tx", tx);
            }
          );
        } catch (e: Error | unknown) {
          console.error("Error converting variant", e);
          setIsConverting(false);
          return;
        }
      }

      setIsConverting(false);
    };

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

    // should close modal if screen size changes to mobile while shown
    useEffect(() => {
      if (isMobile) {
        setTimeout(onRequestClose, 0);
      }
    }, [isMobile, onRequestClose]);

    // close modal once user has no variants left to convert
    useEffect(() => {
      if (
        !isAllocationLoading &&
        allocationData &&
        allocationData.assetVariants?.length === 0
      ) {
        setTimeout(onRequestClose, 0);
      }
    }, [isAllocationLoading, allocationData, onRequestClose]);

    return (
      <div className={classNames("overflow-y-auto, mt-4 flex w-full flex-col")}>
        <p className="body1 text-center text-osmoverse-300">
          {t("assetVariantsConversion.description")}{" "}
          <a
            href="https://medium.com/osmosis/alloyed-assets-on-osmosis-unifying-ux-and-solving-liquidity-fragmentation-168831ce8862"
            className="text-wosmongton-300 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("assetVariantsConversion.learnMore")}
          </a>
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
              <AssetVariantRow
                key={variant?.asset?.coinMinimalDenom}
                variant={variant ?? {}}
                isChecked={checkedVariants.includes(variant ?? {})}
                isConverting={isConverting}
                onCheck={() => handleVariantCheck(variant ?? {})}
              />
            ))
          )}
        </div>
        <div className="my-3 flex w-full flex-col gap-2">
          <div className="flex w-full">
            <span className="body2 flex flex-1 items-center text-osmoverse-300">
              Conversion fees
            </span>
            {isFetchingQuotes ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <p className="body2 text-white-full">
                ~
                {new PricePretty(
                  DEFAULT_VS_CURRENCY,
                  totalConversionFee
                ).toString()}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex w-full">
          <Button
            isLoading={isConverting || isFetchingQuotes}
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
            disabled={
              checkedVariants.length === 0 || isFetchingQuotes || isConverting
            }
            className="w-full"
          >
            {t("assetVariantsConversion.convertSelected")}
          </Button>
        </div>
      </div>
    );
  }
);
