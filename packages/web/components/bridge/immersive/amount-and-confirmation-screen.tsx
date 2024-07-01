import { CoinPretty } from "@keplr-wallet/unit";
import { BridgeChain } from "@osmosis-labs/bridge";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { useState } from "react";

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
    const [destinationAsset, setDestinationAsset] = useState<MinimalAsset>();
    const [fromChain, setFromChain] = useState<BridgeChain>();
    const [toChain, setToChain] = useState<BridgeChain>();

    const [cryptoAmount, setCryptoAmount] = useState<string>("0");
    const [fiatAmount, setFiatAmount] = useState<string>("0");

    // Wallets
    const destinationAccount = accountStore.getWallet(
      accountStore.osmosisChainId
    );
    const { address: evmAddress } = useEvmWalletAccount();

    const sourceChain = direction === "deposit" ? fromChain : toChain;
    const destinationChain = direction === "deposit" ? toChain : fromChain;

    const cosmosCounterpartyAccount =
      sourceChain?.chainType === "evm" || isNil(sourceChain)
        ? undefined
        : accountStore.getWallet(sourceChain.chainId);

    const sourceAddress =
      sourceChain?.chainType === "evm"
        ? evmAddress
        : cosmosCounterpartyAccount?.address;

    const quote = useBridgeQuote({
      destinationAddress: destinationAccount?.address,
      destinationChain,
      destinationAsset: destinationAsset
        ? {
            address: destinationAsset.coinMinimalDenom,
            decimals: destinationAsset.coinDecimals,
            denom: destinationAsset.coinDenom,
          }
        : undefined,
      sourceAddress,
      sourceChain,
      sourceAsset,
      direction,
      onRequestClose: onClose,
      inputAmount: cryptoAmount,
      bridges: sourceAsset?.supportedProviders,
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
              sourceChain={sourceChain}
              destinationChain={destinationChain}
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
