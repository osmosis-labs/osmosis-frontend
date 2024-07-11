import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { BridgeTransactionDirection } from "@osmosis-labs/types";
import { getShortAddress, isNil, noop } from "@osmosis-labs/utils";
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
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { useScreenManager } from "~/components/screen-manager";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import {
  useConnectWalletModalRedirect,
  useDisclosure,
  useTranslation,
} from "~/hooks";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { ChainLogo } from "../assets/chain-logo";
import { SupportedAssetWithAmount } from "./amount-and-review-screen";
import { BridgeNetworkSelectModal } from "./bridge-network-select-modal";
import { BridgeWalletSelectModal } from "./bridge-wallet-select-modal";
import { CryptoFiatInput } from "./crypto-fiat-input";
import { ImmersiveBridgeScreen } from "./immersive-bridge";
import {
  MoreBridgeOptionsModal,
  OnlyExternalBridgeSuggest,
} from "./more-bridge-options";
import {
  BridgeProviderDropdownRow,
  EstimatedTimeRow,
  ExpandDetailsControlContent,
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

    const {
      selectedQuote,
      buttonErrorMessage,
      buttonText,
      isLoadingBridgeQuote,
      isLoadingBridgeTransaction,
      isInsufficientBal,
      isInsufficientFee,
      warnUserOfPriceImpact,
      warnUserOfSlippage,
    } = quote;

    const [areMoreOptionsVisible, setAreMoreOptionsVisible] = useState(false);
    const [isNetworkSelectVisible, setIsNetworkSelectVisible] = useState(false);

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
      isConnecting,
    } = useEvmWalletAccount();

    const fromCosmosCounterpartyAccount =
      !isNil(fromChain) && fromChain.chainType === "cosmos"
        ? accountStore.getWallet(fromChain.chainId)
        : undefined;

    const toCosmosCounterpartyAccount =
      !isNil(toChain) && toChain.chainType === "cosmos"
        ? accountStore.getWallet(toChain.chainId)
        : undefined;

    const chainThatNeedsWalletConnection =
      direction === "deposit" ? fromChain : toChain;
    const accountThatNeedsWalletConnection =
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

      return !!accountThatNeedsWalletConnection?.address;
    }, [
      accountThatNeedsWalletConnection?.address,
      chainThatNeedsWalletConnection,
      isEvmWalletConnected,
      manualToAddress,
    ]);

    const toAddress =
      toChain?.chainType === "evm"
        ? evmAddress
        : toCosmosCounterpartyAccount?.address;

    const { data: assetsInOsmosis } =
      api.edge.assets.getCanonicalAssetWithVariants.useQuery(
        {
          findMinDenomOrSymbol: selectedDenom!,
        },
        {
          enabled: !isNil(selectedDenom),
          cacheTime: 10 * 60 * 1000, // 10 minutes
          staleTime: 10 * 60 * 1000, // 10 minutes
        }
      );

    const { data: osmosisChain } = api.edge.chains.getChain.useQuery({
      findChainNameOrId: accountStore.osmosisChainId,
    });

    const canonicalAsset = assetsInOsmosis?.[0];

    const {
      price: assetInOsmosisPrice,
      isLoading: isLoadingCanonicalAssetPrice,
    } = usePrice(
      /**
       * Use the canonical osmosis asset to determine the price of the assets.
       * This is because providers can return variant assets that are missing in
       * our asset list.
       */
      canonicalAsset
    );

    const {
      supportedAssetsByChainId: counterpartySupportedAssetsByChainId,
      supportedChains,
    } = useBridgesSupportedAssets({
      assets: assetsInOsmosis,
      chain: {
        chainId: accountStore.osmosisChainId,
        chainType: "cosmos",
      },
    });

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
          if (isEvmWalletConnected || isConnecting) {
            return;
          }

          onOpenBridgeWalletSelect();
        } else if (chain.chainType === "cosmos") {
          const account = accountStore.getWallet(chain.chainId);
          const accountRepo = accountStore.getWalletRepo(chain.chainId);

          if (
            // If the account is already connected
            !!account?.address
          ) {
            return;
          }

          accountRepo?.connect(osmosisAccount?.walletName).catch(() => {
            if (supportedChains.length > 1) {
              setIsNetworkSelectVisible(true);
            }
          });
        }
      },
      [
        accountStore,
        direction,
        fromChain,
        isConnecting,
        isEvmWalletConnected,
        manualToAddress,
        onOpenBridgeWalletSelect,
        osmosisAccount?.walletName,
        supportedChains.length,
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
      () => {
        checkChainAndConnectWallet();
      }
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
              [selectedAsset.coinMinimalDenom]: [],
            },
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
      if (fromChain?.chainType === "evm" && supportedSourceAssets) {
        return {
          type: "evm" as const,
          assets: supportedSourceAssets.filter(
            (asset) => asset.chainType === "evm"
          ) as Extract<SupportedAsset, { chainType: "evm" }>[],
          userEvmAddress: evmAddress,
        };
      } else if (fromChain?.chainType === "cosmos" && supportedSourceAssets) {
        return {
          type: "cosmos" as const,
          assets: supportedSourceAssets.filter(
            (asset) => asset.chainType === "cosmos"
          ) as Extract<SupportedAsset, { chainType: "cosmos" }>[],
          userCosmosAddress: fromCosmosCounterpartyAccount?.address,
        };
      } else {
        // TODO: can input solana or btc assets
        return {
          type: fromChain?.chainType ?? "bitcoin",
          assets: (supportedSourceAssets?.filter(
            (asset) => asset.chainType === "bitcoin"
          ) ?? []) as Extract<SupportedAsset, { chainType: "bitcoin" }>[],
        };
      }
    })();
    const { data: assetsBalances, isLoading: isLoadingAssetsBalance } =
      api.local.bridgeTransfer.getSupportedAssetsBalances.useQuery(
        { source: balanceSource },
        {
          enabled: !isNil(fromChain) && !isNil(supportedSourceAssets),

          select: (data) => {
            let nextData: typeof data = data;

            // Filter out assets with no balance
            if (nextData) {
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
      toAsset,
      direction,
      setToAsset,
      toChain,
    ]);

    /**
     * Set the osmosis chain based on the direction
     */
    useEffect(() => {
      const chain = direction === "deposit" ? toChain : fromChain;
      const setChain = direction === "deposit" ? setToChain : setFromChain;
      if (isNil(chain) && !isNil(osmosisChain)) {
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
    }, [direction, fromChain, osmosisChain, setFromChain, setToChain, toChain]);

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
        supportedChains.length > 0
      ) {
        const firstChain = supportedChains[0];
        setChain(firstChain);
        checkChainAndConnectWallet(firstChain);
      }
    }, [
      checkChainAndConnectWallet,
      direction,
      fromChain,
      setFromChain,
      setToChain,
      supportedChains,
      toChain,
      osmosisWalletConnected,
    ]);

    if (
      isLoadingCanonicalAssetPrice ||
      isNil(supportedSourceAssets) ||
      !assetsInOsmosis ||
      !canonicalAsset ||
      !assetInOsmosisPrice ||
      !fromChain ||
      !toChain ||
      !toAsset ||
      !fromAsset
    ) {
      return <AmountScreenSkeletonLoader />;
    }

    const resetAssets = () => {
      setFromAsset(undefined);
      setToAsset(undefined);
    };

    const resetInput = () => {
      setCryptoAmount("0");
      setFiatAmount("0");
    };

    return (
      <div className="flex w-full flex-col items-center justify-center p-4 text-white-full md:p-2">
        <div className="mb-6 flex items-center justify-center gap-3 text-h5 font-h5 md:text-h6 md:font-h6">
          <span>
            {direction === "deposit"
              ? t("transfer.deposit")
              : t("transfer.withdraw")}
          </span>{" "}
          <button
            className="flex items-center gap-3"
            onClick={() => setCurrentScreen(ImmersiveBridgeScreen.Asset)}
          >
            <Image
              width={32}
              height={32}
              src={canonicalAsset.coinImageUrl ?? "/"}
              alt="token image"
            />{" "}
            <span>{canonicalAsset.coinDenom}</span>
          </button>
        </div>

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
              chainColor={fromChain.color}
              chainLogo={fromChain.logoUri}
              chains={supportedChains}
              toChain={toChain}
              onSelectChain={(nextChain) => {
                setFromChain(nextChain);
                resetAssets();
                if (osmosisWalletConnected)
                  checkChainAndConnectWallet(nextChain);
                if (fromChain?.chainId !== nextChain.chainId) {
                  setManualToAddress(undefined);
                  resetInput();
                }
              }}
              readonly={
                direction === "withdraw" || supportedChains.length === 1
              }
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
              {fromChain.prettyName}
            </ChainSelectorButton>

            <Icon
              id="arrow-right"
              className="text-osmoverse-300 md:h-4 md:w-4"
            />

            <ChainSelectorButton
              direction={direction}
              chainColor={toChain.color}
              chainLogo={toChain.logoUri}
              chains={supportedChains}
              toChain={toChain}
              onSelectChain={(nextChain) => {
                setToChain(nextChain);
                resetAssets();
                if (osmosisWalletConnected)
                  checkChainAndConnectWallet(nextChain);
                if (fromChain?.chainId !== nextChain.chainId) {
                  setManualToAddress(undefined);
                  resetInput();
                }
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
              {toChain.prettyName}
            </ChainSelectorButton>
          </div>
        </div>

        {quote.enabled ? (
          <div className="flex w-full flex-col gap-6 md:gap-4">
            <CryptoFiatInput
              currentUnit={inputUnit}
              cryptoInputRaw={cryptoAmount}
              fiatInputRaw={fiatAmount}
              assetPrice={assetInOsmosisPrice}
              asset={fromAsset}
              isInsufficientBal={Boolean(isInsufficientBal)}
              isInsufficientFee={Boolean(isInsufficientFee)}
              transferGasCost={selectedQuote?.gasCost}
              setFiatAmount={setFiatAmount}
              setCryptoAmount={setCryptoAmount}
              setInputUnit={setInputUnit}
              fromChain={fromChain}
            />

            <>
              {isLoadingAssetsBalance && (
                <div className="flex w-full items-center justify-center gap-3">
                  <Spinner className="text-wosmongton-500" />
                  <p className="body1 md:body2 text-osmoverse-300">
                    {t("transfer.lookingForBalances")}
                  </p>
                </div>
              )}

              {!isLoadingAssetsBalance && assetsBalances?.length === 1 && (
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
              toChain={toChain}
              initialManualAddress={manualToAddress}
              onConfirmManualAddress={(address) => {
                setManualToAddress(address);
              }}
            />
            {osmosisWalletConnected && isWalletNeededConnected && (
              <>
                {hasMoreThanOneChainType || direction === "withdraw" ? (
                  <>
                    <button
                      onClick={onOpenBridgeWalletSelect}
                      className="flex items-center justify-between"
                    >
                      <span className="body1 md:body2 text-osmoverse-300">
                        {direction === "deposit"
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
                            return getShortAddress(manualToAddress);
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

            {(direction === "deposit"
              ? !isNil(fromAsset) &&
                Object.keys(fromAsset.supportedVariants).length > 1
              : !isNil(toAsset) &&
                counterpartySupportedAssetsByChainId[toAsset.chainId].length >
                  1) && (
              <Menu>
                {({ open }) => (
                  <div className="relative w-full">
                    <MenuButton className="w-full">
                      <div className="flex items-center justify-between">
                        <Tooltip
                          content={
                            <div>
                              <h1 className="caption mb-1">
                                {t("transfer.receiveAsset")}
                              </h1>
                              <p className="caption text-osmoverse-300">
                                {t("transfer.receiveAssetDescription")}
                              </p>
                            </div>
                          }
                          enablePropagation
                        >
                          <div className="flex items-center gap-2">
                            <span className="body1 md:body2 text-osmoverse-300">
                              {t("transfer.receiveAsset")}
                            </span>
                            <Icon id="generate-stars" width={24} />
                          </div>
                        </Tooltip>

                        <div className="flex items-center gap-2">
                          <span className="subtitle1 md:body2 text-white-full">
                            {toAsset?.denom}
                          </span>
                          <Icon
                            id="chevron-down"
                            width={12}
                            height={12}
                            className={classNames(
                              "text-osmoverse-300 transition-transform duration-150",
                              {
                                "rotate-180": open,
                              }
                            )}
                          />
                        </div>
                      </div>
                    </MenuButton>

                    <MenuItems className="absolute top-full right-0 z-[1000] mt-3 flex max-h-64 min-w-[285px] flex-col gap-1 overflow-auto rounded-2xl bg-osmoverse-825 px-2 py-2">
                      {direction === "deposit" ? (
                        <>
                          {Object.keys(fromAsset.supportedVariants).map(
                            (variantCoinMinimalDenom, index) => {
                              // TODO: HANDLE WITHDRAW CASE
                              const asset = assetsInOsmosis.find(
                                (asset) =>
                                  asset.coinMinimalDenom ===
                                  variantCoinMinimalDenom
                              )!;

                              const onClick = () => {
                                setToAsset({
                                  chainType: "cosmos",
                                  address: asset.coinMinimalDenom,
                                  decimals: asset.coinDecimals,
                                  chainId: accountStore.osmosisChainId,
                                  denom: asset.coinDenom,
                                  // Can be left empty because for deposits we don't rely on the supported variants within the destination asset
                                  supportedVariants: {},
                                });
                              };

                              // Show all as 'deposit as' for now
                              const isConvert =
                                false ??
                                asset.coinMinimalDenom ===
                                  asset.variantGroupKey;
                              const isSelected =
                                toAsset?.denom === asset.coinDenom;

                              const isCanonicalAsset = index === 0;

                              return (
                                <MenuItem key={asset.coinDenom}>
                                  <button
                                    className={classNames(
                                      "flex items-center gap-3 rounded-lg py-2 px-3 text-left data-[active]:bg-osmoverse-800",
                                      isSelected && "bg-osmoverse-700",
                                      !isSelected && "bg-osmoverse-800"
                                    )}
                                    onClick={onClick}
                                  >
                                    <Image
                                      src={asset.coinImageUrl ?? "/"}
                                      alt={`${asset.coinDenom} logo`}
                                      width={32}
                                      height={32}
                                    />
                                    <div className="flex flex-col">
                                      <p className="body1 md:body2">
                                        {isConvert
                                          ? t("transfer.convertTo")
                                          : t("transfer.depositAs")}{" "}
                                        {asset.coinDenom}
                                      </p>
                                      {isCanonicalAsset && (
                                        <p className="body2 text-osmoverse-300">
                                          {t("transfer.recommended")}
                                        </p>
                                      )}
                                    </div>
                                  </button>
                                </MenuItem>
                              );
                            }
                          )}
                        </>
                      ) : (
                        <>
                          {counterpartySupportedAssetsByChainId[
                            toAsset.chainId
                          ].map((asset, index) => {
                            const onClick = () => {
                              setToAsset(asset);
                            };

                            const isSelected = toAsset?.denom === asset.denom;

                            const isCanonicalAsset = index === 0;
                            const representativeAsset =
                              assetsInOsmosis.find(
                                (a) =>
                                  a.coinMinimalDenom === asset.address ||
                                  asset.denom === a.coinDenom
                              ) ?? assetsInOsmosis[0];

                            return (
                              <MenuItem key={asset.denom}>
                                <button
                                  className={classNames(
                                    "flex items-center gap-3 rounded-lg py-2 px-3 text-left data-[active]:bg-osmoverse-800",
                                    isSelected && "bg-osmoverse-700"
                                  )}
                                  onClick={onClick}
                                >
                                  <Image
                                    src={
                                      representativeAsset.coinImageUrl ?? "/"
                                    }
                                    alt={`${asset.denom} logo`}
                                    width={32}
                                    height={32}
                                  />
                                  <div className="flex flex-col">
                                    <p className="body1 md:body2">
                                      {t("transfer.withdrawAs")} {asset.denom}
                                    </p>
                                    {isCanonicalAsset && (
                                      <p className="body2 text-osmoverse-300">
                                        {t("transfer.recommended")}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              </MenuItem>
                            );
                          })}
                        </>
                      )}
                    </MenuItems>
                  </div>
                )}
              </Menu>
            )}

            {isLoadingBridgeQuote && (
              <div className="flex animate-[fadeIn_0.25s] items-center justify-between">
                <div className="flex items-center gap-2">
                  <Spinner className="text-wosmongton-500" />
                  <p className="body1 md:body2 text-osmoverse-300">
                    {t("transfer.estimatingTime")}
                  </p>
                </div>
                <span className="body1 md:body2 text-osmoverse-300">
                  {t("transfer.calculatingFees")}
                </span>
              </div>
            )}

            {!isLoadingBridgeQuote && !isNil(selectedQuote) && (
              <TransferDetails
                quote={
                  quote as BridgeQuote & {
                    selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
                  }
                }
                fromChain={fromChain}
              />
            )}

            <div className="flex flex-col items-center gap-4">
              {!osmosisWalletConnected ? (
                connectWalletButton
              ) : !isWalletNeededConnected ? (
                <Button
                  onClick={() => {
                    checkChainAndConnectWallet();
                  }}
                  className="w-full"
                >
                  <h6 className="flex items-center gap-3">
                    <Icon
                      id="wallet"
                      className="text-white h-[24px] w-[24px]"
                    />
                    {t("connectWallet")}
                  </h6>
                </Button>
              ) : (
                <>
                  <Button
                    disabled={
                      !isNil(buttonErrorMessage) ||
                      isLoadingBridgeQuote ||
                      isLoadingBridgeTransaction ||
                      cryptoAmount === "" ||
                      cryptoAmount === "0" ||
                      isNil(selectedQuote)
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
                    bridges={Array.from(
                      new Set(Object.values(fromAsset.supportedVariants).flat())
                    )}
                    onRequestClose={() => setAreMoreOptionsVisible(false)}
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <OnlyExternalBridgeSuggest
            direction={direction}
            toChain={toChain}
            toAsset={toAsset}
            fromChain={fromChain}
            fromAsset={fromAsset}
            toAddress={toAddress}
            bridges={Array.from(
              new Set(Object.values(fromAsset.supportedVariants).flat())
            )}
            onDone={onClose}
          />
        )}
      </div>
    );
  }
);

interface ChainSelectorButtonProps {
  direction: BridgeTransactionDirection;
  readonly: boolean;
  children: ReactNode;
  chainLogo: string | undefined;
  chainColor: string | undefined;
  chains: SupportedChain[];
  toChain: BridgeChainWithDisplayInfo;
  onSelectChain: (chain: BridgeChainWithDisplayInfo) => void;
  isNetworkSelectVisible: boolean;
  setIsNetworkSelectVisible: Dispatch<SetStateAction<boolean>>;
  initialManualAddress?: string;
  onConfirmManualAddress: (address: string) => void;
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
        className="subtitle1 md:body2 group flex w-[45%] flex-1 items-center justify-between rounded-[48px] bg-osmoverse-825 py-2 px-4 text-start transition-colors duration-200 hover:bg-osmoverse-850 md:py-1 md:px-2"
      >
        <div className="flex w-[90%] items-center gap-2">
          <ChainLogo
            className="flex-shrink-0"
            prettyName=""
            logoUri={chainLogo}
            color={chainColor}
          />
          <span className="truncate">{children}</span>
        </div>
        <Icon
          id="chevron-down"
          className="flex-shrink-0 text-wosmongton-200 transition-colors duration-200 group-hover:text-white-full"
          width={12}
          height={12}
        />
      </button>
      {!isNil(chains) && !isNil(onSelectChain) && (
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

const AmountScreenSkeletonLoader = () => {
  return (
    <div className="flex flex-col items-center gap-6 md:gap-3">
      <SkeletonLoader className="h-8 w-full max-w-sm md:h-4" />
      <SkeletonLoader className="h-20 w-full md:h-10" />
      <SkeletonLoader className="h-24 w-full md:h-12" />
      <SkeletonLoader className="h-24 w-full md:h-12" />
      <SkeletonLoader className="h-6 w-full md:h-3" />
      <SkeletonLoader className="h-6 w-full md:h-3" />
      <SkeletonLoader className="h-14 w-full md:h-8" />
      <SkeletonLoader className="h-14 w-full md:h-8" />
    </div>
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
  quote: BridgeQuote & {
    selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  };
  fromChain: BridgeChainWithDisplayInfo;
}> = ({ quote, fromChain }) => {
  const [detailsRef, { height: detailsHeight, y: detailsOffset }] =
    useMeasure<HTMLDivElement>();
  const { t } = useTranslation();
  const {
    selectedQuote,
    warnUserOfPriceImpact,
    warnUserOfSlippage,
    selectedQuoteUpdatedAt,
    refetchInterval,
    successfulQuotes,
    setSelectedBridgeProvider,
    isRefetchingQuote,
    isTxPending,
  } = quote;

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
              {open ? (
                <p className="subtitle1">{t("transfer.transferDetails")}</p>
              ) : (
                <div className="flex items-center gap-1">
                  <Icon id="stopwatch" className="h-4 w-4 text-osmoverse-400" />
                  <p className="body1 md:body2 text-osmoverse-300 first-letter:capitalize">
                    {selectedQuote.estimatedTime.humanize()}
                  </p>
                </div>
              )}
              <ExpandDetailsControlContent
                warnUserOfPriceImpact={warnUserOfPriceImpact}
                warnUserOfSlippage={warnUserOfSlippage}
                selectedQuoteUpdatedAt={selectedQuoteUpdatedAt}
                refetchInterval={refetchInterval}
                selectedQuote={selectedQuote}
                open={open}
                isRemainingTimePaused={isRefetchingQuote || isTxPending}
                showRemainingTime
              />
            </div>
          </DisclosureButton>
          <DisclosurePanel ref={detailsRef} className="flex flex-col gap-3">
            <BridgeProviderDropdownRow
              successfulQuotes={successfulQuotes}
              setSelectedBridgeProvider={setSelectedBridgeProvider}
              isRefetchingQuote={isRefetchingQuote}
              selectedQuote={selectedQuote}
            />
            <EstimatedTimeRow
              isRefetchingQuote={isRefetchingQuote}
              selectedQuote={selectedQuote}
            />
            <ProviderFeesRow
              isRefetchingQuote={isRefetchingQuote}
              selectedQuote={selectedQuote}
            />
            <NetworkFeeRow
              isRefetchingQuote={isRefetchingQuote}
              selectedQuote={selectedQuote}
              fromChainName={fromChain.prettyName}
            />
            <TotalFeesRow
              isRefetchingQuote={isRefetchingQuote}
              selectedQuote={selectedQuote}
            />
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
};
