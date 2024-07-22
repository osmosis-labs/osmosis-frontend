import { Dec } from "@keplr-wallet/unit";
import { MinimalAsset } from "@osmosis-labs/types";
import classNames from "classnames";
import { useQueryState } from "nuqs";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
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
  setInputRef: (input: HTMLInputElement | null) => void;
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

export enum FocusedInput {
  FIAT = "fiat",
  TOKEN = "token",
}

const nonFocusedClasses = "top-[45%] text-osmoverse-300 cursor-pointer body1";
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
    ? parseFloat(updatedValue).toFixed(decimalCount).toString().trim()
    : updatedValue.trim();
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
  setInputRef,
}) => {
  const [fiatAmount, setFiatAmount] = useState<string>("");
  const [tab] = useQueryState("tab", { defaultValue: "buy" });
  const [type] = useQueryState("type", { defaultValue: "market" });
  const [focused, setFocused] = useState<FocusedInput>(
    tab === "buy" ? FocusedInput.FIAT : FocusedInput.TOKEN
  );

  const swapFocus = useCallback(() => {
    setFocused((p) =>
      p === FocusedInput.FIAT ? FocusedInput.TOKEN : FocusedInput.FIAT
    );
  }, []);

  // Swap focus every time the tab changes
  useEffect(() => swapFocus(), [swapFocus, tab]);

  // Set focus to Fiat / Token on type/tab change
  useEffect(() => {
    if (type === "market") {
      setFocused(tab === "buy" ? FocusedInput.FIAT : FocusedInput.TOKEN);
    }
  }, [tab, type]);

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
        type === "fiat" ? 2 : baseAsset?.coinDecimals
      );

      if (
        !isValidNumericalRawInput(updatedValue) ||
        updatedValue.length > 26 ||
        (updatedValue.length > 0 && updatedValue.startsWith("-"))
      ) {
        return;
      }

      const isFocused =
        focused === FocusedInput[type === "fiat" ? "FIAT" : "TOKEN"];

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
      return setFiatAmount(
        trimPlaceholderZeros(Number(quoteBalance)?.toString()) ?? ""
      );
    }

    return setAmountSafe("token", Number(baseBalance)?.toString() ?? "");
  }, [tab, baseBalance, setAmountSafe, quoteBalance]);

  useEffect(() => {
    if (tokenAmount.length === 0 && focused === FocusedInput.FIAT) {
      setAmountSafe("fiat", "");
      if (tab === "buy") {
        setMarketAmount("");
      }
    }
    if (focused !== FocusedInput.TOKEN || !price) return;

    const value = tokenAmount.length > 0 ? new Dec(tokenAmount) : undefined;
    const fiatValue = value ? price.mul(value) : undefined;

    setFiatAmount(fiatValue ? trimPlaceholderZeros(fiatValue.toString()) : "");
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
    if (focused !== FocusedInput.FIAT || !price) return;

    const value = fiatAmount && fiatAmount.length > 0 ? fiatAmount : undefined;
    const tokenValue = value ? new Dec(value).quo(price) : undefined;
    setAmountSafe("token", tokenValue ? tokenValue.toString() : undefined);
  }, [price, fiatAmount, setAmountSafe, focused]);

  const isSubOneCent = useMemo(() => {
    return type === "limit" || tab === "buy"
      ? fiatAmount.length > 0 &&
          new Dec(fiatAmount).lt(new Dec(0.01)) &&
          !new Dec(fiatAmount).isZero()
      : tab === "sell" &&
          !!expectedOutput &&
          expectedOutput.lt(new Dec(0.01)) &&
          !expectedOutput.isZero();
  }, [fiatAmount, expectedOutput, type, tab]);

  return (
    <div className="relative h-[124px]">
      {(["fiat", "token"] as ("fiat" | "token")[]).map((inputType) => (
        <>
          <AutoInput
            key={inputType}
            type={inputType}
            baseAsset={baseAsset}
            focused={focused}
            swapFocus={swapFocus}
            amount={
              inputType === "fiat"
                ? type === "market" && tab === "sell"
                  ? trimPlaceholderZeros(
                      (isSubOneCent
                        ? "0.01"
                        : expectedOutput ?? new Dec(0)
                      ).toString()
                    )
                  : isSubOneCent
                  ? "0.01"
                  : fiatAmount
                : type === "market" && tab === "buy"
                ? trimPlaceholderZeros(
                    (expectedOutput ?? new Dec(0)).toString()
                  )
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
            setInputRef={setInputRef}
            isSubOneCent={inputType === "fiat" && isSubOneCent}
          />
        </>
      ))}
      <button
        className="absolute right-4 top-3 flex items-center justify-center rounded-5xl border border-osmoverse-700 bg-osmoverse-1000 py-1.5 px-3 transition-opacity disabled:opacity-50"
        onClick={toggleMax}
        disabled={tab === "buy" ? !quoteBalance : !baseBalance}
      >
        <span className={classNames("body2 text-wosmongton-200")}>Max</span>
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
  setInputRef: (input: HTMLInputElement | null) => void;
  isSubOneCent: boolean;
} & Omit<
  LimitInputProps,
  | "onChange"
  | "price"
  | "tokenAmount"
  | "setMarketAmount"
  | "quoteAssetPrice"
  | "expectedOutput"
  | "expectedOutputLoading"
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
  isSubOneCent,
  setInputRef,
}: AutoInputProps) {
  const { isMobile } = useWindowSize();
  const currentTypeEnum = useMemo(
    () => (type === "fiat" ? FocusedInput.FIAT : FocusedInput.TOKEN),
    [type]
  );

  const isFocused = useMemo(
    () => focused === currentTypeEnum,
    [currentTypeEnum, focused]
  );

  const oppositeTypeEnum = useMemo(
    () => (type === "fiat" ? FocusedInput.TOKEN : FocusedInput.FIAT),
    [type]
  );

  const scale = useMemo(
    () => calcScale(amount.length, isMobile),
    [amount, isMobile]
  );
  console.log(isSubOneCent);
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
      <label
        className={classNames(
          "flex w-full shrink grow items-center justify-center",
          { "animate-pulse": !isFocused && loading }
        )}
      >
        {disableSwitching && !isFocused && <span>~</span>}
        {type === "fiat" && (
          <>
            {isSubOneCent && <span>{"<"}</span>}
            <span className={classNames({ "font-normal": !isFocused })}>$</span>
          </>
        )}
        <AutosizeInput
          disabled={!isFocused}
          type="text"
          placeholder="0"
          value={amount}
          inputRef={(input) => {
            if (isFocused) {
              setInputRef(input);
            }
          }}
          inputClassName={classNames(
            "bg-transparent !m-0 !p-0 text-h3 font-h3 text-left focus:outline-none max-w-[700px] placeholder:text-osmoverse-500 h-[72px]",
            {
              "font-normal placeholder:text-osmoverse-300 font-body1 text-center":
                !isFocused,
              "cursor-pointer": !isFocused && !disableSwitching,
            }
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
            className={classNames("ml-1 text-wosmongton-200", {
              "opacity-60": focused === currentTypeEnum,
              "font-normal text-osmoverse-300": !isFocused,
            })}
          >
            {baseAsset && baseAsset.coinDenom}
          </span>
        )}
        {!disableSwitching && focused === oppositeTypeEnum && <SwapArrows />}
      </label>
    </div>
  );
}

function SwapArrows() {
  return (
    <div className="ml-3 flex h-[64px] w-[64px] items-center justify-center rounded-full border-[1px] border-osmoverse-700 p-2">
      <Icon id="switch" width={40} height={40} />
    </div>
  );
}
