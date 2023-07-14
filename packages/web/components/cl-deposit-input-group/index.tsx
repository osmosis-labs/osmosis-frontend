import { Currency } from "@keplr-wallet/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-multi-lang";

import { InputBox } from "~/components/input";
import { useStore } from "~/stores";

export const DepositAmountGroup: FunctionComponent<{
  getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  currency?: Currency;
  onUpdate: (amount: number) => void;
  onMax: () => void;
  currentValue: string;
  percentage: RatePretty;
  outOfRange?: boolean;
  className?: string;
  priceInputClass?: string;
  outOfRangeClassName?: string;
}> = observer(
  ({
    getFiatValue,
    currency,
    percentage,
    onUpdate,
    onMax,
    currentValue,
    outOfRange,
    className,
    priceInputClass,
    outOfRangeClassName,
  }) => {
    const { chainStore, queriesStore, accountStore } = useStore();
    const t = useTranslation();
    const { chainId } = chainStore.osmosis;
    const account = accountStore.getWallet(chainId);
    const address = account?.address ?? "";

    const currentValuePrice =
      currency && getFiatValue
        ? getFiatValue(
            new CoinPretty(
              currency,
              new Dec(currentValue).mul(
                DecUtils.getTenExponentN(currency.coinDecimals)
              )
            )
          )
        : 0;

    const walletBalance = currency
      ? queriesStore
          .get(chainId)
          .queryBalances.getQueryBech32Address(address)
          .getBalanceFromCurrency(currency)
      : null;

    const updateValue = useCallback(
      (val: string) => {
        const newVal = Number(val);
        onUpdate(newVal);
      },
      [onUpdate]
    );

    if (outOfRange) {
      return (
        <div
          className={classNames(
            "flex flex-1 flex-shrink-0 items-center gap-3 rounded-[20px] bg-osmoverse-700 px-6 py-7",
            outOfRangeClassName
          )}
        >
          <Image
            className="flex-shrink-0 flex-grow"
            alt=""
            src="/icons/lock.svg"
            height={24}
            width={24}
          />
          <div className="flex-shrink-1 caption w-0 flex-1 text-osmoverse-300">
            {t("addConcentratedLiquidity.outOfRangeWarning")}
          </div>
        </div>
      );
    }

    return (
      <div
        className={classNames(
          "flex flex-1 flex-shrink-0 items-center rounded-[20px] bg-osmoverse-700 p-6",
          className
        )}
      >
        <div className="flex w-full items-center gap-3">
          <div className="flex w-5/12 flex-wrap items-center gap-3">
            <div className="flex flex-shrink-0 overflow-clip rounded-full p-1">
              {currency?.coinImageUrl && (
                <Image
                  alt=""
                  src={currency.coinImageUrl}
                  height={50}
                  width={50}
                />
              )}
            </div>
            <div className=" flex flex-col xs:mr-8">
              <h6>{currency?.coinDenom ?? ""}</h6>
              <span className="subtitle1 text-osmoverse-400">
                {percentage.maxDecimals(0).toString()}
              </span>
            </div>
          </div>

          <div className="relative flex w-7/12 flex-col gap-1">
            {walletBalance && (
              <span
                onClick={onMax}
                className="caption mr-2.5 cursor-pointer text-right text-wosmongton-300"
              >
                {walletBalance.trim(true).maxDecimals(8).toString()}
              </span>
            )}
            <div
              className={classNames(
                "flex h-16 w-[158px] flex-col items-end justify-center self-end rounded-[12px] bg-osmoverse-800",
                priceInputClass
              )}
            >
              <InputBox
                className="border-0 bg-transparent text-h5 font-h5"
                inputClassName="!leading-4"
                type="number"
                currentValue={currentValue}
                onInput={updateValue}
                rightEntry
              />
              <div className="caption pr-3 text-osmoverse-400">
                {currentValuePrice && `~${currentValuePrice.toString()}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
