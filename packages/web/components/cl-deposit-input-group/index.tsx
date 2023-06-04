import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-multi-lang";

import { InputBox } from "~/components/input";
import { useStore } from "~/stores";

export const DepositAmountGroup: FunctionComponent<{
  getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  coin?: CoinPretty;
  coinIsToken0: boolean;
  onUpdate: (amount: number) => void;
  currentValue: string;
  percentage: RatePretty;
  outOfRange?: boolean;
  className?: string;
  priceInputClass?: string;
  outOfRangeClassName?: string;
}> = observer(
  ({
    getFiatValue,
    coin,
    percentage,
    onUpdate,
    coinIsToken0,
    currentValue,
    outOfRange,
    className,
    priceInputClass,
    outOfRangeClassName,
  }) => {
    const { chainStore, queriesStore, accountStore } = useStore();
    const t = useTranslation();
    const { chainId } = chainStore.osmosis;
    const { bech32Address } = accountStore.getAccount(chainId);

    const fiatPer = coin && getFiatValue ? getFiatValue(coin) : 0;

    const walletBalance = coin?.currency
      ? queriesStore
          .get(chainId)
          .queryBalances.getQueryBech32Address(bech32Address)
          .getBalanceFromCurrency(coin.currency)
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
            "flex flex-1 flex-shrink-0 flex-row items-center gap-3 rounded-[20px] bg-osmoverse-700 px-6 py-7",
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
          "flex flex-1 flex-shrink-0 flex-row items-center rounded-[20px] bg-osmoverse-700 p-6",
          className
        )}
      >
        <div className="flex w-full flex-row items-center">
          <div
            className={classNames(
              "flex overflow-clip rounded-full border-4 p-1",
              coinIsToken0 ? "border-wosmongton-500" : "border-bullish-500"
            )}
          >
            {coin?.currency.coinImageUrl && (
              <Image
                alt=""
                src={coin?.currency.coinImageUrl}
                height={58}
                width={58}
              />
            )}
          </div>
          <div className="ml-[.75rem] mr-[2.75rem] flex flex-col">
            <h6>{coin?.denom ?? ""}</h6>
            <span className="subtitle1 text-osmoverse-400">
              {percentage.maxDecimals(0).toString()}
            </span>
          </div>
          <div className="relative flex flex-1 flex-col gap-0.5">
            <span className="absolute right-0 top-[-16px] mb-[2px] mr-2 text-right text-caption font-caption text-wosmongton-300">
              {walletBalance ? walletBalance.toString() : ""}
            </span>
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
                {fiatPer && `~${fiatPer.toString()}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
