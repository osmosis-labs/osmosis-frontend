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
import { Tooltip } from "~/components/tooltip";
import { useTranslation, useWindowSize } from "~/hooks";
import { useControllableState } from "~/hooks/use-controllable-state";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { trimPlaceholderZeros } from "~/utils/number";

import { SupportedAssetWithAmount } from "./amount-and-review-screen";

const mulGasSlippage = new Dec("1.1");

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
      let nextValue = value;
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

  return (
    <div className="relative flex flex-col items-center">
      <div className="flex h-36 w-full place-content-between items-center">
        <div className="w-14 md:w-13" />
        <div
          className="flex h-full flex-col items-center whitespace-nowrap text-center"
          onClick={() => {
            inputRef.current?.focus();
          }}
        >
          <div
            className={classNames(
              "absolute top-1/2 transition-transform",
              currentUnit === "fiat" ? "max-w-[300px]" : ""
            )}
            style={{
              transform: `scale(${
                currentUnit === "fiat" ? 1 : 0.3
              }) translateY(${currentUnit === "fiat" ? -50 : 120}%)`,
            }}
          >
            {currentUnit === "fiat" ? (
              <ScaledTickerInput
                fiatSymbol={assetPrice.symbol}
                inputRef={inputRef}
                classes={{
                  input: classNames({
                    "text-rust-300": isInsufficientBal || isInsufficientFee,
                  }),
                }}
                value={fiatInputRaw}
                onChange={(value) => {
                  onInput("fiat")(value);
                  setIsMax(false);
                }}
              />
            ) : (
              <button
                className={classNames(
                  "z-50 flex items-center gap-3 text-center !font-normal text-wosmongton-200",
                  isMobile ? "text-h3 font-h3" : "text-h2 font-h2"
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
            className={classNames(
              "absolute top-1/2 transition-transform",
              currentUnit === "crypto" ? "max-w-[300px]" : ""
            )}
            style={{
              transform: `scale(${
                currentUnit === "crypto" ? 1 : 0.3
              }) translateY(${currentUnit === "crypto" ? -50 : 120}%)`,
            }}
          >
            {currentUnit === "crypto" ? (
              <ScaledTickerInput
                coinDenom={inputCoin.denom}
                inputRef={inputRef}
                classes={{
                  input: classNames({
                    "text-rust-300": isInsufficientBal || isInsufficientFee,
                  }),
                  ticker: classNames("ml-1 text-osmoverse-500", {
                    "text-rust-300": isInsufficientBal || isInsufficientFee,
                  }),
                }}
                value={cryptoInputRaw}
                onChange={(value) => {
                  onInput("crypto")(value);
                  setIsMax(false);
                }}
              />
            ) : (
              <button
                className={classNames(
                  "z-50 flex items-center gap-3 text-center !font-normal text-wosmongton-200",
                  isMobile ? "text-h3 font-h3" : "text-h2 font-h2"
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

interface ScaledTickerInputProps {
  fiatSymbol?: string;
  coinDenom?: string;
  value?: string;
  onChange?: (value: string) => void;
  classes?: Partial<Record<"input" | "ticker", string>>;

  inputRef?: React.RefObject<HTMLInputElement>;
}

function ScaledTickerInput({
  fiatSymbol,
  coinDenom,
  value,
  onChange,
  classes,
  inputRef,
}: ScaledTickerInputProps) {
  const { isMobile } = useWindowSize();
  const [inputValue, setInputValue] = useControllableState({
    defaultValue: "",
    value: value,
    onChange,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputSizerRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const minScale = 16 / 96; // = 1rem / 6rem
    let contentWidth;
    let inputMaxWidth =
      (1 / minScale) * (wrapperRef.current?.offsetWidth || 0) -
      (tickerRef.current?.offsetWidth || 0);

    const updateSize = () => {
      if (inputSizerRef.current && wrapperRef.current && tickerRef.current) {
        contentWidth =
          (inputSizerRef.current?.offsetWidth || 0) +
          (tickerRef.current?.offsetWidth || 0);
        let scale = Math.min(
          1,
          Math.max(
            minScale,
            (wrapperRef.current?.offsetWidth || 0) / contentWidth
          )
        );
        wrapperRef.current.style.transform = `scale(${scale})`;
        inputSizerRef.current.style.maxWidth = `${inputMaxWidth}px`;
      }
    };

    updateSize();
  }, [inputValue, isMobile]);

  return (
    <label
      className={classNames(
        "mx-auto block max-w-full rounded-xl px-2",
        isMobile ? "text-h3 font-h3" : "text-h2 font-h2"
      )}
    >
      <div
        ref={wrapperRef}
        className="flex-start relative mx-auto flex w-full flex-1 origin-center justify-center text-center"
      >
        <div className="text-8xl flex items-baseline justify-center">
          {fiatSymbol ? (
            <span
              ref={tickerRef}
              className={classNames("self-center", classes?.ticker)}
            >
              {fiatSymbol}
            </span>
          ) : null}
          <div
            ref={inputSizerRef}
            data-value={inputValue || "0"}
            className={classNames(
              "relative self-center overflow-hidden align-middle",
              "after:invisible after:whitespace-nowrap after:font-[inherit] after:content-[attr(data-value)]"
            )}
          >
            <input
              ref={inputRef}
              className={classNames(
                "absolute m-0 h-full w-full bg-transparent p-0 placeholder-inherit outline-0",
                classes?.input
              )}
              type="text"
              placeholder="0"
              data-expand="true"
              minLength={1}
              style={{
                fontSize: "inherit",
              }}
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
            />
          </div>
          {fiatSymbol ? null : (
            <span
              ref={tickerRef}
              className={classNames(
                "self-center pl-1 opacity-60",
                classes?.ticker
              )}
            >
              {coinDenom}
            </span>
          )}
        </div>
      </div>
    </label>
  );
}
