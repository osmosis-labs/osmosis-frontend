import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
} from "@keplr-wallet/unit";
import { isValidNumericalRawInput } from "@osmosis-labs/utils";
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
import { Tooltip } from "~/components/tooltip";
import { useTranslation, useWindowSize } from "~/hooks";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { trimPlaceholderZeros } from "~/utils/number";

import { SupportedAssetWithAmount } from "./amount-and-review-screen";

const mulGasSlippage = new Dec("1.1");
const scale = 1;
const minScale = 16 / 96; // = 1rem / 6rem

export const CryptoFiatInput: FunctionComponent<{
  currentUnit: "fiat" | "crypto";
  cryptoInputRaw: string;
  fiatInputRaw: string;
  assetPrice: PricePretty;
  asset: SupportedAssetWithAmount;
  isInsufficientBal: boolean;
  isInsufficientFee: boolean;
  fromChain: BridgeChainWithDisplayInfo;
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
  fromChain,
  isInsufficientBal,
  isInsufficientFee,
  transferGasCost,
  setFiatAmount: setFiatAmountProp,
  setCryptoAmount: setCryptoAmountProp,
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

  const hasSubtractedAmount = useMemo(() => {
    return isMax && inputCoin.toDec().lt(asset.amount.toDec());
  }, [asset.amount, inputCoin, isMax]);

  const inputValue = new PricePretty(
    assetPrice.fiatCurrency,
    new Dec(fiatInputRaw === "" ? 0 : fiatInputRaw)
  );

  const setCryptoAmount = useCallback(
    (amount: string) =>
      setCryptoAmountProp(
        amount.endsWith(".") || amount.endsWith("0")
          ? amount
          : new IntPretty(amount)
              .locale(false)
              .trim(true)
              .maxDecimals(asset.decimals)
              .toString()
      ),
    [setCryptoAmountProp, asset]
  );

  const setFiatAmount = useCallback(
    (amount: string) =>
      setFiatAmountProp(
        amount.endsWith(".") || amount.endsWith("0")
          ? amount
          : new IntPretty(amount)
              .locale(false)
              .trim(true)
              .maxDecimals(assetPrice.fiatCurrency.maxDecimals)
              .toString()
      ),
    [setFiatAmountProp, assetPrice]
  );

  const onInput = useCallback(
    (type: "fiat" | "crypto") => (value: string) => {
      let nextValue = type === "fiat" ? value.replace("$", "") : value;
      if (!isValidNumericalRawInput(nextValue) && nextValue !== "") return;

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
    if (isMax && transferGasCost) {
      let maxTransferAmount = new Dec(0);

      const gasFeeMatchesInputDenom =
        transferGasCost &&
        transferGasCost.toCoin().denom === asset.amount.toCoin().denom &&
        transferGasCost.toCoin().denom === inputCoin.toCoin().denom;

      if (gasFeeMatchesInputDenom) {
        maxTransferAmount = asset.amount
          .toDec()
          .sub(transferGasCost.toDec().mul(mulGasSlippage));
      } else {
        maxTransferAmount = asset.amount.toDec();
      }

      if (
        maxTransferAmount.isPositive() &&
        !inputCoin.toDec().equals(maxTransferAmount)
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

  const fiatCurrentValue = `${assetPrice.symbol}${fiatInputRaw}`;
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
    <div
      className="relative flex flex-col items-center"
      style={{
        height: "calc(100% + 41px)",
      }}
    >
      <div className="flex h-36 w-full place-content-between items-center">
        <div className="w-14 md:w-13" />
        <div
          className="flex h-full max-w-full flex-col items-center justify-end whitespace-nowrap text-center"
          onClick={() => {
            inputRef.current?.focus();
          }}
        >
          <div
            className="absolute top-1/2 transition-transform"
            style={{
              transform: `scale(${
                currentUnit === "fiat" ? 1 : 0.3
              }) translateY(${currentUnit === "fiat" ? -50 : 120}%)`,
            }}
          >
            {currentUnit === "fiat" ? (
              <InputBox
                onClick={() => {
                  if (currentUnit === "fiat") return;
                  setInputUnit("fiat");
                }}
                // when the font size changes, we need to prompt the autosize input to re-mount
                // see: https://github.com/JedWatson/react-input-autosize?tab=readme-ov-file#changing-the-styles-at-runtime
                key={`fiat-${fiatInputFontSize}`}
                inputRef={currentUnit === "fiat" ? inputRef : undefined}
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
              <button
                className={classNames(
                  "flex items-center gap-3 text-center !font-normal text-wosmongton-200",
                  fiatInputFontSize
                  // calcTextSizeClass(0, isMobile)
                )}
                onClick={() => {
                  setInputUnit("fiat");
                }}
              >
                <span>{inputValue.maxDecimals(2).toString()}</span>
                <Icon id="switch" className="h-12 w-12 text-wosmongton-200" />
              </button>
            )}
          </div>

          <div
            className="absolute top-1/2 transition-transform"
            style={{
              transform: `scale(${
                currentUnit === "crypto" ? 1 : 0.3
              }) translateY(${currentUnit === "crypto" ? -50 : 120}%)`,
            }}
          >
            {currentUnit === "crypto" ? (
              <InputBox
                onClick={() => {
                  console.log(currentUnit);
                  if (currentUnit === "crypto") return;
                  setInputUnit("crypto");
                }}
                // when the font size changes, we need to prompt the autosize input to re-mount
                // see: https://github.com/JedWatson/react-input-autosize?tab=readme-ov-file#changing-the-styles-at-runtime
                key={`crypto-${cryptoInputFontSize}`}
                inputRef={currentUnit === "crypto" ? inputRef : undefined}
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
            ) : (
              <button
                className={classNames(
                  "flex items-center gap-3 text-center !font-normal text-wosmongton-200",
                  cryptoInputFontSize

                  // calcTextSizeClass(0, isMobile)
                )}
                onClick={() => {
                  setInputUnit("crypto");
                }}
              >
                <span>
                  {trimPlaceholderZeros(inputCoin?.toDec().toString(2) ?? "0")}{" "}
                  {inputCoin.denom}
                </span>
                <Icon id="switch" className="h-12 w-12 text-wosmongton-200" />
              </button>
            )}
          </div>
        </div>

        <Tooltip
          disabled={!hasSubtractedAmount}
          content={
            <div className="flex flex-col gap-1">
              <p className="caption text-white-full">
                {t("transfer.dontForgetFees")}
              </p>
              <p className="caption text-osmoverse-300">
                {t("transfer.feesReserved", {
                  assetName: asset.denom,
                  networkName: fromChain.prettyName,
                })}
              </p>
            </div>
          }
        >
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
              "body2 md:caption w-14 shrink-0 transform rounded-5xl py-2 px-3 text-wosmongton-200 transition duration-200 disabled:opacity-80 md:w-13",
              {
                "border-osmoverse-850 bg-osmoverse-850 text-white-full": isMax,
                "!border-ammelia-500": hasSubtractedAmount,
                "border border-osmoverse-700 hover:border-osmoverse-850 hover:bg-osmoverse-850 hover:text-white-full":
                  !isMax,
              }
            )}
            disabled={asset.amount.toDec().isZero()}
          >
            {t("transfer.max")}
          </button>
        </Tooltip>
      </div>
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
