import { AppCurrency } from "@keplr-wallet/types";
import { ObservableCreatePoolConfig } from "@osmosis-labs/stores/build/ui-config/create-pool";
import { observer } from "mobx-react-lite";
import React, { useMemo, useState } from "react";

import { Icon } from "~/components/assets/icon";
import { AddInitialLiquidity } from "~/components/complex/pool/create/cl/add-initial-liquidity";
import { SetBaseInfos } from "~/components/complex/pool/create/cl/set-base-info";

interface CreateCLPoolProps {
  config: ObservableCreatePoolConfig;
  onClose?: () => void;
  onBack?: () => void;
  currentStep?: 1 | 2 | 3 | 0;
  advanceStep?: () => void;
  backStep?: () => void;
  fullClose?: () => void;
}

export type SelectionToken = {
  token: AppCurrency;
  chainName: string;
};

const OSMO_ASSET: SelectionToken = {
  chainName: "Osmosis",
  token: {
    coinDenom: "OSMO",
    coinDecimals: 6,
    coinMinimalDenom: "uosmo",
    coinImageUrl:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
  },
};

export const CreateCLPool = observer(
  ({
    onBack,
    onClose,
    currentStep,
    advanceStep,
    fullClose,
  }: CreateCLPoolProps) => {
    const [selectedBase, setSelectedBase] = useState<SelectionToken>();
    // I think we can default to OSMO for quote asset
    const [selectedQuote, setSelectedQuote] =
      useState<SelectionToken>(OSMO_ASSET);

    const content = useMemo(() => {
      switch (currentStep) {
        case 1:
          return (
            <SetBaseInfos
              advanceStep={advanceStep}
              selectedBase={selectedBase}
              selectedQuote={selectedQuote}
              setSelectedBase={setSelectedBase}
              setSelectedQuote={setSelectedQuote}
            />
          );
        case 2:
          return (
            <AddInitialLiquidity
              selectedBase={selectedBase}
              selectedQuote={selectedQuote}
              // TODO: compute actual poolId
              poolId="1234"
              onClose={fullClose}
            />
          );
      }
    }, [advanceStep, currentStep, fullClose, selectedBase, selectedQuote]);

    return (
      <div className="flex w-fit flex-col items-center justify-center gap-[38px] rounded-5xl bg-osmoverse-850 p-10">
        <div className="flex w-[641px] items-center justify-between lg:w-full">
          <button
            type="button"
            onClick={onBack}
            className="flex h-6 w-6 items-center justify-center"
          >
            <Icon
              id="chevron-left"
              width={12}
              height={24}
              className="text-osmoverse-400"
            />
          </button>
          <h6 className="text-white-emphasis">
            {getStepHeader(currentStep, "1446")}
          </h6>
          <button
            type="button"
            onClick={onClose}
            className="flex w-fit items-center justify-center"
          >
            <Icon
              id="close-button-icon"
              width={24}
              height={24}
              className="text-osmoverse-400"
            />
          </button>
        </div>
        {content}
      </div>
    );
  }
);

function getStepHeader(currentStep?: 0 | 1 | 2 | 3, poolNumber?: string) {
  if (!currentStep) return;
  switch (currentStep) {
    case 1:
      return "Create New Supercharged Pool";
    case 2:
      return `Add initial liquidity to Pool #${poolNumber}`;
  }
}
