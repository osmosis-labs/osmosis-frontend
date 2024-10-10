import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { memo, useState } from "react";

import { Icon } from "~/components/assets";
import { FallbackImg } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface AssetVariantsConversionModalProps {
  onRequestClose: () => void;
}

export const AssetVariantsConversionModal = memo(
  ({ onRequestClose }: AssetVariantsConversionModalProps) => {
    return (
      <ModalBase
        isOpen={true}
        onRequestClose={onRequestClose}
        title={
          <h6 className="h6 mt-1 w-full self-center text-center">
            Standardize Assets
          </h6>
        }
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
    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const [checkedVariants, setCheckedVariants] = useState<string[]>([]);

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
                data.assetVariants.map(
                  (variant) => variant.asset.coinMinimalDenom
                )
              );
            }
          },
        }
      );

    const handleSelectAll = () => {
      setCheckedVariants(
        data?.assetVariants.map((variant) => variant.asset.coinMinimalDenom)
      );
    };

    const handleVariantCheck = (coinMinimalDenom: string) => {
      console.log("coinMinimalDenom", coinMinimalDenom);
      setCheckedVariants((prevState) =>
        prevState.includes(coinMinimalDenom)
          ? prevState.filter((variant) => variant !== coinMinimalDenom)
          : [...prevState, coinMinimalDenom]
      );
    };

    return (
      <div className={classNames("overflow-y-auto, mt-4 flex w-full flex-col")}>
        <p className="body1 text-center text-osmoverse-300">
          Convert the following assets to their standardized version on Osmosis
          for more flexibility and increased compatibility.{" "}
          <Link
            href="/learn/asset-variants"
            className="text-wosmongton-300 hover:underline"
          >
            Learn more
          </Link>
        </p>
        <div className="-mx-3 mt-6 flex h-14 items-center">
          <Button
            disabled={checkedVariants.length === data?.assetVariants.length}
            size="md"
            variant="ghost"
            className="text-wosmongton-200" // Added h-14 for 56px height
            onClick={handleSelectAll}
          >
            Select All
          </Button>
        </div>
        <div className="flex flex-col">
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error loading asset variants.</p>
          ) : (
            data.assetVariants.map((variant) => (
              <div
                key={variant.asset.coinMinimalDenom}
                className="-mx-4 flex items-center justify-between gap-3 p-4" // Ensure gap-3 is applied here
              >
                <Checkbox
                  checked={checkedVariants.includes(
                    variant.asset.coinMinimalDenom
                  )}
                  onCheckedChange={() =>
                    handleVariantCheck(variant.asset.coinMinimalDenom)
                  }
                  className="mr-2"
                />
                <div className="flex min-w-[262px] items-center gap-3 py-2 px-4">
                  <FallbackImg
                    src={variant.asset.coinImageUrl}
                    alt={variant.asset.coinDenom}
                    fallbacksrc="/icons/question-mark.svg"
                    height={40}
                    width={40}
                  />
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="subtitle1 truncate">
                      {variant.asset?.coinName}
                    </span>
                    <span className="body2 truncate text-osmoverse-300">
                      {variant.asset.coinDenom}
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
                    src={variant.canonicalAsset.coinImageUrl}
                    alt={variant.canonicalAsset.coinDenom}
                    fallbacksrc="/icons/question-mark.svg"
                    height={40}
                    width={40}
                  />
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="subtitle1 truncate">
                      {variant.canonicalAsset?.coinName}
                    </span>
                    <span className="body2 truncate text-osmoverse-300">
                      {variant.canonicalAsset.coinDenom}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Icon
                    id="alloyed"
                    height={24}
                    width={24}
                    className="text-osmoverse-300"
                  />
                </div>
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
            Convert Selected
          </Button>
        </div>
      </div>
    );
  }
);
