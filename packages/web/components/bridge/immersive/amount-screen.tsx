import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { BridgeChain } from "@osmosis-labs/bridge";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { BridgeTransactionDirection, MinimalAsset } from "@osmosis-labs/types";
import { isNil, isNumeric, noop } from "@osmosis-labs/utils";
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

import { Icon } from "~/components/assets";
import { SupportedAssetWithAmount } from "~/components/bridge/immersive/amount-and-confirmation-screen";
import { BridgeNetworkSelectModal } from "~/components/bridge/immersive/bridge-network-select-modal";
import { BridgeProviderDropdown } from "~/components/bridge/immersive/bridge-provider-dropdown";
import { BridgeQuoteRemainingTime } from "~/components/bridge/immersive/bridge-quote-remaining-time";
import { BridgeWalletSelectModal } from "~/components/bridge/immersive/bridge-wallet-select-modal";
import { MoreBridgeOptions } from "~/components/bridge/immersive/more-bridge-options";
import { useBridgeQuote } from "~/components/bridge/immersive/use-bridge-quote";
import { useBridgesSupportedAssets } from "~/components/bridge/immersive/use-bridges-supported-assets";
import { InputBox } from "~/components/input";
import { SkeletonLoader, Spinner } from "~/components/loaders";
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
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

type SupportedAsset = ReturnType<
  typeof useBridgesSupportedAssets
>["supportedAssetsByChainId"][string][number];

interface AmountScreenProps {
  direction: "deposit" | "withdraw";
  selectedDenom: string;

  /**
   * Chain taking into account the direction.
   */
  sourceChain: BridgeChain | undefined;
  destinationChain: BridgeChain | undefined;

  fromChain: BridgeChain | undefined;
  setFromChain: (chain: BridgeChain) => void;
  toChain: BridgeChain | undefined;
  setToChain: (chain: BridgeChain) => void;

  sourceAsset: SupportedAssetWithAmount | undefined;
  setSourceAsset: (asset: SupportedAssetWithAmount | undefined) => void;
  destinationAsset: MinimalAsset | undefined;
  setDestinationAsset: (asset: MinimalAsset | undefined) => void;

  cryptoAmount: string;
  fiatAmount: string;
  setCryptoAmount: (amount: string) => void;
  setFiatAmount: (amount: string) => void;

  quote: ReturnType<typeof useBridgeQuote>;
}

export const AmountScreen = observer(
  ({
    direction,
    selectedDenom,

    sourceChain,

    fromChain,
    setFromChain,
    toChain,
    setToChain,

    sourceAsset,
    setSourceAsset,

    destinationAsset,
    setDestinationAsset,

    cryptoAmount,
    setCryptoAmount,
    fiatAmount,
    setFiatAmount,

    quote,
  }: AmountScreenProps) => {
    const { accountStore } = useStore();
    const { onOpenWalletSelect } = useWalletSelect();
    const { t } = useTranslation();

    const {
      selectedQuote,
      successfulQuotes,
      setSelectedBridgeProvider,
      buttonErrorMessage,
      buttonText,
      isLoadingBridgeQuote,
      isLoadingBridgeTransaction,
      isRefetchingQuote,
      selectedQuoteUpdatedAt,
      refetchInterval,
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
    const destinationAccount = accountStore.getWallet(
      accountStore.osmosisChainId
    );
    const {
      address: evmAddress,
      connector: evmConnector,
      isConnected: isEvmWalletConnected,
    } = useEvmWalletAccount();

    const cosmosCounterpartyAccountRepo =
      sourceChain?.chainType === "evm" || isNil(sourceChain)
        ? undefined
        : accountStore.getWalletRepo(sourceChain.chainId);
    const cosmosCounterpartyAccount =
      sourceChain?.chainType === "evm" || isNil(sourceChain)
        ? undefined
        : accountStore.getWallet(sourceChain.chainId);

    const sourceAddress =
      sourceChain?.chainType === "evm"
        ? evmAddress
        : cosmosCounterpartyAccount?.address;

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

    const { supportedAssetsByChainId, supportedChains } =
      useBridgesSupportedAssets({
        assets: assetsInOsmosis,
        chain: {
          chainId: accountStore.osmosisChainId,
          chainType: "cosmos",
        },
      });

    const supportedAssets =
      supportedAssetsByChainId[sourceChain?.chainId ?? ""];

    const supportedChainsAsBridgeChain = useMemo(
      () =>
        supportedChains.map(
          ({ chainId, chainType, prettyName }) =>
            ({
              chainId,
              chainType,
              chainName: prettyName,
            } as BridgeChain)
        ),
      [supportedChains]
    );

    const firstSupportedEvmChain = useMemo(
      () =>
        supportedChainsAsBridgeChain.find(
          (chain): chain is Extract<BridgeChain, { chainType: "evm" }> =>
            chain.chainType === "evm"
        ),
      [supportedChainsAsBridgeChain]
    );
    const firstSupportedCosmosChain = useMemo(
      () =>
        supportedChainsAsBridgeChain.find(
          (chain): chain is Extract<BridgeChain, { chainType: "cosmos" }> =>
            chain.chainType === "cosmos"
        ),
      [supportedChainsAsBridgeChain]
    );

    const hasMoreThanOneChainType =
      !isNil(firstSupportedCosmosChain) && !isNil(firstSupportedEvmChain);

    const {
      data: sourceAssetsBalances,
      isLoading: isLoadingSourceAssetsBalance,
    } = api.local.bridgeTransfer.getSupportedAssetsBalances.useQuery(
      sourceChain?.chainType === "evm"
        ? {
            type: "evm",
            assets: supportedAssets as Extract<
              SupportedAsset,
              { chainType: "evm" }
            >[],
            userEvmAddress: evmAddress,
          }
        : {
            type: "cosmos",
            assets: supportedAssets as Extract<
              SupportedAsset,
              { chainType: "cosmos" }
            >[],
            userCosmosAddress: cosmosCounterpartyAccount?.address,
          },
      {
        enabled: !isNil(sourceChain) && !isNil(supportedAssets),

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

          if (!sourceAsset && nextData) {
            const highestBalance = nextData.reduce(
              (acc, curr) =>
                curr.amount.toDec().gt(acc.amount.toDec()) ? curr : acc,
              nextData[0]
            );

            setSourceAsset(highestBalance);
          }

          return nextData;
        },
      }
    );

    /**
     * Set the initial destination asset based on the source asset.
     */
    useEffect(() => {
      if (!isNil(sourceAsset) && !isNil(assetsInOsmosis)) {
        const destinationAsset = assetsInOsmosis.find(
          (a) => a.coinMinimalDenom === sourceAsset.supportedVariants[0]
        )!;

        setDestinationAsset(destinationAsset);
      }
    }, [assetsInOsmosis, setDestinationAsset, sourceAsset]);

    /**
     * Set the osmosis chain based on the direction
     */
    useEffect(() => {
      const chain = direction === "deposit" ? toChain : fromChain;
      const setChain = direction === "deposit" ? setToChain : setFromChain;
      if (isNil(chain) && !isNil(osmosisChain)) {
        setChain({
          chainId: osmosisChain.chain_id,
          chainName: osmosisChain.pretty_name,
          chainType: "cosmos",
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
        setChain({
          chainId: firstChain.chainId,
          chainName: firstChain.prettyName,
          chainType: firstChain.chainType,
        } as BridgeChain);
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

      const chain = direction === "deposit" ? fromChain : toChain;

      if (
        // If the chain is an EVM chain, we don't need to connect the cosmos chain
        chain.chainType !== "cosmos" ||
        // Or if the account is already connected
        !!cosmosCounterpartyAccount?.address ||
        // Or if there's no available cosmos chain
        !firstSupportedCosmosChain ||
        // Or if the account is already connected
        !!cosmosCounterpartyAccountRepo?.current
      ) {
        return;
      }

      cosmosCounterpartyAccountRepo
        ?.connect(destinationAccount?.walletName)
        .catch(() =>
          // Display the connect modal if the user for some reason rejects the connection
          onOpenWalletSelect({
            walletOptions: [
              { walletType: "cosmos", chainId: String(chain.chainId) },
            ],
          })
        );
    }, [
      destinationAccount?.walletName,
      cosmosCounterpartyAccount?.address,
      cosmosCounterpartyAccountRepo,
      direction,
      firstSupportedCosmosChain,
      fromChain,
      onOpenWalletSelect,
      toChain,
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
      isNil(supportedAssets) ||
      !assetsInOsmosis ||
      !canonicalAsset ||
      !destinationAsset ||
      !assetInOsmosisPrice ||
      !fromChain ||
      !toChain ||
      !sourceAsset
    ) {
      return <AmountScreenSkeletonLoader />;
    }

    const cryptoAmountPretty = new CoinPretty(
      {
        coinDecimals: sourceAsset.decimals,
        coinDenom: sourceAsset.denom,
        coinMinimalDenom: sourceAsset.address,
      },
      cryptoAmount === ""
        ? new Dec(0)
        : new Dec(cryptoAmount).mul(
            DecUtils.getTenExponentN(sourceAsset.decimals)
          )
    );

    const fiatAmountPretty = new PricePretty(
      DEFAULT_VS_CURRENCY,
      new Dec(fiatAmount === "" ? 0 : fiatAmount)
    );

    const parseFiatAmount = (value: string) => {
      return value.replace("$", "");
    };

    const formatFiatAmount = (value: string) => {
      return `$${value}`;
    };

    const onInput = (type: "fiat" | "crypto") => (value: string) => {
      let nextValue = type === "fiat" ? parseFiatAmount(value) : value;
      if (!isNumeric(nextValue) && nextValue !== "") return;

      if (nextValue.startsWith("0") && !nextValue.startsWith("0.")) {
        nextValue = nextValue.slice(1);
      }
      if (nextValue === "") {
        nextValue = "0";
      }
      if (nextValue === ".") {
        nextValue = "0.";
      }

      if (type === "fiat") {
        // Update the crypto amount based on the fiat amount
        const priceInFiat = assetInOsmosisPrice.toDec();
        const nextFiatAmount = new Dec(nextValue);
        const nextCryptoAmount = nextFiatAmount.quo(priceInFiat).toString();

        setCryptoAmount(trimPlaceholderZeros(nextCryptoAmount));
      } else {
        // Update the fiat amount based on the crypto amount
        const priceInFiat = assetInOsmosisPrice.toDec();
        const nextCryptoAmount = new Dec(nextValue);
        const nextFiatAmount = nextCryptoAmount.mul(priceInFiat).toString();

        setFiatAmount(trimPlaceholderZeros(nextFiatAmount));
      }

      type === "fiat" ? setFiatAmount(nextValue) : setCryptoAmount(nextValue);
    };

    const resetAssets = () => {
      setSourceAsset(undefined);
      setDestinationAsset(undefined);
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
          <Image
            width={32}
            height={32}
            src={canonicalAsset.coinImageUrl ?? "/"}
            alt="token image"
          />{" "}
          <span>{canonicalAsset.coinDenom}</span>
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
              chainLogo={""}
              chains={supportedChains}
              onSelectChain={(nextChain) => {
                setFromChain(nextChain);
                resetAssets();
              }}
              readonly={direction === "withdraw"}
            >
              {fromChain.chainName}
            </ChainSelectorButton>

            <Icon id="arrow-right" className="text-osmoverse-300" />

            <ChainSelectorButton
              direction={direction}
              chainLogo=""
              chains={supportedChains}
              onSelectChain={(nextChain) => {
                setToChain(nextChain);
                resetAssets();
              }}
              readonly={direction === "deposit"}
            >
              {toChain.chainName}
            </ChainSelectorButton>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="relative flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="text-center text-4xl font-bold">
                {inputUnit === "fiat" ? (
                  <>
                    <InputBox
                      currentValue={formatFiatAmount(fiatAmount)}
                      onInput={onInput("fiat")}
                      classes={{
                        input: classNames("text-center", {
                          "text-rust-300":
                            isInsufficientBal || isInsufficientFee,
                        }),
                      }}
                      className="mr-4 border-none bg-transparent text-center"
                    />
                  </>
                ) : (
                  <div className="flex items-center">
                    <p className="ml-1 w-full text-right align-middle text-2xl text-osmoverse-500">
                      {cryptoAmountPretty?.denom}
                    </p>
                    <InputBox
                      currentValue={cryptoAmount}
                      onInput={onInput("crypto")}
                      className="w-full border-none bg-transparent text-center"
                      classes={{
                        input: classNames("px-0", {
                          "text-rust-300":
                            isInsufficientBal || isInsufficientFee,
                        }),
                        trailingSymbol:
                          "ml-1 align-middle text-2xl text-osmoverse-500 text-left absolute right-0",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="relative flex w-full justify-center">
                <button
                  className="body1 flex items-center gap-2 text-center text-wosmongton-200"
                  onClick={() => {
                    setInputUnit(inputUnit === "fiat" ? "crypto" : "fiat");
                  }}
                >
                  <span>
                    {inputUnit === "fiat" ? (
                      <>
                        {trimPlaceholderZeros(
                          cryptoAmountPretty?.toDec().toString(2) ?? "0"
                        )}{" "}
                        {cryptoAmountPretty?.denom}
                      </>
                    ) : (
                      fiatAmountPretty.maxDecimals(2).toString()
                    )}
                  </span>
                  <span>
                    <Icon
                      id="switch"
                      className="text-wosmongton-200"
                      width={16}
                      height={16}
                    />
                  </span>
                </button>

                <button className="body2 absolute right-0 top-1/2 -translate-y-1/2 transform rounded-5xl border border-osmoverse-700 py-2 px-3 text-wosmongton-200 transition duration-200 hover:border-osmoverse-850 hover:bg-osmoverse-850 hover:text-white-full">
                  {t("transfer.max")}
                </button>
              </div>
            </div>
          </div>

          <>
            {isLoadingSourceAssetsBalance && (
              <div className="flex w-full items-center justify-center gap-3">
                <Spinner className="text-wosmongton-500" />
                <p className="body1 text-osmoverse-300">Looking for balances</p>
              </div>
            )}

            {!isLoadingSourceAssetsBalance &&
              sourceAssetsBalances?.length === 1 && (
                <div className="flex w-full items-center justify-center">
                  <p className="text-osmoverse-300">
                    {inputUnit === "crypto"
                      ? sourceAssetsBalances[0].amount
                          .trim(true)
                          .maxDecimals(6)
                          .hideDenom(true)
                          .toString()
                      : sourceAssetsBalances[0].usdValue.toString()}{" "}
                    {t("transfer.available")}
                  </p>
                </div>
              )}

            {!isLoadingSourceAssetsBalance &&
              (sourceAssetsBalances?.length ?? 0) > 1 && (
                <div className="flex flex-wrap items-center justify-between rounded-2xl bg-osmoverse-1000">
                  {(sourceAssetsBalances ?? []).map((asset) => {
                    const isActive =
                      asset.amount.currency.coinMinimalDenom ===
                      sourceAsset?.address;
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
                        onClick={() => setSourceAsset(asset)}
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
                        sourceChain?.chainType === "evm"
                          ? evmConnector?.icon
                          : cosmosCounterpartyAccount?.walletInfo.logo
                      }
                      name={
                        sourceChain?.chainType === "evm"
                          ? evmConnector?.name
                          : cosmosCounterpartyAccount?.walletInfo.prettyName
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
                    evmChain={
                      sourceChain?.chainType === "evm"
                        ? sourceChain
                        : firstSupportedEvmChain
                    }
                    cosmosChain={
                      sourceChain?.chainType === "cosmos"
                        ? sourceChain
                        : firstSupportedCosmosChain
                    }
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
                      sourceChain?.chainType === "evm"
                        ? evmConnector?.icon
                        : destinationAccount?.walletInfo.logo
                    }
                    name={
                      sourceChain?.chainType === "evm"
                        ? evmConnector?.name
                        : destinationAccount?.walletInfo.prettyName
                    }
                  />
                </div>
              )}
            </>
          )}

          {!isNil(sourceAsset) && sourceAsset.supportedVariants.length > 1 && (
            <Menu>
              {({ open }) => (
                <div className="relative w-full">
                  <MenuButton className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="body1 text-osmoverse-300">
                          {t("transfer.receiveAsset")}
                        </span>
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
                        >
                          <Icon id="info" width={16} />
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="body1 text-white-full">
                          {destinationAsset?.coinDenom}
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
                    {sourceAsset.supportedVariants.map(
                      (variantCoinMinimalDenom, index) => {
                        const asset = assetsInOsmosis.find(
                          (asset) =>
                            asset.coinMinimalDenom === variantCoinMinimalDenom
                        )!;

                        const onClick = () => {
                          setDestinationAsset(asset);
                        };

                        // Show all as 'deposit as' for now
                        const isConvert =
                          false ??
                          asset.coinMinimalDenom === asset.variantGroupKey;
                        const isSelected =
                          destinationAsset?.coinDenom === asset.coinDenom;

                        const isCanonicalAsset = index === 0;

                        return (
                          <MenuItem key={asset.coinDenom}>
                            <>
                              {isCanonicalAsset ? (
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
                                          : direction === "withdraw"
                                          ? t("transfer.withdrawAs")
                                          : t("transfer.depositAs")}{" "}
                                        {asset.coinDenom}
                                      </p>
                                      <p className="body2 text-osmoverse-300">
                                        {t("transfer.recommended")}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && dropdownActiveItemIcon}
                                </button>
                              ) : (
                                <button
                                  className={classNames(
                                    "flex items-center gap-3 rounded-lg py-2 px-3 data-[active]:bg-osmoverse-800",
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
                                  <p className="body1">
                                    {isConvert
                                      ? t("transfer.convertTo")
                                      : t("transfer.depositAs")}{" "}
                                    {asset.coinDenom}
                                  </p>
                                  {isSelected && dropdownActiveItemIcon}
                                </button>
                              )}
                            </>
                          </MenuItem>
                        );
                      }
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
            <Disclosure>
              {({ open }) => (
                <>
                  {" "}
                  <DisclosureButton>
                    <div className="flex animate-[fadeIn_0.25s] items-center justify-between">
                      {open ? (
                        <p className="subtitle1">
                          {t("transfer.transferDetails")}
                        </p>
                      ) : (
                        <p className="body1 text-osmoverse-300">
                          {selectedQuote.estimatedTime.humanize()} ETA
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {!isNil(selectedQuoteUpdatedAt) && (
                          <BridgeQuoteRemainingTime
                            dataUpdatedAt={selectedQuoteUpdatedAt}
                            refetchInterval={refetchInterval}
                            expiredElement={
                              <Spinner className="!h-6 !w-6 text-wosmongton-500" />
                            }
                          />
                        )}
                        <div className="flex items-center gap-2">
                          {!open && (
                            <span className="body1">
                              ~
                              {(
                                selectedQuote.transferFeeFiat ??
                                new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
                              )
                                ?.add(selectedQuote.gasCost ?? new Dec(0))
                                .toString()}{" "}
                              {t("transfer.fees")}
                            </span>
                          )}
                          {(warnUserOfPriceImpact || warnUserOfSlippage) && (
                            <Tooltip
                              content={
                                warnUserOfSlippage
                                  ? t("transfer.slippageWarning")
                                  : t("transfer.priceImpactWarning", {
                                      priceImpact:
                                        selectedQuote.priceImpact.toString(),
                                    })
                              }
                            >
                              <Icon
                                id="alert-circle"
                                className="h-6 w-6 text-rust-400"
                              />
                            </Tooltip>
                          )}
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
                    </div>
                  </DisclosureButton>
                  <DisclosurePanel className="flex flex-col gap-2">
                    <TransferDetailRow
                      label={t("transfer.provider")}
                      value={
                        <BridgeProviderDropdown
                          selectedQuote={selectedQuote}
                          quotes={successfulQuotes}
                          onSelect={(bridgeId) =>
                            setSelectedBridgeProvider(bridgeId)
                          }
                        />
                      }
                      isLoading={isRefetchingQuote}
                    />
                    <TransferDetailRow
                      label={t("transfer.estimatedTime")}
                      value={
                        <div className="flex items-center gap-1">
                          <Icon
                            id="stopwatch"
                            className="h-4 w-4 text-osmoverse-400"
                          />{" "}
                          <p className="text-osmoverse-100">
                            {selectedQuote.estimatedTime.humanize()}
                          </p>
                        </div>
                      }
                      isLoading={isRefetchingQuote}
                    />
                    <TransferDetailRow
                      label={t("transfer.providerFees")}
                      value={
                        <>
                          {selectedQuote.transferFee
                            .toDec()
                            .equals(new Dec(0)) ? (
                            <p className="text-bullish-400">
                              {t("transfer.free")}
                            </p>
                          ) : (
                            <p className="text-osmoverse-100">
                              {selectedQuote.transferFeeFiat
                                ? `${selectedQuote.transferFeeFiat.toString()} (${selectedQuote.transferFee
                                    .maxDecimals(4)
                                    .toString()})`
                                : selectedQuote.transferFee
                                    .maxDecimals(4)
                                    .toString()}
                            </p>
                          )}
                        </>
                      }
                      isLoading={isRefetchingQuote}
                    />

                    <TransferDetailRow
                      label={t("transfer.networkFee", {
                        networkName: sourceChain?.chainName ?? "",
                      })}
                      value={
                        <p className="text-osmoverse-100">
                          {isNil(selectedQuote.gasCostFiat) &&
                          isNil(selectedQuote.gasCost) ? (
                            <Tooltip
                              content={t("transfer.unknownFeeTooltip", {
                                networkName: sourceChain?.chainName ?? "",
                              })}
                            >
                              <div className="flex items-center gap-2">
                                <Icon
                                  id="help-circle"
                                  className="h-4 w-4 text-osmoverse-400"
                                />
                                <p className="body2 text-osmoverse-300">
                                  {t("transfer.unknown")}
                                </p>
                              </div>
                            </Tooltip>
                          ) : (
                            <>
                              {selectedQuote.gasCostFiat
                                ? selectedQuote.gasCostFiat.toString()
                                : selectedQuote.gasCost
                                    ?.maxDecimals(4)
                                    .toString()}
                              {selectedQuote.gasCostFiat &&
                              selectedQuote.gasCost
                                ? ` (${selectedQuote.gasCost
                                    .maxDecimals(4)
                                    .toString()})`
                                : ""}
                            </>
                          )}
                        </p>
                      }
                      isLoading={isRefetchingQuote}
                    />

                    {(selectedQuote.gasCostFiat ||
                      selectedQuote.transferFeeFiat) && (
                      <TransferDetailRow
                        label={t("transfer.totalFees")}
                        value={
                          <p className="text-osmoverse-100">
                            {(
                              selectedQuote?.gasCostFiat ??
                              new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
                            )
                              .add(
                                selectedQuote.transferFeeFiat ??
                                  new PricePretty(
                                    DEFAULT_VS_CURRENCY,
                                    new Dec(0)
                                  )
                              )
                              .toString()}
                          </p>
                        }
                        isLoading={isRefetchingQuote}
                      />
                    )}
                    <TransferDetailRow
                      label={t("transfer.estimatedAmountReceived")}
                      value={
                        <p
                          className={
                            warnUserOfSlippage
                              ? "text-rust-300"
                              : "text-osmoverse-100"
                          }
                        >
                          {selectedQuote.expectedOutputFiat.toString()} (
                          {selectedQuote.expectedOutput
                            .maxDecimals(4)
                            .toString()}
                          )
                        </p>
                      }
                      isLoading={isRefetchingQuote}
                    />
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
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
                    isLoadingBridgeTransaction
                  }
                  className="w-full text-h6 font-h6"
                >
                  {buttonText}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-lg font-h6 text-wosmongton-200 hover:text-white-full"
                  onClick={() => setAreMoreOptionsVisible(true)}
                  disabled={isNil(sourceAsset) || isNil(destinationAsset)}
                >
                  {direction === "deposit"
                    ? t("transfer.moreDepositOptions")
                    : t("transfer.moreWithdrawOptions")}
                </Button>
                <MoreBridgeOptions
                  direction={direction}
                  isOpen={areMoreOptionsVisible}
                  fromAsset={sourceAsset}
                  toAsset={{
                    address: destinationAsset.coinMinimalDenom,
                    decimals: destinationAsset.coinDecimals,
                    denom: destinationAsset.coinDenom,
                  }}
                  fromChain={fromChain}
                  toChain={toChain}
                  toAddress={sourceAddress}
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
  chainLogo: string;
  chains: ReturnType<typeof useBridgesSupportedAssets>["supportedChains"];
  onSelectChain: (chain: BridgeChain) => void;
}> = ({
  direction,
  readonly,
  children,
  chainLogo: _chainLogo,
  chains,
  onSelectChain,
}) => {
  const [isNetworkSelectVisible, setIsNetworkSelectVisible] = useState(false);

  if (readonly) {
    return (
      <div className="subtitle1 flex-1 rounded-[48px] border border-osmoverse-700 py-2 px-4 text-osmoverse-200">
        {children}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setIsNetworkSelectVisible(true);
        }}
        className="subtitle1 group flex flex-1 items-center justify-between rounded-[48px] bg-osmoverse-825 py-2 px-4 text-start transition-colors duration-200 hover:bg-osmoverse-850"
      >
        <span>{children}</span>
        <Icon
          id="chevron-down"
          className="text-wosmongton-200 transition-colors duration-200 group-hover:text-white-full"
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

const TransferDetailRow: FunctionComponent<{
  label: string;
  value: ReactNode;
  isLoading: boolean;
}> = ({ label, value, isLoading }) => {
  return (
    <div className="body2 flex justify-between">
      <p className="text-osmoverse-300">{label}</p>
      <span
        className={classNames({
          "animate-[deepPulse_2s_ease-in-out_infinite] cursor-progress":
            isLoading,
        })}
      >
        {value}
      </span>
    </div>
  );
};
