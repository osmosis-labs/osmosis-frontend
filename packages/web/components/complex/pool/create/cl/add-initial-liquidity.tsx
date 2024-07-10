import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { MinimalAsset } from "@osmosis-labs/types";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useState } from "react";

import { Icon } from "~/components/assets";
import { TokenSelectorProps } from "~/components/complex/pool/create/cl/set-base-info";
import { SelectionToken } from "~/components/complex/pool/create/cl-pool";
import { Spinner } from "~/components/loaders";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

interface AddInitialLiquidityProps {
  poolId: string;
  selectedBase?: SelectionToken;
  selectedQuote?: SelectionToken;
  onClose?: () => void;
}

const isAmountValid = (amount?: string) => !!amount && !/^0*$/.test(amount);

export const AddInitialLiquidity = observer(
  ({
    selectedBase,
    selectedQuote,
    poolId,
    onClose,
  }: AddInitialLiquidityProps) => {
    const [baseAmount, setBaseAmount] = useState<string>();
    const [quoteAmount, setQuoteAmount] = useState<string>();

    const [isTxLoading, setIsTxLoading] = useState(false);
    const { accountStore } = useStore();

    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const { data: quoteUsdValue } = api.edge.assets.getAssetPrice.useQuery(
      {
        coinMinimalDenom: selectedQuote?.token.coinMinimalDenom ?? "",
      },
      { enabled: !!selectedQuote?.token.coinMinimalDenom }
    );

    const {
      data: baseAssetBalanceData,
      isLoading: isLoadingBaseAssetBalanceData,
    } = api.edge.assets.getUserAsset.useQuery(
      {
        userOsmoAddress: wallet?.address ?? "",
        findMinDenomOrSymbol: selectedBase?.token.coinMinimalDenom ?? "",
      },
      { enabled: !!wallet?.address }
    );

    const {
      data: quoteAssetBalanceData,
      isLoading: isLoadingQuoteAssetBalanceData,
    } = api.edge.assets.getUserAsset.useQuery(
      {
        userOsmoAddress: wallet?.address ?? "",
        findMinDenomOrSymbol: selectedQuote?.token.coinMinimalDenom ?? "",
      },
      { enabled: !!wallet?.address }
    );

    const account = accountStore.getWallet(accountStore.osmosisChainId);

    if (!selectedBase || !selectedQuote) return;

    return (
      <>
        <div className="flex items-center gap-3 self-center">
          <Icon
            id="info-uncolored"
            className="h-4 w-4 text-osmoverse-400"
            width={16}
            height={16}
          />
          <span className="subtitle2 text-osmoverse-100">
            Initial liquidity will be deposited as a full range position
          </span>
        </div>
        <div className="flex items-center gap-3">
          <TokenLiquiditySelector
            selectedAsset={selectedBase}
            value={baseAmount}
            setter={setBaseAmount}
            balanceData={baseAssetBalanceData}
            isLoadingBalanceData={isLoadingBaseAssetBalanceData}
          />
          <TokenLiquiditySelector
            selectedAsset={selectedQuote}
            value={quoteAmount}
            setter={setQuoteAmount}
            balanceData={quoteAssetBalanceData}
            isLoadingBalanceData={isLoadingQuoteAssetBalanceData}
            assetPrice={quoteUsdValue}
            isQuote
          />
        </div>
        {isAmountValid(baseAmount) &&
          isAmountValid(quoteAmount) &&
          quoteUsdValue && (
            <span className="subtitle1 text-osmoverse-300">
              Implied value: 1 {selectedBase.token.coinDenom}{" "}
              <span className="font-bold">
                ≈{" "}
                {formatPretty(
                  new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    new Dec(quoteAmount!)
                      .mul(quoteUsdValue?.toDec())
                      .quo(new Dec(baseAmount!))
                  )
                )}
              </span>
            </span>
          )}
        <div className="flex flex-col gap-[26px]">
          <button
            disabled={
              isTxLoading ||
              new Dec(baseAmount ?? 0).gt(
                baseAssetBalanceData?.amount?.toDec() ?? new Dec(0)
              ) ||
              new Dec(quoteAmount ?? 0).gt(
                quoteAssetBalanceData?.amount?.toDec() ?? new Dec(0)
              )
            }
            onClick={() => {
              if (!baseAmount || !quoteAmount) return;

              setIsTxLoading(true);
              account?.osmosis
                .sendCreateConcentratedLiquidityInitialFullRangePositionMsg(
                  poolId,
                  undefined,
                  {
                    amount: new Int(baseAmount.toString()),
                    denom: selectedBase.token.coinMinimalDenom,
                  },
                  {
                    amount: new Int(quoteAmount.toString()),
                    denom: selectedQuote.token.coinMinimalDenom,
                  },
                  () => {
                    onClose?.();
                  }
                )
                .finally(() => setIsTxLoading(false));
            }}
            className={classNames(
              "flex h-13 w-[520px] items-center justify-center gap-2.5 rounded-xl bg-wosmongton-700 transition-all hover:bg-wosmongton-800 focus:bg-wosmongton-900 disabled:pointer-events-none disabled:bg-osmoverse-500"
            )}
          >
            <h6>Next</h6>
            {isTxLoading && <Spinner />}
          </button>
          <button onClick={onClose}>
            <span className="subtitle1 text-wosmongton-200">Skip</span>
          </button>
        </div>
      </>
    );
  }
);

const TokenLiquiditySelector = observer(
  ({
    selectedAsset,
    isQuote,
    value,
    setter,
    assetPrice,
    balanceData,
    isLoadingBalanceData,
  }: Omit<TokenSelectorProps, "assets" | "setSelectedAsset"> & {
    value?: string;
    setter: (value?: string) => void;
    isQuote?: boolean;
    assetPrice?: PricePretty;
    balanceData?: MinimalAsset &
      Partial<{
        amount: CoinPretty;
        usdValue: PricePretty;
      }>;
    isLoadingBalanceData?: boolean;
  }) => {
    if (!selectedAsset) return;

    return (
      <div className="flex w-[360px] items-center justify-between rounded-3xl bg-osmoverse-825 p-5">
        <div className="flex items-center gap-3">
          <Image
            src={selectedAsset.token.coinImageUrl ?? ""}
            alt={`${selectedAsset.token.coinDenom}`}
            width={52}
            height={52}
            className="rounded-full"
          />
          <h5 className="max-w-[90px] truncate">
            {selectedAsset.token.coinDenom}
          </h5>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => {
              if (balanceData?.amount) {
                setter(balanceData.amount.toDec().toString());
              }
            }}
          >
            <span className="caption text-wosmongton-300">
              {isLoadingBalanceData ? (
                <div className="h-3.5 w-25 animate-pulse rounded-xl bg-osmoverse-800" />
              ) : (
                formatPretty(
                  balanceData?.amount ?? new CoinPretty(selectedAsset.token, 0)
                )
              )}
            </span>
          </button>
          <input
            type="number"
            className="w-[158px] rounded-xl bg-osmoverse-800 py-2 px-3 text-right text-h5 font-h5"
            placeholder="0"
            value={value}
            onChange={(e) => {
              // we might have to adjust this treshold
              if (e.target.value.length > 32) return;
              if (e.target.value === "") return setter();

              setter(e.target.value);
            }}
          />
          <span className="caption h-3.5 text-osmoverse-400">
            {isQuote &&
              value &&
              "~" +
                formatPretty(
                  new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    new Dec(value).mul(assetPrice?.toDec() ?? new Dec(0))
                  )
                )}
          </span>
        </div>
      </div>
    );
  }
);
