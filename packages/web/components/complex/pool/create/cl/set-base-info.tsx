import {
  Checkbox,
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { getAssets } from "@osmosis-labs/server";
import { ConcentratedLiquidityParams } from "@osmosis-labs/stores";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { Fragment, useMemo, useState } from "react";

import { Icon } from "~/components/assets/icon";
import { SelectionToken } from "~/components/complex/pool/create/cl-pool";
import { Spinner } from "~/components/loaders";
import { AssetLists } from "~/config/mock-asset-lists";
import { useDisclosure, useFilteredData } from "~/hooks";
import { TokenSelectModal } from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

interface SetBaseInfosProps {
  advanceStep?: () => void;
  selectedBase?: SelectionToken;
  selectedQuote: SelectionToken;
  setSelectedBase: (value: SelectionToken) => void;
  setSelectedQuote: (value: SelectionToken) => void;
  setPoolId: (value: string) => void;
}

export const SetBaseInfos = observer(
  ({
    advanceStep,
    selectedBase,
    selectedQuote,
    setSelectedBase,
    setSelectedQuote,
    setPoolId,
  }: SetBaseInfosProps) => {
    const { accountStore, queriesStore } = useStore();

    const queryConcentratedLiquidityParams = queriesStore.get(
      accountStore.osmosisChainId
    ).osmosis?.queryConcentratedLiquidityParams;

    const { data: clParams, isLoading: isLoadingCLParams } = useQuery({
      queryFn: () => queryConcentratedLiquidityParams?.waitResponse(),
      queryKey: ["queryConcentratedLiquidityParams"],
      select: (d) =>
        (d?.data as unknown as { params: ConcentratedLiquidityParams }).params,
      cacheTime: 1000 * 60 * 60,
    });

    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const [selectedSpread, setSelectedSpread] = useState(
      "0.000000000000000000"
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

    const [isAgreementChecked, setIsAgreementChecked] = useState(false);
    const [isTxLoading, setIsTxLoading] = useState(false);

    return (
      <>
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-center gap-13">
            <div className="flex flex-col gap-2 pl-4">
              <span className="subtitle1 text-white-emphasis">Base</span>
              <TokenSelector
                assets={baseTokens.filter(
                  (qc) => qc.token.coinDenom !== selectedQuote?.token.coinDenom
                )}
                selectedAsset={selectedBase}
                setSelectedAsset={setSelectedBase}
              />
            </div>
            <div className="flex flex-col gap-2 pl-4">
              <span className="subtitle1 text-white-emphasis">Quote</span>
              <TokenSelector
                assets={quoteTokens.filter(
                  (qc) => qc.token.coinDenom !== selectedBase?.token.coinDenom
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
          <Field className="flex items-center gap-3">
            <Checkbox
              className="group flex h-[26px] w-[26px] items-center justify-center rounded-lg border-2 border-solid border-osmoverse-400 transition-colors data-[checked]:bg-osmoverse-400"
              checked={isAgreementChecked}
              onChange={setIsAgreementChecked}
            >
              <svg
                width="15"
                height="12"
                viewBox="0 0 15 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-0 transition-opacity group-data-[checked]:opacity-100"
              >
                <path
                  d="M1.5 6L4.80769 9.5L13 2"
                  stroke="#231D4B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </Checkbox>
            <Label className="body2">
              I understand that creating a new pool will cost 20 USDC
            </Label>
          </Field>
          <button
            disabled={
              isTxLoading ||
              !isAgreementChecked ||
              isLoadingCLParams ||
              !selectedBase
            }
            className={classNames(
              "flex h-13 w-[520px] items-center justify-center gap-2.5 rounded-xl bg-wosmongton-700 transition-all hover:bg-wosmongton-800 focus:bg-wosmongton-900 disabled:pointer-events-none disabled:bg-osmoverse-500"
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
                      if (!res.events) return;

                      const poolId = res.events
                        .find(({ type }) => type === "pool_created")
                        ?.attributes.find(
                          ({ key }) => key === "pool_id"
                        )?.value;

                      if (!poolId) return;

                      setPoolId(poolId);
                      advanceStep?.();
                    }
                  }
                )
                .finally(() => setIsTxLoading(false));
            }}
          >
            <h6>{isTxLoading ? "Creating" : "Create"} Pool</h6>
            {isTxLoading && <Spinner />}
          </button>
        </div>
      </>
    );
  }
);

export interface TokenSelectorProps {
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
                <h5 className="max-w-[130px] truncate">
                  {selectedAsset.token.coinDenom}
                </h5>
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

interface SpreadSelectorProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

function SpreadSelector({ options, value, onChange }: SpreadSelectorProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative flex">
        <ListboxButton className="flex items-center justify-center gap-2.5 rounded-xl bg-osmoverse-825 py-3 px-4">
          <span className="max-w-[100px] truncate font-subtitle1 leading-6 sm:max-w-none">
            {formatPretty(new RatePretty(value))}
          </span>
          <Icon id="caret-down" />
        </ListboxButton>
        <Transition
          as={Fragment}
          enter="transition ease-in duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute inset-x-0 z-[51] mt-13 flex max-h-[200px] w-max flex-col gap-2 overflow-scroll rounded-lg bg-osmoverse-800 pt-2">
            {options.map((option, i) => (
              <ListboxOption
                className="group relative inline-flex select-none items-center gap-3 py-2 px-4 data-[selected]:bg-osmoverse-850"
                key={`${option} ${i}`}
                value={option}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg">
                  <svg
                    width="15"
                    height="12"
                    viewBox="0 0 15 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-0 transition-opacity group-data-[selected]:opacity-100"
                  >
                    <path
                      d="M1.5 6L4.80769 9.5L13 2"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="truncate capitalize">
                  {formatPretty(new RatePretty(option))}
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  );
}
