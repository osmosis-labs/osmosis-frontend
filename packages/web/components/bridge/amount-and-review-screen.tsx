import { CoinPretty } from "@keplr-wallet/unit";
import type { Bridge } from "@osmosis-labs/bridge";
import { isNil, noop } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { getAddress } from "viem";

import { Screen } from "~/components/screen-manager";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { refetchUserQueries, useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { AmountScreen } from "./amount-screen";
import { ImmersiveBridgeScreen } from "./immersive-bridge";
import { ReviewScreen } from "./review-screen";
import { QuotableBridge, useBridgeQuotes } from "./use-bridge-quotes";
import {
  SupportedAsset,
  useBridgesSupportedAssets,
} from "./use-bridges-supported-assets";

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
    const { logEvent } = useAmplitudeAnalytics();

    const [fromAsset, setFromAsset] = useState<SupportedAssetWithAmount>();
    const [toAsset, setToAsset] = useState<SupportedAsset>();
    const [fromChain, setFromChain] = useState<BridgeChainWithDisplayInfo>();
    const [toChain, setToChain] = useState<BridgeChainWithDisplayInfo>();

    const [cryptoAmount, setCryptoAmount] = useState<string>("");
    const [fiatAmount, setFiatAmount] = useState<string>("");

    const [manualToAddress, setManualToAddress] = useState<string>();

    // Wallets
    const { address: evmAddress, connector: evmConnector } =
      useEvmWalletAccount();

    const fromChainCosmosAccount =
      !isNil(fromChain) && fromChain.chainType === "cosmos"
        ? accountStore.getWallet(fromChain.chainId)
        : undefined;

    const toChainCosmosAccount =
      !isNil(toChain) && toChain.chainType === "cosmos"
        ? accountStore.getWallet(toChain.chainId)
        : undefined;

    // Note on below: they are only used when chains are EVM or Cosmos
    // Going to need to add support or Bitcoin or Solana wallets
    const fromAddress =
      fromChain?.chainType === "evm"
        ? evmAddress
        : fromChainCosmosAccount?.address;
    const toAddress = !isNil(manualToAddress)
      ? manualToAddress
      : toChain?.chainType === "evm"
      ? evmAddress
      : toChainCosmosAccount?.address;

    const fromWalletIcon =
      fromChain?.chainType === "evm"
        ? evmConnector?.icon
        : fromChainCosmosAccount?.walletInfo.logo;
    const toWalletIcon =
      toChain?.chainType === "evm"
        ? evmConnector?.icon
        : toChainCosmosAccount?.walletInfo.logo;

    const fromWalletName =
      fromChain?.chainType === "evm"
        ? evmConnector?.name
        : fromChainCosmosAccount?.walletInfo.name;
    const toWalletName =
      toChain?.chainType === "evm"
        ? evmConnector?.name
        : toChainCosmosAccount?.walletInfo.name;

    const { data: assetsInOsmosis } =
      api.edge.assets.getCanonicalAssetWithVariants.useQuery(
        {
          findMinDenomOrSymbol: selectedAssetDenom ?? "",
        },
        {
          enabled: !isNil(selectedAssetDenom),
          cacheTime: 10 * 60 * 1000, // 10 minutes
          staleTime: 10 * 60 * 1000, // 10 minutes
          useErrorBoundary: true,
        }
      );

    const supportedAssets = useBridgesSupportedAssets({
      assets: assetsInOsmosis,
      chain: {
        chainId: accountStore.osmosisChainId,
        chainType: "cosmos",
      },
    });
    const { supportedAssetsByChainId: counterpartySupportedAssetsByChainId } =
      supportedAssets;

    /** Filter for bridges that currently support quoting. */
    const quoteBridges = useMemo(() => {
      const assetSupportedBridges = new Set<Bridge>();

      if (direction === "deposit" && fromAsset) {
        const providers = Object.values(fromAsset.supportedVariants).flat();
        providers.forEach((provider) => assetSupportedBridges.add(provider));
      } else if (direction === "withdraw" && fromAsset && toAsset) {
        const counterpartyAssets =
          counterpartySupportedAssetsByChainId[toAsset.chainId];
        counterpartyAssets.forEach((asset) => {
          const providers = asset.supportedVariants[fromAsset.address] || [];
          providers.forEach((provider) => assetSupportedBridges.add(provider));
        });
      }

      return Array.from(assetSupportedBridges).filter(
        (bridge) => bridge !== "Nomic" && bridge !== "Wormhole"
      ) as QuotableBridge[];
    }, [direction, fromAsset, toAsset, counterpartySupportedAssetsByChainId]);

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
      bridges: quoteBridges,
      onTransfer: () => {
        // Ensures user queries are reset for other chains txs, since
        // only cosmos txs reset queries from root store
        if (
          fromChain?.chainType !== "cosmos" ||
          toChain?.chainType !== "cosmos"
        ) {
          refetchUserQueries(apiUtils);
        }

        setToAsset(undefined);
        setFromAsset(undefined);
        setCryptoAmount("0");
        setFiatAmount("0");
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
              assetsInOsmosis={assetsInOsmosis}
              bridgesSupportedAssets={supportedAssets}
              fromChain={fromChain}
              setFromChain={setFromChain}
              toChain={toChain}
              setToChain={setToChain}
              manualToAddress={manualToAddress}
              setManualToAddress={setManualToAddress}
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
              onClose={onClose}
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
                      const q = quote.selectedQuote?.quote;

                      if (q) {
                        const variants =
                          direction === "deposit"
                            ? Object.keys(fromAsset.supportedVariants)
                            : counterpartySupportedAssetsByChainId[
                                toAsset.chainId
                              ].map(({ address }) => address);

                        const selectedVariant =
                          direction === "deposit"
                            ? toAsset.address
                            : fromAsset.address;

                        /** If there's multiple variants, it's only recommended if
                         * the selected variant is the first one in the sorted list.
                         * If there's not multiple variants, it automatiaclly is recommended.
                         */
                        const isRecommendedVariant =
                          variants.length > 1
                            ? selectedVariant === variants[0]
                            : true;

                        const walletName =
                          direction === "deposit"
                            ? fromWalletName
                            : toWalletName;

                        const networkName =
                          direction === "deposit"
                            ? fromChain.chainName
                            : toChain.chainName;

                        logEvent([
                          EventName.DepositWithdraw.started,
                          {
                            amount: Number(q.input.amount.toDec().toString()),
                            tokenName: q.input.amount.denom,
                            bridgeProviderName: q.provider.id,
                            hasMultipleVariants: variants.length > 1,
                            isRecommendedVariant,
                            network: networkName,
                            transferDirection: direction,
                            valueUsd: Number(
                              q.input.fiatValue.toDec().toString()
                            ),
                            walletName,
                          },
                        ]);
                      }

                      quote.onTransfer().catch(noop);
                    }}
                    isManualAddress={!isNil(manualToAddress)}
                  />
                )}
            </>
          )}
        </Screen>
      </>
    );
  }
);
