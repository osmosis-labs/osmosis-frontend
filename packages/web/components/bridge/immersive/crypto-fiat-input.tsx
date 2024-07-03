import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { isNumeric } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent, useEffect, useRef, useState } from "react";

import { Icon } from "~/components/assets";
import { InputBox } from "~/components/input";
import { useTranslation } from "~/hooks";
import { trimPlaceholderZeros } from "~/utils/number";

import { SupportedAssetWithAmount } from "./amount-and-review-screen";

export const CryptoFiatInput: FunctionComponent<{
  currentUnit: "fiat" | "crypto";
  cryptoInputRaw: string;
  fiatInputRaw: string;
  assetPrice: PricePretty;
  asset: SupportedAssetWithAmount;
  isInsufficientBal: boolean;
  isInsufficientFee: boolean;
  setFiatAmount: (amount: string) => void;
  setCryptoAmount: (amount: string) => void;
  setInputUnit: (unit: "fiat" | "crypto") => void;
}> = ({
  currentUnit,
  cryptoInputRaw,
  fiatInputRaw,
  assetPrice,
  asset,
  isInsufficientBal,
  isInsufficientFee,
  setFiatAmount,
  setCryptoAmount,
  setInputUnit,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const cryptoAmountPretty = new CoinPretty(
    {
      coinDecimals: asset.decimals,
      coinDenom: asset.denom,
      coinMinimalDenom: asset.address,
    },
    cryptoInputRaw === ""
      ? new Dec(0)
      : new Dec(cryptoInputRaw).mul(DecUtils.getTenExponentN(asset.decimals))
  );

  const fiatAmountPretty = new PricePretty(
    assetPrice.fiatCurrency,
    new Dec(fiatInputRaw === "" ? 0 : fiatInputRaw)
  );

  const onInput = (type: "fiat" | "crypto") => (value: string) => {
    let nextValue = type === "fiat" ? value.replace("$", "") : value;
    if (!isNumeric(nextValue) && nextValue !== "") return;

    if (nextValue.startsWith("0") && !nextValue.startsWith("0.")) {
      nextValue = nextValue.slice(1);
    }

    if (nextValue === "") {
      nextValue = "0";
    }
    if (nextValue === ".") {
      nextValue = "0.";
    }

    if (type === "fiat") {
      // Update the crypto amount based on the fiat amount
      const priceInFiat = assetPrice.toDec();
      const nextFiatAmount = new Dec(nextValue);
      const nextCryptoAmount = nextFiatAmount.quo(priceInFiat).toString();

      setCryptoAmount(trimPlaceholderZeros(nextCryptoAmount));
    } else {
      // Update the fiat amount based on the crypto amount
      const priceInFiat = assetPrice.toDec();
      const nextCryptoAmount = new Dec(nextValue);
      const nextFiatAmount = nextCryptoAmount.mul(priceInFiat).toString();

      setFiatAmount(trimPlaceholderZeros(nextFiatAmount));
    }

    type === "fiat" ? setFiatAmount(nextValue) : setCryptoAmount(nextValue);
  };

  const fiatCurrentValue = `${assetPrice?.symbol ?? ""}${fiatInputRaw}`;
  const fiatInputFontSize = calcTextSizeClass(fiatCurrentValue.length);
  const cryptoInputFontSize = calcTextSizeClass(
    cryptoInputRaw.length + cryptoAmountPretty.denom.length
  );
  const [isInputFocused, setIsInputFocused] = useState(false);

  // when the key to the autosize input changes, it will re-mount
  // causing the input to lose focus,
  // so we use an effect to re-focus the input if it's already focused
  useEffect(() => {
    if (isInputFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputFocused, fiatInputFontSize, cryptoInputFontSize]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-24 w-full place-content-between items-center">
        <div className="w-14" />
        <div
          className="max-w-full overflow-clip whitespace-nowrap text-center"
          onClick={() => {
            inputRef.current?.focus();
          }}
        >
          {currentUnit === "fiat" ? (
            <InputBox
              // when the font size changes, we need to prompt the autosize input to re-mount
              // see: https://github.com/JedWatson/react-input-autosize?tab=readme-ov-file#changing-the-styles-at-runtime
              key={fiatInputFontSize}
              inputRef={inputRef}
              className={classNames(
                "border-none bg-transparent text-center font-bold",
                fiatInputFontSize
              )}
              classes={{
                label: "!block",
                input: classNames({
                  "text-rust-300": isInsufficientBal || isInsufficientFee,
                }),
              }}
              onBlur={() => setIsInputFocused(false)}
              onFocus={() => setIsInputFocused(true)}
              currentValue={fiatCurrentValue}
              onInput={onInput("fiat")}
              isAutosize
            />
          ) : (
            <InputBox
              // when the font size changes, we need to prompt the autosize input to re-mount
              // see: https://github.com/JedWatson/react-input-autosize?tab=readme-ov-file#changing-the-styles-at-runtime
              key={cryptoInputFontSize}
              inputRef={inputRef}
              className={classNames(
                "border-none bg-transparent font-bold",
                cryptoInputFontSize
              )}
              classes={{
                label: "!block",
                input: classNames("!p-0", {
                  "text-rust-300": isInsufficientBal || isInsufficientFee,
                }),
                trailingSymbol: classNames(
                  "ml-1 align-middle text-osmoverse-500",
                  {
                    "text-rust-300": isInsufficientBal || isInsufficientFee,
                  }
                ),
              }}
              onBlur={() => setIsInputFocused(false)}
              onFocus={() => setIsInputFocused(true)}
              currentValue={cryptoInputRaw}
              onInput={onInput("crypto")}
              trailingSymbol={cryptoAmountPretty.denom}
              isAutosize
            />
          )}
        </div>
        <button
          onClick={() => {
            // TODO: Subtract fees from the amount
            onInput("crypto")(
              trimPlaceholderZeros(asset.amount.toDec().toString())
            );
          }}
          className="body2 w-14 shrink-0 transform rounded-5xl border border-osmoverse-700 py-2 px-3 text-wosmongton-200 transition duration-200 hover:border-osmoverse-850 hover:bg-osmoverse-850 hover:text-white-full disabled:opacity-80"
        >
          {t("transfer.max")}
        </button>
      </div>

      <button
        className="body1 flex items-center gap-2 text-center text-wosmongton-200"
        onClick={() => {
          setInputUnit(currentUnit === "fiat" ? "crypto" : "fiat");
        }}
      >
        <span>
          {currentUnit === "fiat" ? (
            <>
              {trimPlaceholderZeros(
                cryptoAmountPretty?.toDec().toString(2) ?? "0"
              )}{" "}
              {cryptoAmountPretty.denom}
            </>
          ) : (
            fiatAmountPretty.maxDecimals(2).toString()
          )}
        </span>
        <span>
          <Icon
            id="switch"
            className="text-wosmongton-200"
            width={16}
            height={16}
          />
        </span>
      </button>
    </div>
  );
};

function calcTextSizeClass(numChars: number): string {
  if (numChars <= 8) {
    return "text-4xl";
  } else if (numChars <= 10) {
    return "text-3xl";
  } else if (numChars <= 12) {
    return "text-2xl";
  } else if (numChars <= 18) {
    return "text-xl";
  } else if (numChars <= 24) {
    return "text-lg";
  }

  return "text-md";
}
