import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { BridgeChain } from "@osmosis-labs/bridge";
import { getShortAddress, isNil } from "@osmosis-labs/utils";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, useState } from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { api } from "~/utils/trpc";

import {
  BridgeProviderDropdownRow,
  EstimatedTimeRow,
  ExpandDetailsControlContent,
  NetworkFeeRow,
  ProviderFeesRow,
  TotalFeesRow,
} from "./quote-detail";
import { BridgeQuotes } from "./use-bridge-quotes";
import { SupportedAsset } from "./use-bridges-supported-assets";

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

  quote: BridgeQuotes;

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
  const { t } = useTranslation();

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
      <h5 className="pb-6 text-center">
        {t(
          direction === "withdraw"
            ? "transfer.confirmWithdrawTo"
            : "transfer.confirmDepositTo",
          { chain: quote.toChainInfo?.prettyName ?? "" }
        )}
      </h5>
      <p className="body1 pb-3 text-center text-osmoverse-400">
        {t(
          direction === "withdraw"
            ? "transfer.reviewWithdrawP"
            : "transfer.reviewDepositP"
        )}
      </p>
      {quote.selectedQuote && (
        <AssetBox
          type="from"
          assetImageUrl={fromVariantAsset?.coinImageUrl ?? "/"}
          chainName={
            quote.fromChainInfo?.prettyName ??
            fromChain.chainName ??
            fromChain.chainId.toString()
          }
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
          chainName={
            quote.toChainInfo?.prettyName ??
            toChain.chainName ??
            toChain.chainId.toString()
          }
          address={toAddress}
          walletImageUrl={toWalletIcon}
          value={quote.selectedQuote.expectedOutputFiat}
          coin={quote.selectedQuote.expectedOutput}
        />
      )}
      <div className="flex w-full items-center gap-3 py-3">
        <Button className="w-full" variant="secondary" onClick={onCancel}>
          <h6>{t("transfer.cancel")}</h6>
        </Button>
        <Button
          className="w-full"
          onClick={onConfirm}
          disabled={!quote.userCanInteract}
        >
          <h6>{t("transfer.confirm")}</h6>
        </Button>
      </div>
      <Link
        href="/disclaimer#providers-and-bridge-disclaimer"
        target="_blank"
        className="mx-auto text-xs font-semibold text-wosmongton-100 hover:text-rust-200"
      >
        {t("disclaimer")}
      </Link>
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
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-osmoverse-700">
      <div className="flex place-content-between items-center px-6 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <Image alt="token image" src={assetImageUrl} width={48} height={48} />
          <h6>
            {t(type === "from" ? "transfer.transfer" : "transfer.receive", {
              denom: coin.denom,
            })}
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
          {t(type === "from" ? "transfer.from" : "transfer.to", {
            network: chainName,
          })}
        </div>
        <div className="flex items-center gap-2">
          <Image
            alt="wallet image"
            src={walletImageUrl}
            width={24}
            height={24}
          />
          <div className="body1 text-wosmongton-200">
            {getShortAddress(address)}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Assumes the first provider in the list is the selected provider. */
const TransferDetails: FunctionComponent<BridgeQuotes> = (quote) => {
  const [isOpen, setIsOpen] = useState(false);
  const [detailsRef, { height: detailsHeight, y: detailsOffset }] =
    useMeasure<HTMLDivElement>();
  const { t } = useTranslation();

  const { selectedQuote } = quote;

  if (!selectedQuote) return null;
  const { estimatedTime, fromChain } = selectedQuote;

  const estTime = estimatedTime.humanize();

  const HeaderContents = isOpen ? (
    <div className="subtitle1">{t("transfer.transferDetails")}</div>
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
        <ExpandDetailsControlContent
          {...quote}
          selectedQuote={selectedQuote}
          open={isOpen}
        />
      </button>
      <div ref={detailsRef} className="flex flex-col gap-4">
        <BridgeProviderDropdownRow {...quote} selectedQuote={selectedQuote} />
        <EstimatedTimeRow {...quote} selectedQuote={selectedQuote} />
        <ProviderFeesRow {...quote} selectedQuote={selectedQuote} />
        <NetworkFeeRow
          {...quote}
          selectedQuote={selectedQuote}
          fromChainName={fromChain?.chainName}
        />

        <TotalFeesRow {...quote} selectedQuote={selectedQuote} />
      </div>
    </div>
  );
};
