import { CoinPretty } from "@keplr-wallet/unit";
import { isNil, noop } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { getAddress } from "viem";

import { Screen } from "~/components/screen-manager";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { refetchUserQueries, useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { AmountScreen } from "./amount-screen";
import { ImmersiveBridgeScreen } from "./immersive-bridge";
import { ReviewScreen } from "./review-screen";
import { useBridgeQuotes } from "./use-bridge-quotes";
import { SupportedAsset } from "./use-bridges-supported-assets";

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
    const apiUtils = api.useUtils();

    const [fromAsset, setFromAsset] = useState<SupportedAssetWithAmount>();
    const [toAsset, setToAsset] = useState<SupportedAsset>();
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
      toAsset: toAsset
        ? {
            address:
              toChain?.chainType === "evm"
                ? getAddress(toAsset.address)
                : toAsset.address,
            decimals: toAsset.decimals,
            denom: toAsset.denom,
          }
        : undefined,
      fromAddress,
      fromChain: fromChain,
      fromAsset: fromAsset
        ? {
            address:
              fromChain?.chainType === "evm"
                ? getAddress(fromAsset.address)
                : fromAsset.address,
            decimals: fromAsset.decimals,
            denom: fromAsset.denom,
            amount: fromAsset.amount,
          }
        : undefined,
      direction,
      onRequestClose: onClose,
      inputAmount: cryptoAmount,
      bridges:
        direction === "deposit"
          ? fromAsset?.supportedVariants[toAsset?.address ?? ""]
          : toAsset?.supportedVariants[fromAsset?.address ?? ""],
      onTransfer: () => {
        setToAsset(undefined);
        setFromAsset(undefined);
        setCryptoAmount("0");
        setFiatAmount("0");

        // redundantly ensures user queries are reset for EVM txs, since
        // only cosmos txs reset queries from root store
        refetchUserQueries(apiUtils);
      },
    });

    if (!selectedAssetDenom) return;

    return (
      <>
        <Screen screenName={ImmersiveBridgeScreen.Amount}>
          {({ setCurrentScreen }) => (
            <AmountScreen
              direction={direction}
              selectedDenom={selectedAssetDenom!}
              fromChain={fromChain}
              setFromChain={setFromChain}
              toChain={toChain}
              setToChain={setToChain}
              fromAsset={fromAsset}
              setFromAsset={setFromAsset}
              toAsset={toAsset}
              setToAsset={setToAsset}
              cryptoAmount={cryptoAmount}
              setCryptoAmount={setCryptoAmount}
              fiatAmount={fiatAmount}
              setFiatAmount={setFiatAmount}
              quote={quote}
              onConfirm={() => setCurrentScreen(ImmersiveBridgeScreen.Review)}
            />
          )}
        </Screen>
        <Screen screenName={ImmersiveBridgeScreen.Review}>
          {({ goBack }) => (
            <>
              {fromChain &&
                toChain &&
                fromAddress &&
                toAddress &&
                fromWalletIcon &&
                toWalletIcon &&
                fromAsset &&
                toAsset && (
                  <ReviewScreen
                    direction={direction}
                    selectedDenom={selectedAssetDenom!}
                    fromChain={fromChain}
                    toChain={toChain}
                    fromAsset={fromAsset}
                    toAsset={toAsset}
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
