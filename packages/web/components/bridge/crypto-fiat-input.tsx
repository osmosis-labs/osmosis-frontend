import { CoinPretty, IntPretty, PricePretty } from "@keplr-wallet/unit";
import { FunctionComponent, useCallback, useState } from "react";

import { CryptoFiatInput } from "~/components/control/crypto-fiat-input";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";

import { SupportedAssetWithAmount } from "./amount-and-review-screen";

export const ImmersiveBridgeInput: FunctionComponent<{
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
  const [isMax, setIsMax] = useState(false);

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

  return (
    <CryptoFiatInput
      currentUnit={currentUnit}
      isMax={isMax}
      setIsMax={setIsMax}
      assetPrice={assetPrice}
      cryptoInput={cryptoInputRaw}
      fiatInput={fiatInputRaw}
      isInsufficientBal={isInsufficientBal}
      isInsufficientFee={isInsufficientFee}
      onChangeCryptoInput={setCryptoAmount}
      onChangeFiatInput={setFiatAmount}
      setCurrentUnit={setInputUnit}
      transferGasCost={transferGasCost}
      assetWithBalance={asset}
      transferGasChain={fromChain}
    />
  );
};
