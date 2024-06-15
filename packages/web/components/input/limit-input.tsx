import { CoinPretty, Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { formatPretty } from "~/utils/formatter";

export interface LimitInputProps {
  baseAsset: CoinPretty;
  onChange: (value: string) => void;
  tokenAmount: string;
  price: Dec;
}

enum FocusedInput {
  FIAT = "fiat",
  TOKEN = "token",
}

const nonFocusedClasses =
  "top-[45%] scale-[43%] text-wosmongton-200 hover:cursor-pointer select-none";
const focusedClasses = "top-[0%] text-wosmongton-400 font-h3 font-normal";

const transformAmount = (value: string) => {
  let updatedValue = value;
  if (value.endsWith(".") && value.length === 1) {
    updatedValue = value + "0";
  }

  if (value.startsWith(".")) {
    updatedValue = "0" + value;
  }

  return updatedValue;
};

export const LimitInput: FC<LimitInputProps> = ({
  baseAsset,
  onChange,
  tokenAmount,
  price,
}) => {
  const [fiatAmount, setFiatAmount] = useState<string>("");
  const [focused, setFocused] = useState<FocusedInput>(FocusedInput.FIAT);

  const swapFocus = useCallback(() => {
    switch (focused) {
      case FocusedInput.FIAT:
        setFocused(FocusedInput.TOKEN);
        break;
      case FocusedInput.TOKEN:
      default:
        setFocused(FocusedInput.FIAT);
        break;
    }
  }, [focused]);

  const setFiatAmountSafe = useCallback(
    (value: string) => {
      const updatedValue = transformAmount(value);
      const isFocused = focused === FocusedInput.FIAT;
      if (updatedValue.length > 0 && new Dec(updatedValue).isNegative()) {
        return;
      }
      isFocused
        ? setFiatAmount(updatedValue)
        : setFiatAmount(formatPretty(new Dec(updatedValue)));
    },
    [setFiatAmount, focused]
  );

  const setTokenAmountSafe = useCallback(
    (value: string) => {
      const updatedValue = transformAmount(value);
      const isFocused = focused === FocusedInput.TOKEN;

      if (updatedValue.length > 0 && new Dec(updatedValue).isNegative()) {
        return;
      }
      isFocused
        ? onChange(updatedValue)
        : onChange(formatPretty(new Dec(updatedValue)));
    },
    [onChange, focused]
  );

  useEffect(() => {
    if (focused !== FocusedInput.TOKEN || !price) return;
    const value = new Dec(tokenAmount.length > 0 ? tokenAmount : 0);
    const fiatValue = price?.mul(value) ?? new Dec(0);
    setFiatAmountSafe(formatPretty(fiatValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, tokenAmount, setFiatAmountSafe]);

  useEffect(() => {
    if (focused !== FocusedInput.FIAT || !price) return;
    const value = fiatAmount && fiatAmount.length > 0 ? fiatAmount : "0";
    const tokenValue = new Dec(value)?.quo(price);
    setTokenAmountSafe(tokenValue.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, fiatAmount, setTokenAmountSafe]);

  const FiatInput = useMemo(() => {
    const isFocused = focused === FocusedInput.FIAT;
    return (
      <div
        className={classNames(
          "absolute flex w-full items-center justify-center text-h3 transition-all",
          {
            [nonFocusedClasses]: !isFocused,
            [focusedClasses]: isFocused,
          }
        )}
        onClick={focused === FocusedInput.TOKEN ? swapFocus : undefined}
      >
        <span className={classNames({ "font-normal": !isFocused })}>$</span>
        <AutosizeInput
          placeholder="0"
          type="number"
          value={fiatAmount}
          inputClassName={classNames(
            "bg-transparent text-center placeholder:text-white-disabled focus:outline-none max-w-full",
            { "cursor-pointer font-normal": !isFocused }
          )}
          injectStyles={false}
          onChange={(e) => setFiatAmountSafe(e.target.value)}
          onClick={!isFocused ? swapFocus : undefined}
        />
        {focused === FocusedInput.TOKEN && <SwapArrows />}
      </div>
    );
  }, [fiatAmount, focused, swapFocus, setFiatAmountSafe]);

  const TokenInput = useMemo(() => {
    const isFocused = focused === FocusedInput.TOKEN;
    return (
      <div
        className={classNames(
          "absolute flex w-full items-center justify-center text-h3 transition-all",
          {
            [nonFocusedClasses]: !isFocused,
            [focusedClasses]: isFocused,
          }
        )}
        onClick={focused === FocusedInput.FIAT ? swapFocus : undefined}
      >
        <AutosizeInput
          type="number"
          placeholder="0"
          value={tokenAmount}
          inputClassName={classNames(
            "bg-transparent text-center placeholder:text-white-disabled focus:outline-none",
            { "cursor-pointer font-normal": !isFocused }
          )}
          onChange={(e) => setTokenAmountSafe(e.target.value)}
          onClick={!isFocused ? swapFocus : undefined}
        />
        <span
          className={classNames("text-wosmongton-200", {
            "opacity-60": focused === FocusedInput.TOKEN,
            "font-normal": !isFocused,
          })}
        >
          {baseAsset ? baseAsset.denom : ""}
        </span>
        {focused === FocusedInput.FIAT && <SwapArrows />}
      </div>
    );
  }, [tokenAmount, setTokenAmountSafe, focused, baseAsset, swapFocus]);

  return (
    <div className="relative h-[108px]">
      {FiatInput}
      {TokenInput}
      <button className="absolute right-4 top-3 flex items-center justify-center rounded-5xl border border-osmoverse-700 py-1.5 px-3 opacity-50 transition-opacity hover:opacity-100">
        <span className="body2 text-wosmongton-200">Max</span>
      </button>
    </div>
  );
};

function SwapArrows() {
  return (
    <div className="ml-1 flex h-12 w-14 items-center">
      <Icon
        id="arrow-right"
        className="h-full w-auto rotate-90 text-wosmongton-200"
        width={16}
        height={24}
      />
      <Icon
        id="arrow-right"
        className="-ml-1 h-full w-auto -rotate-90 text-wosmongton-200"
        width={16}
        height={24}
      />
    </div>
  );
}
