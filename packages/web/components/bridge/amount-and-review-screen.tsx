import { CoinPretty } from "@keplr-wallet/unit";
import type { Bridge } from "@osmosis-labs/bridge";
import { isNil, noop } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { getAddress } from "viem";

import { Screen, useScreenManager } from "~/components/screen-manager";
import { EventName, OUTLIER_USD_VALUE_THRESHOLD } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { BridgeScreen } from "~/hooks/bridge";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { refetchUserQueries, useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { AmountScreen } from "./amount-screen";
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

const unsupportedBridges: Exclude<Bridge, QuotableBridge>[] = [
  "Nomic",
  "Wormhole",
  "Nitro",
];

export const AmountAndReviewScreen = observer(
  ({
    direction,
    selectedAssetDenom,
    onClose,
  }: AmountAndConfirmationScreenProps) => {
    const { accountStore } = useStore();
    const apiUtils = api.useUtils();
    const { logEvent } = useAmplitudeAnalytics();
    const { setCurrentScreen } = useScreenManager();

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

    const { data: assetsInOsmosis, isLoading: isLoadingAssetsInOsmosis } =
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

    /**
     * Only find supported assets for the selected variant
     * when withdrawing.
     */
    const withdrawAsset =
      direction === "withdraw"
        ? assetsInOsmosis?.find(
            (asset) =>
              asset.coinDenom === selectedAssetDenom ||
              asset.coinMinimalDenom === selectedAssetDenom
          )
        : undefined;

    const supportedAssets = useBridgesSupportedAssets({
      assets: withdrawAsset ? [withdrawAsset] : assetsInOsmosis,
      chain: {
        chainId: accountStore.osmosisChainId,
        chainType: "cosmos",
      },
    });
    const { supportedAssetsByChainId: counterpartySupportedAssetsByChainId } =
      supportedAssets;

    /** Filter for bridges for the current to/from chain/asset selection. */
    const bridges = useMemo(() => {
      if (!fromAsset || !toAsset || !fromChain || !toChain) return [];

      const assetSupportedBridges = new Set<Bridge>();

      if (direction === "deposit") {
        const providers = fromAsset.supportedVariants[toAsset.address] ?? [];
        providers.forEach((provider) => assetSupportedBridges.add(provider));
      } else if (direction === "withdraw") {
        const counterpartyAssets =
          counterpartySupportedAssetsByChainId[toAsset.chainId];
        counterpartyAssets
          ?.filter(({ address }) => address === toAsset.address)
          .forEach((asset) => {
            const providers = asset.supportedVariants[fromAsset.address] ?? [];
            providers.forEach((provider) =>
              assetSupportedBridges.add(provider)
            );
          });
      }

      return Array.from(assetSupportedBridges);
    }, [
      direction,
      fromAsset,
      fromChain,
      toAsset,
      toChain,
      counterpartySupportedAssetsByChainId,
    ]);
    /**
     * Only some bridges support quoting.
     * It's also important to only return bridges
     * that support the current to/from assets by extracting the bridges
     * from the supported bridges mapping.
     */
    const quoteBridges = useMemo(
      () =>
        bridges.filter(
          (bridge) =>
            !unsupportedBridges.includes(
              // @ts-expect-error
              bridge
            )
        ) as QuotableBridge[],
      [bridges]
    );

    const quote = useBridgeQuotes({
      toAddress,
      toChain: toChain,
      toAsset: (() => {
        if (!toAsset) return undefined;
        const asset = assetsInOsmosis?.find(
          (a) =>
            a.coinMinimalDenom === toAsset.address ||
            toAsset.denom === a.coinDenom
        );
        return {
          address:
            toChain?.chainType === "evm"
              ? getAddress(toAsset.address)
              : toAsset.address,
          decimals: toAsset.decimals,
          denom: toAsset.denom,
          imageUrl: asset?.coinImageUrl ?? assetsInOsmosis?.[0]?.coinImageUrl,
          isUnstable: !!asset?.isUnstable,
        };
      })(),
      fromAddress,
      fromChain: fromChain,
      fromAsset: (() => {
        if (!fromAsset) return undefined;
        const asset = assetsInOsmosis?.find(
          (a) =>
            a.coinMinimalDenom === fromAsset.address ||
            fromAsset.denom === a.coinDenom
        );
        return {
          address:
            fromChain?.chainType === "evm"
              ? getAddress(fromAsset.address)
              : fromAsset.address,
          decimals: fromAsset.decimals,
          denom: fromAsset.denom,
          amount: fromAsset.amount,
          imageUrl: asset?.coinImageUrl ?? assetsInOsmosis?.[0]?.coinImageUrl,
          isUnstable: !!asset?.isUnstable,
        };
      })(),
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

    if (!selectedAssetDenom) {
      setCurrentScreen(BridgeScreen.Asset);
      return null;
    }

    return (
      <>
        <Screen screenName={BridgeScreen.Amount}>
          {({ setCurrentScreen }) => (
            <AmountScreen
              direction={direction}
              selectedDenom={selectedAssetDenom!}
              assetsInOsmosis={assetsInOsmosis}
              isLoadingAssetsInOsmosis={isLoadingAssetsInOsmosis}
              bridgesSupportedAssets={supportedAssets}
              supportedBridges={bridges}
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
              onConfirm={() => setCurrentScreen(BridgeScreen.Review)}
              onClose={onClose}
            />
          )}
        </Screen>
        <Screen screenName={BridgeScreen.Review}>
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

                        /** If there's multiple variants, it's only recommended if
                         * the selected variant is the first one in the sorted list.
                         * If there's not multiple variants, it automatically is recommended.
                         * This allows us to more easily isolate transfers where
                         * the user optend out of the default flow by selecting
                         * an unconventional/alt variant.
                         */
                        const isRecommendedVariant =
                          variants.length > 1
                            ? toAsset.address === variants[0]
                            : true;

                        const walletName =
                          direction === "deposit"
                            ? fromWalletName
                            : toWalletName;

                        const networkName =
                          direction === "deposit"
                            ? fromChain.chainName
                            : toChain.chainName;

                        let valueUsd = Number(
                          q.input.fiatValue.toDec().toString()
                        );
                        // Protect our data from outliers
                        // Perhaps from upstream issues with price data providers
                        if (
                          isNaN(valueUsd) ||
                          valueUsd > OUTLIER_USD_VALUE_THRESHOLD
                        ) {
                          valueUsd = 0;
                        }

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
                            valueUsd,
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
