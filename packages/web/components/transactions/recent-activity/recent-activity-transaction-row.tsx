import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { FunctionComponent } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { ChainLogo } from "~/components/assets/chain-logo";
import { displayFiatPrice } from "~/components/transactions/transaction-utils";
import { useTranslation } from "~/hooks";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

export type TransactionStatus = "pending" | "success" | "failed";
type Effect = "swap" | "deposit" | "withdraw";

interface Activity {
  isSelected?: boolean;
  status: TransactionStatus;
  effect: Effect;
  title: {
    [key in TransactionStatus]: string;
  };
  tokenConversion?: {
    tokenIn: {
      amount: CoinPretty;
      value?: PricePretty;
    };
    tokenOut: {
      amount: CoinPretty;
      value?: PricePretty;
    };
  };
  transfer?: {
    direction: "deposit" | "withdraw";
    amount: CoinPretty;
    value?: PricePretty;
  };
  toChainId?: string;
  fromChainId?: string;
}

export const RecentActivityRow: FunctionComponent<{
  status: TransactionStatus;
  title: { [key in TransactionStatus]: string };
  leftComponent: JSX.Element | null;
  rightComponent: JSX.Element | null;
}> = ({ status, title, leftComponent, rightComponent }) => {
  return (
    <div className="-mx-2 flex justify-between gap-4 rounded-2xl p-2">
      <div className="flex flex-col">
        <p className="subtitle1 text-osmoverse-100">{title[status]}</p>
        {leftComponent}
      </div>
      <div className="flex items-center justify-end">{rightComponent}</div>
    </div>
  );
};

export const TransferRow: FunctionComponent<Activity> = ({
  status,
  title,
  transfer,
  toChainId,
  fromChainId,
}) => {
  const findChainNameOrId =
    transfer?.direction === "withdraw" ? toChainId : fromChainId;

  const { data: chainData } = api.edge.chains.getChain.useQuery(
    {
      findChainNameOrId: findChainNameOrId || "",
    },
    {
      useErrorBoundary: true,
    }
  );

  const text = transfer?.direction === "withdraw" ? "to" : "from";

  const leftComponent = transfer ? (
    <div className="caption flex gap-1 text-osmoverse-300">
      {formatPretty(transfer.amount, { maxDecimals: 6 })} {text}{" "}
      {chainData?.pretty_name}
    </div>
  ) : null;

  const rightComponent =
    transfer?.direction === "withdraw" ? (
      <>
        <FallbackImg
          alt={transfer?.amount.denom}
          src={transfer?.amount.currency.coinImageUrl}
          fallbacksrc="/icons/question-mark.svg"
          height={32}
          width={32}
        />
        <Icon
          id="arrow-right"
          width={16}
          height={16}
          className="my-[8px] mx-[4px] text-osmoverse-500"
        />
        <ChainLogo
          prettyName={chainData?.pretty_name}
          color={undefined}
          logoUri={chainData?.logoURIs?.svg}
          size="md"
        />
      </>
    ) : (
      <>
        <ChainLogo
          prettyName={chainData?.pretty_name}
          color={undefined}
          logoUri={chainData?.logoURIs?.svg}
          size="md"
        />
        <Icon
          id="arrow-right"
          width={16}
          height={16}
          className="my-[8px] mx-[4px] text-osmoverse-500"
        />
        <FallbackImg
          alt={transfer?.amount.denom}
          src={transfer?.amount.currency.coinImageUrl}
          fallbacksrc="/icons/question-mark.svg"
          height={32}
          width={32}
        />
      </>
    );

  return (
    <RecentActivityRow
      status={status}
      title={title}
      leftComponent={leftComponent}
      rightComponent={rightComponent}
    />
  );
};

export const SwapRow: FunctionComponent<Activity> = ({
  status,
  title,
  tokenConversion,
}) => {
  const { t } = useTranslation();

  const leftComponent = tokenConversion ? (
    <div className="caption flex gap-1 text-osmoverse-300">
      {displayFiatPrice(tokenConversion.tokenIn?.value, "", t)}{" "}
      {tokenConversion.tokenOut.amount.denom}{" "}
      <Icon id="arrow-right" width={14} height={14} />{" "}
      {tokenConversion.tokenIn.amount.denom}
    </div>
  ) : null;

  const rightComponent = tokenConversion ? (
    <div className="flex items-center justify-end">
      <FallbackImg
        alt={tokenConversion.tokenIn.amount.denom}
        src={tokenConversion.tokenIn.amount.currency.coinImageUrl}
        fallbacksrc="/icons/question-mark.svg"
        height={32}
        width={32}
      />
      <Icon
        id="arrows-swap"
        width={16}
        height={16}
        className="my-[8px] mx-[4px] text-osmoverse-500"
      />
      <FallbackImg
        alt={tokenConversion.tokenOut.amount.denom}
        src={tokenConversion.tokenOut.amount.currency.coinImageUrl}
        fallbacksrc="/icons/question-mark.svg"
        height={32}
        width={32}
      />
    </div>
  ) : null;

  return (
    <RecentActivityRow
      status={status}
      title={title}
      leftComponent={leftComponent}
      rightComponent={rightComponent}
    />
  );
};
