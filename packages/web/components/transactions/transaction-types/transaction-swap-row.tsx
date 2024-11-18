import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import React from "react";

import { FallbackImg, Icon } from "~/components/assets";
import {
  LargeTransactionContainer,
  SmallTransactionContainer,
} from "~/components/transactions/transaction-types/transaction-containers";
import { useWindowSize } from "~/hooks";
import { useTranslation } from "~/hooks/language/context";
import { formatFiatPrice, formatPretty } from "~/utils/formatter";

interface TransactionSwapRowProps {
  size: "sm" | "lg";
  transaction: {
    code: number;
    tokenIn: {
      amount: CoinPretty;
      value?: PricePretty;
    };
    tokenOut: {
      amount: CoinPretty;
      value?: PricePretty;
    };
  };
  isSelected?: boolean;
  onClick?: () => void;
  hash?: string;
}

export const TransactionSwapRow = ({
  transaction,
  size: sizeProp,
  isSelected,
  onClick,
  hash,
}: TransactionSwapRowProps) => {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();

  const size = isMobile ? "sm" : sizeProp;

  const status = transaction.code === 0 ? "success" : "failed";

  const leftComponent = (
    <div className="flex flex-col gap-0.5">
      <div className="caption flex items-center gap-1 text-osmoverse-300">
        {transaction.tokenIn?.value &&
          formatFiatPrice(transaction.tokenIn?.value)}{" "}
        {transaction.tokenIn.amount.denom}{" "}
        <Icon id="arrow-right" width={14} height={14} />{" "}
        {transaction.tokenOut.amount.denom}
      </div>
    </div>
  );

  const rightComponent =
    size === "sm" ? (
      <div className="flex items-center justify-end">
        <FallbackImg
          alt={transaction.tokenIn.amount.denom}
          src={transaction.tokenIn.amount.currency.coinImageUrl}
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
          alt={transaction.tokenOut.amount.denom}
          src={transaction.tokenOut.amount.currency.coinImageUrl}
          fallbacksrc="/icons/question-mark.svg"
          height={32}
          width={32}
        />
      </div>
    ) : (
      <div className="flex w-2/3 items-center justify-end gap-4 md:w-1/2">
        <div className="flex w-60 items-center justify-end gap-4 md:hidden">
          <div className="flex flex-col text-right md:hidden">
            {transaction.tokenIn.value && (
              <div
                className={classNames("subtitle1", {
                  "text-osmoverse-100": status === "success",
                  "text-rust-400": status === "failed",
                })}
              >
                {formatPretty(transaction.tokenIn.amount, { maxDecimals: 6 })}
              </div>
            )}
            <div className="body2 text-osmoverse-400">
              {transaction.tokenIn.value &&
                `- ${formatFiatPrice(transaction.tokenIn.value)}`}
            </div>
          </div>
          <FallbackImg
            alt={transaction.tokenIn.amount.denom}
            src={transaction.tokenIn.amount.currency.coinImageUrl}
            fallbacksrc="/icons/question-mark.svg"
            height={32}
            width={32}
            className="block md:hidden"
          />
        </div>
        <Icon
          id="arrow-right"
          width={24}
          height={24}
          className="block text-osmoverse-600 md:hidden"
        />
        <div className="flex w-60 items-center justify-start gap-4 md:justify-end">
          <FallbackImg
            alt={transaction.tokenOut.amount.denom}
            src={transaction.tokenOut.amount.currency.coinImageUrl}
            fallbacksrc="/icons/question-mark.svg"
            height={32}
            width={32}
            className="block md:hidden"
          />
          <div className="text-left text-osmoverse-400 md:text-right">
            {transaction.tokenOut.value && (
              <div
                className={classNames("subtitle1 md:body2", {
                  "text-osmoverse-100": status === "success",
                  "text-rust-400": status === "failed",
                })}
              >
                {formatPretty(transaction.tokenOut.amount, { maxDecimals: 6 })}
              </div>
            )}
            <div className="md:caption body2 mt-0 md:mt-1">
              {transaction.tokenOut.value &&
                `+ ${formatFiatPrice(transaction.tokenOut.value)}`}
            </div>
          </div>
        </div>
      </div>
    );

  if (size === "sm") {
    return (
      <SmallTransactionContainer
        status={status}
        title={{
          pending: t("transactions.swapping"),
          success: t("transactions.swapped"),
          failed: t("transactions.swapFailed"),
        }}
        leftComponent={leftComponent}
        rightComponent={rightComponent}
        isSelected={isSelected}
        onClick={onClick}
      />
    );
  }

  return (
    <LargeTransactionContainer
      iconId="swap"
      status={status}
      title={{
        pending: t("transactions.swapping"),
        success: t("transactions.swapped"),
        failed: t("transactions.swapFailed"),
      }}
      rightComponent={rightComponent}
      isSelected={isSelected}
      onClick={onClick}
      hash={hash}
    />
  );
};
