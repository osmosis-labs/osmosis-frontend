import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { IntPretty } from "@keplr-wallet/unit";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil, noop, shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  Dispatch,
  FunctionComponent,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { BridgeReceiveAssetDropdown } from "~/components/bridge/bridge-receive-asset-dropdown";
import { DepositAddressScreen } from "~/components/bridge/deposit-address-screen";
import { CryptoFiatInput } from "~/components/control/crypto-fiat-input";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import {
  Screen,
  ScreenManager,
  useScreenManager,
} from "~/components/screen-manager";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { EthereumChainIds } from "~/config/wagmi";
import {
  useAmplitudeAnalytics,
  useConnectWalletModalRedirect,
  useDisclosure,
  useFeatureFlags,
  useTranslation,
} from "~/hooks";
import { BridgeScreen } from "~/hooks/bridge";
import { useEvmWalletAccount, useSwitchEvmChain } from "~/hooks/evm-wallet";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { ChainLogo } from "../assets/chain-logo";
import {
  SupportedAssetWithAmount,
  SupportedBridgeInfo,
} from "./amount-and-review-screen";
import { BridgeNetworkSelectModal } from "./bridge-network-select-modal";
import { BridgeWalletSelectModal } from "./bridge-wallet-select-modal";
import {
  MoreBridgeOptionsModal,
  OnlyExternalBridgeSuggest,
} from "./more-bridge-options";
import {
  BridgeProviderDropdownRow,
  EstimatedTimeRow,
  ExpandDetailsControlContent,
  ExpectedOutputRow,
  NetworkFeeRow,
  ProviderFeesRow,
  TotalFeesRow,
} from "./quote-detail";
import { BridgeQuote } from "./use-bridge-quotes";
import {
  SupportedAsset,
  SupportedChain,
  useBridgesSupportedAssets,
} from "./use-bridges-supported-assets";

interface AmountScreenProps {
  direction: "deposit" | "withdraw";
  selectedDenom: string;

  assetsInOsmosis: MinimalAsset[] | undefined;
  isLoadingAssetsInOsmosis: boolean;

  bridgesSupportedAssets: ReturnType<typeof useBridgesSupportedAssets>;
  supportedBridgeInfo: SupportedBridgeInfo;

  fromChain: BridgeChainWithDisplayInfo | undefined;
  setFromChain: (chain: BridgeChainWithDisplayInfo) => void;
  toChain: BridgeChainWithDisplayInfo | undefined;
  setToChain: (chain: BridgeChainWithDisplayInfo) => void;

  fromAsset: SupportedAssetWithAmount | undefined;
  setFromAsset: (asset: SupportedAssetWithAmount | undefined) => void;
  toAsset: SupportedAsset | undefined;
  setToAsset: (asset: SupportedAsset | undefined) => void;

  manualToAddress: string | undefined;
  setManualToAddress: (address: string | undefined) => void;

  toAddress: string | undefined;

  cryptoAmount: string;
  fiatAmount: string;
  setCryptoAmount: (amount: string) => void;
  setFiatAmount: (amount: string) => void;

  quote: BridgeQuote;

  onConfirm: () => void;
  onClose: () => void;
}

export const AmountScreen = observer(
  ({
    direction,
    selectedDenom,

    assetsInOsmosis,
    isLoadingAssetsInOsmosis,

    bridgesSupportedAssets: {
      supportedAssetsByChainId: counterpartySupportedAssetsByChainId,
      supportedChains,
      isLoading: isLoadingSupportedAssets,
    },
    supportedBridgeInfo,

    fromChain,
    setFromChain,
    toChain,
    setToChain,

    fromAsset,
    setFromAsset,
    toAsset,
    setToAsset,

    manualToAddress,
    setManualToAddress,

    toAddress,

    cryptoAmount,
    setCryptoAmount,
    fiatAmount,
    setFiatAmount,

    quote,

    onConfirm,
    onClose,
  }: AmountScreenProps) => {
    const { setCurrentScreen } = useScreenManager();
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();
    const featureFlags = useFeatureFlags();

    const {
      selectedQuote,
      buttonText,
      isLoadingBridgeQuote,
      isInsufficientBal,
      isInsufficientFee,
      warnUserOfPriceImpact,
      warnUserOfSlippage,
      errorBoxMessage,
      warningBoxMessage,
    } = quote;

    const [areMoreOptionsVisible, setAreMoreOptionsVisible] = useState(false);
    const [isNetworkSelectVisible, setIsNetworkSelectVisible] = useState(false);
    const [pendingChainApproval, setPendingChainApproval] = useState(false);

    const [inputUnit, setInputUnit] = useState<"crypto" | "fiat">("fiat");
    const {
      isOpen: isBridgeWalletSelectOpen,
      onClose: onCloseBridgeWalletSelect,
      onOpen: onOpenBridgeWalletSelect,
    } = useDisclosure();

    // Wallets
    const osmosisAccount = accountStore.getWallet(accountStore.osmosisChainId);
    const {
      address: evmAddress,
      connector: evmConnector,
      isConnected: isEvmWalletConnected,
      chainId: evmWalletCurrentChainId,
      isConnecting,
    } = useEvmWalletAccount();
    const { switchChain: switchEvmChain } = useSwitchEvmChain();

    const fromCosmosCounterpartyAccount =
      !isNil(fromChain) && fromChain.chainType === "cosmos"
        ? accountStore.getWallet(fromChain.chainId)
        : undefined;

    const chainThatNeedsWalletConnection =
      direction === "deposit" ? fromChain : toChain;
    const cosmosAccountRequiringConnection =
      !isNil(chainThatNeedsWalletConnection) &&
      chainThatNeedsWalletConnection.chainType === "cosmos"
        ? accountStore.getWallet(chainThatNeedsWalletConnection.chainId)
        : undefined;
    const isWalletNeededConnected = useMemo(() => {
      if (isNil(chainThatNeedsWalletConnection)) return false;

      if (!isNil(manualToAddress)) return true;

      if (chainThatNeedsWalletConnection.chainType === "evm") {
        return isEvmWalletConnected;
      }

      if (chainThatNeedsWalletConnection.chainType === "bitcoin") {
        return !isNil(manualToAddress);
      }

      return !!cosmosAccountRequiringConnection?.address;
    }, [
      cosmosAccountRequiringConnection?.address,
      chainThatNeedsWalletConnection,
      isEvmWalletConnected,
      manualToAddress,
    ]);

    const { data: osmosisChain } = api.edge.chains.getChain.useQuery(
      {
        findChainNameOrId: accountStore.osmosisChainId,
      },
      {
        useErrorBoundary: true,
      }
    );

    const canonicalAsset = assetsInOsmosis?.[0];

    const {
      price: canonicalAssetPrice,
      isLoading: isLoadingCanonicalAssetPrice,
    } = usePrice(
      /**
       * Use the canonical osmosis asset to determine the price of the assets.
       * This is because providers can return variant assets that are missing in
       * our asset list.
       */
      canonicalAsset
    );

    const firstSupportedEvmChain = useMemo(
      () =>
        supportedChains.find(
          (
            chain
          ): chain is Extract<
            BridgeChainWithDisplayInfo,
            { chainType: "evm" }
          > => chain.chainType === "evm"
        ),
      [supportedChains]
    );
    const firstSupportedCosmosChain = useMemo(
      () =>
        supportedChains.find(
          (
            chain
          ): chain is Extract<
            BridgeChainWithDisplayInfo,
            { chainType: "cosmos" }
          > => chain.chainType === "cosmos"
        ),
      [supportedChains]
    );

    const hasMoreThanOneChainType =
      !isNil(firstSupportedCosmosChain) && !isNil(firstSupportedEvmChain);

    const checkChainAndConnectWallet = useCallback(
      (chainParam?: BridgeChainWithDisplayInfo) => {
        const chain =
          chainParam ?? (direction === "deposit" ? fromChain : toChain);

        if (!chain || !isNil(manualToAddress)) return;
        if (chain.chainType === "evm") {
          if (
            (isEvmWalletConnected &&
              evmWalletCurrentChainId === chain.chainId) ||
            isConnecting
          ) {
            return;
          }

          if (
            isEvmWalletConnected &&
            evmWalletCurrentChainId !== chain.chainId
          ) {
            switchEvmChain({
              chainId: chain.chainId as EthereumChainIds,
            });
          } else {
            onOpenBridgeWalletSelect();
          }
        } else if (chain.chainType === "cosmos") {
          const account = accountStore.getWallet(chain.chainId);
          const accountRepo = accountStore.getWalletRepo(chain.chainId);

          if (
            // If the account is already connected
            account?.isWalletConnected
          ) {
            return;
          }

          setPendingChainApproval(true);

          accountRepo
            ?.connect(osmosisAccount?.walletName)
            .catch((error) => {
              console.error("Failed to connect Osmosis account:", error);
              if (supportedChains.length > 1) {
                setIsNetworkSelectVisible(true);
              }
            })
            .finally(() => setPendingChainApproval(false));
        } else if (chain.chainType === "bitcoin") {
          onOpenBridgeWalletSelect();
        }
      },
      [
        accountStore,
        direction,
        evmWalletCurrentChainId,
        fromChain,
        isConnecting,
        isEvmWalletConnected,
        manualToAddress,
        onOpenBridgeWalletSelect,
        osmosisAccount?.walletName,
        supportedChains.length,
        switchEvmChain,
        toChain,
      ]
    );

    const {
      accountActionButton: connectWalletButton,
      walletConnected: osmosisWalletConnected,
    } = useConnectWalletModalRedirect(
      {
        className: "w-full",
      },
      noop,
      undefined,
      checkChainAndConnectWallet
    );

    const supportedSourceAssets: SupportedAsset[] | undefined = useMemo(() => {
      if (!fromChain) return undefined;

      // Use Osmosis Assets to get the source asset
      if (direction === "withdraw") {
        const selectedAsset = assetsInOsmosis?.find(
          (asset) =>
            asset.coinDenom === selectedDenom ||
            asset.coinMinimalDenom === selectedDenom
        );
        if (!selectedAsset) return undefined;
        return [
          {
            address: selectedAsset.coinMinimalDenom,
            decimals: selectedAsset.coinDecimals,
            chainId: fromChain.chainId,
            chainType: fromChain.chainType,
            denom: selectedAsset.coinDenom,
            supportedVariants: {
              [selectedAsset.coinMinimalDenom]: {},
            },
            transferTypes: [],
          },
        ];
      }

      return counterpartySupportedAssetsByChainId[fromChain.chainId];
    }, [
      assetsInOsmosis,
      counterpartySupportedAssetsByChainId,
      direction,
      fromChain,
      selectedDenom,
    ]);

    const balanceSource = (() => {
      if (!fromChain || !supportedSourceAssets) return undefined;
      const assets = supportedSourceAssets.filter(
        (asset) => asset.chainType === fromChain.chainType
      );

      switch (fromChain.chainType) {
        case "evm":
          return {
            type: fromChain.chainType,
            assets: assets as Extract<SupportedAsset, { chainType: "evm" }>[],
            userEvmAddress: evmAddress,
          };
        case "cosmos":
          return {
            type: fromChain.chainType,
            assets: assets as Extract<
              SupportedAsset,
              { chainType: "cosmos" }
            >[],
            userCosmosAddress: fromCosmosCounterpartyAccount?.address,
          };
        case "bitcoin":
          return {
            type: fromChain.chainType,
            assets: assets as Extract<
              SupportedAsset,
              { chainType: "bitcoin" }
            >[],
          };
        case "tron":
          return {
            type: fromChain.chainType,
            assets: assets as Extract<SupportedAsset, { chainType: "tron" }>[],
          };
        default:
          return {
            type: fromChain.chainType,
            assets: assets as Extract<
              SupportedAsset,
              { chainType: "solana" }
            >[],
          };
      }
    })();

    const {
      data: assetsBalances,
      isLoading: isLoadingAssetsBalance,
      isError: hasBalanceError,
    } = api.local.bridgeTransfer.getSupportedAssetsBalances.useQuery(
      { source: balanceSource! },
      {
        enabled:
          !isNil(fromChain) &&
          !isNil(supportedSourceAssets) &&
          supportedSourceAssets.length > 0 &&
          !isNil(balanceSource),

        select: (data) => {
          let nextData: typeof data = data;

          // Filter out assets with no balance
          if (nextData && nextData.length) {
            const filteredData = nextData.filter((asset) =>
              asset.amount.toDec().isPositive()
            );

            // If there are no assets with balance, leave one to be selected
            if (filteredData.length === 0) {
              nextData = [nextData[0]];
            } else {
              nextData = filteredData;
            }

            if (
              !fromAsset ||
              (nextData[0].denom === fromAsset.denom &&
                nextData[0].amount.toDec().gt(fromAsset.amount.toDec()))
            ) {
              const highestBalance = nextData.reduce(
                (acc, curr) =>
                  curr.amount.toDec().gt(acc.amount.toDec()) ? curr : acc,
                nextData[0]
              );

              setFromAsset(highestBalance);
            }
          }

          return nextData;
        },
      }
    );

    /**
     * Deposit
     * Set the initial destination asset based on the source asset.
     */
    useEffect(() => {
      if (
        direction === "deposit" &&
        !isNil(fromAsset) &&
        !isNil(assetsInOsmosis) &&
        isNil(toAsset)
      ) {
        const destinationAsset = assetsInOsmosis.find(
          (a) =>
            a.coinMinimalDenom === Object.keys(fromAsset.supportedVariants)[0]
        )!;

        setToAsset({
          address: destinationAsset.coinMinimalDenom,
          decimals: destinationAsset.coinDecimals,
          chainId: accountStore.osmosisChainId,
          chainType: "cosmos",
          denom: destinationAsset.coinDenom,
          // Can be left empty because for deposits we don't rely on the supported variants within the destination asset
          supportedVariants: {},
          transferTypes: [],
        });
      }
    }, [
      accountStore.osmosisChainId,
      assetsInOsmosis,
      toAsset,
      direction,
      setToAsset,
      fromAsset,
    ]);

    /**
     * Withdraw
     * Set the initial destination asset based on the source asset.
     */
    useEffect(() => {
      if (
        direction === "withdraw" &&
        isNil(toAsset) &&
        counterpartySupportedAssetsByChainId &&
        toChain
      ) {
        const counterpartyAssets =
          counterpartySupportedAssetsByChainId[toChain.chainId];

        if (counterpartyAssets && counterpartyAssets.length > 0) {
          setToAsset(counterpartyAssets[0]);
        }
      }
    }, [
      counterpartySupportedAssetsByChainId,
      direction,
      setToAsset,
      toAsset,
      toChain,
    ]);

    /**
     * Set the osmosis chain based on the direction
     */
    useEffect(() => {
      const chain = direction === "deposit" ? toChain : fromChain;
      const setChain = direction === "deposit" ? setToChain : setFromChain;
      if (isNil(chain) && !isNil(osmosisChain) && !isLoadingSupportedAssets) {
        setChain({
          chainId: osmosisChain.chain_id,
          chainName: osmosisChain.chain_name,
          prettyName: osmosisChain.pretty_name,
          chainType: "cosmos",
          logoUri: osmosisChain.logoURIs?.svg ?? osmosisChain.logoURIs?.png,
          color: osmosisChain.logoURIs?.theme?.primary_color_hex,
          bech32Prefix: osmosisChain.bech32_prefix,
        });
      }
    }, [
      direction,
      fromChain,
      toChain,
      osmosisChain,
      isLoadingSupportedAssets,
      setFromChain,
      setToChain,
    ]);

    /**
     * Set the initial chain based on the direction.
     * TODO: When all balances are computed per chain, we can default to the highest balance
     * instead of the first one.
     */
    useEffect(() => {
      const chain = direction === "deposit" ? fromChain : toChain;
      const setChain = direction === "deposit" ? setFromChain : setToChain;
      if (
        isNil(chain) &&
        !isNil(supportedChains) &&
        supportedChains.length > 0 &&
        !isLoadingSupportedAssets
      ) {
        const firstChain = supportedChains[0];
        setChain(firstChain);
      }
    }, [
      checkChainAndConnectWallet,
      direction,
      fromChain,
      isLoadingSupportedAssets,
      setFromChain,
      setToChain,
      supportedChains,
      toChain,
    ]);

    /** If an asset is disabled */
    const areAssetTransfersDisabled = useMemo(() => {
      return direction === "withdraw"
        ? Boolean(canonicalAsset?.areTransfersDisabled)
        : Boolean(
            assetsInOsmosis?.find(
              (a) => a.coinMinimalDenom === toAsset?.address
            )?.areTransfersDisabled
          );
    }, [direction, canonicalAsset, assetsInOsmosis, toAsset?.address]);

    const onChangeCryptoInput = useCallback(
      (amount: string) => {
        if (isNil(fromAsset?.decimals)) return;

        setCryptoAmount(
          amount.endsWith(".") || amount.endsWith("0") || amount === ""
            ? amount
            : new IntPretty(amount)
                .locale(false)
                .trim(true)
                .maxDecimals(fromAsset.decimals)
                .toString()
        );
      },
      [fromAsset?.decimals, setCryptoAmount]
    );

    const onChangeFiatInput = useCallback(
      (amount: string) => {
        if (isNil(canonicalAssetPrice?.fiatCurrency.maxDecimals)) return;

        setFiatAmount(
          amount.endsWith(".") || amount.endsWith("0") || amount === ""
            ? amount
            : new IntPretty(amount)
                .locale(false)
                .trim(true)
                .maxDecimals(canonicalAssetPrice.fiatCurrency.maxDecimals)
                .toString()
        );
      },
      [canonicalAssetPrice?.fiatCurrency.maxDecimals, setFiatAmount]
    );

    const isLoading =
      isLoadingCanonicalAssetPrice ||
      isLoadingSupportedAssets ||
      isLoadingAssetsInOsmosis ||
      !canonicalAsset ||
      !canonicalAssetPrice ||
      (direction === "withdraw"
        ? !fromChain || !fromAsset
        : !toChain || !toAsset);

    const shouldShowAssetDropdown = useMemo(() => {
      return direction === "deposit"
        ? !isNil(fromAsset) &&
            Object.keys(fromAsset.supportedVariants).length > 1
        : !isNil(toAsset) &&
            counterpartySupportedAssetsByChainId[toAsset.chainId]?.length > 1;
    }, [counterpartySupportedAssetsByChainId, direction, fromAsset, toAsset]);

    const resetAssets = () => {
      setFromAsset(undefined);
      setToAsset(undefined);
    };

    const resetInput = () => {
      setCryptoAmount("");
      setFiatAmount("");
    };

    const chainSelection = (
      <div className="mb-6 flex w-full flex-col gap-2">
        <div className="flex w-full gap-2">
          <span className="body1 md:caption flex-1 text-osmoverse-300">
            {t("transfer.fromNetwork")}
          </span>
          <Icon id="arrow-right" className="invisible md:h-4 md:w-4" />
          <span className="body1 md:caption flex-1 text-osmoverse-300">
            {t("transfer.toNetwork")}
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-2">
          <ChainSelectorButton
            direction={direction}
            chainColor={fromChain?.color}
            chainLogo={fromChain?.logoUri}
            chains={supportedChains}
            toChain={toChain}
            isLoading={!fromChain}
            onSelectChain={(nextChain) => {
              setFromChain(nextChain);
              resetAssets();
              if (fromChain?.chainId !== nextChain.chainId) {
                setManualToAddress(undefined);
                resetInput();
              }
              if (osmosisWalletConnected) {
                checkChainAndConnectWallet(nextChain);
              }
              logEvent([
                EventName.DepositWithdraw.networkSelected,
                { network: nextChain.prettyName },
              ]);
            }}
            readonly={direction === "withdraw" || supportedChains.length === 1}
            isNetworkSelectVisible={
              direction === "withdraw" ? false : isNetworkSelectVisible
            }
            setIsNetworkSelectVisible={
              direction === "withdraw" ? noop : setIsNetworkSelectVisible
            }
            initialManualAddress={manualToAddress}
            onConfirmManualAddress={(address) => {
              setManualToAddress(address);
            }}
          >
            {fromChain?.prettyName}
          </ChainSelectorButton>

          <Icon id="arrow-right" className="text-osmoverse-300 md:h-4 md:w-4" />

          <ChainSelectorButton
            direction={direction}
            chainColor={toChain?.color}
            chainLogo={toChain?.logoUri}
            chains={supportedChains}
            toChain={toChain!}
            isLoading={!toChain}
            onSelectChain={(nextChain) => {
              setToChain(nextChain);
              resetAssets();
              if (fromChain?.chainId !== nextChain.chainId) {
                setManualToAddress(undefined);
                resetInput();
              }
              if (osmosisWalletConnected) {
                checkChainAndConnectWallet(nextChain);
              }
              logEvent([
                EventName.DepositWithdraw.networkSelected,
                { network: nextChain.prettyName },
              ]);
            }}
            readonly={direction === "deposit" || supportedChains.length === 1}
            isNetworkSelectVisible={
              direction === "deposit" ? false : isNetworkSelectVisible
            }
            setIsNetworkSelectVisible={
              direction === "deposit" ? noop : setIsNetworkSelectVisible
            }
            initialManualAddress={manualToAddress}
            onConfirmManualAddress={(address) => {
              setManualToAddress(address);
            }}
          >
            {toChain?.prettyName}
          </ChainSelectorButton>
        </div>
      </div>
    );

    const assetDropdown = fromAsset &&
      toAsset &&
      assetsInOsmosis &&
      shouldShowAssetDropdown &&
      !isLoading && (
        <BridgeReceiveAssetDropdown
          direction={direction}
          fromAsset={fromAsset}
          toAsset={toAsset}
          setToAsset={setToAsset}
          assetsInOsmosis={assetsInOsmosis}
          counterpartySupportedAssetsByChainId={
            counterpartySupportedAssetsByChainId
          }
        />
      );

    console.log(fromAsset);

    if (
      featureFlags.bridgeDepositAddress &&
      !quote.enabled &&
      fromAsset &&
      supportedBridgeInfo.depositAddressBridges.length > 0 &&
      direction === "deposit" &&
      canonicalAsset &&
      fromChain &&
      toChain &&
      toAsset
    ) {
      return (
        <DepositAddressScreen
          canonicalAsset={canonicalAsset}
          direction={direction}
          chainSelection={chainSelection}
          assetDropdown={assetDropdown}
          fromChain={fromChain}
          toChain={toChain}
          fromAsset={fromAsset}
          toAsset={toAsset}
          bridge={supportedBridgeInfo.depositAddressBridges[0]} // For now, only one bridge provider is supported
        />
      );
    }

    /**
     * This condition will be met if:
     * - An asset is disabled, effectively its FF is turned off for whatever reason
     * - There's no supportedAssets returned from providers, so we don't know the to/from asset/chain depending on direction
     * - Quoting is disabled for the current selection, meaning providers can't provide quotes but they may provide external URLs
     */
    if (
      !isLoading &&
      (areAssetTransfersDisabled ||
        !fromChain ||
        !fromAsset ||
        !toChain ||
        !toAsset ||
        hasBalanceError ||
        !quote.enabled)
    ) {
      return (
        <>
          {chainSelection}
          <OnlyExternalBridgeSuggest
            direction={direction}
            toChain={toChain}
            toAsset={toAsset}
            canonicalAssetDenom={canonicalAsset?.coinDenom}
            fromChain={fromChain}
            fromAsset={fromAsset}
            toAddress={toAddress}
            bridges={supportedBridgeInfo.allBridges}
            onDone={onClose}
          />
        </>
      );
    }

    /**
     * This will trigger an error boundary
     */
    if (!supportedSourceAssets && !isLoading) {
      throw new Error("Supported source assets are not defined");
    }

    if (!assetsInOsmosis && !isLoading) {
      throw new Error("Assets are not defined");
    }

    return (
      <div className="flex w-full flex-col items-center justify-center p-4 text-white-full md:py-2 md:px-0">
        <div className="mb-6 flex w-full items-center justify-center gap-3 text-h5 font-h5 md:text-h6 md:font-h6">
          {!canonicalAsset ? (
            <SkeletonLoader className="h-8 w-full max-w-sm md:h-4" />
          ) : (
            <>
              <span>
                {direction === "deposit"
                  ? t("transfer.deposit")
                  : t("transfer.withdraw")}
              </span>{" "}
              <button
                className="flex items-center gap-3"
                onClick={() => setCurrentScreen(BridgeScreen.Asset)}
              >
                <Image
                  width={32}
                  height={32}
                  src={canonicalAsset.coinImageUrl ?? "/"}
                  alt="token image"
                />{" "}
                <span>{canonicalAsset.coinDenom}</span>
              </button>
            </>
          )}
        </div>

        {chainSelection}

        <div className="flex w-full flex-col gap-6 md:gap-4">
          <CryptoFiatInput
            currentUnit={inputUnit}
            cryptoInput={cryptoAmount}
            fiatInput={fiatAmount}
            assetPrice={canonicalAssetPrice}
            assetWithBalance={fromAsset}
            isInsufficientBal={Boolean(isInsufficientBal)}
            isInsufficientFee={Boolean(isInsufficientFee)}
            transferGasCost={selectedQuote?.gasCost}
            /** Wait for all quotes to resolve before modifying input amount.
             *  This helps reduce thrash while the best quote is being determined.
             *  Only once we get the best quote, we can modify the input amount
             *  to account for gas then restart the quote search process. */
            canSetMax={!quote.isLoadingAnyBridgeQuote}
            onChangeFiatInput={onChangeFiatInput}
            onChangeCryptoInput={onChangeCryptoInput}
            setCurrentUnit={setInputUnit}
            transferGasChain={fromChain}
          />

          {(isWalletNeededConnected || isLoading) && (
            <>
              {(isLoadingAssetsBalance || isLoading) && (
                <div className="flex w-full items-center justify-center gap-3">
                  <Spinner className="text-wosmongton-500" />
                  <p className="body1 md:body2 text-osmoverse-300">
                    {t("transfer.lookingForBalances")}
                  </p>
                </div>
              )}

              {!isLoadingAssetsBalance &&
                !isLoading &&
                assetsBalances?.length === 1 && (
                  <p className="body1 md:body2 w-full text-center text-osmoverse-300">
                    {inputUnit === "crypto"
                      ? assetsBalances[0].amount
                          .trim(true)
                          .maxDecimals(6)
                          .hideDenom(true)
                          .toString()
                      : assetsBalances[0].usdValue.toString()}{" "}
                    {t("transfer.available")}
                  </p>
                )}

              {!isLoadingAssetsBalance &&
                !isLoading &&
                assetsBalances &&
                (assetsBalances.length ?? 0) > 1 && (
                  <div className="mx-auto flex w-full flex-wrap items-center rounded-2xl bg-osmoverse-1000">
                    {assetsBalances.map((asset) => {
                      const isActive =
                        asset.amount.currency.coinMinimalDenom ===
                        fromAsset?.address;
                      return (
                        <button
                          key={asset.amount.currency.coinMinimalDenom}
                          className={classNames(
                            "flex flex-grow flex-col items-center rounded-2xl py-2 px-4",
                            {
                              "bg-osmoverse-825 text-wosmongton-100": isActive,
                              "text-osmoverse-100": !isActive,
                            }
                          )}
                          onClick={() => setFromAsset(asset)}
                        >
                          <span className="subtitle1 md:body2">
                            {asset.denom}
                          </span>
                          <span className="body2 md:caption text-osmoverse-300">
                            {inputUnit === "crypto"
                              ? asset.amount
                                  .trim(true)
                                  .maxDecimals(6)
                                  .hideDenom(true)
                                  .toString()
                              : asset.usdValue.toString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
            </>
          )}

          {fromChain && toChain && (
            <BridgeWalletSelectModal
              direction={direction}
              isOpen={isBridgeWalletSelectOpen}
              onRequestClose={onCloseBridgeWalletSelect}
              onSelectChain={(chain) => {
                const setChain =
                  direction === "deposit" ? setFromChain : setToChain;
                setChain(chain);
                resetAssets();
                setManualToAddress(undefined);
              }}
              evmChain={(() => {
                const chain = direction === "deposit" ? fromChain : toChain;
                return chain?.chainType === "evm"
                  ? chain
                  : firstSupportedEvmChain;
              })()}
              cosmosChain={(() => {
                const chain = direction === "deposit" ? fromChain : toChain;
                return chain?.chainType === "cosmos"
                  ? chain
                  : firstSupportedCosmosChain;
              })()}
              fromChain={fromChain}
              toChain={toChain}
              initialManualAddress={manualToAddress}
              onConfirmManualAddress={(address) => {
                setManualToAddress(address);
              }}
            />
          )}

          {isLoading ? (
            <div className="flex justify-between">
              <SkeletonLoader className="h-4 w-16" />
              <SkeletonLoader className="h-4 w-16" />
            </div>
          ) : (
            <>
              {osmosisWalletConnected && isWalletNeededConnected && (
                <>
                  {hasMoreThanOneChainType || direction === "withdraw" ? (
                    <>
                      <button
                        onClick={onOpenBridgeWalletSelect}
                        className="flex items-center justify-between"
                      >
                        <span className="body1 md:body2 text-osmoverse-300">
                          {direction === "deposit" ||
                          fromChain?.chainType === toChain?.chainType
                            ? t("transfer.transferWith")
                            : t("transfer.transferTo")}
                        </span>

                        <WalletDisplay
                          icon={(() => {
                            if (
                              direction === "withdraw" &&
                              !isNil(manualToAddress)
                            ) {
                              return (
                                <Icon
                                  id="wallet"
                                  className="text-wosmongton-200"
                                />
                              );
                            }

                            const chain =
                              direction === "deposit" ? fromChain : toChain;
                            return chain?.chainType === "evm"
                              ? evmConnector?.icon
                              : fromCosmosCounterpartyAccount?.walletInfo.logo;
                          })()}
                          name={(() => {
                            if (
                              direction === "withdraw" &&
                              !isNil(manualToAddress)
                            ) {
                              return shorten(manualToAddress);
                            }

                            const chain =
                              direction === "deposit" ? fromChain : toChain;
                            return chain?.chainType === "evm"
                              ? evmConnector?.name
                              : fromCosmosCounterpartyAccount?.walletInfo
                                  .prettyName;
                          })()}
                          suffix={
                            <Icon
                              id="chevron-down"
                              width={12}
                              height={12}
                              className="text-osmoverse-300"
                            />
                          }
                        />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="body1 md:body2 text-osmoverse-300">
                        {direction === "deposit"
                          ? t("transfer.transferWith")
                          : t("transfer.transferTo")}
                      </span>
                      <WalletDisplay
                        icon={
                          fromChain?.chainType === "evm"
                            ? evmConnector?.icon
                            : osmosisAccount?.walletInfo.logo
                        }
                        name={
                          fromChain?.chainType === "evm"
                            ? evmConnector?.name
                            : osmosisAccount?.walletInfo.prettyName
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {assetDropdown}

          {fromChain && (
            <TransferDetails
              quote={
                quote as BridgeQuote & {
                  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
                }
              }
              fromChain={fromChain}
              isLoading={isLoadingBridgeQuote}
            />
          )}

          <div className="flex flex-col items-center gap-4">
            <ScreenManager
              currentScreen={(function () {
                if (isLoading) {
                  return "next-step";
                }

                if (!osmosisWalletConnected && !pendingChainApproval) {
                  return "no-osmo-wallet";
                }

                if (!isWalletNeededConnected) {
                  return "counterparty-chain-not-connected";
                }

                if (quote.isWrongEvmChainSelected) {
                  return "wrong-evm-chain-selected";
                }

                return "next-step";
              })()}
            >
              <Screen screenName="no-osmo-wallet">{connectWalletButton}</Screen>

              <Screen screenName="wrong-evm-chain-selected">
                <Button
                  onClick={() => checkChainAndConnectWallet()}
                  className="w-full"
                  variant="secondary"
                >
                  <h6 className="flex items-center gap-3">
                    <Icon
                      id="switch"
                      className="h-6 w-6 rotate-90 transform text-wosmongton-200"
                    />
                    {t("transfer.changeNetworkInWallet")}
                  </h6>
                </Button>
              </Screen>

              <Screen screenName="counterparty-chain-not-connected">
                <Button
                  onClick={() => checkChainAndConnectWallet()}
                  className="w-full"
                  disabled={pendingChainApproval}
                >
                  <h6 className="flex items-center gap-3">
                    {toChain?.chainType === "bitcoin" &&
                    direction === "withdraw"
                      ? t("transfer.continue")
                      : pendingChainApproval
                      ? t("transfer.pendingApproval")
                      : t("transfer.connectTo", {
                          network:
                            direction === "deposit"
                              ? fromChain?.prettyName ?? ""
                              : toChain?.prettyName ?? "",
                        })}
                  </h6>
                </Button>
              </Screen>

              <Screen screenName="next-step">
                {(errorBoxMessage || warningBoxMessage) && (
                  <div className="flex animate-[fadeIn_0.25s] gap-3 rounded-[20px] border-2 border-rust-600 p-5 py-3">
                    <Icon
                      id="alert-triangle"
                      className="h-6 w-6 text-rust-600"
                    />
                    <div className="flex flex-col">
                      <h1 className="body2">
                        {errorBoxMessage?.heading ?? warningBoxMessage?.heading}
                      </h1>
                      <p className="body2 text-osmoverse-300">
                        {errorBoxMessage?.description ??
                          warningBoxMessage?.description}
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  disabled={
                    cryptoAmount === "" ||
                    cryptoAmount === "0" ||
                    !quote.userCanAdvance
                  }
                  className="w-full md:h-12"
                  variant={
                    warnUserOfSlippage || warnUserOfPriceImpact
                      ? "destructive"
                      : "default"
                  }
                  onClick={onConfirm}
                >
                  <div className="md:subtitle1 text-h6 font-h6">
                    {buttonText}
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-wosmongton-200 hover:text-white-full md:h-12"
                  onClick={() => setAreMoreOptionsVisible(true)}
                  disabled={isNil(fromAsset) || isNil(toAsset)}
                >
                  <div className="md:subtitle1 text-h6 font-h6">
                    {direction === "deposit"
                      ? t("transfer.moreDepositOptions")
                      : t("transfer.moreWithdrawOptions")}
                  </div>
                </Button>
                <MoreBridgeOptionsModal
                  direction={direction}
                  isOpen={areMoreOptionsVisible}
                  fromAsset={fromAsset}
                  toAsset={toAsset}
                  fromChain={fromChain}
                  toChain={toChain}
                  toAddress={toAddress}
                  bridges={supportedBridgeInfo.allBridges}
                  onRequestClose={() => setAreMoreOptionsVisible(false)}
                />
              </Screen>
            </ScreenManager>
          </div>
        </div>
      </div>
    );
  }
);

interface ChainSelectorButtonProps {
  direction: "deposit" | "withdraw";
  readonly: boolean;
  children: ReactNode;
  chainLogo: string | undefined;
  chainColor: string | undefined;
  chains: SupportedChain[];
  toChain: BridgeChainWithDisplayInfo | undefined;
  onSelectChain: (chain: BridgeChainWithDisplayInfo) => void;
  isNetworkSelectVisible: boolean;
  setIsNetworkSelectVisible: Dispatch<SetStateAction<boolean>>;
  initialManualAddress?: string;
  onConfirmManualAddress: (address: string) => void;
  isLoading: boolean;
}

const ChainSelectorButton: FunctionComponent<ChainSelectorButtonProps> = ({
  direction,
  readonly,
  children,
  chainLogo,
  chainColor,
  chains,
  onSelectChain,
  toChain,
  isNetworkSelectVisible,
  setIsNetworkSelectVisible,
  onConfirmManualAddress,
  initialManualAddress,
  isLoading,
}) => {
  if (readonly) {
    return (
      <div className="subtitle1 md:body2 flex w-[45%] flex-1 items-center gap-2 rounded-[48px] border border-osmoverse-700 py-2 px-4 text-osmoverse-200 md:py-1 md:px-2">
        <ChainLogo prettyName="" logoUri={chainLogo} color={chainColor} />
        <span className="truncate">{children}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setIsNetworkSelectVisible(true);
        }}
        className={classNames(
          "subtitle1 md:body2 group flex w-[45%] flex-1 items-center justify-between rounded-[48px] bg-osmoverse-825 py-2 px-4 text-start transition-colors duration-200 md:py-1 md:px-2",
          {
            "opacity-60": isLoading,
            "hover:bg-osmoverse-850": !isLoading,
          }
        )}
        disabled={isLoading}
      >
        <div className="flex w-[90%] items-center gap-2">
          {isLoading ? (
            <Spinner className="flex-shrink-0 text-wosmongton-500" />
          ) : (
            <ChainLogo
              className="flex-shrink-0"
              prettyName=""
              logoUri={chainLogo}
              color={chainColor}
            />
          )}
          {isLoading ? (
            <span className="subtitle1 whitespace-nowrap text-wosmongton-200">
              Loading networks
            </span>
          ) : (
            <span className="truncate">{children}</span>
          )}
        </div>
        {isLoading ? null : (
          <Icon
            id="chevron-down"
            className="flex-shrink-0 text-wosmongton-200 transition-colors duration-200 group-hover:text-white-full"
            width={12}
            height={12}
          />
        )}
      </button>
      {toChain && (
        <BridgeNetworkSelectModal
          isOpen={isNetworkSelectVisible}
          chains={chains}
          onSelectChain={async (chain) => {
            onSelectChain(chain);
            setIsNetworkSelectVisible(false);
          }}
          onRequestClose={() => setIsNetworkSelectVisible(false)}
          direction={direction}
          toChain={toChain}
          initialManualAddress={initialManualAddress}
          onConfirmManualAddress={onConfirmManualAddress}
        />
      )}
    </>
  );
};

const WalletDisplay: FunctionComponent<{
  icon: string | ReactNode | undefined;
  name: string | undefined;
  suffix?: ReactNode;
}> = ({ icon, name, suffix }) => {
  return (
    <div className="subtitle1 md:body2 flex items-center gap-2 rounded-lg">
      {!isNil(icon) && (
        <>
          {typeof icon === "string" ? (
            <img src={icon} alt={name} className="h-6 w-6" />
          ) : (
            icon
          )}
        </>
      )}
      <span title={name}>{name}</span>
      {suffix}
    </div>
  );
};

const TransferDetails: FunctionComponent<{
  quote: BridgeQuote | undefined;
  fromChain: BridgeChainWithDisplayInfo;
  isLoading: boolean;
}> = ({ quote, fromChain, isLoading }) => {
  const [detailsRef, { height: detailsHeight, y: detailsOffset }] =
    useMeasure<HTMLDivElement>();
  const { t } = useTranslation();
  const successfulQuotes = quote?.successfulQuotes ?? [];

  if (!isLoading && successfulQuotes.length === 0) {
    return null;
  }

  return (
    <Disclosure>
      {({ open }) => (
        <div
          className="flex w-full flex-col gap-3 overflow-clip transition-height duration-300 ease-inOutBack"
          style={{
            height: open
              ? (detailsHeight + detailsOffset ?? 288) + 46 // collapsed height
              : 36,
          }}
        >
          <DisclosureButton>
            <div className="flex animate-[fadeIn_0.25s] items-center justify-between">
              {isLoading || !quote ? (
                <div className="flex items-center gap-2">
                  <Spinner className="text-wosmongton-500" />
                  <p className="body1 md:body2 text-osmoverse-300">
                    {t("transfer.estimatingTime")}
                  </p>
                </div>
              ) : open ? (
                <p className="subtitle1">{t("transfer.transferDetails")}</p>
              ) : null}

              {!isLoading && quote?.selectedQuote && !open && (
                <div className="flex items-center gap-1">
                  <Icon id="stopwatch" className="h-4 w-4 text-osmoverse-400" />
                  <p className="body1 md:body2 text-osmoverse-300 first-letter:capitalize">
                    {quote.selectedQuote.estimatedTime.humanize()}
                  </p>
                </div>
              )}

              {isLoading || !quote ? (
                <span className="body1 md:body2 text-osmoverse-300">
                  {t("transfer.calculatingFees")}
                </span>
              ) : null}

              {!isLoading && quote?.selectedQuote ? (
                <ExpandDetailsControlContent
                  warnUserOfPriceImpact={quote.warnUserOfPriceImpact}
                  warnUserOfSlippage={quote.warnUserOfSlippage}
                  selectedQuoteUpdatedAt={quote.selectedQuoteUpdatedAt}
                  refetchInterval={quote.refetchInterval}
                  selectedQuote={quote.selectedQuote}
                  open={open}
                  isRemainingTimePaused={
                    quote.isRefetchingQuote || quote.isTxPending
                  }
                  showRemainingTime
                />
              ) : null}
            </div>
          </DisclosureButton>
          <DisclosurePanel ref={detailsRef} className="flex flex-col gap-3">
            {quote?.selectedQuote && (
              <>
                <BridgeProviderDropdownRow
                  successfulQuotes={quote.successfulQuotes}
                  setSelectedBridgeProvider={quote.setSelectedBridgeProvider}
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                />
                <EstimatedTimeRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                />
                <ProviderFeesRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                />
                <NetworkFeeRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                  fromChainName={fromChain.prettyName}
                />
                <TotalFeesRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                />
                <ExpectedOutputRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                  warnUserOfSlippage={Boolean(quote.warnUserOfSlippage)}
                />
              </>
            )}
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
};
