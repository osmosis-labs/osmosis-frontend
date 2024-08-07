import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { ChainLogo } from "~/components/assets/chain-logo";
import { displayFiatPrice } from "~/components/transactions/transaction-utils";
import { useTranslation } from "~/hooks";
import { formatPretty } from "~/utils/formatter";
export type TransactionStatus = "pending" | "success" | "failed";
import { api } from "~/utils/trpc";
type Effect = "swap" | "deposit" | "withdraw";

interface Transaction {
  isSelected?: boolean;
  status: TransactionStatus;
  /** At a high level- what this transaction does. */
  effect: Effect;
  title: {
    [key in TransactionStatus]: string;
  };
  caption?: string;
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
  onClick?: () => void;
}

interface Transaction {
  isSelected?: boolean;
  status: TransactionStatus;
  /** At a high level- what this transaction does. */
  effect: Effect;
  title: {
    [key in TransactionStatus]: string;
  };
  caption?: string;
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
  onClick?: () => void;
  toChainId?: string;
  fromChainId?: string;
}

export const RecentActivityTransferRow: FunctionComponent<Transaction> = ({
  status,
  title,
  transfer,
  toChainId,
  fromChainId,
}) => {
  const { data: chainData } = api.edge.chains.getChain.useQuery(
    {
      findChainNameOrId: fromChainId || "",
    },
    {
      useErrorBoundary: true,
    }
  );

  console.log("direction: ", transfer?.direction);
  console.log("chainData: ", chainData?.pretty_name);
  console.log("-------------");

  return (
    <div
      className={classNames("-mx-2 flex justify-between gap-4 rounded-2xl p-2")}
    >
      <div className="flex flex-col">
        <p className="subtitle1 text-osmoverse-100">{title[status]}</p>
        {transfer && (
          <div className="caption flex gap-1 text-osmoverse-300">
            {transfer && formatPretty(transfer?.amount, { maxDecimals: 6 })}{" "}
            from {chainData?.pretty_name}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end">
        {transfer?.direction === "withdraw" ? (
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
        )}
      </div>
    </div>
  );
};

export const RecentActivityTransactionRow: FunctionComponent<Transaction> = ({
  status,
  title,
  caption,
  tokenConversion,
  transfer,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames("-mx-2 flex justify-between gap-4 rounded-2xl p-2")}
    >
      <div className="flex items-center gap-4">
        <div>
          <div className="flex flex-col">
            <p className="subtitle1 text-osmoverse-100">{title[status]}</p>
            {tokenConversion && (
              <div className="caption flex gap-1 text-osmoverse-300">
                {displayFiatPrice(tokenConversion.tokenIn?.value, "", t)}{" "}
                {tokenConversion.tokenOut.amount.denom}{" "}
                <Icon id="arrow-right" width={14} height={14} />{" "}
                {tokenConversion.tokenIn.amount.denom}
              </div>
            )}
          </div>
          {tokenConversion && (
            <div className="caption mt-1 hidden text-osmoverse-300">
              {formatPretty(tokenConversion.tokenOut.amount, {
                maxDecimals: 6,
              })}
              <Icon
                id="arrow-right"
                width={12}
                height={12}
                className="ml-1 inline-block"
              />
            </div>
          )}
        </div>
      </div>
      {caption && <p className="body1 text-osmoverse-300">{caption}</p>}
      {tokenConversion && (
        <TokenConversion status={status} {...tokenConversion} />
      )}
      {transfer && <TokenTransfer status={status} {...transfer} />}
    </div>
  );
};

/** UI for displaying one token being converted into another by this transaction. */
const TokenConversion: FunctionComponent<
  { status: TransactionStatus } & NonNullable<Transaction["tokenConversion"]>
> = ({ tokenIn, tokenOut }) => {
  return (
    <div className="flex items-center justify-end">
      <FallbackImg
        alt={tokenIn.amount.denom}
        src={tokenIn.amount.currency.coinImageUrl}
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
        alt={tokenOut.amount.denom}
        src={tokenOut.amount.currency.coinImageUrl}
        fallbacksrc="/icons/question-mark.svg"
        height={32}
        width={32}
      />
    </div>
  );
};

/** UI for displaying a token being deposited or withdrawn from Osmosis. */
export const TokenTransfer: FunctionComponent<
  {
    status: TransactionStatus;
  } & NonNullable<Transaction["transfer"]>
> = ({ status, direction, amount, value }) => (
  <div className="flex items-center gap-4">
    <FallbackImg
      alt={amount.denom}
      src={amount.currency.coinImageUrl}
      fallbacksrc="/icons/question-mark.svg"
      height={32}
      width={32}
    />
    <div className="body2 text-osmoverse-400">
      {formatPretty(amount, { maxDecimals: 6 })}
    </div>
    {value && (
      <div
        className={classNames("subtitle1", {
          "text-osmoverse-400": status === "pending",
          "text-osmoverse-100": status === "success",
          "text-rust-400": status === "failed",
        })}
      >
        {direction === "withdraw" ? "-" : "+"} {value.symbol}
        {Number(value.toDec().abs().toString()).toFixed(2)}
      </div>
    )}
  </div>
);
