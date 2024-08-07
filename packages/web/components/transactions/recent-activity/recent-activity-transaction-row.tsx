import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { displayFiatPrice } from "~/components/transactions/transaction-utils";
import { useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

import { Spinner } from "../../loaders";

export type TransactionStatus = "pending" | "success" | "failed";

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
}

export const RecentActivityTransferRow: FunctionComponent<Transaction> = ({
  status,
  effect,
  title,
  transfer,
}) => {
  const effectIconId = effect === "swap" ? "swap" : "down-arrow";

  return (
    <div
      className={classNames("-mx-4 flex justify-between gap-4 rounded-2xl p-2")}
    >
      <div className="flex items-center gap-4 md:w-1/2 md:gap-2">
        {status === "pending" ? (
          <Spinner className="h-8 w-8 pb-4 text-wosmongton-500" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825 p-3 md:h-8 md:w-8 md:p-2">
            {status === "success" ? (
              effect === "withdraw" ? (
                <Icon
                  className="rotate-180 transform"
                  id={effectIconId}
                  width="100%"
                  height="100%"
                />
              ) : (
                <Icon id={effectIconId} width="100%" height="100%" />
              )
            ) : (
              <Icon
                width="100%"
                height="100%"
                id="alert-circle"
                color={theme.colors.rust[400]}
              />
            )}
          </div>
        )}
        <div>
          <p className="subtitle1 md:body2 text-osmoverse-100">
            {title[status]}
          </p>
        </div>
      </div>
      {transfer && <TokenTransfer status={status} {...transfer} />}
    </div>
  );
};

export const RecentActivityTransactionRow: FunctionComponent<Transaction> = ({
  status,
  effect,
  title,
  caption,
  tokenConversion,
  transfer,
}) => {
  const effectIconId = effect === "swap" ? "swap" : "down-arrow";

  const { t } = useTranslation();

  return (
    <div
      className={classNames("-mx-4 flex justify-between gap-4 rounded-2xl p-2")}
    >
      <div className="flex items-center gap-4 md:w-1/2 md:gap-2">
        {status === "pending" ? (
          <Spinner className="h-8 w-8 pb-4 text-wosmongton-500" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825 p-3">
            {status === "success" ? (
              effect === "withdraw" ? (
                <Icon
                  className="rotate-180 transform"
                  id={effectIconId}
                  width="100%"
                  height="100%"
                />
              ) : (
                <Icon id={effectIconId} width="100%" height="100%" />
              )
            ) : (
              <Icon
                width="100%"
                height="100%"
                id="alert-circle"
                color={theme.colors.rust[400]}
              />
            )}
          </div>
        )}

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
            <div className="caption mt-1 hidden text-osmoverse-300 md:flex md:items-center">
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
        <TokenConversion status={status} effect={effect} {...tokenConversion} />
      )}
      {transfer && <TokenTransfer status={status} {...transfer} />}
    </div>
  );
};

/** UI for displaying one token being converted into another by this transaction. */
const TokenConversion: FunctionComponent<
  { status: TransactionStatus; effect: Effect } & NonNullable<
    Transaction["tokenConversion"]
  >
> = ({ tokenIn, tokenOut }) => {
  return (
    <div className="flex items-center justify-end gap-4">
      <div className="flex items-center justify-end gap-4">
        <FallbackImg
          alt={tokenIn.amount.denom}
          src={tokenIn.amount.currency.coinImageUrl}
          fallbacksrc="/icons/question-mark.svg"
          height={32}
          width={32}
        />
      </div>
      <Icon id="arrow-right" width={24} height={24} />
      <div className="flex items-center justify-end gap-4">
        <FallbackImg
          alt={tokenOut.amount.denom}
          src={tokenOut.amount.currency.coinImageUrl}
          fallbacksrc="/icons/question-mark.svg"
          height={32}
          width={32}
        />
      </div>
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
