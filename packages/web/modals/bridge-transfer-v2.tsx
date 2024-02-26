import { WalletStatus } from "@cosmos-kit/core";
import {
  CoinPretty,
  Dec,
  DecUtils,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDebounce, useUnmount } from "react-use";
import { Required } from "utility-types";
import { isAddress } from "web3-utils";

import { displayToast, ToastType } from "~/components/alert";
import { Button, buttonCVA } from "~/components/buttons";
import { Transfer, TransferProps } from "~/components/complex/transfer";
import { EventName } from "~/config";
import {
  useAmountConfig,
  useAmplitudeAnalytics,
  useConnectWalletModalRedirect,
  useFakeFeeConfig,
  useLocalStorageState,
  useTranslation,
} from "~/hooks";
import { SourceChain, useTxEventToasts } from "~/integrations";
import {
  EthClientChainIds_SourceChainMap,
  type SourceChainKey,
} from "~/integrations/bridge-info";
import {
  AxelarChainIds_SourceChainMap,
  SourceChainTokenConfig,
} from "~/integrations/bridges/axelar/types";
import type { AvailableBridges } from "~/integrations/bridges/bridge-manager";
import {
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetTransferStatusParams,
} from "~/integrations/bridges/types";
import {
  ChainNames,
  EthWallet,
  NativeEVMTokenConstantAddress,
  useErc20Balance,
  useNativeBalance,
  useTxReceiptState,
} from "~/integrations/ethereum";
import { useAmountConfig as useEvmAmountConfig } from "~/integrations/ethereum/hooks/use-amount-config";
import type { ObservableWallet } from "~/integrations/wallets";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { IBCBalance } from "~/stores/assets";
import { ErrorTypes } from "~/utils/error-types";
import { noop } from "~/utils/function";
import { getKeyByValue } from "~/utils/object";
import { createContext } from "~/utils/react-context";
import { api } from "~/utils/trpc";

interface BridgeTransferContext {
  useWrappedToken: boolean;
  useNativeToken: boolean;
  setUseWrappedToken: (nextValue: boolean) => void;
  sourceChainConfig?: SourceChainTokenConfig;
  sourceChainKeyMapped: SourceChain;
  originCurrency: Currency;
}

const [BridgeTransferModalProvider, useBridgeTransfer] =
  createContext<BridgeTransferContext>({
    name: "BridgeTransferModal",
    strict: true,
  });

interface BridgeTransferModalProps extends ModalBaseProps {
  isWithdraw: boolean;
  balance: IBCBalance;
  sourceChainKey: SourceChainKey;
  walletClient?: ObservableWallet;
  onRequestSwitchWallet: () => void;
}

export const BridgeTransferV2Modal: FunctionComponent<BridgeTransferModalProps> =
  observer((props) => {
    const { balance: assetToBridge, sourceChainKey, walletClient } = props;

    if (!assetToBridge.originBridgeInfo) {
      console.error("BridgeTransferModal given unconfigured IBC balance/asset");
      return null;
    }

    const sourceChainConfig =
      assetToBridge.originBridgeInfo!.sourceChainTokens.find(
        ({ id }) => id === sourceChainKey
      );

    const [useWrappedToken, setUseWrappedToken] = useLocalStorageState(
      sourceChainConfig?.erc20ContractAddress &&
        sourceChainConfig?.nativeWrapEquivalent
        ? `bridge-${sourceChainConfig.erc20ContractAddress}-use-wrapped-token`
        : "",
      false // assume we're transferring native token, since it's the gas token as well and generally takes precedence
    );

    const sourceChainKeyMapped =
      AxelarChainIds_SourceChainMap[sourceChainKey] || sourceChainKey;

    const useNativeToken =
      (sourceChainConfig?.nativeWrapEquivalent && !useWrappedToken) || false;

    const originCurrency = useMemo(() => {
      const wrapCurrency = sourceChainConfig?.nativeWrapEquivalent
        ? {
            ...assetToBridge.balance.currency.originCurrency!,
            coinDenom: sourceChainConfig.nativeWrapEquivalent.wrapDenom,
          }
        : undefined;

      return !useNativeToken && wrapCurrency
        ? wrapCurrency
        : assetToBridge.balance.currency.originCurrency!;
    }, [sourceChainConfig, assetToBridge, useNativeToken]);

    const contextValue = useMemo<BridgeTransferContext>(
      () => ({
        useNativeToken,
        useWrappedToken,
        setUseWrappedToken,
        sourceChainConfig,
        sourceChainKeyMapped,
        originCurrency,
      }),
      [
        originCurrency,
        setUseWrappedToken,
        sourceChainConfig,
        sourceChainKeyMapped,
        useNativeToken,
        useWrappedToken,
      ]
    );

    return (
      <BridgeTransferModalProvider value={contextValue}>
        {walletClient ? (
          <EvmTransfer {...props} walletClient={walletClient} />
        ) : (
          <ManualTransfer {...props} chainType="evm" />
        )}
      </BridgeTransferModalProvider>
    );
  });

const EvmTransfer: FunctionComponent<
  Required<BridgeTransferModalProps, "walletClient" | "balance">
> = observer((props) => {
  const {
    isWithdraw,
    balance: assetToBridge,
    sourceChainKey,
    walletClient,
  } = props;

  const {
    sourceChainKeyMapped,
    sourceChainConfig,
    originCurrency,
    useNativeToken,
  } = useBridgeTransfer();

  const ethWalletClient = walletClient as EthWallet;
  const isDeposit = !isWithdraw;

  useTxEventToasts(ethWalletClient);

  const ethWalletClientChainKey =
    EthClientChainIds_SourceChainMap[ethWalletClient?.chainId ?? ""] ||
    ethWalletClient?.chainId;
  const isCorrectChainSelected =
    ethWalletClientChainKey === sourceChainKeyMapped;

  const erc20Balance = useErc20Balance(
    ethWalletClient,
    isDeposit ? sourceChainConfig?.erc20ContractAddress : undefined
  );
  const nativeBalance = useNativeBalance(
    ethWalletClient,
    isDeposit ? originCurrency : undefined
  );

  const {
    amount: depositAmount,
    setAmount: setDepositAmount,
    toggleIsMax: toggleIsDepositAmtMax,
  } = useEvmAmountConfig({
    sendFn: ethWalletClient?.send,
    balance: useNativeToken
      ? nativeBalance ?? undefined
      : erc20Balance ?? undefined,
    address: ethWalletClient?.accountAddress,
    gasCurrency: useNativeToken
      ? assetToBridge.balance.currency.originCurrency
      : undefined, // user will inspect gas costs in their wallet
  });

  // notify eth wallet of prev selected preferred chain
  useEffect(() => {
    let ethClientChainName: string | undefined =
      getKeyByValue(EthClientChainIds_SourceChainMap, sourceChainKey) ??
      sourceChainKey;

    let hexChainId: string | undefined = getKeyByValue(
      ChainNames,
      ethClientChainName
    )
      ? ethClientChainName
      : undefined;

    if (!hexChainId || !ethWalletClient) return;

    ethWalletClient.setPreferredSourceChain(hexChainId);
  }, [ethWalletClient, sourceChainKey, walletClient]);

  const [userDisconnectedEthWallet, setUserDisconnectedWallet] =
    useState(false);
  useEffect(() => {
    if (!ethWalletClient?.isConnected) {
      setUserDisconnectedWallet(true);
    }
    if (ethWalletClient?.isConnected && userDisconnectedEthWallet) {
      setUserDisconnectedWallet(false);
    }
  }, [ethWalletClient?.isConnected, userDisconnectedEthWallet]);

  const [lastDepositAccountEvmAddress, setLastDepositAccountEvmAddress] =
    useLocalStorageState<string | null>(
      isWithdraw
        ? ""
        : `axelar-last-deposit-addr-${originCurrency.coinMinimalDenom}`,
      null
    );

  const warnOfDifferentDepositAddress =
    isWithdraw &&
    ethWalletClient?.isConnected &&
    lastDepositAccountEvmAddress &&
    ethWalletClient?.accountAddress
      ? ethWalletClient?.accountAddress !== lastDepositAccountEvmAddress
      : false;

  const { isEthTxPending } = useTxReceiptState(ethWalletClient);

  return (
    <TransferContent
      {...props}
      erc20Balance={erc20Balance}
      nativeBalance={nativeBalance}
      isCorrectChainSelected={isCorrectChainSelected}
      depositAmount={depositAmount}
      setDepositAmount={setDepositAmount}
      toggleIsDepositAmtMax={toggleIsDepositAmtMax}
      counterpartyAddress={ethWalletClient.accountAddress ?? ""}
      warnOfDifferentDepositAddress={warnOfDifferentDepositAddress}
      setLastDepositAccountEvmAddress={setLastDepositAccountEvmAddress}
      isEthTxPending={
        isEthTxPending || ethWalletClient?.isSending === "eth_sendTransaction"
      }
      ethWalletClient={ethWalletClient}
    />
  );
});

const ManualTransfer: FunctionComponent<
  Omit<BridgeTransferModalProps, "walletClient"> & { chainType: "evm" }
> = observer((props) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState("");
  const [didAckWithdrawRisk, setAckWithdrawRisk] = useState(false);
  const { sourceChainKeyMapped } = useBridgeTransfer();

  if (props.chainType !== "evm") throw new Error("Unsupported chain type");

  const addressConfig: TransferProps<any>["addWithdrawAddrConfig"] = {
    customAddress: address,
    setCustomAddress(bech32Address) {
      setAddress(bech32Address);
    },
    isValid: isAddress(address),
    didAckWithdrawRisk: didAckWithdrawRisk,
    setDidAckWithdrawRisk: setAckWithdrawRisk,
    inputPlaceholder: t("assets.transfer.enterAddress", {
      network: sourceChainKeyMapped,
    }),
  };

  return (
    <TransferContent
      {...props}
      counterpartyAddress={address}
      depositAmount=""
      setDepositAmount={noop}
      toggleIsDepositAmtMax={noop}
      setLastDepositAccountEvmAddress={noop}
      addWithdrawAddrConfig={addressConfig}
      isDisabled={
        addressConfig?.customAddress === "" ||
        !addressConfig.isValid ||
        !didAckWithdrawRisk
      }
      isCounterpartyAddressValid={addressConfig.isValid}
    />
  );
});

const availableBridgeKeys: AvailableBridges[] = ["Skip", "Squid", "Axelar"];

/** Modal that lets user transfer via non-IBC bridges. */
export const TransferContent: FunctionComponent<
  ModalBaseProps & {
    isWithdraw: boolean;
    balance: IBCBalance;
    /** Selected network key. */
    sourceChainKey: SourceChainKey;
    onRequestSwitchWallet: () => void;
    counterpartyAddress: string;
    isCounterpartyAddressValid?: boolean;

    // Deposit
    isCorrectChainSelected?: boolean;
    erc20Balance?: CoinPretty;
    nativeBalance?: CoinPretty;
    depositAmount: string;
    setDepositAmount: (amount: string) => void;
    toggleIsDepositAmtMax: () => void;
    setLastDepositAccountEvmAddress: (address: string) => void;
    userDisconnectedEthWallet?: boolean;
    warnOfDifferentDepositAddress?: boolean;
    isEthTxPending?: boolean;
    ethWalletClient?: EthWallet;
    addWithdrawAddrConfig?: TransferProps<any>["addWithdrawAddrConfig"];
    isDisabled?: boolean;
  }
> = observer((props) => {
  const {
    isWithdraw,
    balance: assetToBridge,
    sourceChainKey,
    onRequestClose,
    onRequestSwitchWallet,
    isCorrectChainSelected,
    depositAmount,
    setDepositAmount,
    toggleIsDepositAmtMax,
    nativeBalance,
    erc20Balance,
    userDisconnectedEthWallet,
    counterpartyAddress,
    warnOfDifferentDepositAddress,
    setLastDepositAccountEvmAddress,
    isEthTxPending,
    ethWalletClient,
    addWithdrawAddrConfig,
    isDisabled: isDisabledProp,
    isCounterpartyAddressValid = true,
  } = props;
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const {
    queriesExternalStore,
    chainStore,
    accountStore,
    queriesStore,
    nonIbcBridgeHistoryStore,
    priceStore,
  } = useStore();
  const {
    showModalBase,
    accountActionButton: connectWalletButton,
    walletConnected,
  } = useConnectWalletModalRedirect(
    {
      className: "md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl",
      onClick: () => {},
    },
    props.onRequestClose
  );
  const {
    useNativeToken,
    originCurrency,
    useWrappedToken,
    setUseWrappedToken,
    sourceChainConfig,
  } = useBridgeTransfer();

  const { chainId: osmosisChainId, chainName } = chainStore.osmosis;
  const osmosisAccount = accountStore.getWallet(osmosisChainId);
  const osmosisAddress = osmosisAccount?.address ?? "";
  const osmoIcnsName =
    queriesExternalStore.queryICNSNames.getQueryContract(
      osmosisAddress
    ).primaryName;

  const isDeposit = !isWithdraw;

  if (!assetToBridge.originBridgeInfo) {
    console.error("BridgeTransferModal given unconfigured IBC balance/asset");
    return null;
  }
  const { bridge } = assetToBridge.originBridgeInfo;

  let modalTitle = "";

  if (isWithdraw) {
    /** Since the modal will display a toggle, hide the coin denom from the title  */
    if (
      bridge === "axelar" &&
      Boolean(sourceChainConfig?.nativeWrapEquivalent)
    ) {
      modalTitle = t("assets.transferAssetSelect.withdraw");
    } else {
      modalTitle = t("assets.transfer.titleWithdraw", {
        coinDenom: assetToBridge.balance.currency.coinDenom,
      });
    }
  } else {
    /** Since the modal will display a toggle, hide the coin denom from the title  */
    if (
      bridge === "axelar" &&
      Boolean(sourceChainConfig?.nativeWrapEquivalent)
    ) {
      modalTitle = t("assets.transferAssetSelect.deposit");
    } else {
      modalTitle = t("assets.transfer.titleDeposit", {
        coinDenom: assetToBridge.balance.currency.coinDenom,
      });
    }
  }

  const feeConfig = useFakeFeeConfig(
    chainStore,
    osmosisChainId,
    osmosisAccount?.cosmos.msgOpts.ibcTransfer.gas ?? 0
  );

  // WITHDRAW
  const withdrawAmountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    osmosisChainId,
    osmosisAddress,
    feeConfig,
    assetToBridge.balance.currency
  );

  const inputAmountRaw = isWithdraw
    ? withdrawAmountConfig.amount
    : depositAmount;

  const [debouncedInputValue, setDebouncedInputValue] =
    useState(inputAmountRaw);
  useDebounce(
    () => {
      setDebouncedInputValue(inputAmountRaw);
      // Every time the input amount changes, deactivate the controlled mode.
      // Best quotes will be selected automatically.
      setBridgeProviderControlledMode(false);
    },
    300,
    [inputAmountRaw]
  );
  const inputAmount = new Dec(
    debouncedInputValue === "" ? "0" : debouncedInputValue
  ).mul(
    // CoinPretty only accepts whole amounts
    DecUtils.getTenExponentNInPrecisionRange(originCurrency.coinDecimals)
  );

  let availableBalance: CoinPretty | undefined;
  if (isWithdraw) {
    availableBalance = assetToBridge.balance;
  } else if (useNativeToken) {
    availableBalance = nativeBalance;
  } else if (sourceChainConfig?.erc20ContractAddress) {
    availableBalance = erc20Balance;
  }

  const osmosisPath = {
    address: osmosisAddress,
    networkName: chainStore.osmosis.prettyChainName,
    iconUrl: "/tokens/osmo.svg",
    source: "account" as const,
    asset: {
      denom: assetToBridge.balance.currency.coinDenom,
      sourceDenom:
        originCurrency?.coinMinimalDenom ??
        assetToBridge.balance.currency?.coinMinimalDenom!,
      address: assetToBridge.balance.currency.coinMinimalDenom, // IBC address
      decimals: assetToBridge.balance.currency.coinDecimals,
    },
    chain: {
      chainId: osmosisChainId,
      chainName,
      chainType: "cosmos" as const,
    },
  };

  const counterpartyPath = {
    address: counterpartyAddress,
    networkName: sourceChainKey,
    iconUrl: assetToBridge.balance.currency.coinImageUrl,
    source: "counterpartyAccount" as const,
    asset: {
      denom: assetToBridge.balance.denom,
      sourceDenom:
        useNativeToken && isDeposit
          ? sourceChainConfig?.nativeWrapEquivalent?.tokenMinDenom! // deposit uses native/gas token denom
          : originCurrency?.coinMinimalDenom ??
            assetToBridge.balance.currency?.coinMinimalDenom!,
      address: useNativeToken
        ? NativeEVMTokenConstantAddress
        : sourceChainConfig?.erc20ContractAddress!,
      decimals: assetToBridge.balance.currency.coinDecimals,
    },
    chain: {
      chainId: sourceChainConfig?.chainId!,
      chainName: sourceChainConfig?.id!,
      chainType: "evm" as const,
    },
  };

  const quoteParams = {
    fromAddress: isDeposit ? counterpartyPath.address : osmosisPath.address,
    fromAsset: isDeposit ? counterpartyPath.asset : osmosisPath.asset,
    fromChain: isDeposit ? counterpartyPath.chain : osmosisPath.chain,
    toAddress: isDeposit ? osmosisPath.address : counterpartyPath.address,
    toAsset: isDeposit ? osmosisPath.asset : counterpartyPath.asset,
    toChain: isDeposit ? osmosisPath.chain : counterpartyPath.chain,
  };

  const [selectedBridgeProvider, setSelectedBridgeProvider] =
    useState<AvailableBridges | null>(null);
  const [isBridgeProviderControlledMode, setBridgeProviderControlledMode] =
    useState(false);

  const quoteResults = api.useQueries((t) =>
    availableBridgeKeys.map((bridge) =>
      t.bridgeTransfer.getQuoteByBridge(
        {
          ...quoteParams,
          bridge,
          fromAmount: inputAmount.truncate().toString(),
        },
        {
          enabled:
            inputAmount.gt(new Dec(0)) &&
            counterpartyAddress !== "" &&
            isCounterpartyAddressValid,
          staleTime: 5_000,
          cacheTime: 5_000,
          // Disable retries, as useQueries
          // will block successful quotes from being returned
          // if failed quotes are being returned
          // until retry starts returning false.
          // This causes slow UX even though there's a
          // quote that the user can use.
          retry: false,

          refetchInterval: 30 * 1000, // 30 seconds

          select: ({ quote }) => {
            const {
              estimatedGasFee,
              transferFee,
              estimatedTime,
              expectedOutput,
              transactionRequest,
              provider,
              fromChain,
              toChain,
              input,
            } = quote;

            const priceImpact = new RatePretty(
              new Dec(expectedOutput.priceImpact)
            );
            const expectedOutputFiatDec = new Dec(
              expectedOutput.fiatValue.amount
            );
            const inputFiatDec = new Dec(input.fiatValue.amount);

            let transferSlippage: Dec;
            if (expectedOutputFiatDec.gt(inputFiatDec)) {
              // if expected output is greater than input, assume slippage is 0%
              transferSlippage = new Dec(0);
            } else if (expectedOutputFiatDec.lt(new Dec(0))) {
              // if expected output is negative, assume slippage is 100%
              transferSlippage = new Dec(1);
            } else {
              transferSlippage = new Dec(1).sub(
                expectedOutputFiatDec.quo(inputFiatDec)
              );
            }

            return {
              gasCost: estimatedGasFee
                ? new CoinPretty(
                    {
                      coinDecimals: estimatedGasFee.decimals,
                      coinDenom: estimatedGasFee.denom,
                      coinMinimalDenom: estimatedGasFee.sourceDenom,
                    },
                    new Dec(estimatedGasFee.amount)
                  ).maxDecimals(8)
                : undefined,

              transferFee: new CoinPretty(
                {
                  coinDecimals: transferFee.decimals,
                  coinDenom: transferFee.denom,
                  coinMinimalDenom: transferFee.sourceDenom,
                },
                new Dec(transferFee.amount)
              ).maxDecimals(8),

              expectedOutput: new CoinPretty(
                {
                  coinDecimals: expectedOutput.decimals,
                  coinDenom: expectedOutput.denom,
                  coinMinimalDenom: expectedOutput.sourceDenom,
                },
                new Dec(expectedOutput.amount)
              ),

              get expectedOutputFiat() {
                if (!expectedOutput.fiatValue) return undefined;
                const expectedOutputFiatValue = expectedOutput.fiatValue;
                const fiat = priceStore.getFiatCurrency(
                  expectedOutputFiatValue.currency
                );
                if (!fiat) return undefined;

                return new PricePretty(
                  fiat,
                  new Dec(expectedOutputFiatValue.amount)
                );
              },

              get transferFeeFiat() {
                if (!transferFee.fiatValue) return undefined;

                const transferFeeFiatValue = transferFee.fiatValue;
                const fiat = priceStore.getFiatCurrency(
                  transferFeeFiatValue?.currency ?? "usd"
                );

                if (!fiat) throw new Error("No fiat currency found");

                return new PricePretty(
                  fiat,
                  new Dec(transferFeeFiatValue.amount)
                );
              },

              get gasCostFiat() {
                if (!estimatedGasFee?.fiatValue) return undefined;
                const gasCostFiatValue = estimatedGasFee.fiatValue;
                const fiat = priceStore.getFiatCurrency(
                  gasCostFiatValue.currency
                );
                if (!fiat) return undefined;

                return new PricePretty(fiat, new Dec(gasCostFiatValue.amount));
              },

              estimatedTime: dayjs.duration({
                seconds: estimatedTime,
              }),

              responseTime: dayjs(),
              quote,
              transactionRequest,
              priceImpact,
              provider,
              fromChain,
              toChain,
              isSlippageTooHigh: transferSlippage.gt(new Dec(0.06)), // warn if expected output is less than 6% of input amount
              isPriceImpactTooHigh: priceImpact.toDec().gte(new Dec(0.1)), // warn if price impact is greater than 10%.
            };
          },

          // prevent batching so that fast routers can
          // return requests faster than the slowest router
          trpc: {
            context: {
              skipBatch: true,
            },
          },
        }
      )
    )
  );

  // reduce the results' data to that with the highest out amount
  const selectedQuote = useMemo(() => {
    return quoteResults?.find(
      ({ data: quote }) => quote?.provider.id === selectedBridgeProvider
    )?.data;
  }, [quoteResults, selectedBridgeProvider]);

  const numSucceeded = quoteResults.filter(({ isSuccess }) => isSuccess).length;
  const isOneSuccessful = Boolean(numSucceeded);
  const amountOfErrors = quoteResults.filter(({ isError }) => isError).length;
  const isOneErrored = Boolean(amountOfErrors);

  // if none have returned a resulting quote, find some error
  const someError = useMemo(
    () =>
      !isOneSuccessful &&
      isOneErrored &&
      quoteResults.every(({ isLoading }) => !isLoading)
        ? quoteResults.find((quoteResult) => Boolean(quoteResult.error))?.error
        : undefined,
    [isOneSuccessful, isOneErrored, quoteResults]
  );

  useEffect(() => {
    const quoteResults_ = [...quoteResults];

    const bestQuote = quoteResults_
      // only those that have fetched
      .filter((quoteResult) => Boolean(quoteResult.isFetched))
      // Sort by response time. The fastest and highest quality quote will be first.
      .sort((a, b) => {
        if (a.data?.responseTime.isBefore(b.data?.responseTime)) {
          return 1;
        }
        if (a.data?.responseTime.isAfter(b.data?.responseTime)) {
          return -1;
        }
        return 0;
      })
      // only those that have returned a result without error
      .map(({ data }) => data)
      // only the best quote data
      .reduce((bestAcc, cur) => {
        if (!bestAcc) return cur;
        if (
          !!cur &&
          bestAcc.expectedOutput.toDec().lt(cur.expectedOutput.toDec())
        ) {
          return cur;
        }
        return bestAcc;
      }, undefined);

    // If the selected bridge provider is not found in the results, select the best quote provider
    const isBridgeProviderNotFound = !quoteResults_.some(
      ({ data }) => data?.provider.id === selectedBridgeProvider
    );

    if (
      !!bestQuote &&
      ((bestQuote?.provider.id !== selectedBridgeProvider &&
        !isBridgeProviderControlledMode) ||
        isBridgeProviderNotFound)
    ) {
      setSelectedBridgeProvider(bestQuote.provider.id);
    }
  }, [
    selectedQuote,
    quoteResults,
    selectedBridgeProvider,
    isBridgeProviderControlledMode,
  ]);

  const isInsufficientFee =
    inputAmountRaw !== "" &&
    selectedQuote?.transferFee !== undefined &&
    new CoinPretty(assetToBridge.balance.currency, inputAmount)
      .toDec()
      .lt(selectedQuote?.transferFee.toDec());

  const isInsufficientBal =
    inputAmountRaw !== "" &&
    availableBalance &&
    new CoinPretty(assetToBridge.balance.currency, inputAmount)
      .toDec()
      .gt(availableBalance.toDec());

  const bridgeTransaction =
    api.bridgeTransfer.getTransactionRequestByBridge.useQuery(
      {
        ...quoteParams,
        fromAmount: inputAmount.truncate().toString(),
        bridge: selectedBridgeProvider!,
      },
      {
        /**
         * If there is no transaction request data, fetch it.
         */
        enabled:
          Boolean(selectedQuote) &&
          Boolean(selectedBridgeProvider) &&
          !selectedQuote?.transactionRequest &&
          inputAmount.gt(new Dec(0)) &&
          !isInsufficientBal &&
          !isInsufficientFee,
        refetchInterval: 30 * 1000, // 30 seconds
      }
    );

  useUnmount(() => {
    setSelectedBridgeProvider(null);
    setBridgeProviderControlledMode(false);
  });

  const [transferInitiated, setTransferInitiated] = useState(false);
  const trackTransferStatus = useCallback(
    (providerId: AvailableBridges, params: GetTransferStatusParams) => {
      if (inputAmountRaw !== "") {
        nonIbcBridgeHistoryStore.pushTxNow(
          `${providerId}${JSON.stringify(params)}`,
          new CoinPretty(originCurrency, inputAmount).trim(true).toString(),
          isWithdraw,
          osmosisAccount?.address ?? "" // use osmosis account for account keys (vs any EVM account)
        );
      }
    },
    [
      inputAmountRaw,
      nonIbcBridgeHistoryStore,
      originCurrency,
      inputAmount,
      isWithdraw,
      osmosisAccount?.address,
    ]
  );

  const [isApprovingToken, setIsApprovingToken] = useState(false);

  // close modal when initial eth transaction is committed
  const isSendTxPending = isWithdraw
    ? osmosisAccount?.txTypeInProgress !== ""
    : isEthTxPending;
  useEffect(() => {
    if (transferInitiated && !isSendTxPending) {
      onRequestClose();
    }
  }, [
    transferInitiated,
    isSendTxPending,
    osmosisAccount?.txTypeInProgress,
    isEthTxPending,
    onRequestClose,
  ]);

  const handleEvmTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    if (!ethWalletClient) throw new Error("No ETH wallet client found");

    const transactionRequest =
      quote.transactionRequest as EvmBridgeTransactionRequest;
    try {
      /**
       * This occurs when users haven't given permission to the bridge smart contract to use their tokens.
       */
      if (transactionRequest.approvalTransactionRequest) {
        setIsApprovingToken(true);

        await ethWalletClient.send({
          method: "eth_sendTransaction",
          params: [
            {
              to: transactionRequest.approvalTransactionRequest.to,
              from: ethWalletClient.accountAddress,
              data: transactionRequest.approvalTransactionRequest.data,
            },
          ],
        });

        await new Promise((resolve, reject) => {
          const onConfirmed = () => {
            setIsApprovingToken(false);
            clearEvents();
            resolve(void 0);
          };
          const onFailed = () => {
            setIsApprovingToken(false);
            clearEvents();
            reject(void 0);
          };

          const clearEvents = () => {
            ethWalletClient.txStatusEventEmitter!.removeListener(
              "confirmed",
              onConfirmed
            );
            ethWalletClient.txStatusEventEmitter!.removeListener(
              "failed",
              onFailed
            );
          };
          ethWalletClient.txStatusEventEmitter!.on("confirmed", onConfirmed);
          ethWalletClient.txStatusEventEmitter!.on("failed", onFailed);
        });

        for (const quoteResult of quoteResults) {
          await quoteResult.refetch();
        }

        return;
      }

      const txHash = await ethWalletClient.send({
        method: "eth_sendTransaction",
        params: [
          {
            to: transactionRequest.to,
            from: ethWalletClient.accountAddress,
            value: transactionRequest?.value
              ? transactionRequest.value
              : undefined,
            data: transactionRequest.data,
            gas: transactionRequest.gas,
            gasPrice: transactionRequest.gasPrice,
            maxFeePerGas: transactionRequest.maxFeePerGas,
            maxPriorityFeePerGas: transactionRequest.maxPriorityFeePerGas,
          },
        ],
      });

      await new Promise((resolve, reject) => {
        const onConfirm = () => {
          trackTransferStatus(quote.provider.id, {
            sendTxHash: txHash as string,
            fromChainId: quote.fromChain.chainId,
            toChainId: quote.toChain.chainId,
          });
          setLastDepositAccountEvmAddress(ethWalletClient.accountAddress!);

          if (isWithdraw) {
            withdrawAmountConfig.setAmount("");
          } else {
            setDepositAmount("");
          }
          setTransferInitiated(true);

          clearEvents();
          resolve(void 0);
        };

        const onFailed = () => {
          clearEvents();
          reject(void 0);
        };

        const clearEvents = () => {
          ethWalletClient.txStatusEventEmitter!.removeListener(
            "confirmed",
            onConfirm
          );
          ethWalletClient.txStatusEventEmitter!.removeListener(
            "failed",
            onFailed
          );
        };

        ethWalletClient.txStatusEventEmitter!.on("confirmed", onConfirm);
        ethWalletClient.txStatusEventEmitter!.on("failed", onFailed);
      });
    } catch (e) {
      const msg = ethWalletClient.displayError?.(e);
      if (typeof msg === "string") {
        displayToast(
          {
            message: "transactionFailed",
            caption: msg,
          },
          ToastType.ERROR
        );
      } else if (msg) {
        displayToast(msg, ToastType.ERROR);
      } else {
        console.error(e);
      }
    }
  };

  const handleCosmosTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    const transactionRequest =
      quote.transactionRequest as CosmosBridgeTransactionRequest;
    return accountStore.signAndBroadcast(
      osmosisChainId, // Osmosis chain id. For now all Cosmos transactions will come from Osmosis
      transactionRequest.msgTypeUrl,
      [
        {
          typeUrl: transactionRequest.msgTypeUrl,
          value: transactionRequest.msg,
        },
      ],
      "",
      undefined,
      undefined,
      (tx: DeliverTxResponse) => {
        if (tx.code == null || tx.code === 0) {
          const queries = queriesStore.get(osmosisChainId);

          // After succeeding to send token, refresh the balance.
          const queryBalance = queries.queryBalances
            .getQueryBech32Address(osmosisAddress)
            .balances.find((bal) => {
              return (
                bal.currency.coinMinimalDenom ===
                assetToBridge.balance.currency.coinMinimalDenom
              );
            });

          if (queryBalance) {
            queryBalance.fetch();
          }

          if (isDeposit) {
            logEvent([
              EventName.Assets.depositAssetCompleted,
              {
                tokenName: originCurrency.coinDenom,
                tokenAmount: Number(inputAmountRaw),
                bridge: quote.provider.id,
              },
            ]);
          } else {
            logEvent([
              EventName.Assets.withdrawAssetCompleted,
              {
                tokenName: originCurrency.coinDenom,
                tokenAmount: Number(inputAmountRaw),
                bridge: quote.provider.id,
              },
            ]);
          }

          trackTransferStatus(quote.provider.id, {
            sendTxHash: tx.transactionHash,
            fromChainId: quote.fromChain.chainId,
            toChainId: quote.toChain.chainId,
          });

          if (isWithdraw) {
            withdrawAmountConfig.setAmount("");
          } else {
            setDepositAmount("");
          }
          setTransferInitiated(true);
        }
      }
    );
  };

  const onTransfer = async () => {
    const transactionRequest =
      selectedQuote?.transactionRequest ??
      bridgeTransaction.data?.transactionRequest;
    const quote = selectedQuote?.quote;

    if (!transactionRequest || !quote) return;

    logEvent([
      isWithdraw
        ? EventName.Assets.withdrawAssetStarted
        : EventName.Assets.depositAssetStarted,
      {
        tokenName: originCurrency.coinDenom,
        tokenAmount: Number(inputAmountRaw),
        bridge: selectedQuote.provider.id,
      },
    ]);

    try {
      if (transactionRequest.type === "evm") {
        await handleEvmTx({ ...quote, transactionRequest });
      } else if (transactionRequest.type === "cosmos") {
        await handleCosmosTx({
          ...quote,
          transactionRequest,
        });
      }

      if (isDeposit) {
        logEvent([
          EventName.Assets.depositAssetCompleted,
          {
            tokenName: originCurrency.coinDenom,
            tokenAmount: Number(inputAmountRaw),
            bridge: selectedQuote.provider.id,
          },
        ]);
      } else {
        logEvent([
          EventName.Assets.withdrawAssetCompleted,
          {
            tokenName: originCurrency.coinDenom,
            tokenAmount: Number(inputAmountRaw),
            bridge: selectedQuote.provider.id,
          },
        ]);
      }
    } catch (e) {}
  };

  const errors = someError?.data?.errors ?? [];
  const hasNoQuotes = errors?.[0]?.errorType === ErrorTypes.NoQuotesError;
  const warnUserOfSlippage = selectedQuote?.isSlippageTooHigh;
  const warnUserOfPriceImpact = selectedQuote?.isPriceImpactTooHigh;

  let buttonErrorMessage: string | undefined;
  if (!counterpartyAddress) {
    buttonErrorMessage = t("assets.transfer.errors.missingAddress");
  } else if (!isCounterpartyAddressValid) {
    buttonErrorMessage = t("assets.transfer.errors.invalidAddress");
  } else if (hasNoQuotes) {
    buttonErrorMessage = t("assets.transfer.errors.noQuotesAvailable");
  } else if (userDisconnectedEthWallet) {
    buttonErrorMessage = t("assets.transfer.errors.reconnectWallet", {
      walletName: ethWalletClient?.displayInfo.displayName ?? "Unknown",
    });
  } else if (isDeposit && !isCorrectChainSelected) {
    buttonErrorMessage = t("assets.transfer.errors.wrongNetworkInWallet", {
      walletName: ethWalletClient?.displayInfo.displayName ?? "Unknown",
    });
  } else if (Boolean(someError)) {
    buttonErrorMessage = t("assets.transfer.errors.unexpectedError");
  } else if (bridgeTransaction.error) {
    buttonErrorMessage = t("assets.transfer.errors.transactionError");
  } else if (isInsufficientFee) {
    buttonErrorMessage = t("assets.transfer.errors.insufficientFee");
  } else if (isInsufficientBal) {
    buttonErrorMessage = t("assets.transfer.errors.insufficientBal");
  }

  /** User can interact with any of the controls on the modal. */
  const isLoadingBridgeQuote =
    (!isOneSuccessful ||
      quoteResults.every((quoteResult) => quoteResult.isLoading)) &&
    quoteResults.some((quoteResult) => quoteResult.fetchStatus !== "idle");
  const isLoadingBridgeTransaction =
    bridgeTransaction.isLoading && bridgeTransaction.fetchStatus !== "idle";
  const isWithdrawReady = isWithdraw && osmosisAccount?.txTypeInProgress === "";
  const isDepositReady =
    isDeposit &&
    !userDisconnectedEthWallet &&
    isCorrectChainSelected &&
    !isLoadingBridgeQuote &&
    !isEthTxPending;
  const userCanInteract = isDepositReady || isWithdrawReady;

  let buttonText: string;
  if (buttonErrorMessage) {
    buttonText = buttonErrorMessage;
  } else if (isLoadingBridgeQuote || isLoadingBridgeTransaction) {
    buttonText = `${t("assets.transfer.loading")}...`;
  } else if (warnUserOfSlippage || warnUserOfPriceImpact) {
    buttonText = t("assets.transfer.transferAnyway");
  } else if (isApprovingToken) {
    buttonText = t("assets.transfer.approving");
  } else if (isSendTxPending) {
    buttonText = t("assets.transfer.sending");
  } else if (
    selectedQuote?.quote?.transactionRequest?.type === "evm" &&
    selectedQuote?.quote?.transactionRequest.approvalTransactionRequest &&
    !isEthTxPending
  ) {
    buttonText = t("assets.transfer.givePermission");
  } else if (isWithdraw) {
    buttonText = t("assets.transfer.titleWithdraw", {
      coinDenom: originCurrency.coinDenom,
    });
  } else {
    buttonText = t("assets.transfer.titleDeposit", {
      coinDenom: originCurrency.coinDenom,
    });
  }

  let warningMessage;
  if (warnOfDifferentDepositAddress) {
    warningMessage = t("assets.transfer.warnDepositAddressDifferent", {
      address: ethWalletClient?.displayInfo.displayName ?? "",
    });
  }

  if (selectedQuote && !selectedQuote.expectedOutput) {
    throw new Error("Expected output is not defined.");
  }

  return (
    <ModalBase
      {...props}
      title={modalTitle}
      isOpen={props.isOpen && showModalBase}
    >
      <Transfer
        isWithdraw={isWithdraw}
        transferPath={[
          isWithdraw
            ? {
                ...osmosisPath,
                address: osmoIcnsName === "" ? osmosisAddress : osmoIcnsName,
              }
            : counterpartyPath,
          isWithdraw
            ? counterpartyPath
            : {
                ...osmosisPath,
                address: osmoIcnsName === "" ? osmosisAddress : osmoIcnsName,
              },
        ]}
        selectedWalletDisplay={
          isWithdraw || !ethWalletClient
            ? undefined
            : ethWalletClient.displayInfo
        }
        isOsmosisAccountLoaded={
          osmosisAccount?.walletStatus === WalletStatus.Connected
        }
        onRequestSwitchWallet={onRequestSwitchWallet}
        currentValue={inputAmountRaw}
        onInput={(value) =>
          isWithdraw
            ? withdrawAmountConfig.setAmount(value)
            : setDepositAmount(value)
        }
        availableBalance={
          isWithdraw || isCorrectChainSelected ? availableBalance : undefined
        }
        warningMessage={warningMessage}
        toggleIsMax={() => {
          if (isWithdraw) {
            withdrawAmountConfig.toggleIsMax();
          } else {
            toggleIsDepositAmtMax();
          }
        }}
        toggleUseWrappedConfig={
          sourceChainConfig?.nativeWrapEquivalent &&
          assetToBridge.balance.currency.originCurrency
            ? {
                isUsingWrapped: useWrappedToken,
                setIsUsingWrapped: (isUsingWrapped) => {
                  setSelectedBridgeProvider(null);
                  if (isWithdraw) {
                    withdrawAmountConfig.setAmount("");
                  } else {
                    setDepositAmount("");
                  }
                  setUseWrappedToken(isUsingWrapped);
                },
                nativeDenom:
                  assetToBridge.balance.currency.originCurrency.coinDenom,
                wrapDenom: sourceChainConfig.nativeWrapEquivalent.wrapDenom,
              }
            : undefined
        }
        transferFee={!someError ? selectedQuote?.transferFee ?? "-" : "-"}
        transferFeeFiat={
          !someError ? selectedQuote?.transferFeeFiat : undefined
        }
        gasCost={
          !someError && selectedQuote ? selectedQuote.gasCost : undefined
        }
        gasCostFiat={!someError ? selectedQuote?.gasCostFiat : undefined}
        classes={{
          expectedOutputValue: warnUserOfSlippage ? "text-rust-500" : undefined,
          priceImpactValue: warnUserOfPriceImpact ? "text-rust-500" : undefined,
        }}
        expectedOutput={
          !someError ? selectedQuote?.expectedOutput ?? "-" : undefined
        }
        expectedOutputFiat={
          !someError ? selectedQuote?.expectedOutputFiat : undefined
        }
        priceImpact={
          !someError &&
          inputAmountRaw !== "" &&
          selectedQuote?.priceImpact.toDec().gt(new Dec(0))
            ? selectedQuote?.priceImpact
            : undefined
        }
        waitTime={
          !someError ? selectedQuote?.estimatedTime?.humanize() ?? "-" : "-"
        }
        bridgeProviders={quoteResults
          .map(({ data }) => data?.provider)
          ?.filter((r): r is NonNullable<typeof r> => !!r)
          .map(({ id, logoUrl }) => ({
            id: id,
            logo: logoUrl,
            name: id,
          }))}
        selectedBridgeProvidersId={
          !someError ? selectedQuote?.provider.id : undefined
        }
        onSelectBridgeProvider={({ id }) => {
          setBridgeProviderControlledMode(true);
          setSelectedBridgeProvider(id);
        }}
        disabled={(isDeposit && !!isEthTxPending) || userDisconnectedEthWallet}
        isLoadingDetails={isLoadingBridgeQuote}
        addWithdrawAddrConfig={addWithdrawAddrConfig}
      />
      <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 md:mt-4">
        {walletConnected ? (
          <Button
            className={classNames(
              "transition-opacity duration-300 hover:opacity-75",
              { "opacity-30": isLoadingBridgeQuote }
            )}
            disabled={
              (!userCanInteract && !userDisconnectedEthWallet) ||
              (isDeposit &&
                !userDisconnectedEthWallet &&
                inputAmountRaw === "") ||
              (isWithdraw && inputAmountRaw === "") ||
              isInsufficientFee ||
              isInsufficientBal ||
              isSendTxPending ||
              isLoadingBridgeQuote ||
              isLoadingBridgeTransaction ||
              isApprovingToken ||
              Boolean(someError) ||
              Boolean(bridgeTransaction.error) ||
              !selectedQuote?.quote ||
              isDisabledProp ||
              !counterpartyAddress
            }
            mode={
              warnUserOfSlippage || warnUserOfPriceImpact
                ? "primary-warning"
                : undefined
            }
            onClick={() => {
              if (isDeposit && userDisconnectedEthWallet)
                ethWalletClient?.enable();
              else onTransfer();
            }}
          >
            {buttonText}
          </Button>
        ) : (
          connectWalletButton
        )}
        <Link
          href="/disclaimer#providers-and-bridge-disclaimer"
          className={buttonCVA({
            className: "caption font-semibold",
            mode: "text-white",
            size: "text",
          })}
          target="_blank"
        >
          {t("disclaimer")}
        </Link>
      </div>
    </ModalBase>
  );
});
