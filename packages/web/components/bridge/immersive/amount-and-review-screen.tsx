import { CoinPretty } from "@keplr-wallet/unit";
import { BridgeChain } from "@osmosis-labs/bridge";
import { isNil } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { getAddress } from "viem";

import { AmountScreen } from "~/components/bridge/immersive/amount-screen";
import { ImmersiveBridgeScreens } from "~/components/bridge/immersive/immersive-bridge";
import { useBridgeQuote } from "~/components/bridge/immersive/use-bridge-quote";
import { useBridgesSupportedAssets } from "~/components/bridge/immersive/use-bridges-supported-assets";
import { Screen } from "~/components/screen-manager";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { useStore } from "~/stores";

import { ReviewScreen } from "./review-screen";

export type SupportedAsset = ReturnType<
  typeof useBridgesSupportedAssets
>["supportedAssetsByChainId"][string][number];

export type SupportedAssetWithAmount = SupportedAsset & { amount: CoinPretty };

interface AmountAndConfirmationScreenProps {
  direction: "deposit" | "withdraw";
  selectedAssetDenom: string | undefined;
  onClose: () => void;
}

export const AmountAndReviewScreen = observer(
  ({
    direction,
    selectedAssetDenom,
    onClose,
  }: AmountAndConfirmationScreenProps) => {
    const { accountStore } = useStore();

    const [sourceAsset, setSourceAsset] = useState<SupportedAssetWithAmount>();
    const [destinationAsset, setDestinationAsset] = useState<SupportedAsset>();
    const [fromChain, setFromChain] = useState<BridgeChain>();
    const [toChain, setToChain] = useState<BridgeChain>();

    const [cryptoAmount, setCryptoAmount] = useState<string>("0");
    const [fiatAmount, setFiatAmount] = useState<string>("0");

    // Wallets
    const { address: evmAddress, connector: evmConnector } =
      useEvmWalletAccount();

    const fromChainCosmosAccount =
      fromChain?.chainType === "evm" || isNil(fromChain)
        ? undefined
        : accountStore.getWallet(fromChain.chainId);

    const toChainCosmosAccount =
      toChain?.chainType === "evm" || isNil(toChain)
        ? undefined
        : accountStore.getWallet(toChain.chainId);

    const fromAddress =
      fromChain?.chainType === "evm"
        ? evmAddress
        : fromChainCosmosAccount?.address;
    const toAddress =
      toChain?.chainType === "evm" ? evmAddress : toChainCosmosAccount?.address;

    const fromWalletIcon =
      fromChain?.chainType === "evm"
        ? evmConnector?.icon
        : fromChainCosmosAccount?.walletInfo.logo;
    const toWalletIcon =
      toChain?.chainType === "evm"
        ? evmConnector?.icon
        : toChainCosmosAccount?.walletInfo.logo;

    const quote = useBridgeQuote({
      toAddress,
      toChain: toChain,
      toAsset: destinationAsset
        ? {
            address:
              toChain?.chainType === "evm"
                ? getAddress(destinationAsset.address)
                : destinationAsset.address,
            decimals: destinationAsset.decimals,
            denom: destinationAsset.denom,
          }
        : undefined,
      fromAddress,
      fromChain: fromChain,
      fromAsset: sourceAsset
        ? {
            address:
              fromChain?.chainType === "evm"
                ? getAddress(sourceAsset.address)
                : sourceAsset.address,
            decimals: sourceAsset.decimals,
            denom: sourceAsset.denom,
            amount: sourceAsset.amount,
          }
        : undefined,
      direction,
      onRequestClose: onClose,
      inputAmount: cryptoAmount,
      bridges:
        direction === "deposit"
          ? sourceAsset?.supportedProviders
          : destinationAsset?.supportedProviders,
      onTransfer: () => {
        setCryptoAmount("0");
        setFiatAmount("0");
      },
    });

    if (!selectedAssetDenom) return;

    return (
      <>
        <Screen screenName={ImmersiveBridgeScreens.Amount}>
          {({ setCurrentScreen }) => (
            <AmountScreen
              direction={direction}
              selectedDenom={selectedAssetDenom!}
              fromChain={fromChain}
              setFromChain={setFromChain}
              toChain={toChain}
              setToChain={setToChain}
              sourceAsset={sourceAsset}
              setSourceAsset={setSourceAsset}
              destinationAsset={destinationAsset}
              setDestinationAsset={setDestinationAsset}
              cryptoAmount={cryptoAmount}
              setCryptoAmount={setCryptoAmount}
              fiatAmount={fiatAmount}
              setFiatAmount={setFiatAmount}
              quote={quote}
              onConfirm={() => setCurrentScreen(ImmersiveBridgeScreens.Review)}
            />
          )}
        </Screen>
        <Screen screenName={ImmersiveBridgeScreens.Review}>
          {({ goBack }) => (
            <>
              {fromChain &&
                toChain &&
                fromAddress &&
                toAddress &&
                fromWalletIcon &&
                toWalletIcon && (
                  <ReviewScreen
                    direction={direction}
                    fromChain={fromChain}
                    toChain={toChain}
                    fromAddress={fromAddress}
                    toAddress={toAddress}
                    fromWalletIcon={fromWalletIcon}
                    toWalletIcon={toWalletIcon}
                    quote={quote}
                    onCancel={goBack}
                    onConfirm={() => {
                      quote.onTransfer();
                    }}
                  />
                )}
            </>
          )}
        </Screen>
      </>
    );
  }
);
