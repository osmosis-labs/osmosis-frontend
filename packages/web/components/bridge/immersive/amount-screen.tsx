import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Dec } from "@keplr-wallet/unit";
import { BridgeTransactionDirection } from "@osmosis-labs/types";
import { isNil, noop } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { ChainLogo } from "~/components/assets/chain-logo";
import { SupportedAssetWithAmount } from "~/components/bridge/immersive/amount-and-review-screen";
import { BridgeNetworkSelectModal } from "~/components/bridge/immersive/bridge-network-select-modal";
import { BridgeWalletSelectModal } from "~/components/bridge/immersive/bridge-wallet-select-modal";
import { ImmersiveBridgeScreens } from "~/components/bridge/immersive/immersive-bridge";
import { MoreBridgeOptions } from "~/components/bridge/immersive/more-bridge-options";
import {
  SupportedAsset,
  useBridgesSupportedAssets,
} from "~/components/bridge/immersive/use-bridges-supported-assets";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { useScreenManager } from "~/components/screen-manager";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import {
  useConnectWalletModalRedirect,
  useDisclosure,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { CryptoFiatInput } from "./crypto-fiat-input";
import {
  BridgeProviderDropdownRow,
  EstimatedTimeRow,
  ExpandDetailsControlContent,
  NetworkFeeRow,
  ProviderFeesRow,
  TotalFeesRow,
} from "./quote-detail";
import { BridgeQuote } from "./use-bridge-quotes";

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

  cryptoAmount: string;
  fiatAmount: string;
  setCryptoAmount: (amount: string) => void;
  setFiatAmount: (amount: string) => void;

  quote: BridgeQuote;

  onConfirm: () => void;
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

    cryptoAmount,
    setCryptoAmount,
    fiatAmount,
    setFiatAmount,

    quote,

    onConfirm,
  }: AmountScreenProps) => {
    const { setCurrentScreen } = useScreenManager();
    const { accountStore } = useStore();
    const { onOpenWalletSelect } = useWalletSelect();
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

    const { accountActionButton: connectWalletButton, walletConnected } =
      useConnectWalletModalRedirect(
        {
          className: "w-full",
        },
        noop
      );

    const [areMoreOptionsVisible, setAreMoreOptionsVisible] = useState(false);

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
    } = useEvmWalletAccount();

    const fromCosmosCounterpartyAccountRepo =
      fromChain?.chainType === "evm" || isNil(fromChain)
        ? undefined
        : accountStore.getWalletRepo(fromChain.chainId);
    const fromCosmosCounterpartyAccount =
      fromChain?.chainType === "evm" || isNil(fromChain)
        ? undefined
        : accountStore.getWallet(fromChain.chainId);

    const toCosmosCounterpartyAccountRepo =
      toChain?.chainType === "evm" || isNil(toChain)
        ? undefined
        : accountStore.getWalletRepo(toChain.chainId);
    const toCosmosCounterpartyAccount =
      toChain?.chainType === "evm" || isNil(toChain)
        ? undefined
        : accountStore.getWallet(toChain.chainId);

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
       *
       * TODO: Weigh the pros and cons of filtering variant assets not in our asset list.
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

    const supportedSourceAssets: SupportedAsset[] | undefined = useMemo(() => {
      if (!fromChain) return undefined;

      // Use Osmosis Assets to get the source asset
      if (direction === "withdraw") {
        const selectedAsset = assetsInOsmosis?.find(
          (asset) => asset.coinDenom === selectedDenom
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

    const { data: assetsBalances, isLoading: isLoadingAssetsBalance } =
      api.local.bridgeTransfer.getSupportedAssetsBalances.useQuery(
        fromChain?.chainType === "evm"
          ? {
              type: "evm",
              assets: supportedSourceAssets as Extract<
                SupportedAsset,
                { chainType: "evm" }
              >[],
              userEvmAddress: evmAddress,
            }
          : {
              type: "cosmos",
              assets: supportedSourceAssets as Extract<
                SupportedAsset,
                { chainType: "cosmos" }
              >[],
              userCosmosAddress: fromCosmosCounterpartyAccount?.address,
            },
        {
          enabled: !isNil(fromChain) && !isNil(supportedSourceAssets),

          select: (data) => {
            let nextData: typeof data = data;

            // Filter out assets with no balance
            if (nextData) {
              const filteredData = nextData.filter((asset) =>
                asset.amount.toDec().gt(new Dec(0))
              );

              // If there are no assets with balance, leave one to be selected
              if (filteredData.length === 0) {
                nextData = [nextData[0]];
              } else {
                nextData = filteredData;
              }
            }

            if (!fromAsset && nextData) {
              const highestBalance = nextData.reduce(
                (acc, curr) =>
                  curr.amount.toDec().gt(acc.amount.toDec()) ? curr : acc,
                nextData[0]
              );

              setFromAsset(highestBalance);
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
      }
    }, [
      direction,
      fromChain,
      setFromChain,
      setToChain,
      supportedChains,
      toChain,
    ]);

    /**
     * Connect cosmos wallet to the counterparty chain
     */
    useEffect(() => {
      if (!fromChain || !toChain) return;

      const account =
        direction === "deposit"
          ? fromCosmosCounterpartyAccount
          : toCosmosCounterpartyAccount;
      const accountRepo =
        direction === "deposit"
          ? fromCosmosCounterpartyAccountRepo
          : toCosmosCounterpartyAccountRepo;
      const chain = direction === "deposit" ? fromChain : toChain;

      if (
        // If the chain is an EVM chain, we don't need to connect the cosmos chain
        chain.chainType !== "cosmos" ||
        // Or if the account is already connected
        !!account?.address ||
        // Or if there's no available cosmos chain
        !firstSupportedCosmosChain ||
        // Or if the account is already connected
        !!accountRepo?.current
      ) {
        return;
      }

      accountRepo?.connect(osmosisAccount?.walletName).catch(() =>
        // Display the connect modal if the user for some reason rejects the connection
        onOpenWalletSelect({
          walletOptions: [
            { walletType: "cosmos", chainId: String(chain.chainId) },
          ],
        })
      );
    }, [
      direction,
      firstSupportedCosmosChain,
      fromChain,
      fromCosmosCounterpartyAccount,
      fromCosmosCounterpartyAccountRepo,
      onOpenWalletSelect,
      osmosisAccount?.walletName,
      toChain,
      toCosmosCounterpartyAccount,
      toCosmosCounterpartyAccountRepo,
    ]);

    /**
     * Connect evm wallet to the counterparty chain
     */
    useEffect(() => {
      if (!fromChain || !toChain) return;

      const chain = direction === "deposit" ? fromChain : toChain;

      if (
        // If the chain is an Cosmos chain, we don't need to connect the cosmos chain
        chain.chainType !== "evm" ||
        // Or if the account is already connected
        isEvmWalletConnected ||
        // Or if there's no available evm chain
        !firstSupportedEvmChain
      ) {
        return;
      }

      onOpenBridgeWalletSelect();
    }, [
      direction,
      evmAddress,
      firstSupportedEvmChain,
      fromChain,
      isEvmWalletConnected,
      onOpenBridgeWalletSelect,
      toChain,
    ]);

    if (
      isLoadingCanonicalAssetPrice ||
      isNil(supportedSourceAssets) ||
      !assetsInOsmosis ||
      !canonicalAsset ||
      !toAsset ||
      !assetInOsmosisPrice ||
      !fromChain ||
      !toChain ||
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

    const dropdownActiveItemIcon = (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ammelia-400">
        <Icon id="check-mark" className="text-osmoverse-700" width={14} />
      </div>
    );

    return (
      <div className="mx-auto flex w-full flex-col items-center justify-center p-4 text-white-full">
        <h5 className="mb-6 flex items-center justify-center gap-3">
          <span>
            {direction === "deposit"
              ? t("transfer.deposit")
              : t("transfer.withdraw")}
          </span>{" "}
          <button
            className="flex items-center gap-3"
            onClick={() => setCurrentScreen(ImmersiveBridgeScreens.Asset)}
          >
            <Image
              width={32}
              height={32}
              src={canonicalAsset.coinImageUrl ?? "/"}
              alt="token image"
            />{" "}
            <span>{canonicalAsset.coinDenom}</span>
          </button>
        </h5>

        <div className="mb-6 flex w-full flex-col gap-2">
          <div className="flex w-full gap-2">
            <span className="body1 flex-1 text-osmoverse-300">
              {t("transfer.fromNetwork")}
            </span>
            <Icon id="arrow-right" className="invisible" />
            <span className="body1 flex-1 text-osmoverse-300">
              {t("transfer.toNetwork")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ChainSelectorButton
              direction={direction}
              chainColor={fromChain.color}
              chainLogo={fromChain.logoUri}
              chains={supportedChains}
              onSelectChain={(nextChain) => {
                setFromChain(nextChain);
                resetAssets();
                if (fromChain?.chainId !== nextChain.chainId) {
                  resetInput();
                }
              }}
              readonly={direction === "withdraw"}
            >
              {fromChain.prettyName}
            </ChainSelectorButton>

            <Icon id="arrow-right" className="text-osmoverse-300" />

            <ChainSelectorButton
              direction={direction}
              chainColor={toChain.color}
              chainLogo={toChain.logoUri}
              chains={supportedChains}
              onSelectChain={(nextChain) => {
                setToChain(nextChain);
                resetAssets();
                if (fromChain?.chainId !== nextChain.chainId) {
                  resetInput();
                }
              }}
              readonly={direction === "deposit"}
            >
              {toChain.prettyName}
            </ChainSelectorButton>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
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
          />

          <>
            {isLoadingAssetsBalance && (
              <div className="flex w-full items-center justify-center gap-3">
                <Spinner className="text-wosmongton-500" />
                <p className="body1 text-osmoverse-300">
                  {t("transfer.lookingForBalances")}
                </p>
              </div>
            )}

            {!isLoadingAssetsBalance && assetsBalances?.length === 1 && (
              <div className="flex w-full items-center justify-center">
                <p className="text-osmoverse-300">
                  {inputUnit === "crypto"
                    ? assetsBalances[0].amount
                        .trim(true)
                        .maxDecimals(6)
                        .hideDenom(true)
                        .toString()
                    : assetsBalances[0].usdValue.toString()}{" "}
                  {t("transfer.available")}
                </p>
              </div>
            )}

            {!isLoadingAssetsBalance && (assetsBalances?.length ?? 0) > 1 && (
              <div className="flex flex-wrap items-center justify-between rounded-2xl bg-osmoverse-1000">
                {(assetsBalances ?? []).map((asset) => {
                  const isActive =
                    asset.amount.currency.coinMinimalDenom ===
                    fromAsset?.address;
                  return (
                    <button
                      key={asset.amount.currency.coinMinimalDenom}
                      className={classNames(
                        "subtitle1 flex w-1/3 flex-col items-center rounded-lg py-3 px-2",
                        {
                          "bg-osmoverse-825 text-wosmongton-100": isActive,
                          "text-osmoverse-100": !isActive,
                        }
                      )}
                      onClick={() => setFromAsset(asset)}
                    >
                      <span>{asset.denom}</span>
                      <span className="body2 text-osmoverse-300">
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

          {walletConnected && (
            <>
              {hasMoreThanOneChainType ? (
                <>
                  <button
                    onClick={onOpenBridgeWalletSelect}
                    className="flex items-center justify-between"
                  >
                    <span className="body1 text-osmoverse-300">
                      {direction === "deposit"
                        ? t("transfer.transferWith")
                        : t("transfer.transferTo")}
                    </span>

                    <WalletDisplay
                      icon={
                        (direction === "deposit" ? fromChain : toChain)
                          ?.chainType === "evm"
                          ? evmConnector?.icon
                          : fromCosmosCounterpartyAccount?.walletInfo.logo
                      }
                      name={
                        (direction === "deposit" ? fromChain : toChain)
                          ?.chainType === "evm"
                          ? evmConnector?.name
                          : fromCosmosCounterpartyAccount?.walletInfo.prettyName
                      }
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

                  <BridgeWalletSelectModal
                    direction={direction}
                    isOpen={isBridgeWalletSelectOpen}
                    onRequestClose={onCloseBridgeWalletSelect}
                    onSelectChain={(chain) => {
                      const setChain =
                        direction === "deposit" ? setFromChain : setToChain;
                      setChain(chain);
                      resetAssets();
                    }}
                    evmChain={(() => {
                      const chain =
                        direction === "deposit" ? fromChain : toChain;
                      return chain?.chainType === "evm"
                        ? chain
                        : firstSupportedEvmChain;
                    })()}
                    cosmosChain={(() => {
                      const chain =
                        direction === "deposit" ? fromChain : toChain;
                      return chain?.chainType === "cosmos"
                        ? chain
                        : firstSupportedCosmosChain;
                    })()}
                  />
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="body1 text-osmoverse-300">
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
                          <span className="body1 text-osmoverse-300">
                            {t("transfer.receiveAsset")}
                          </span>
                          <Icon id="generate-stars" width={24} />
                        </div>
                      </Tooltip>

                      <div className="flex items-center gap-2">
                        <span className="body1 text-white-full">
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
                              asset.coinMinimalDenom === asset.variantGroupKey;
                            const isSelected =
                              toAsset?.denom === asset.coinDenom;

                            const isCanonicalAsset = index === 0;

                            return (
                              <MenuItem key={asset.coinDenom}>
                                <button
                                  className={classNames(
                                    "flex items-center justify-between gap-3 rounded-lg py-2 px-3 text-left data-[active]:bg-osmoverse-800",
                                    isSelected && "bg-osmoverse-700",
                                    !isSelected && "bg-osmoverse-800"
                                  )}
                                  onClick={onClick}
                                >
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src={asset.coinImageUrl ?? "/"}
                                      alt={`${asset.coinDenom} logo`}
                                      width={32}
                                      height={32}
                                    />
                                    <div className="flex flex-col">
                                      <p className="body1">
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
                                  </div>
                                  {isSelected && dropdownActiveItemIcon}
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
                                  "flex items-center justify-between gap-3 rounded-lg py-2 px-3 text-left",
                                  isSelected && "bg-osmoverse-700",
                                  !isSelected &&
                                    "data-[active]:bg-osmoverse-800"
                                )}
                                onClick={onClick}
                              >
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={
                                      representativeAsset.coinImageUrl ?? "/"
                                    }
                                    alt={`${asset.denom} logo`}
                                    width={32}
                                    height={32}
                                  />
                                  <div className="flex flex-col">
                                    <p className="body1">
                                      {t("transfer.withdrawAs")} {asset.denom}
                                    </p>
                                    {isCanonicalAsset && (
                                      <p className="body2 text-osmoverse-300">
                                        {t("transfer.recommended")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {isSelected && dropdownActiveItemIcon}
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
                <p className="body1 text-osmoverse-300">
                  {t("transfer.estimatingTime")}
                </p>
              </div>
              <span className="body1 text-osmoverse-300">
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
            />
          )}

          <div className="flex flex-col items-center gap-4">
            {!walletConnected ? (
              connectWalletButton
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
                  className="w-full text-h6 font-h6"
                  variant={
                    warnUserOfSlippage || warnUserOfPriceImpact
                      ? "destructive"
                      : "default"
                  }
                  onClick={onConfirm}
                >
                  {buttonText}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-lg font-h6 text-wosmongton-200 hover:text-white-full"
                  onClick={() => setAreMoreOptionsVisible(true)}
                  disabled={isNil(fromAsset) || isNil(toAsset)}
                >
                  {direction === "deposit"
                    ? t("transfer.moreDepositOptions")
                    : t("transfer.moreWithdrawOptions")}
                </Button>
                <MoreBridgeOptions
                  direction={direction}
                  isOpen={areMoreOptionsVisible}
                  fromAsset={fromAsset}
                  toAsset={toAsset}
                  fromChain={fromChain}
                  toChain={toChain}
                  toAddress={toAddress}
                  onRequestClose={() => setAreMoreOptionsVisible(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const ChainSelectorButton: FunctionComponent<{
  direction: BridgeTransactionDirection;
  readonly: boolean;
  children: ReactNode;
  chainLogo: string | undefined;
  chainColor: string | undefined;
  chains: ReturnType<typeof useBridgesSupportedAssets>["supportedChains"];
  onSelectChain: (chain: BridgeChainWithDisplayInfo) => void;
}> = ({
  direction,
  readonly,
  children,
  chainLogo,
  chainColor,
  chains,
  onSelectChain,
}) => {
  const [isNetworkSelectVisible, setIsNetworkSelectVisible] = useState(false);

  if (readonly) {
    return (
      <div className="subtitle1 flex w-[45%] flex-1 items-center gap-2 rounded-[48px] border border-osmoverse-700 py-2 px-4 text-osmoverse-200">
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
        className="subtitle1 group flex w-[45%] flex-1 items-center justify-between rounded-[48px] bg-osmoverse-825 py-2 px-4 text-start transition-colors duration-200 hover:bg-osmoverse-850"
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
        />
      )}
    </>
  );
};

const AmountScreenSkeletonLoader = () => {
  return (
    <div className="flex flex-col items-center gap-6">
      <SkeletonLoader className="h-8 w-full max-w-sm" />
      <SkeletonLoader className="h-20 w-full" />
      <SkeletonLoader className="h-24 w-full" />
      <SkeletonLoader className="h-24 w-full" />
      <SkeletonLoader className="h-6 w-full" />
      <SkeletonLoader className="h-6 w-full" />
      <SkeletonLoader className="h-14 w-full" />
      <SkeletonLoader className="h-14 w-full" />
    </div>
  );
};

const WalletDisplay: FunctionComponent<{
  icon: string | undefined;
  name: string | undefined;
  suffix?: ReactNode;
}> = ({ icon, name, suffix }) => {
  return (
    <div className="flex items-center gap-2 rounded-lg">
      {!isNil(icon) && <img src={icon} alt={name} className="h-6 w-6" />}
      <span>{name}</span>
      {suffix}
    </div>
  );
};

const TransferDetails: FunctionComponent<{
  quote: BridgeQuote & {
    selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  };
}> = ({ quote }) => {
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
                <p className="body1 text-osmoverse-300">
                  {selectedQuote.estimatedTime.humanize()} ETA
                </p>
              )}
              <ExpandDetailsControlContent
                warnUserOfPriceImpact={warnUserOfPriceImpact}
                warnUserOfSlippage={warnUserOfSlippage}
                selectedQuoteUpdatedAt={selectedQuoteUpdatedAt}
                refetchInterval={refetchInterval}
                selectedQuote={selectedQuote}
                open={open}
              />
            </div>
          </DisclosureButton>
          <DisclosurePanel ref={detailsRef} className="flex flex-col gap-2">
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
              fromChainName={selectedQuote.fromChain?.chainName}
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
