import { CoinPretty } from "@keplr-wallet/unit";
import { BridgeChain } from "@osmosis-labs/bridge";
import { isNil, noop } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { getAddress } from "viem";

import { AmountScreen } from "~/components/bridge/immersive/amount-screen";
import { ImmersiveBridgeScreens } from "~/components/bridge/immersive/immersive-bridge";
import { useBridgeQuotes } from "~/components/bridge/immersive/use-bridge-quotes";
import { SupportedAsset } from "~/components/bridge/immersive/use-bridges-supported-assets";
import { Screen } from "~/components/screen-manager";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { useStore } from "~/stores";

import { ReviewScreen } from "./review-screen";

export type SupportedAssetWithAmount = SupportedAsset & { amount: CoinPretty };
export type BridgeChainWithDisplayInfo = BridgeChain & {
  logoUri?: string;
  color?: string;
  prettyName: string;
};

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
    const [fromChain, setFromChain] = useState<BridgeChainWithDisplayInfo>();
    const [toChain, setToChain] = useState<BridgeChainWithDisplayInfo>();

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

    const quote = useBridgeQuotes({
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
          ? sourceAsset?.supportedVariants[destinationAsset?.address ?? ""]
          : destinationAsset?.supportedVariants[sourceAsset?.address ?? ""],
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
                toWalletIcon &&
                sourceAsset &&
                destinationAsset && (
                  <ReviewScreen
                    direction={direction}
                    selectedDenom={selectedAssetDenom!}
                    fromChain={fromChain}
                    toChain={toChain}
                    fromAsset={sourceAsset}
                    toAsset={destinationAsset}
                    fromAddress={fromAddress}
                    toAddress={toAddress}
                    fromWalletIcon={fromWalletIcon}
                    toWalletIcon={toWalletIcon}
                    quote={quote}
                    onCancel={goBack}
                    onConfirm={() => {
                      quote.onTransfer().catch(noop);
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
