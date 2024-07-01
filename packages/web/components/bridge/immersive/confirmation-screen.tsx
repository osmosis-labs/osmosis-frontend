import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { getShortAddress } from "@osmosis-labs/utils";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import { FunctionComponent, PropsWithChildren, useState } from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";

export const ConfirmationScreen: FunctionComponent<{
  direction: "deposit" | "withdraw";
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ direction, onCancel, onConfirm }) => (
  <div className="mx-auto flex w-[512px] flex-col gap-1 py-12">
    <h5>
      Confirm {direction} {direction === "withdraw" ? "from" : "to"} Osmosis
    </h5>
    <AssetBox
      type="from"
      tokenImageUrl="/tokens/generated/USDC.svg"
      chainName="Noble"
      address="noble1ckgqk0nfqaqs32rv4akjqkcl9754ylwrkg30ht"
      walletImageUrl="/wallets/keplr.svg"
      value={
        new PricePretty(
          { currency: "usd", locale: "en-US", maxDecimals: 2, symbol: "$" },
          40
        )
      }
      coin={
        new CoinPretty(
          {
            coinDenom: "USDC",
            coinMinimalDenom: "uusdc",
            coinDecimals: 6,
          },
          "40000000"
        )
      }
    />
    <TransferDetails
      providerId="Skip"
      providerImageUrl="/bridges/skip.svg"
      estimatedTimeSeconds={920}
      networkName="Ethereum"
      networkFee={{
        amount: new CoinPretty(
          {
            coinDenom: "OSMO",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
          },
          "1000000"
        ),
        value: new PricePretty(
          { currency: "usd", locale: "en-US", maxDecimals: 2, symbol: "$" },
          0.1
        ),
      }}
      transferFee={{
        amount: new CoinPretty(
          {
            coinDenom: "OSMO",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
          },
          "1000000"
        ),
        value: new PricePretty(
          { currency: "usd", locale: "en-US", maxDecimals: 2, symbol: "$" },
          0.1
        ),
      }}
      alternativeProvider={[{ id: "Squid", imageUrl: "/bridges/squid.svg" }]}
      onSelectProvider={() => {}}
    />
    <AssetBox
      type="to"
      tokenImageUrl="/tokens/generated/USDC.svg"
      chainName="Noble"
      address="noble1ckgqk0nfqaqs32rv4akjqkcl9754ylwrkg30ht"
      walletImageUrl="/wallets/keplr.svg"
      value={
        new PricePretty(
          { currency: "usd", locale: "en-US", maxDecimals: 2, symbol: "$" },
          39.88
        )
      }
      coin={
        new CoinPretty(
          {
            coinDenom: "USDC",
            coinMinimalDenom: "uusdc",
            coinDecimals: 6,
          },
          "39880000"
        )
      }
    />
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

const AssetBox: FunctionComponent<{
  type: "from" | "to";
  tokenImageUrl: string;
  chainName: string;
  address: string;
  walletImageUrl: string;
  value: PricePretty;
  coin: CoinPretty;
}> = ({
  type,
  tokenImageUrl,
  chainName,
  address,
  walletImageUrl,
  value,
  coin,
}) => (
  <div className="flex w-full flex-col gap-2 rounded-2xl border border-osmoverse-700">
    <div className="flex place-content-between items-center px-6 pt-4 pb-2">
      <div className="flex items-center gap-3">
        <Image alt="token image" src={tokenImageUrl} width={48} height={48} />
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
const TransferDetails: FunctionComponent<{
  // TODO: this should be a list of quotes of a single quote type
  providerId: string;
  providerImageUrl: string;
  estimatedTimeSeconds: number;
  networkName: string;
  networkFee: {
    amount: CoinPretty;
    value: PricePretty;
  };
  transferFee: {
    amount: CoinPretty;
    value: PricePretty;
  };
  alternativeProvider: { id: string; imageUrl: string }[];
  onSelectProvider: (providerId: string) => void;
}> = ({
  providerImageUrl,
  estimatedTimeSeconds,
  networkName,
  networkFee,
  transferFee,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [detailsRef, { height: detailsHeight, y: detailsOffset }] =
    useMeasure<HTMLDivElement>();

  const totalFeePrice = networkFee.value.add(transferFee.value);
  const estTime = dayjs.duration({ seconds: estimatedTimeSeconds }).humanize();

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
          {!isOpen && (
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
          <div className="flex items-center gap-3">
            <Image
              alt="provider logo"
              src={providerImageUrl}
              height={24}
              width={24}
            />
            <Icon
              className="text-osmoverse-300"
              id="chevron-down"
              height={16}
              width={16}
            />
          </div>
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
        <DetailRow label={`${networkName} network fee`}>
          <div className="flex items-center gap-1">
            <div className="body2 text-osmoverse-100">
              {networkFee.value.trim(true).toString()}
            </div>
            <div className="body2 text-osmoverse-300">
              {networkFee.amount.trim(true).toString()}
            </div>
          </div>
        </DetailRow>
        <DetailRow label="Provider fee">
          <div className="flex items-center gap-1">
            <div className="body2 text-osmoverse-100">
              {transferFee.value.trim(true).toString()}
            </div>
            <div className="body2 text-osmoverse-300">
              {transferFee.amount.trim(true).toString()}
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
