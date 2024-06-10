import { CoinPretty, Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { useCoinPrice } from "~/hooks/queries/assets/use-coin-price";
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
  "top-[58%] scale-[20%] text-wosmongton-200 hover:cursor-pointer select-none";
const focusedClasses = "top-[20%]";

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
  const { price: basePrice } = useCoinPrice(baseAsset);

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
    const value = new Dec(tokenAmount.length > 0 ? tokenAmount : "0");
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
  }, [price, fiatAmount, setTokenAmountSafe, basePrice]);

  const FiatInput = useMemo(() => {
    const isFocused = focused === FocusedInput.FIAT;
    return (
      <div
        className={classNames(
          "absolute flex w-full flex-row items-center justify-center text-h1 transition-all",
          {
            [nonFocusedClasses]: !isFocused,
            [focusedClasses]: isFocused,
          }
        )}
        onClick={focused === FocusedInput.TOKEN ? swapFocus : undefined}
      >
        <span className="mr-1">$</span>
        <AutosizeInput
          placeholder="0"
          type="number"
          value={fiatAmount}
          inputClassName={classNames(
            "bg-transparent text-center placeholder:text-white-disabled focus:outline-none max-w-full",
            { "cursor-pointer": !isFocused }
          )}
          injectStyles={false}
          onChange={(e) => setFiatAmountSafe(e.target.value)}
          onClick={!isFocused ? swapFocus : undefined}
        />
        {focused === FocusedInput.TOKEN && <Icon id="chevron-up" />}
      </div>
    );
  }, [fiatAmount, focused, swapFocus, setFiatAmountSafe]);

  const TokenInput = useMemo(() => {
    const isFocused = focused === FocusedInput.TOKEN;
    return (
      <div
        className={classNames(
          "absolute flex w-full flex-row items-center justify-center gap-1 text-h1 transition-all",
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
            { "cursor-pointer": !isFocused }
          )}
          onChange={(e) => setTokenAmountSafe(e.target.value)}
          onClick={!isFocused ? swapFocus : undefined}
        />
        <span
          className={classNames("ml-2 text-wosmongton-200", {
            "opacity-60": focused === FocusedInput.TOKEN,
          })}
        >
          {baseAsset ? baseAsset.denom : ""}
        </span>
        {focused === FocusedInput.FIAT && (
          <Icon id="chevron-up" width={16} height={16} />
        )}
      </div>
    );
  }, [tokenAmount, setTokenAmountSafe, focused, baseAsset, swapFocus]);

  return (
    <div className="relative h-[200px]">
      {FiatInput}
      {TokenInput}
    </div>
  );
};
