import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { isValidNumericalRawInput } from "@osmosis-labs/utils";
import classNames from "classnames";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { Icon } from "~/components/assets";
import { ScaledCurrencyInput } from "~/components/input/scaled-currency-input";
import { Tooltip } from "~/components/tooltip";
import { useTranslation, useWindowSize } from "~/hooks";
import { useControllableState } from "~/hooks/use-controllable-state";
import { trimPlaceholderZeros } from "~/utils/number";

const mulGasSlippage = new Dec("1.1");

export const CryptoFiatInput: FunctionComponent<{
  currentUnit: "fiat" | "crypto";
  setCurrentUnit: (nextValue: "fiat" | "crypto") => void;

  isMax?: boolean;
  setIsMax?: (nextValue: boolean) => void;
  canSetMax?: boolean;
  transferGasCost: CoinPretty | undefined;
  transferGasChain: { prettyName: string };

  assetPrice: PricePretty;
  assetWithBalance: {
    denom: string;
    address: string;
    decimals: number;
    amount: CoinPretty;
  };

  cryptoInput?: string;
  onChangeCryptoInput?: (value: string) => void;

  fiatInput?: string;
  onChangeFiatInput?: (value: string) => void;

  // TODO: Implement this logic within the component
  isInsufficientBal: boolean | undefined;
  isInsufficientFee: boolean | undefined;
}> = ({
  currentUnit,
  setCurrentUnit,

  isMax: isMaxProp,
  setIsMax: setIsMaxProp,
  canSetMax = true,
  transferGasCost,
  transferGasChain,

  assetPrice,
  assetWithBalance,

  cryptoInput: cryptoInputProp,
  onChangeCryptoInput,

  fiatInput: fiatInputProp,
  onChangeFiatInput,

  isInsufficientBal,
  isInsufficientFee,
}) => {
  const { isMobile } = useWindowSize();
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const [fiatInputRaw, setFiatInputRaw] = useControllableState({
    defaultValue: "",
    value: fiatInputProp,
    onChange: onChangeFiatInput,
  });

  const [cryptoInputRaw, setCryptoInputRaw] = useControllableState({
    defaultValue: "",
    value: cryptoInputProp,
    onChange: onChangeCryptoInput,
  });

  const [isMax, setIsMax] = useControllableState({
    defaultValue: false,
    value: isMaxProp,
    onChange: setIsMaxProp,
  });

  const inputValue = new PricePretty(
    assetPrice.fiatCurrency,
    new Dec(fiatInputRaw === "" ? 0 : fiatInputRaw)
  );

  const inputCoin = useMemo(
    () =>
      new CoinPretty(
        {
          coinDecimals: assetWithBalance.decimals,
          coinDenom: assetWithBalance.denom,
          coinMinimalDenom: assetWithBalance.address,
        },
        cryptoInputRaw === ""
          ? new Dec(0)
          : new Dec(cryptoInputRaw || "0").mul(
              DecUtils.getTenExponentN(assetWithBalance.decimals)
            )
      ),
    [assetWithBalance, cryptoInputRaw]
  );

  const hasSubtractedAmount = useMemo(() => {
    return isMax && inputCoin.toDec().lt(assetWithBalance.amount.toDec());
  }, [assetWithBalance.amount, inputCoin, isMax]);

  const onInput = useCallback(
    (type: "fiat" | "crypto") => (value: string) => {
      let nextValue = value;
      if (!isValidNumericalRawInput(nextValue) && nextValue !== "") return;

      if (nextValue === ".") {
        nextValue = "0.";
      }

      if (type === "fiat") {
        // Update the crypto amount based on the fiat amount
        const priceInFiat = assetPrice.toDec();
        const nextFiatAmount = new Dec(nextValue || "0");
        const nextCryptoAmount = nextFiatAmount.quo(priceInFiat).toString();

        setCryptoInputRaw(trimPlaceholderZeros(nextCryptoAmount));
      } else {
        // Update the fiat amount based on the crypto amount
        const priceInFiat = assetPrice.toDec();
        const nextCryptoAmount = new Dec(nextValue || "0");
        const nextFiatAmount = nextCryptoAmount.mul(priceInFiat).toString();

        setFiatInputRaw(trimPlaceholderZeros(nextFiatAmount));
      }

      type === "fiat"
        ? setFiatInputRaw(nextValue)
        : setCryptoInputRaw(nextValue);
    },
    [assetPrice, setCryptoInputRaw, setFiatInputRaw]
  );

  // Subtract gas cost and adjust input when selecting max amount
  useEffect(() => {
    if (isMax && canSetMax) {
      if (transferGasCost) {
        let maxTransferAmount = new Dec(0);

        const gasFeeMatchesInputDenom =
          transferGasCost &&
          transferGasCost.toCoin().denom ===
            assetWithBalance.amount.toCoin().denom &&
          transferGasCost.toCoin().denom === inputCoin.toCoin().denom;

        if (gasFeeMatchesInputDenom) {
          maxTransferAmount = assetWithBalance.amount
            .toDec()
            .sub(transferGasCost.toDec().mul(mulGasSlippage));
        } else {
          maxTransferAmount = assetWithBalance.amount.toDec();
        }

        console.log({
          max: maxTransferAmount.toString(),
          input: inputCoin.toDec().toString(),
          gt: inputCoin.toDec().gt(maxTransferAmount),
        });

        if (
          maxTransferAmount.isPositive() &&
          inputCoin.toDec().gt(maxTransferAmount)
        ) {
          console.log("set to max", maxTransferAmount.toString());
          onInput("crypto")(trimPlaceholderZeros(maxTransferAmount.toString()));
        }
      } else {
        onInput("crypto")(
          trimPlaceholderZeros(assetWithBalance.amount.toDec().toString())
        );
      }
    }
  }, [
    isMax,
    transferGasCost,
    assetWithBalance.amount,
    inputCoin,
    onInput,
    canSetMax,
  ]);

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
              <ScaledCurrencyInput
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
                  setCurrentUnit("fiat");
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
              <ScaledCurrencyInput
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
                  setCurrentUnit("crypto");
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
                  assetName: assetWithBalance.denom,
                  networkName: transferGasChain.prettyName,
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
                  trimPlaceholderZeros(
                    assetWithBalance.amount.toDec().toString()
                  )
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
            disabled={assetWithBalance.amount.toDec().isZero()}
          >
            {t("transfer.max")}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
