import { Listbox, Transition } from "@headlessui/react";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { getAssets } from "@osmosis-labs/server";
import { ConcentratedLiquidityParams } from "@osmosis-labs/stores";
import { ObservableCreatePoolConfig } from "@osmosis-labs/stores/build/ui-config/create-pool";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { Fragment, useMemo, useState } from "react";

import { Icon } from "~/components/assets/icon";
import { Spinner } from "~/components/loaders";
import { Checkbox } from "~/components/ui/checkbox";
import { AssetLists } from "~/config/generated/asset-lists";
import { useDisclosure, useFilteredData } from "~/hooks";
import { TokenSelectModal } from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

interface CreateCLPoolProps {
  config: ObservableCreatePoolConfig;
  onClose?: () => void;
  onBack?: () => void;
  currentStep?: 1 | 2 | 3 | 0;
  advanceStep?: () => void;
  backStep?: () => void;
}

type SelectionToken = {
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
    // advanceStep,
    // backStep,
    config,
  }: CreateCLPoolProps) => {
    // const selectableCurrencies = useMemo(
    //   () => config.remainingSelectableCurrencies,
    //   [config.remainingSelectableCurrencies]
    // );

    const { accountStore, queriesStore } = useStore();

    const queryConcentratedLiquidityParams = queriesStore.get(
      accountStore.osmosisChainId
    ).osmosis?.queryConcentratedLiquidityParams;

    const { data: clParams, isLoading: isLoadingCLParams } = useQuery({
      queryFn: () => queryConcentratedLiquidityParams?.waitResponse(),
      queryKey: ["queryConcentratedLiquidityParams"],
      select: (d) =>
        (d?.data as unknown as { params: ConcentratedLiquidityParams }).params,
    });

    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const [selectedSpread, setSelectedSpread] = useState(
      clParams?.authorized_spread_factors[0] ?? "0.000000000000000000"
    );

    const { baseTokens, quoteTokens } = useMemo(() => {
      return {
        baseTokens: getAssets({
          assetLists: AssetLists,
          onlyVerified: true,
        }).map((asset) => {
          const assetListAsset = getAssetFromAssetList({
            assetLists: AssetLists,
            coinMinimalDenom: asset.coinMinimalDenom,
          });

          return {
            chainName: assetListAsset?.rawAsset.chainName,
            token: new CoinPretty(
              {
                coinDenom: asset.coinDenom,
                coinDecimals: asset.coinDecimals,
                coinMinimalDenom: asset.coinMinimalDenom,
                coinImageUrl: asset.coinImageUrl,
              },
              0
            ).currency,
          };
        }) as SelectionToken[],
        quoteTokens: clParams
          ? (clParams.authorized_quote_denoms
              .map((qa): SelectionToken | undefined => {
                const asset = getAssetFromAssetList({
                  assetLists: AssetLists,
                  coinMinimalDenom: qa,
                });

                if (!asset) return;

                const {
                  symbol,
                  decimals,
                  coinMinimalDenom,
                  rawAsset: { logoURIs },
                } = asset;
                return {
                  token: new CoinPretty(
                    {
                      coinDenom: symbol,
                      coinDecimals: decimals,
                      coinMinimalDenom,
                      coinImageUrl: logoURIs.svg ?? logoURIs.png ?? "",
                    },
                    0
                  ).currency,
                  chainName: asset.rawAsset.chainName,
                };
              })
              .filter(Boolean) as SelectionToken[])
          : [],
      };
    }, [clParams]);

    const [selectedBase, setSelectedBase] = useState<SelectionToken>();
    // I think we can default to OSMO for quote asset
    const [selectedQuote, setSelectedQuote] =
      useState<SelectionToken>(OSMO_ASSET);

    const [isAgreementChecked, setIsAgreementChecked] = useState(false);
    const [isTxLoading, setIsTxLoading] = useState(false);

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
                      assets={baseTokens.filter(
                        (qc) =>
                          qc.token.coinDenom !== selectedQuote?.token.coinDenom
                      )}
                      selectedAsset={selectedBase}
                      setSelectedAsset={setSelectedBase}
                    />
                  </div>
                  <div className="flex flex-col gap-2 pl-4">
                    <span className="subtitle1 text-white-emphasis">Quote</span>
                    <TokenSelector
                      assets={quoteTokens.filter(
                        (qc) =>
                          qc.token.coinDenom !== selectedBase?.token.coinDenom
                      )}
                      selectedAsset={selectedQuote}
                      setSelectedAsset={setSelectedQuote}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-5">
                  <span className="subtitle1">Set swap fee to</span>
                  {clParams ? (
                    <SpreadSelector
                      options={clParams.authorized_spread_factors}
                      value={selectedSpread}
                      onChange={setSelectedSpread}
                    />
                  ) : (
                    <div className="flex h-12 items-center justify-center">
                      <Spinner />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="h-[26px] w-[26px]"
                    id="clCreationAgreement"
                    checked={isAgreementChecked}
                    onCheckedChange={(e) => setIsAgreementChecked(e as boolean)}
                  />
                  <label htmlFor="clCreationAgreement" className="body2">
                    I understand that creating a new pool will cost 100 OSMO
                  </label>
                </div>
                <button
                  disabled={
                    isTxLoading ||
                    !isAgreementChecked ||
                    isLoadingCLParams ||
                    !selectedBase
                  }
                  className={classNames(
                    "flex h-13 w-[520px] items-center justify-center rounded-xl bg-wosmongton-700 transition-all hover:bg-wosmongton-800 focus:bg-wosmongton-900 disabled:pointer-events-none disabled:opacity-70"
                  )}
                  onClick={() => {
                    setIsTxLoading(true);
                    account?.osmosis
                      .sendCreateConcentratedPoolMsg(
                        selectedBase?.token.coinMinimalDenom!,
                        selectedQuote?.token.coinMinimalDenom!,
                        100,
                        +selectedSpread,
                        undefined,
                        (res) => {
                          if (res.code === 0) {
                            setIsTxLoading(false);
                          }
                        }
                      )
                      .finally(() => setIsTxLoading(false));
                  }}
                >
                  <h6>Create Pool</h6>
                </button>
              </div>
            </>
          );
      }
    }, [
      account?.osmosis,
      baseTokens,
      clParams,
      currentStep,
      isAgreementChecked,
      isLoadingCLParams,
      isTxLoading,
      quoteTokens,
      selectedBase,
      selectedQuote,
      selectedSpread,
    ]);

    return (
      <div className="flex w-fit flex-col justify-center gap-[38px] rounded-5xl bg-osmoverse-850 p-10">
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
  assets: SelectionToken[];
  setSelectedAsset: (asset: SelectionToken) => void;
  selectedAsset?: SelectionToken;
}

const TokenSelector = observer(
  ({ selectedAsset, assets, setSelectedAsset }: TokenSelectorProps) => {
    const { isOpen, onClose, onOpen } = useDisclosure();

    const [query, setQuery, results] = useFilteredData(assets, [
      "token.coinDenom",
    ]);

    return (
      <>
        <button
          onClick={onOpen}
          className="flex w-[260px] items-center justify-between rounded-3xl bg-osmoverse-825 p-5"
        >
          <div className="flex items-center gap-3">
            {selectedAsset ? (
              <>
                <Image
                  src={selectedAsset.token.coinImageUrl ?? ""}
                  alt={`${selectedAsset.token.coinDenom}`}
                  width={52}
                  height={52}
                  className="rounded-full"
                />
                <h5>{selectedAsset.token.coinDenom}</h5>
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
        <TokenSelectModal
          isOpen={isOpen}
          tokens={results}
          currentValue={query}
          onInput={setQuery}
          onRequestClose={onClose}
          onSelect={(selectedDenom) =>
            setSelectedAsset(
              assets.find((value) => value.token.coinDenom === selectedDenom)!
            )
          }
        />
      </>
    );
  }
);

interface SpreadSelctorProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

function SpreadSelector({ options, value, onChange }: SpreadSelctorProps) {
  return (
    <Listbox value={options} onChange={() => {}}>
      <div className="relative flex">
        <Listbox.Button
          className={classNames(
            "flex items-center justify-center gap-2.5 rounded-xl bg-osmoverse-825 py-3 px-4"
          )}
        >
          <span className="max-w-[100px] truncate font-subtitle1 leading-6 sm:max-w-none">
            {formatPretty(new RatePretty(value))}
          </span>
          <Icon id="caret-down" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="transition ease-in duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={
              "absolute inset-x-0 z-[51] mt-13 flex w-[150px] flex-col gap-2 rounded-lg bg-osmoverse-800 py-4"
            }
          >
            {options.map((option, i) => (
              <Listbox.Option
                className={({ active }) =>
                  classNames(
                    "relative inline-flex cursor-default select-none items-center gap-3 py-2 px-4",
                    {
                      "bg-osmoverse-825": active,
                    }
                  )
                }
                onClick={() => onChange(option)}
                key={`${value} ${i}`}
                value={value}
              >
                <Checkbox id={`c${i}`} checked={value === option} />
                <label
                  htmlFor={`c${i}`}
                  className="pointer-events-none block truncate capitalize"
                >
                  {formatPretty(new RatePretty(option))}
                </label>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
