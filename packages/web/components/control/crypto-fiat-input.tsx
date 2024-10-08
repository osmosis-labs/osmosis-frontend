import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
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
import { ScaledCurrencyInput } from "~/components/input/scaled-currency-input";
import { SkeletonLoader } from "~/components/loaders";
import { Tooltip } from "~/components/tooltip";
import { useTranslation, useWindowSize } from "~/hooks";
import { useControllableState } from "~/hooks/use-controllable-state";
import { replaceAt } from "~/utils/array";
import { trimPlaceholderZeros } from "~/utils/number";

const mulGasSlippage = new Dec("1.1");

export const CryptoFiatInput: FunctionComponent<{
  currentUnit: "fiat" | "crypto";
  setCurrentUnit: (nextValue: "fiat" | "crypto") => void;

  isMax?: boolean;
  setIsMax?: (nextValue: boolean) => void;
  canSetMax?: boolean;
  transferGasCost: CoinPretty | undefined;
  transferGasChain: { prettyName: string } | undefined;

  assetPrice: PricePretty | undefined;
  assetWithBalance:
    | {
        denom: string;
        address: string;
        decimals: number;
        amount: CoinPretty;
      }
    | undefined;

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

  /**
   * If the asset price is not available, set the pending ratio update to true
   * so that the ratio is updated once the asset price is available.
   */
  const [pendingRatioUpdate, setPendingRatioUpdate] = useState(false);

  const inputValue = useMemo(() => {
    if (!assetPrice?.fiatCurrency) return;
    return new PricePretty(
      assetPrice.fiatCurrency,
      new Dec(fiatInputRaw === "" ? 0 : fiatInputRaw)
    );
  }, [assetPrice?.fiatCurrency, fiatInputRaw]);

  const inputCoin = useMemo(() => {
    if (!assetWithBalance) return;
    return new CoinPretty(
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
    );
  }, [assetWithBalance, cryptoInputRaw]);

  const hasSubtractedAmount = useMemo(() => {
    if (!inputCoin || !assetWithBalance) return false;
    return isMax && inputCoin.toDec().lt(assetWithBalance.amount.toDec());
  }, [assetWithBalance, inputCoin, isMax]);

  const onUpdateRatio = useCallback(
    ({
      type,
      assetPrice,
      nextValue,
    }: {
      type: "fiat" | "crypto";
      assetPrice: PricePretty;
      nextValue: string;
    }) => {
      setPendingRatioUpdate(false);
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
        const nextFiatAmount = nextCryptoAmount.mul(priceInFiat);

        // Create a string of placeholder zeroes based on the maximum number of decimals allowed for the fiat currency.
        const placeholderZeroes = `0.${new Array(
          assetPrice.fiatCurrency.maxDecimals
        )
          .fill("0")
          .join("")}`;

        const smallestPossibleValue = new Dec(
          replaceAt(
            "1",
            placeholderZeroes.split(""),
            placeholderZeroes.length - 1
          ).join("")
        );

        // Set the fiat input raw value. If the next fiat amount is less than the smallest possible value,
        // use the placeholder zeroes.
        setFiatInputRaw(
          nextFiatAmount.lt(smallestPossibleValue)
            ? placeholderZeroes
            : trimPlaceholderZeros(nextFiatAmount.toString())
        );
      }
    },
    [setCryptoInputRaw, setFiatInputRaw]
  );

  const onInput = useCallback(
    (type: "fiat" | "crypto") => (value: string) => {
      let nextValue = value;
      if (!isValidNumericalRawInput(nextValue) && nextValue !== "") return;

      if (assetPrice && assetWithBalance) {
        onUpdateRatio({
          assetPrice,
          nextValue,
          type,
        });
      } else {
        /**
         * If the asset price is not available, set the pending ratio update to true
         * so that the ratio is updated once the asset price is available.
         */
        setPendingRatioUpdate(true);
      }

      type === "fiat"
        ? setFiatInputRaw(nextValue)
        : setCryptoInputRaw(nextValue);
    },
    [
      assetPrice,
      assetWithBalance,
      setFiatInputRaw,
      setCryptoInputRaw,
      onUpdateRatio,
    ]
  );

  useEffect(() => {
    if (pendingRatioUpdate && assetWithBalance && assetPrice) {
      onUpdateRatio({
        assetPrice,
        nextValue: fiatInputRaw,
        type: currentUnit,
      });
    }
  }, [
    assetPrice,
    assetWithBalance,
    currentUnit,
    fiatInputRaw,
    onUpdateRatio,
    pendingRatioUpdate,
  ]);

  // Subtract gas cost and adjust input when selecting max amount
  useEffect(() => {
    if (isMax && canSetMax && assetWithBalance?.amount && inputCoin) {
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

        if (
          maxTransferAmount.isPositive() &&
          inputCoin.toDec().gt(maxTransferAmount)
        ) {
          onInput("crypto")(trimPlaceholderZeros(maxTransferAmount.toString()));
        }
      } else {
        onInput("crypto")(
          trimPlaceholderZeros(assetWithBalance.amount.toDec().toString())
        );
      }
    }
  }, [
    assetWithBalance?.amount,
    canSetMax,
    inputCoin,
    isMax,
    onInput,
    transferGasCost,
  ]);

  const insufficientFunds = isInsufficientBal || isInsufficientFee;

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
          {insufficientFunds && (
            <p className="body1 animate-[fadeIn_0.25s] text-rust-400">
              {t("components.cryptoFiatInput.insufficientFunds")}
            </p>
          )}
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
                fiatSymbol={assetPrice?.symbol ?? DEFAULT_VS_CURRENCY.symbol}
                inputRef={inputRef}
                value={fiatInputRaw}
                onChange={(value) => {
                  setIsMax(false);

                  // Prevent the user from entering more decimals than fiat supports
                  if (
                    value.split(".")[1]?.length >
                    (assetPrice?.fiatCurrency.maxDecimals ??
                      DEFAULT_VS_CURRENCY.maxDecimals)
                  ) {
                    return;
                  }
                  onInput("fiat")(value);
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
                <span>
                  {inputValue
                    ?.maxDecimals(
                      assetPrice?.fiatCurrency.maxDecimals ??
                        DEFAULT_VS_CURRENCY.maxDecimals
                    )
                    .toString()}
                </span>
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
            <SkeletonLoader
              className="min-w-[280px]"
              isLoaded={!!assetWithBalance}
            >
              {currentUnit === "crypto" ? (
                <ScaledCurrencyInput
                  coinDenom={inputCoin?.denom}
                  inputRef={inputRef}
                  classes={{
                    ticker: "ml-1 text-osmoverse-500",
                  }}
                  value={cryptoInputRaw}
                  onChange={(value) => {
                    if (!assetWithBalance) {
                      console.warn("Asset with balance is not available");
                      return;
                    }
                    setIsMax(false);
                    // Prevent the user from entering more decimals than the asset supports
                    if (
                      value.toString().split(".")[1]?.length >
                      assetWithBalance.decimals
                    ) {
                      return;
                    }
                    onInput("crypto")(value);
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
                    {trimPlaceholderZeros(
                      inputCoin?.toDec().toString(2) ?? "0"
                    )}{" "}
                    {inputCoin?.denom}
                  </span>
                  <Icon id="switch" className="h-12 w-12 text-wosmongton-200" />
                </button>
              )}
            </SkeletonLoader>
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
                  assetName: assetWithBalance?.denom ?? "",
                  networkName: transferGasChain?.prettyName ?? "",
                })}
              </p>
            </div>
          }
        >
          <button
            onClick={() => {
              if (!assetWithBalance) return;
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
                "border !border-ammelia-500": hasSubtractedAmount,
                "border border-osmoverse-700 hover:border-osmoverse-850 hover:bg-osmoverse-850 hover:text-white-full":
                  !isMax,
              }
            )}
            disabled={
              !assetWithBalance || assetWithBalance.amount.toDec().isZero()
            }
          >
            {t("transfer.max")}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
