import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { memo } from "react";

import { Button } from "~/components/ui/button";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";

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
        <div className="mt-6 flex flex-col">
          <div className="-ml-3">
            <Button
              size="md"
              variant="secondary-outline"
              className="border-none"
              onClick={() => {
                // TODO: Implement select all functionality
              }}
            >
              Select All
            </Button>
          </div>
          <div className="flex flex-col gap-4"></div>
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
      </div>
    );
  }
);
