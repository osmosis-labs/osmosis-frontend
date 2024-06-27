import { AppCurrency } from "@keplr-wallet/types";
import { ObservableCreatePoolConfig } from "@osmosis-labs/stores/build/ui-config/create-pool";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { useMemo } from "react";

import { Icon } from "~/components/assets/icon";

interface CreateCLPoolProps {
  config: ObservableCreatePoolConfig;
  onClose?: () => void;
  onBack?: () => void;
  currentStep?: 1 | 2 | 3 | 0;
  advanceStep?: () => void;
  backStep?: () => void;
}

export const CreateCLPool = observer(
  ({
    onBack,
    onClose,
    currentStep,
    advanceStep,
    backStep,
    config,
  }: CreateCLPoolProps) => {
    const selectableCurrencies = useMemo(
      () => config.remainingSelectableCurrencies,
      [config.remainingSelectableCurrencies]
    );

    const content = useMemo(() => {
      switch (currentStep) {
        case 1:
          return (
            <>
              <div className="flex flex-col gap-10">
                <div className="flex items-center justify-center gap-13">
                  <div className="flex flex-col gap-2 pl-4">
                    <span className="subtitle1 text-white-emphasis">Base</span>
                    <TokenSelector
                      onClick={() => {}}
                      selectedAsset={selectableCurrencies[0]}
                    />
                  </div>
                  <div className="flex flex-col gap-2 pl-4">
                    <span className="subtitle1 text-white-emphasis">Quote</span>
                    {selectableCurrencies[1] && (
                      <button className="flex w-[260px] items-center justify-between rounded-3xl bg-osmoverse-825 p-5">
                        <div className="flex items-center gap-3">
                          <Image
                            src={selectableCurrencies[1].coinImageUrl ?? ""}
                            alt={`${selectableCurrencies[1].coinDenom}`}
                            width={52}
                            height={52}
                            className="rounded-full"
                          />
                          <h5>{selectableCurrencies[1].coinDenom}</h5>
                        </div>
                        <button
                          type="button"
                          onClick={onBack}
                          className="flex h-6 w-6 items-center justify-center"
                        >
                          <Icon
                            id="chevron-left"
                            width={12}
                            height={24}
                            className="-rotate-90 text-osmoverse-400"
                          />
                        </button>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
      }
    }, [currentStep, onBack, selectableCurrencies]);

    return (
      <div className="flex w-fit flex-col justify-center gap-[38px] bg-osmoverse-850 p-10">
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
          <h6 className="text-white-emphasis">Create New Supercharged Pool</h6>
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

interface TokenSelectorProps {
  selectedAsset?: AppCurrency;
  onClick?: () => void;
}

const TokenSelector = observer(
  ({ selectedAsset, onClick }: TokenSelectorProps) => {
    return (
      <button
        onClick={onClick}
        className="flex w-[260px] items-center justify-between rounded-3xl bg-osmoverse-825 p-5"
      >
        <div className="flex items-center gap-3">
          {selectedAsset ? (
            <>
              <Image
                src={selectedAsset.coinImageUrl ?? ""}
                alt={`${selectedAsset.coinDenom}`}
                width={52}
                height={52}
                className="rounded-full"
              />
              <h5>{selectedAsset.coinDenom}</h5>
            </>
          ) : (
            <>
              <div className="flex h-13 w-13 items-center justify-center rounded-full bg-wosmongton-400">
                <Icon id="close-button-icon" className="rotate-45" />
              </div>
              <h6>Add token</h6>
            </>
          )}
        </div>
        {selectedAsset && (
          <div className="flex h-6 w-6 items-center justify-center">
            <Icon
              id="chevron-left"
              width={12}
              height={24}
              className="-rotate-90 text-osmoverse-400"
            />
          </div>
        )}
      </button>
    );
  }
);
