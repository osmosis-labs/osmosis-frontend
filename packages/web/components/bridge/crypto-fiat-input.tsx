import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
} from "@keplr-wallet/unit";
import { isNumeric } from "@osmosis-labs/utils";
import classNames from "classnames";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import { InputBox } from "~/components/input";
import { useTranslation, useWindowSize } from "~/hooks";
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
  transferGasCost: CoinPretty | undefined;
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
  transferGasCost,
  setFiatAmount,
  setCryptoAmount,
  setInputUnit,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useWindowSize();

  const [isMax, setIsMax] = useState(false);

  const inputCoin = useMemo(
    () =>
      new CoinPretty(
        {
          coinDecimals: asset.decimals,
          coinDenom: asset.denom,
          coinMinimalDenom: asset.address,
        },
        cryptoInputRaw === ""
          ? new Dec(0)
          : new Dec(cryptoInputRaw).mul(
              DecUtils.getTenExponentN(asset.decimals)
            )
      ),
    [asset, cryptoInputRaw]
  );

  const inputValue = new PricePretty(
    assetPrice.fiatCurrency,
    new Dec(fiatInputRaw === "" ? 0 : fiatInputRaw)
  );

  const onInput = useCallback(
    (type: "fiat" | "crypto") => (value: string) => {
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
    },
    [assetPrice, setCryptoAmount, setFiatAmount]
  );

  // Subtract gas cost and adjust input when selecting max amount
  useEffect(() => {
    if (
      isMax &&
      transferGasCost &&
      transferGasCost.toCoin().denom === inputCoin.toCoin().denom &&
      transferGasCost.toCoin().denom === asset.amount.toCoin().denom
    ) {
      const maxTransferAmount = asset.amount
        .toDec()
        .sub(transferGasCost.toDec());

      if (
        maxTransferAmount.isPositive() &&
        inputCoin.toDec().gt(maxTransferAmount)
      ) {
        onInput("crypto")(trimPlaceholderZeros(maxTransferAmount.toString()));
      }
    }
  }, [isMax, transferGasCost, asset.amount, inputCoin, onInput]);

  // Apply max amount if asset changes
  useEffect(() => {
    if (isMax) {
      onInput("crypto")(trimPlaceholderZeros(asset.amount.toDec().toString()));
    }
  }, [asset, isMax, onInput]);

  const fiatCurrentValue = `${assetPrice.symbol}${new IntPretty(fiatInputRaw)
    .locale(false)
    .trim(true)
    .maxDecimals(assetPrice.fiatCurrency.maxDecimals)}`;
  const fiatInputFontSize = calcTextSizeClass(
    fiatCurrentValue.length,
    isMobile
  );
  const cryptoInputFontSize = calcTextSizeClass(
    cryptoInputRaw.length + inputCoin.denom.length,
    isMobile
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
        <div className="w-14 md:w-13" />
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
              onInput={(value) => {
                onInput("fiat")(value);
                setIsMax(false);
              }}
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
              onInput={(value) => {
                onInput("crypto")(value);
                setIsMax(false);
              }}
              trailingSymbol={inputCoin.denom}
              isAutosize
            />
          )}
        </div>
        <button
          onClick={() => {
            if (isMax) {
              onInput("crypto")("0");
              setIsMax(false);
            } else {
              onInput("crypto")(
                trimPlaceholderZeros(asset.amount.toDec().toString())
              );
              setIsMax(true);
            }
          }}
          className={classNames(
            "body2 md:caption w-14 shrink-0 transform rounded-5xl border border-osmoverse-700 py-2 px-3 text-wosmongton-200 transition duration-200 hover:border-osmoverse-850 hover:bg-osmoverse-850 hover:text-white-full disabled:opacity-80 md:w-13",
            {
              "border-osmoverse-850 bg-osmoverse-850 text-white-full": isMax,
            }
          )}
          disabled={asset.amount.toDec().isZero()}
        >
          {t("transfer.max")}
        </button>
      </div>

      <button
        className="body1 md:body2 flex items-center gap-2 text-center text-wosmongton-200"
        onClick={() => {
          setInputUnit(currentUnit === "fiat" ? "crypto" : "fiat");
        }}
      >
        <span>
          {currentUnit === "fiat" ? (
            <>
              {trimPlaceholderZeros(inputCoin?.toDec().toString(2) ?? "0")}{" "}
              {inputCoin.denom}
            </>
          ) : (
            inputValue.maxDecimals(2).toString()
          )}
        </span>
        <Icon id="switch" className="h-4 w-4 text-wosmongton-200" />
      </button>
    </div>
  );
};

const calcTextSizeClass = (numChars: number, isMobile: boolean): string => {
  const sizeMapping: { [key: number]: string } = isMobile
    ? {
        8: "text-h3 font-h3",
        10: "text-h4 font-h4",
        12: "text-h5 font-h5",
        18: "text-h6 font-h6",
        24: "text-lg",
      }
    : {
        8: "text-h2 font-h2",
        10: "text-h3 font-h3",
        12: "text-h4 font-h4",
        18: "text-h5 font-h5",
        24: "text-h6 font-h6",
      };

  for (const [key, value] of Object.entries(sizeMapping)) {
    if (numChars <= Number(key)) {
      return value;
    }
  }

  return isMobile ? "text-sm" : "text-md";
};
