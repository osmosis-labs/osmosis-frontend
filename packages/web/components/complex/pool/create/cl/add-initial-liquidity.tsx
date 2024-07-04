import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useState } from "react";

import { Icon } from "~/components/assets";
import {
  SelectionToken,
  TokenSelectorProps,
} from "~/components/complex/pool/create/cl-pool";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

interface AddInitialLiquidityProps {
  poolId: string;
  selectedBase?: SelectionToken;
  selectedQuote?: SelectionToken;
  onClose?: () => void;
}

export const AddInitialLiquidity = observer(
  ({
    selectedBase,
    selectedQuote,
    poolId,
    onClose,
  }: AddInitialLiquidityProps) => {
    const [baseAmount, setBaseAmount] = useState(0);
    const [quoteAmount, setQuoteAmount] = useState(0);

    const [isTxLoading, setIsTxLoading] = useState(false);
    const { accountStore } = useStore();

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
          />
          <TokenLiquiditySelector
            selectedAsset={selectedQuote}
            isQuote
            value={quoteAmount}
            setter={setQuoteAmount}
          />
        </div>
        <span className="subtitle1 text-osmoverse-300">
          Implied value: 1 {selectedBase.token.coinDenom}{" "}
          <span className="font-bold">≈ $1.23</span>
        </span>
        <div className="flex flex-col gap-[26px]">
          <button
            onClick={() => {
              setIsTxLoading(true);
              account?.osmosis
                .sendCreateConcentratedLiquidityPositionMsg(
                  poolId,
                  new Int(0),
                  // TODO: put actual max tick
                  new Int(1),
                  undefined,
                  {
                    currency: selectedBase.token,
                    amount: baseAmount.toString(),
                  },
                  {
                    currency: selectedQuote.token,
                    amount: quoteAmount.toString(),
                  },
                  undefined,
                  undefined,
                  (res) => {
                    if (res.code === 0) {
                      setIsTxLoading(false);
                      onClose?.();
                    }
                  }
                )
                .finally(() => setIsTxLoading(false));
            }}
            disabled={isTxLoading}
            className={classNames(
              "flex h-13 w-[520px] items-center justify-center gap-2.5 rounded-xl bg-wosmongton-700 transition-all hover:bg-wosmongton-800 focus:bg-wosmongton-900 disabled:pointer-events-none disabled:bg-osmoverse-500"
            )}
          >
            <h6>Next</h6>
          </button>
          <button onClick={onClose}>
            <span className="subtitle1 text-osmoverse-100">Skip</span>
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
  }: Omit<TokenSelectorProps, "assets" | "setSelectedAsset"> & {
    value: number;
    setter: (value: number) => void;
    isQuote?: boolean;
  }) => {
    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const { data: assetData, isLoading } =
      api.edge.assets.getUserAsset.useQuery(
        {
          userOsmoAddress: wallet?.address ?? "",
          findMinDenomOrSymbol: selectedAsset?.token.coinMinimalDenom ?? "",
        },
        { enabled: !!wallet?.address }
      );

    const { data: assetPrice } = api.edge.assets.getAssetPrice.useQuery(
      {
        coinMinimalDenom: selectedAsset?.token.coinMinimalDenom ?? "",
      },
      { enabled: !!selectedAsset?.token.coinMinimalDenom }
    );

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
              if (assetData?.amount) {
                setter(+assetData.amount.toDec().toString());
              }
            }}
          >
            <span className="caption text-wosmongton-300">
              {isLoading ? (
                <div className="h-3.5 w-25 animate-pulse rounded-xl bg-osmoverse-800" />
              ) : (
                formatPretty(
                  assetData?.amount ?? new CoinPretty(selectedAsset.token, 0)
                )
              )}
            </span>
          </button>
          <input
            type="number"
            className="w-[158px] rounded-xl bg-osmoverse-800 py-2 px-3 text-right text-h5 font-h5"
            value={value}
            onChange={(e) => setter(+new Dec(+e.target.value).toString())}
          />
          <span className="caption h-3.5 text-osmoverse-400">
            {isQuote &&
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
