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
import { Button } from "~/components/ui/button";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { useStore } from "~/stores";

export type SupportedAsset = ReturnType<
  typeof useBridgesSupportedAssets
>["supportedAssetsByChainId"][string][number];

export type SupportedAssetWithAmount = SupportedAsset & { amount: CoinPretty };

interface AmountAndConfirmationScreenProps {
  direction: "deposit" | "withdraw";
  selectedAssetDenom: string | undefined;
  onClose: () => void;
}

export const AmountAndConfirmationScreen = observer(
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
    const { address: evmAddress } = useEvmWalletAccount();

    const fromChainCosmosAccount =
      fromChain?.chainType === "evm" || isNil(fromChain)
        ? undefined
        : accountStore.getWallet(fromChain.chainId);

    const toChainCosmosAccount =
      toChain?.chainType === "evm" || isNil(toChain)
        ? undefined
        : accountStore.getWallet(toChain.chainId);

    const quote = useBridgeQuote({
      toAddress:
        toChain?.chainType === "evm"
          ? evmAddress
          : toChainCosmosAccount?.address,
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
      fromAddress:
        fromChain?.chainType === "evm"
          ? evmAddress
          : fromChainCosmosAccount?.address,
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
          {() => (
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
            />
          )}
        </Screen>
        <Screen screenName={ImmersiveBridgeScreens.Review}>
          {({ goBack }) => (
            <div>
              <h6>Step 3: Review</h6>
              <Button onClick={goBack}>Back</Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </Screen>
      </>
    );
  }
);
