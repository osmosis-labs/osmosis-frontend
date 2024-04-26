import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

import { Spinner } from "../loaders";

export type TransactionStatus = "pending" | "success" | "failed";

interface Transaction {
  status: TransactionStatus;
  /** At a high level- what this transaction does. */
  effect: "swap" | "deposit" | "withdraw";
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

export const TransactionRow: FunctionComponent<Transaction> = ({
  status,
  effect,
  title,
  caption,
  tokenConversion,
  transfer,
  onClick,
}) => {
  const effectIconId = effect === "swap" ? "swap" : "down-arrow";

  return (
    <div
      className={classNames("-mx-4 flex h-20 justify-between rounded-2xl p-4", {
        "cursor-pointer hover:bg-osmoverse-825": Boolean(onClick),
      })}
      onClick={() => onClick?.()}
    >
      <div className="flex items-center gap-4">
        {status === "pending" ? (
          <Spinner className="h-8 w-8 pb-4 text-wosmongton-500" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825">
            {status === "success" ? (
              effect === "withdraw" ? (
                <Icon
                  className="rotate-180 transform"
                  id={effectIconId}
                  width={24}
                  height={24}
                />
              ) : (
                <Icon id={effectIconId} width={24} height={24} />
              )
            ) : (
              <Icon
                width={24}
                height={24}
                id="alert-circle"
                color={theme.colors.rust[400]}
              />
            )}
          </div>
        )}

        <p className="text-osmoverse-100">{title[status]}</p>
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
> = ({ status, tokenIn, tokenOut }) => (
  <div className="flex items-center gap-4">
    <FallbackImg
      alt={tokenIn.amount.denom}
      src={tokenIn.amount.currency.coinImageUrl}
      fallbacksrc="/icons/question-mark.svg"
      height={32}
      width={32}
    />
    <div className="flex flex-col text-right ">
      {tokenIn.value && (
        <div
          className={classNames("text-subtitle1", {
            "text-osmoverse-400": status === "pending",
            "text-osmoverse-100": status === "success",
            "text-rust-400": status === "failed",
          })}
        >
          - ${Number(tokenIn.value.toDec().toString()).toFixed(2)}
        </div>
      )}
      <div className="text-body2 text-osmoverse-400">
        {formatPretty(tokenIn.amount, { maxDecimals: 6 })}
      </div>
    </div>
    <Icon
      id="arrow-right"
      width={24}
      height={24}
      className="text-osmoverse-600"
    />
    <FallbackImg
      alt={tokenOut.amount.denom}
      src={tokenOut.amount.currency.coinImageUrl}
      fallbacksrc="/icons/question-mark.svg"
      height={32}
      width={32}
    />
    <div className="flex flex-col text-right text-osmoverse-400">
      {tokenOut.value && (
        <div
          className={classNames("text-subtitle1", {
            "text-osmoverse-400": status === "pending",
            "text-osmoverse-100": status === "success",
            "text-rust-400": status === "failed",
          })}
        >
          + {tokenOut.value.symbol}
          {Number(tokenOut.value.toDec().toString()).toFixed(2)}
        </div>
      )}
      <div className="body2">
        {formatPretty(tokenOut.amount, { maxDecimals: 6 })}
      </div>
    </div>
  </div>
);

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
        className={classNames("text-subtitle1", {
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
