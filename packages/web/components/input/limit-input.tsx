import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/server";
import classNames from "classnames";
import { useQueryState } from "nuqs";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { formatPretty } from "~/utils/formatter";

export interface LimitInputProps {
  baseAsset: Asset;
  onChange: (value: string) => void;
  setMarketAmount: (value: string) => void;
  tokenAmount: string;
  price: Dec;
  insufficentFunds?: boolean;
  disableSwitching?: boolean;
  quoteAssetPrice: Dec;
  quoteBalance?: Dec;
  baseBalance?: Dec;
}

export enum FocusedInput {
  FIAT = "fiat",
  TOKEN = "token",
}

const nonFocusedClasses =
  "top-[45%] scale-[43%] text-wosmongton-200 hover:cursor-pointer select-none";
const focusedClasses = "top-[0%] font-h3 font-normal";

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
  insufficentFunds,
  disableSwitching,
  setMarketAmount,
  quoteAssetPrice,
  quoteBalance,
  baseBalance,
}) => {
  const [fiatAmount, setFiatAmount] = useState<string>("");
  // const [nonMaxAmount, setNonMaxAmount] = useState<string>("");
  // const [max, setMax] = useState<boolean>(false);
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

  const setFiatAmountSafe = useCallback(
    (value: string) => {
      const updatedValue = transformAmount(value);
      const isFocused = focused === FocusedInput.FIAT;
      if (updatedValue.length > 0 && new Dec(updatedValue).isNegative()) {
        return;
      }

      // Hacky solution to deal with rounding
      // TODO: Investigate a way to improve this
      if (tab === "buy" && updatedValue.length > 0) {
        setMarketAmount(new Dec(updatedValue).quo(quoteAssetPrice).toString());
      }
      isFocused || updatedValue.length === 0
        ? setFiatAmount(updatedValue)
        : setFiatAmount(formatPretty(new Dec(updatedValue)));
    },
    [setFiatAmount, focused, tab, setMarketAmount, quoteAssetPrice]
  );

  const setTokenAmountSafe = useCallback(
    (value: string) => {
      const updatedValue = transformAmount(value);
      const isFocused = focused === FocusedInput.TOKEN;

      if (updatedValue.length > 0 && new Dec(updatedValue).isNegative()) {
        return;
      }
      isFocused || updatedValue.length === 0
        ? onChange(updatedValue)
        : onChange(formatPretty(new Dec(updatedValue)));
    },
    [onChange, focused]
  );

  const toggleMax = useCallback(() => {
    if (tab === "buy") {
      return setFiatAmountSafe(Number(quoteBalance)?.toString() ?? "");
    }

    return setTokenAmountSafe(Number(baseBalance)?.toString() ?? "");
  }, [tab, setTokenAmountSafe, baseBalance, setFiatAmountSafe, quoteBalance]);

  useEffect(() => {
    if (focused !== FocusedInput.TOKEN || !price) return;
    const value = new Dec(tokenAmount.length > 0 ? tokenAmount : 0);
    const fiatValue = price.mul(value);
    setFiatAmountSafe(formatPretty(fiatValue));
  }, [price, tokenAmount, setFiatAmountSafe, focused, tab]);

  useEffect(() => {
    if (focused !== FocusedInput.FIAT || !price) return;
    const value = fiatAmount && fiatAmount.length > 0 ? fiatAmount : "0";
    const tokenValue = new Dec(value).quo(price);
    setTokenAmountSafe(tokenValue.toString());
  }, [price, fiatAmount, setTokenAmountSafe, focused]);

  return (
    <div className="relative h-[108px]">
      {(["fiat", "token"] as ("fiat" | "token")[]).map((type) => (
        <AutoInput
          key={type}
          type={type}
          baseAsset={baseAsset}
          focused={focused}
          swapFocus={swapFocus}
          insufficentFunds={insufficentFunds}
          amount={type === "fiat" ? fiatAmount : tokenAmount}
          setter={type === "fiat" ? setFiatAmountSafe : setTokenAmountSafe}
          disableSwitching={disableSwitching}
        />
      ))}
      <button
        className="absolute right-4 top-3 flex items-center justify-center rounded-5xl border border-osmoverse-700 bg-osmoverse-1000 py-1.5 px-3 opacity-50 transition-opacity hover:opacity-100"
        onClick={toggleMax}
      >
        <span
          className={classNames("body2 text-wosmongton-200", {
            "text-rust-300": insufficentFunds,
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
} & Omit<
  LimitInputProps,
  | "onChange"
  | "price"
  | "tokenAmount"
  | "setMarketAmount"
  | "quoteAssetPrice"
  | "setInputMax"
>;

function AutoInput({
  focused,
  baseAsset,
  insufficentFunds,
  swapFocus,
  amount,
  setter,
  type,
  disableSwitching,
}: AutoInputProps) {
  const currentTypeEnum = useMemo(
    () => (type === "fiat" ? FocusedInput.FIAT : FocusedInput.TOKEN),
    [type]
  );

  const oppositeTypeEnum = useMemo(
    () => (type === "fiat" ? FocusedInput.TOKEN : FocusedInput.FIAT),
    [type]
  );

  const isFocused = useMemo(
    () => focused === currentTypeEnum,
    [currentTypeEnum, focused]
  );

  return (
    <div
      className={classNames(
        "absolute flex w-full items-center justify-center text-h3 transition-all",
        {
          [nonFocusedClasses]: !isFocused,
          [focusedClasses]: isFocused,
          "text-rust-300": isFocused && insufficentFunds,
          "text-wosmongton-400": isFocused && (amount === "0" || amount === ""),
          "text-white-full": isFocused && +amount > 0,
        }
      )}
      onClick={
        !disableSwitching && focused === oppositeTypeEnum
          ? swapFocus
          : undefined
      }
    >
      {disableSwitching && !isFocused && <span>~</span>}
      {type === "fiat" && (
        <span className={classNames({ "font-normal": !isFocused })}>$</span>
      )}
      <AutosizeInput
        disabled={!isFocused}
        type="number"
        placeholder="0"
        value={amount}
        inputClassName={classNames(
          "bg-transparent text-center placeholder:text-white-disabled focus:outline-none max-w-[360px]",
          { "cursor-pointer font-normal": !isFocused }
        )}
        onChange={(e) => setter(e.target.value)}
        onClick={!isFocused ? swapFocus : undefined}
      />
      {type === "token" && (
        <span
          className={classNames("text-wosmongton-200", {
            "opacity-60": focused === currentTypeEnum,
            "font-normal": !isFocused,
          })}
        >
          {baseAsset ? baseAsset.coinDenom : ""}
        </span>
      )}
      {!disableSwitching && focused === oppositeTypeEnum && <SwapArrows />}
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
