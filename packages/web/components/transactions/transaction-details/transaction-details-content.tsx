import { FormattedTransaction } from "@osmosis-labs/server";
import { shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { FallbackImg } from "~/components/assets";
import { CopyIconButton } from "~/components/buttons/copy-icon-button";
import { IconButton } from "~/components/buttons/icon-button";
import { displayFiatPrice } from "~/components/transactions/transaction-utils";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useFeatureFlags,
  useTranslation,
} from "~/hooks";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

export const TransactionDetailsContent = ({
  onRequestClose,
  isModal,
  transaction,
}: {
  onRequestClose: () => void;
  isModal: boolean;
  transaction: FormattedTransaction;
}) => {
  const { t } = useTranslation();

  const { tokenIn, tokenOut } = transaction.metadata[0].value[0].txInfo;

  const txFee = transaction.metadata[0].value[0].txFee[0];

  const formattedMonth = dayjs(transaction.blockTimestamp)
    .format("MMMM")
    .slice(0, 3);

  const formattedDateDayYearHourMinute = dayjs(
    transaction.blockTimestamp
  ).format("DD, YYYY, HH:mm");

  // create a localized formatted date - example: Jan 1, 2022, 12:00
  const formattedDate = `${formattedMonth} ${formattedDateDayYearHourMinute}`;

  const [conversion, setConversion] = useState({
    numerator: tokenIn.token,
    denominator: tokenOut.token,
  });

  useEffect(() => {
    setConversion({
      numerator: tokenIn.token,
      denominator: tokenOut.token,
    });
  }, [tokenIn.token, tokenOut.token, transaction.hash]);

  const toggleConversion = () => {
    setConversion({
      numerator: conversion.denominator,
      denominator: conversion.numerator,
    });
  };

  const conversionRate = useMemo(() => {
    return formatPretty(
      conversion.numerator.toDec().quo(conversion.denominator.toDec()),
      { maxDecimals: 2 }
    );
  }, [conversion.numerator, conversion.denominator]);

  const { logEvent } = useAmplitudeAnalytics();

  const status = transaction.code === 0 ? "success" : "failed";

  const title = {
    pending: t("transactions.swapping"),
    success: t("transactions.swapped"),
    failed: t("transactions.swapFailed"),
  };

  const featureFlags = useFeatureFlags();

  return (
    <div
      className={classNames("flex flex-col overflow-y-auto", {
        // 4.5rem is the height of the navbar
        "sticky top-[4.5rem] ml-4 h-[calc(100vh_-_4.5rem)] w-[480px] border-osmoverse-700 bg-osmoverse-900 pl-4 pt-3":
          !isModal,
        "bg-osmoverse-900": !featureFlags.limitOrders,
        "bg-osmoverse-1000 xl:bg-osmoverse-850": featureFlags.limitOrders,
      })}
    >
      <div className="flex flex-col px-4 pb-8 md:p-0">
        {!isModal && (
          <div className="py-4">
            <IconButton
              aria-label="Close"
              mode="unstyled"
              size="unstyled"
              className="h-12 w-12 cursor-pointer rounded-full py-0 text-osmoverse-400 hover:rounded-full hover:bg-osmoverse-850 hover:text-white-full"
              icon={<Icon id="close-small" width={24} height={24} />}
              onClick={onRequestClose}
            />
          </div>
        )}
        <div className="flex flex-col items-center gap-4 pb-6 pt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825">
            <Icon id="swap" width={24} height={24} aria-label="swap icon" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="text-h5">{title[status]}</div>
            <div className="body1 capitalize text-osmoverse-300">
              {formattedDate}
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-osmoverse-700 p-2">
          <div className="flex justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10">
                <FallbackImg
                  alt={tokenIn.token.denom}
                  src={tokenIn.token.currency.coinImageUrl}
                  fallbacksrc="/icons/question-mark.svg"
                  height={40}
                  width={40}
                />
              </div>
              <div className="flex flex-col">
                <div className="subtitle1">{t("transactions.sold")}</div>
                <div className="body1 text-osmoverse-300">
                  {tokenIn.token.denom}
                </div>
              </div>
            </div>
            <div className="flex-end flex flex-col text-right">
              <div className="subtitle1">
                {/* // TODO - clean this up to match tokenConversion */}
                {formatPretty(tokenIn.token, { maxDecimals: 6 }).split(" ")[0]}
              </div>
              <div className="body1 text-osmoverse-300">
                {displayFiatPrice(tokenIn?.usd, "", t)}
              </div>
            </div>
          </div>
          <div className="flex h-10 w-14 items-center justify-center p-2">
            <Icon
              id="arrow-right"
              width={24}
              height={24}
              className="rotate-90"
              color={theme.colors.osmoverse[400]}
            />
          </div>
          <div className="flex justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10">
                <FallbackImg
                  alt={tokenOut.token.denom}
                  src={tokenOut.token.currency.coinImageUrl}
                  fallbacksrc="/icons/question-mark.svg"
                  height={40}
                  width={40}
                />
              </div>
              <div className="flex flex-col">
                <div className="subtitle1">{t("transactions.bought")}</div>
                <div className="body1 text-osmoverse-300">
                  {tokenOut.token.denom}
                </div>
              </div>
            </div>
            <div className="flex-end flex flex-col text-right">
              <div className="subtitle1">
                {/* // TODO - clean this up to match tokenConversion */}
                {formatPretty(tokenOut.token, { maxDecimals: 6 }).split(" ")[0]}
              </div>
              <div className="body1 text-osmoverse-300">
                {displayFiatPrice(tokenOut?.usd, "", t)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col py-3">
          <div className="body2 flex justify-between gap-3 py-3">
            <div
              onClick={toggleConversion}
              className="body2 flex cursor-pointer items-center gap-1 whitespace-nowrap"
            >
              {t("transactions.executionPrice")} <Icon id="left-right-arrow" />
            </div>
            <CopyIconButton
              valueToCopy={conversionRate}
              label={`1 ${conversion.denominator.denom} = ${conversionRate} ${conversion.numerator.denom}`}
            />
          </div>
          <div className="body2 flex justify-between gap-3 py-3">
            <div>{t("transactions.totalFees")}</div>
            <div className="text-osmoverse-300">
              {formatPretty(txFee.token, {
                maxDecimals: 2,
              })?.toString()}
            </div>
          </div>
          <div className="body2 flex items-center justify-between py-3">
            <div>{t("transactions.transactionHash")}</div>
            <CopyIconButton
              valueToCopy={transaction.hash}
              label={shorten(transaction.hash)}
            />
          </div>
        </div>
        <Button
          size="default"
          variant="secondary"
          asChild
          onClick={() =>
            logEvent([
              EventName.TransactionsPage.explorerClicked,
              {
                source: "modal",
              },
            ])
          }
        >
          <a
            rel="noopener noreferrer"
            target="_blank"
            href={`https://www.mintscan.io/osmosis/txs/${transaction.hash}`}
          >
            <span>{t("transactions.viewOnExplorer")} &#x2197;</span>
          </a>
        </Button>
      </div>
    </div>
  );
};
