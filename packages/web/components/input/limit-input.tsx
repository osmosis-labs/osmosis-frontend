import { Dec } from "@keplr-wallet/unit";
import { MinimalAsset } from "@osmosis-labs/types";
import classNames from "classnames";
import { useQueryState } from "nuqs";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { useWindowSize } from "~/hooks";
import { isValidNumericalRawInput } from "~/hooks/input/use-amount-input";
import { countDecimals, trimPlaceholderZeros } from "~/utils/number";

export interface LimitInputProps {
  baseAsset: MinimalAsset;
  onChange: (value: string) => void;
  setMarketAmount: (value: string) => void;
  tokenAmount: string;
  price: Dec;
  disableSwitching?: boolean;
  quoteAssetPrice: Dec;
  quoteBalance?: Dec;
  baseBalance?: Dec;
  expectedOutput?: Dec;
  expectedOutputLoading: boolean;
  insufficientFunds?: boolean;
  inputMode: "fiat" | "token";
  setInputMode: (mode: "fiat" | "token") => void;
}

const calcScale = (numChars: number, isMobile: boolean): string => {
  const sizeMapping: { [key: number]: string } = isMobile
    ? {
        8: "1",
        10: "0.90",
        12: "0.80",
        18: "0.70",
        100: "0.48",
      }
    : {
        8: "1",
        10: "0.90",
        12: "0.80",
        18: "0.70",
        100: "0.48",
      };

  for (const [key, value] of Object.entries(sizeMapping)) {
    if (numChars <= Number(key)) {
      return value;
    }
  }

  return "1";
};

export type FocusedInput = "fiat" | "token";

const nonFocusedClasses =
  "top-[45%] text-wosmongton-200 hover:cursor-pointer select-none";
const focusedClasses = "top-[0%] font-h3 font-normal";

const transformAmount = (value: string, decimalCount = 18) => {
  let updatedValue = value;
  if (value.endsWith(".") && value.length === 1) {
    updatedValue = value + "0";
  }

  if (value.startsWith(".")) {
    updatedValue = "0" + value;
  }

  const decimals = countDecimals(updatedValue);
  return decimals > decimalCount
    ? parseFloat(updatedValue).toFixed(decimalCount).toString()
    : updatedValue;
};

export const LimitInput: FC<LimitInputProps> = ({
  baseAsset,
  onChange,
  tokenAmount,
  price,
  disableSwitching,
  setMarketAmount,
  quoteAssetPrice,
  expectedOutput,
  expectedOutputLoading,
  quoteBalance,
  baseBalance,
  insufficientFunds,
  inputMode,
  setInputMode,
}) => {
  const [fiatAmount, setFiatAmount] = useState<string>("");
  // const [nonMaxAmount, setNonMaxAmount] = useState<string>("");
  // const [max, setMax] = useState<boolean>(false);
  const [tab] = useQueryState("tab", { defaultValue: "buy" });
  const [type] = useQueryState("type", { defaultValue: "market" });
  // const [focused, setFocused] = useState<FocusedInput>(
  //   tab === "buy" ? "fiat" : "token"
  // );
  const focused = inputMode;
  const setFocused = setInputMode;

  const swapFocus = useCallback(() => {
    setFocused((p) => (p === "fiat" ? "token" : "fiat"));
  }, []);

  // Swap focus every time the tab changes
  useEffect(() => swapFocus(), [swapFocus, tab]);

  // Set focus to Fiat / Token on type/tab change
  useEffect(() => {
    if (type === "market") {
      setFocused(tab === "buy" ? "fiat" : "token");
    }
  }, [tab, type]);

  // const setFiatAmountSafe = useCallback(
  //   (value?: string) => {
  //     if (!value) {
  //       setMarketAmount("");
  //       return setFiatAmount("");
  //     }

  //     const updatedValue = transformAmount(value, 6);

  //     if (
  //       !isValidNumericalRawInput(updatedValue) ||
  //       updatedValue.length > 26 ||
  //       (updatedValue.length > 0 && updatedValue.startsWith("-"))
  //     ) {
  //       return;
  //     }

  //     const isFocused = focused === "fiat";

  //     // Hacky solution to deal with rounding
  //     // TODO: Investigate a way to improve this
  //     if (tab === "buy") {
  //       setMarketAmount(new Dec(updatedValue).quo(quoteAssetPrice).toString());
  //     }
  //     setFiatAmount(
  //       parseFloat(updatedValue) !== 0 && !isFocused
  //         ? trimPlaceholderZeros(updatedValue)
  //         : updatedValue
  //     );
  //   },
  //   [focused, setFiatAmount, tab, setMarketAmount, quoteAssetPrice]
  // );

  // const setTokenAmountSafe = useCallback(
  //   (value?: string) => {
  //     if (!value) {
  //       return onChange("");
  //     }

  //     const updatedValue = transformAmount(value, baseAsset?.coinDecimals);

  //     if (
  //       !isValidNumericalRawInput(updatedValue) ||
  //       updatedValue.length > 26 ||
  //       (updatedValue.length > 0 && updatedValue.startsWith("-"))
  //     ) {
  //       return;
  //     }

  //     const isFocused = focused === "token";
  //     onChange(
  //       parseFloat(updatedValue) !== 0 && !isFocused
  //         ? trimPlaceholderZeros(updatedValue)
  //         : updatedValue
  //     );
  //   },
  //   [onChange, focused, baseAsset?.coinDecimals]
  // );

  const setAmountSafe = useCallback(
    (type: "fiat" | "token", value?: string) => {
      const update = type === "fiat" ? setFiatAmount : onChange;

      if (!value?.trim()) {
        if (type === "fiat") {
          setMarketAmount("");
        }
        return update("");
      }

      const updatedValue = transformAmount(
        value,
        type === "fiat" ? 6 : baseAsset?.coinDecimals
      ).trim();

      if (
        !isValidNumericalRawInput(updatedValue) ||
        updatedValue.length > 26 ||
        (updatedValue.length > 0 && updatedValue.startsWith("-"))
      ) {
        return;
      }

      const isFocused = focused === type;

      // Hacky solution to deal with rounding
      // TODO: Investigate a way to improve this
      if (type === "fiat" && tab === "buy") {
        setMarketAmount(new Dec(updatedValue).quo(quoteAssetPrice).toString());
      }

      update(
        parseFloat(updatedValue) !== 0 && !isFocused
          ? trimPlaceholderZeros(updatedValue)
          : updatedValue
      );
    },
    [
      baseAsset?.coinDecimals,
      focused,
      onChange,
      quoteAssetPrice,
      setMarketAmount,
      tab,
    ]
  );

  const toggleMax = useCallback(() => {
    if (tab === "buy") {
      return setAmountSafe("fiat", Number(quoteBalance)?.toString() ?? "");
    }

    return setAmountSafe("token", baseBalance?.toString() ?? "");
  }, [tab, baseBalance, setAmountSafe, quoteBalance]);

  useEffect(() => {
    if (tokenAmount.length === 0 && focused === "fiat") {
      setAmountSafe("fiat", "");
      if (tab === "buy") {
        setMarketAmount("");
      }
    }
    if (focused !== "token" || !price) return;

    const value = tokenAmount.length > 0 ? new Dec(tokenAmount) : undefined;
    const fiatValue = value ? price.mul(value) : undefined;

    setAmountSafe("fiat", fiatValue ? fiatValue.toString() : undefined);
  }, [
    price,
    tokenAmount,
    setFiatAmount,
    focused,
    tab,
    setMarketAmount,
    setAmountSafe,
  ]);

  useEffect(() => {
    if (focused !== "fiat" || !price) return;

    const value = fiatAmount && fiatAmount.length > 0 ? fiatAmount : undefined;
    const tokenValue = value ? new Dec(value).quo(price) : undefined;
    setAmountSafe("token", tokenValue ? tokenValue.toString() : undefined);
  }, [price, fiatAmount, setAmountSafe, focused]);

  return (
    <div className="relative h-[108px]">
      {["fiat", "token"].map((inputType) => (
        <AutoInput
          key={inputType}
          type={inputType as "fiat" | "token"}
          baseAsset={baseAsset}
          focused={focused}
          swapFocus={swapFocus}
          amount={
            inputType === "fiat"
              ? type === "market" && tab === "sell"
                ? trimPlaceholderZeros(
                    (expectedOutput ?? new Dec(0)).toString()
                  )
                : fiatAmount
              : type === "market" && tab === "buy"
              ? trimPlaceholderZeros((expectedOutput ?? new Dec(0)).toString())
              : tokenAmount
          }
          setter={(v) =>
            inputType === "fiat"
              ? setAmountSafe("fiat", v)
              : setAmountSafe("token", v)
          }
          disableSwitching={disableSwitching}
          loading={
            inputType === "fiat"
              ? tab === "sell" && type === "market" && expectedOutputLoading
              : tab === "buy" && type === "market" && expectedOutputLoading
          }
        />
      ))}
      <button
        className="absolute right-4 top-3 flex items-center justify-center rounded-5xl border border-osmoverse-700 bg-osmoverse-1000 py-1.5 px-3 opacity-50 transition-opacity hover:opacity-100"
        onClick={toggleMax}
      >
        <span
          className={classNames("body2 text-wosmongton-200", {
            "text-rust-300": insufficientFunds,
          })}
        >
          Max
        </span>
      </button>
    </div>
  );
};

type AutoInputProps = {
  focused: FocusedInput;
  swapFocus: () => void;
  setter: (v: string) => void;
  amount: string;
  type: "fiat" | "token";
  loading: boolean;
} & Omit<
  LimitInputProps,
  | "onChange"
  | "price"
  | "tokenAmount"
  | "setMarketAmount"
  | "quoteAssetPrice"
  | "expectedOutput"
  | "expectedOutputLoading"
  | "inputMode"
  | "setInputMode"
>;

function AutoInput({
  focused,
  baseAsset,
  swapFocus,
  amount,
  setter,
  type,
  disableSwitching,
  loading,
}: AutoInputProps) {
  const { isMobile } = useWindowSize();
  const currentTypeEnum = useMemo(
    () => (type === "fiat" ? "fiat" : "token"),
    [type]
  );

  const isFocused = useMemo(
    () => focused === currentTypeEnum,
    [currentTypeEnum, focused]
  );

  const oppositeTypeEnum = useMemo(
    () => (type === "fiat" ? "token" : "fiat"),
    [type]
  );

  const scale = useMemo(
    () => calcScale(amount.length, isMobile),
    [amount, isMobile]
  );
  return (
    <div
      className={classNames(
        "absolute flex w-full items-center justify-center text-h3 font-h3 transition-transform",
        {
          [nonFocusedClasses]: !isFocused,
          [focusedClasses]: isFocused,
          "text-wosmongton-400": isFocused && (amount === "0" || amount === ""),
          "text-white-full": isFocused && +amount > 0,
        }
      )}
      style={{
        transform: `scale(${isFocused ? scale : 0.45})`,
      }}
      onClick={
        !disableSwitching && focused === oppositeTypeEnum
          ? swapFocus
          : undefined
      }
    >
      {loading ? (
        <div className="flex items-center justify-center text-osmoverse-300 opacity-50 ">
          <Spinner className="mr-4" /> Estimating...{" "}
        </div>
      ) : (
        <label className="flex w-full shrink grow items-center justify-center">
          {disableSwitching && !isFocused && <span>~</span>}
          {type === "fiat" && (
            <span className={classNames({ "font-normal": !isFocused })}>$</span>
          )}
          <AutosizeInput
            disabled={!isFocused}
            type="text"
            placeholder="0"
            value={amount}
            inputClassName={classNames(
              "bg-transparent !m-0 !p-0 text-h3 font-h3 text-center placeholder:text-white-disabled focus:outline-none max-w-[700px]",
              { "cursor-pointer font-normal": !isFocused }
            )}
            onChange={(e) => setter(e.target.value)}
            onClick={!isFocused ? swapFocus : undefined}
            extraWidth={
              isFocused
                ? type === "fiat"
                  ? 0
                  : 4
                : type === "fiat"
                ? 0
                : undefined
            }
          />
          {type === "token" && (
            <span
              className={classNames("text-wosmongton-200", {
                "opacity-60": focused === currentTypeEnum,
                "font-normal": !isFocused,
              })}
            >
              {baseAsset && baseAsset.coinDenom}
            </span>
          )}
          {!disableSwitching && focused === oppositeTypeEnum && <SwapArrows />}
        </label>
      )}
    </div>
  );
}

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
