import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { BridgeChain } from "@osmosis-labs/bridge";
import { getShortAddress, isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";
import { FunctionComponent, PropsWithChildren, useState } from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/trpc";

import { SupportedAsset } from "./amount-and-review-screen";
import { BridgeProviderDropdown } from "./bridge-provider-dropdown";
import { BridgeQuoteRemainingTime } from "./bridge-quote-remaining-time";
import { useBridgeQuote } from "./use-bridge-quote";

type QuoteResult = ReturnType<typeof useBridgeQuote>;

interface ConfirmationScreenProps {
  direction: "deposit" | "withdraw";
  selectedDenom: string;

  fromChain: BridgeChain;
  toChain: BridgeChain;

  fromAsset: SupportedAsset;
  toAsset: SupportedAsset;

  fromAddress: string;
  toAddress: string;

  fromWalletIcon: string;
  toWalletIcon: string;

  quote: QuoteResult;

  onCancel: () => void;
  onConfirm: () => void;
}

export const ReviewScreen: FunctionComponent<ConfirmationScreenProps> = ({
  direction,
  selectedDenom,

  fromChain,
  toChain,

  fromAsset,
  toAsset,

  fromAddress,
  toAddress,

  fromWalletIcon,
  toWalletIcon,

  quote,

  onCancel,
  onConfirm,
}) => {
  const { data: assetsInOsmosis } =
    api.edge.assets.getCanonicalAssetWithVariants.useQuery(
      {
        findMinDenomOrSymbol: selectedDenom!,
      },
      {
        enabled: !isNil(selectedDenom),
        cacheTime: 10 * 60 * 1000, // 10 minutes
        staleTime: 10 * 60 * 1000, // 10 minutes
      }
    );

  // Find the asset variant or default to the first asset in the list for display metadata
  const fromVariantAsset =
    assetsInOsmosis?.find(
      (asset) => asset.coinMinimalDenom === fromAsset.address
    ) ?? assetsInOsmosis?.[0];
  const toVariantAsset =
    assetsInOsmosis?.find(
      (asset) => asset.coinMinimalDenom === toAsset.address
    ) ?? assetsInOsmosis?.[0];

  return (
    <div className="mx-auto flex w-[512px] flex-col gap-1 py-12">
      <h5>
        Confirm {direction} {direction === "withdraw" ? "from" : "to"} Osmosis
      </h5>
      {quote.selectedQuote && (
        <AssetBox
          type="from"
          assetImageUrl={fromVariantAsset?.coinImageUrl ?? "/"}
          chainName={fromChain.chainName ?? fromChain.chainId.toString()}
          address={fromAddress}
          walletImageUrl={fromWalletIcon}
          value={quote.selectedQuote.quote.input.fiatValue}
          coin={quote.selectedQuote.quote.input.amount}
        />
      )}
      <TransferDetails {...quote} />
      {quote.selectedQuote && (
        <AssetBox
          type="to"
          assetImageUrl={toVariantAsset?.coinImageUrl ?? "/"}
          chainName={toChain.chainName ?? toChain.chainId.toString()}
          address={toAddress}
          walletImageUrl={toWalletIcon}
          value={quote.selectedQuote.expectedOutputFiat}
          coin={quote.selectedQuote.expectedOutput}
        />
      )}
      <div className="flex w-full items-center gap-3 py-3">
        <Button className="w-full" variant="secondary" onClick={onCancel}>
          <h6>Cancel</h6>
        </Button>
        <Button className="w-full" onClick={onConfirm}>
          <h6>Confirm</h6>
        </Button>
      </div>
    </div>
  );
};

const AssetBox: FunctionComponent<{
  type: "from" | "to";
  assetImageUrl: string;
  chainName: string;
  address: string;
  walletImageUrl: string;
  value: PricePretty;
  coin: CoinPretty;
}> = ({
  type,
  assetImageUrl,
  chainName,
  address,
  walletImageUrl,
  value,
  coin,
}) => (
  <div className="flex w-full flex-col gap-2 rounded-2xl border border-osmoverse-700">
    <div className="flex place-content-between items-center px-6 pt-4 pb-2">
      <div className="flex items-center gap-3">
        <Image alt="token image" src={assetImageUrl} width={48} height={48} />
        <h6>
          {type === "from" ? "Transfer" : "Receive"} {coin.denom}
        </h6>
      </div>
      <div className="text-right">
        <div className="subtitle1">
          {type === "to" && "~"} {value.toString()}
        </div>
        <div className="body1 text-osmoverse-300">
          {type === "to" && "~"} {coin.trim(true).toString()}
        </div>
      </div>
    </div>
    <div className="h-[1px] w-full self-center bg-osmoverse-700" />
    <div className="flex place-content-between items-center px-6 pb-3 pt-1">
      <div>
        {type === "from" ? "From" : "To"} {chainName}
      </div>
      <div className="flex items-center gap-2">
        <Image alt="wallet image" src={walletImageUrl} width={24} height={24} />
        <div className="body1 text-wosmongton-200">
          {getShortAddress(address)}
        </div>
      </div>
    </div>
  </div>
);

/** Assumes the first provider in the list is the selected provider. */
const TransferDetails: FunctionComponent<QuoteResult> = ({
  selectedQuote,
  successfulQuotes,
  refetchInterval,
  selectedQuoteUpdatedAt,

  setSelectedBridgeProvider,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [detailsRef, { height: detailsHeight, y: detailsOffset }] =
    useMeasure<HTMLDivElement>();

  if (!selectedQuote) return null;
  const {
    estimatedTime,
    fromChain,
    gasCost,
    gasCostFiat,
    transferFee,
    transferFeeFiat,
  } = selectedQuote;

  let totalFeePrice = gasCostFiat;
  if (totalFeePrice && transferFeeFiat) {
    totalFeePrice = totalFeePrice.add(transferFeeFiat);
  }
  const estTime = estimatedTime.humanize();

  const HeaderContents = isOpen ? (
    <div className="subtitle1">Transfer details</div>
  ) : (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-osmoverse-700">
        <Icon id="down-arrow" />
      </div>
      <div>{estTime} ETA</div>
    </div>
  );

  return (
    <div
      className="flex flex-col gap-4 overflow-hidden px-6 transition-height duration-300 ease-inOutBack"
      style={{
        height: isOpen
          ? (detailsHeight + detailsOffset ?? 288) + 74 // collapsed height
          : 74,
      }}
    >
      <button
        className="flex place-content-between items-center py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        {HeaderContents}
        <div className="flex items-center gap-2">
          {!isNil(selectedQuoteUpdatedAt) && (
            <BridgeQuoteRemainingTime
              dataUpdatedAt={selectedQuoteUpdatedAt}
              refetchInterval={refetchInterval}
              expiredElement={
                <Spinner className="!h-6 !w-6 text-wosmongton-500" />
              }
            />
          )}
          {!isOpen && totalFeePrice && (
            <div className="subtitle1">{totalFeePrice.toString()} fees</div>
          )}
          <Icon
            className={classNames(
              "text-osmoverse-300 transition-transform",
              isOpen ? "rotate-180" : ""
            )}
            id="chevron-down"
            height={16}
            width={16}
          />
        </div>
      </button>
      <div ref={detailsRef} className="flex flex-col gap-4">
        <DetailRow label="Provider">
          <BridgeProviderDropdown
            selectedQuote={selectedQuote}
            quotes={successfulQuotes}
            onSelect={setSelectedBridgeProvider}
          />
        </DetailRow>
        <DetailRow label="Estimated time">
          <div className="flex items-center gap-1">
            <Icon
              className="text-osmoverse-300"
              id="stopwatch"
              height={16}
              width={16}
            />
            <div className="body2 text-osmoverse-100">{estTime}</div>
          </div>
        </DetailRow>
        <DetailRow
          label={`${fromChain.chainName ?? fromChain.chainId} network fee`}
        >
          <div className="flex items-center gap-1">
            {gasCostFiat && (
              <div className="body2 text-osmoverse-100">
                {gasCostFiat.trim(true).toString()}
              </div>
            )}
            {gasCost && (
              <div className="body2 text-osmoverse-300">
                ({gasCost.trim(true).toString()})
              </div>
            )}
          </div>
        </DetailRow>
        <DetailRow label="Provider fee">
          <div className="flex items-center gap-1">
            {transferFeeFiat && (
              <div className="body2 text-osmoverse-100">
                {transferFeeFiat.trim(true).toString()}
              </div>
            )}
            <div className="body2 text-osmoverse-300">
              ({transferFee.trim(true).toString()})
            </div>
          </div>
        </DetailRow>
      </div>
    </div>
  );
};

const DetailRow: FunctionComponent<PropsWithChildren<{ label: string }>> = ({
  label,
  children,
}) => (
  <div className="flex place-content-between items-center">
    <div className="body2 text-osmoverse-300">{label}</div>
    {children}
  </div>
);
