import { CoinPretty, PricePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import React from "react";

import { Icon } from "~/components/assets";
import {
  LargeTransactionContainer,
  SmallTransactionContainer,
} from "~/components/transactions/transaction-types/transaction-containers";
import { EntityImage } from "~/components/ui/entity-image";
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
        <EntityImage
          logoURIs={
            transaction.tokenIn.amount.currency.coinImageUrl
              ? {
                  svg: transaction.tokenIn.amount.currency.coinImageUrl.replace(
                    /\.(png|svg)$/,
                    ".svg"
                  ),
                  png: transaction.tokenIn.amount.currency.coinImageUrl.replace(
                    /\.(png|svg)$/,
                    ".png"
                  ),
                }
              : {}
          }
          name={transaction.tokenIn.amount.denom}
          symbol={transaction.tokenIn.amount.denom}
          height={32}
          width={32}
        />
        <Icon
          id="arrows-swap"
          width={16}
          height={16}
          className="my-[8px] mx-[4px] text-osmoverse-500"
        />
        <EntityImage
          logoURIs={
            transaction.tokenOut.amount.currency.coinImageUrl
              ? {
                  svg: transaction.tokenOut.amount.currency.coinImageUrl.replace(
                    /\.(png|svg)$/,
                    ".svg"
                  ),
                  png: transaction.tokenOut.amount.currency.coinImageUrl.replace(
                    /\.(png|svg)$/,
                    ".png"
                  ),
                }
              : {}
          }
          name={transaction.tokenOut.amount.denom}
          symbol={transaction.tokenOut.amount.denom}
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
          <EntityImage
            logoURIs={
              transaction.tokenIn.amount.currency.coinImageUrl
                ? {
                    svg: transaction.tokenIn.amount.currency.coinImageUrl.replace(
                      /\.(png|svg)$/,
                      ".svg"
                    ),
                    png: transaction.tokenIn.amount.currency.coinImageUrl.replace(
                      /\.(png|svg)$/,
                      ".png"
                    ),
                  }
                : {}
            }
            name={transaction.tokenIn.amount.denom}
            symbol={transaction.tokenIn.amount.denom}
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
          <EntityImage
            logoURIs={
              transaction.tokenOut.amount.currency.coinImageUrl
                ? {
                    svg: transaction.tokenOut.amount.currency.coinImageUrl.replace(
                      /\.(png|svg)$/,
                      ".svg"
                    ),
                    png: transaction.tokenOut.amount.currency.coinImageUrl.replace(
                      /\.(png|svg)$/,
                      ".png"
                    ),
                  }
                : {}
            }
            name={transaction.tokenOut.amount.denom}
            symbol={transaction.tokenOut.amount.denom}
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
