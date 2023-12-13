import { WalletStatus } from "@cosmos-kit/core";
import {
  CoinPretty,
  Dec,
  DecUtils,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { DeliverTxResponse } from "@osmosis-labs/stores";
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

import { displayToast, ToastType } from "~/components/alert";
import { Button, buttonCVA } from "~/components/buttons";
import { Transfer } from "~/components/complex/transfer";
import { EventName } from "~/config";
import {
  useAmountConfig,
  useAmplitudeAnalytics,
  useConnectWalletModalRedirect,
  useFakeFeeConfig,
  useLocalStorageState,
  useTranslation,
} from "~/hooks";
import { useTxEventToasts } from "~/integrations";
import {
  EthClientChainIds_SourceChainMap,
  type SourceChainKey,
} from "~/integrations/bridge-info";
import { AxelarChainIds_SourceChainMap } from "~/integrations/bridges/axelar";
import { AvailableBridges } from "~/integrations/bridges/bridge-manager";
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
import { getKeyByValue } from "~/utils/object";
import { api } from "~/utils/trpc";

/** Modal that lets user transfer via non-IBC bridges. */
export const BridgeTransferV2Modal: FunctionComponent<
  ModalBaseProps & {
    isWithdraw: boolean;
    balance: IBCBalance;
    /** Selected network key. */
    sourceChainKey: SourceChainKey;
    walletClient: ObservableWallet | undefined;
    onRequestSwitchWallet: () => void;
  }
> = observer((props) => {
  const {
    isWithdraw,
    balance: assetToBridge,
    sourceChainKey,
    walletClient,
    onRequestClose,
    onRequestSwitchWallet,
  } = props;
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const ethWalletClient = walletClient as EthWallet;
  useTxEventToasts(ethWalletClient);

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
  const { chainId: osmosisChainId, chainName } = chainStore.osmosis;
  const osmosisAccount = accountStore.getWallet(osmosisChainId);
  const osmosisAddress = osmosisAccount?.address ?? "";
  const osmoIcnsName =
    queriesExternalStore.queryICNSNames.getQueryContract(
      osmosisAddress
    ).primaryName;

  const isDeposit = !isWithdraw;

  const ethChainKey =
    EthClientChainIds_SourceChainMap[ethWalletClient.chainId as string] ||
    ethWalletClient.chainId;
  const sourceChainKeyMapped =
    AxelarChainIds_SourceChainMap[sourceChainKey] || sourceChainKey;

  if (!assetToBridge.originBridgeInfo) {
    console.error("BridgeTransferModal given unconfigured IBC balance/asset");
    return null;
  }
  const { bridge } = assetToBridge.originBridgeInfo;

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

    if (!hexChainId) return;

    ethWalletClient.setPreferredSourceChain(hexChainId);
  }, [ethWalletClient, sourceChainKey, walletClient]);

  const sourceChainConfig =
    assetToBridge.originBridgeInfo.sourceChainTokens.find(
      ({ id }) => id === sourceChainKey
    );

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

  // DEPOSIT
  const [useWrappedToken, setUseWrappedToken] = useLocalStorageState(
    sourceChainConfig?.erc20ContractAddress &&
      sourceChainConfig?.nativeWrapEquivalent
      ? `bridge-${sourceChainConfig.erc20ContractAddress}-use-wrapped-token`
      : "",
    false // assume we're transferring native token, since it's the gas token as well and generally takes precedence
  );
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
    sendFn: ethWalletClient.send,
    balance: useNativeToken
      ? nativeBalance ?? undefined
      : erc20Balance ?? undefined,
    address: ethWalletClient.accountAddress,
    gasCurrency: useNativeToken
      ? assetToBridge.balance.currency.originCurrency
      : undefined, // user will inspect gas costs in their wallet
  });

  const inputAmountRaw = isWithdraw
    ? withdrawAmountConfig.amount
    : depositAmount;

  const [debouncedInputValue, setDebouncedInputValue] =
    useState(inputAmountRaw);
  useDebounce(
    () => {
      setDebouncedInputValue(inputAmountRaw);
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

  const isCorrectChainSelected = ethChainKey === sourceChainKeyMapped;

  let availableBalance: CoinPretty | undefined;
  if (isWithdraw) {
    availableBalance = assetToBridge.balance;
  } else if (useNativeToken) {
    availableBalance = nativeBalance;
  } else if (sourceChainConfig?.erc20ContractAddress) {
    availableBalance = erc20Balance;
  }

  const [userDisconnectedEthWallet, setUserDisconnectedWallet] =
    useState(false);
  useEffect(() => {
    if (!ethWalletClient.isConnected) {
      setUserDisconnectedWallet(true);
    }
    if (ethWalletClient.isConnected && userDisconnectedEthWallet) {
      setUserDisconnectedWallet(false);
    }
  }, [ethWalletClient.isConnected, userDisconnectedEthWallet]);

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
    address: ethWalletClient.accountAddress || "",
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
  const bridgeQuote = api.bridgeTransfer.getQuotes.useQuery(
    {
      ...quoteParams,
      fromAmount: inputAmount.truncate().toString(),
    },
    {
      enabled: inputAmount.gt(new Dec(0)),
      refetchInterval: 30 * 1000, // 30 seconds
      retry(failureCount, error) {
        if (failureCount > 3) return false;
        /** Do not retry if there are no quotes */
        if (error?.data?.errors?.[0]?.errorType === ErrorTypes.NoQuotesError) {
          return false;
        }
        return true;
      },
      select: ({ quotes }) => {
        const nextProviderId = selectedBridgeProvider ?? quotes[0].provider.id;
        if (!selectedBridgeProvider) {
          setSelectedBridgeProvider(nextProviderId);
        }

        if (!quotes) throw new Error("No quotes found");

        let selectedQuote = quotes?.find(
          (quote) => quote.provider.id === nextProviderId
        );

        if (!selectedQuote) {
          setSelectedBridgeProvider(quotes[0].provider.id);
          selectedQuote = quotes[0];
        }

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
        } = selectedQuote;

        const priceImpact = new RatePretty(new Dec(expectedOutput.priceImpact));
        const expectedOutputFiatDec = new Dec(expectedOutput.fiatValue.amount);
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
          ).maxDecimals(8),

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

            return new PricePretty(fiat, new Dec(transferFeeFiatValue.amount));
          },

          get gasCostFiat() {
            if (!estimatedGasFee?.fiatValue) return undefined;
            const gasCostFiatValue = estimatedGasFee.fiatValue;
            const fiat = priceStore.getFiatCurrency(gasCostFiatValue.currency);
            if (!fiat) return undefined;

            return new PricePretty(fiat, new Dec(gasCostFiatValue.amount));
          },

          estimatedTime: dayjs.duration({
            seconds: estimatedTime,
          }),

          allBridgeProviders: quotes.map((quote) => quote.provider),

          transactionRequest,
          priceImpact,
          provider,
          fromChain,
          toChain,
          selectedQuote: selectedQuote,
          isSlippageTooHigh: transferSlippage.gt(new Dec(0.06)), // warn if expected output is less than 6% of input amount
          isPriceImpactTooHigh: priceImpact.toDec().gte(new Dec(0.1)), // warn if price impact is greater than 10%.
        };
      },
    }
  );

  const isInsufficientFee =
    inputAmountRaw !== "" &&
    bridgeQuote.data?.transferFee !== undefined &&
    new CoinPretty(assetToBridge.balance.currency, inputAmount)
      .toDec()
      .lt(bridgeQuote.data?.transferFee.toDec());

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
          bridgeQuote.isSuccess &&
          Boolean(selectedBridgeProvider) &&
          !bridgeQuote.data?.transactionRequest &&
          inputAmount.gt(new Dec(0)) &&
          !isInsufficientBal &&
          !isInsufficientFee,
        refetchInterval: 30 * 1000, // 30 seconds
      }
    );

  useUnmount(() => {
    setSelectedBridgeProvider(null);
  });

  const [lastDepositAccountEvmAddress, setLastDepositAccountEvmAddress] =
    useLocalStorageState<string | null>(
      isWithdraw
        ? ""
        : `axelar-last-deposit-addr-${originCurrency.coinMinimalDenom}`,
      null
    );
  const warnOfDifferentDepositAddress =
    isWithdraw &&
    ethWalletClient.isConnected &&
    lastDepositAccountEvmAddress &&
    ethWalletClient.accountAddress
      ? ethWalletClient.accountAddress !== lastDepositAccountEvmAddress
      : false;

  const [transferInitiated, setTransferInitiated] = useState(false);
  const trackTransferStatus = useCallback(
    (providerId: AvailableBridges, params: GetTransferStatusParams) => {
      if (inputAmountRaw !== "") {
        nonIbcBridgeHistoryStore.pushTxNow(
          `${providerId.toLowerCase()}${JSON.stringify(params)}`,
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
  const { isEthTxPending } = useTxReceiptState(ethWalletClient);

  // close modal when initial eth transaction is committed
  const isSendTxPending = isWithdraw
    ? osmosisAccount?.txTypeInProgress !== ""
    : isEthTxPending || ethWalletClient.isSending === "eth_sendTransaction";
  useEffect(() => {
    if (transferInitiated && !isSendTxPending) {
      onRequestClose();
    }
  }, [
    transferInitiated,
    isSendTxPending,
    osmosisAccount?.txTypeInProgress,
    ethWalletClient.isSending,
    isEthTxPending,
    onRequestClose,
  ]);

  const handleEvmTx = async (
    quote: NonNullable<(typeof bridgeQuote)["data"]>["selectedQuote"]
  ) => {
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
          ethWalletClient.txStatusEventEmitter!.on("confirmed", () => {
            resolve(void 0);
            setIsApprovingToken(false);
          });
          ethWalletClient.txStatusEventEmitter!.on("failed", () => {
            reject(void 0);
            setIsApprovingToken(false);
          });
        });

        bridgeQuote.refetch();

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
        ethWalletClient.txStatusEventEmitter!.on("confirmed", () => {
          resolve(void 0);
          trackTransferStatus(quote.provider.id, {
            sendTxHash: txHash as string,
            fromChainId: quote.fromChain.chainId,
            toChainId: quote.toChain.chainId,
          });
          setLastDepositAccountEvmAddress(ethWalletClient.accountAddress!);
        });
        ethWalletClient.txStatusEventEmitter!.on("failed", () => {
          reject(void 0);
        });
      });

      if (isWithdraw) {
        withdrawAmountConfig.setAmount("");
      } else {
        setDepositAmount("");
      }
      setTransferInitiated(true);
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
    quote: NonNullable<(typeof bridgeQuote)["data"]>["selectedQuote"]
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
      bridgeQuote.data?.transactionRequest ??
      bridgeTransaction.data?.transactionRequest;
    const selectedQuote = bridgeQuote.data?.selectedQuote;

    if (!transactionRequest || !selectedQuote) return;

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
        await handleEvmTx({ ...selectedQuote, transactionRequest });
        return;
      }

      if (transactionRequest.type === "cosmos") {
        await handleCosmosTx({
          ...selectedQuote,
          transactionRequest,
        });
        return;
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

  const errors = bridgeQuote.error?.data?.errors ?? [];
  const hasNoQuotes = errors?.[0]?.errorType === ErrorTypes.NoQuotesError;
  const warnUserOfSlippage = bridgeQuote.data?.isSlippageTooHigh;
  const warnUserOfPriceImpact = bridgeQuote.data?.isPriceImpactTooHigh;

  let buttonErrorMessage: string | undefined;
  if (hasNoQuotes) {
    buttonErrorMessage = t("assets.transfer.errors.noQuotesAvailable");
  } else if (userDisconnectedEthWallet) {
    buttonErrorMessage = t("assets.transfer.errors.reconnectWallet", {
      walletName: ethWalletClient.displayInfo.displayName,
    });
  } else if (isDeposit && !isCorrectChainSelected) {
    buttonErrorMessage = t("assets.transfer.errors.wrongNetworkInWallet", {
      walletName: ethWalletClient.displayInfo.displayName,
    });
  } else if (bridgeQuote.error) {
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
    bridgeQuote.isLoading && bridgeQuote.fetchStatus !== "idle";
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
    bridgeQuote.data?.selectedQuote?.transactionRequest?.type === "evm" &&
    bridgeQuote.data?.selectedQuote?.transactionRequest
      .approvalTransactionRequest &&
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
      address: ethWalletClient.displayInfo.displayName,
    });
  }

  if (bridgeQuote.data && !bridgeQuote.data.expectedOutput) {
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
          isWithdraw ? undefined : ethWalletClient.displayInfo
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
        transferFee={
          !bridgeQuote.error ? bridgeQuote.data?.transferFee ?? "-" : "-"
        }
        transferFeeFiat={
          !bridgeQuote.error ? bridgeQuote.data?.transferFeeFiat : undefined
        }
        gasCost={
          !bridgeQuote.error && bridgeQuote.data
            ? bridgeQuote.data.gasCost
            : undefined
        }
        gasCostFiat={
          !bridgeQuote.error ? bridgeQuote.data?.gasCostFiat : undefined
        }
        classes={{
          expectedOutputValue: warnUserOfSlippage ? "text-rust-500" : undefined,
          priceImpactValue: warnUserOfPriceImpact ? "text-rust-500" : undefined,
        }}
        expectedOutput={
          !bridgeQuote.error
            ? bridgeQuote.data?.expectedOutput ?? "-"
            : undefined
        }
        expectedOutputFiat={
          !bridgeQuote.error ? bridgeQuote.data?.expectedOutputFiat : undefined
        }
        priceImpact={
          !bridgeQuote.error &&
          inputAmountRaw !== "" &&
          bridgeQuote.data?.priceImpact.toDec().gt(new Dec(0))
            ? bridgeQuote.data?.priceImpact
            : undefined
        }
        waitTime={
          !bridgeQuote.error
            ? bridgeQuote.data?.estimatedTime?.humanize() ?? "-"
            : "-"
        }
        disabled={(isDeposit && !!isEthTxPending) || userDisconnectedEthWallet}
        bridgeProviders={bridgeQuote.data?.allBridgeProviders?.map(
          ({ id, logoUrl }) => ({
            id: id,
            logo: logoUrl,
            name: id,
          })
        )}
        selectedBridgeProvidersId={
          !bridgeQuote.error
            ? bridgeQuote.data?.selectedQuote?.provider.id
            : undefined
        }
        onSelectBridgeProvider={({ id }) => {
          setSelectedBridgeProvider(id);
        }}
        isLoadingDetails={isLoadingBridgeQuote}
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
              Boolean(bridgeQuote.error) ||
              Boolean(bridgeTransaction.error) ||
              !bridgeQuote.data?.selectedQuote
            }
            mode={
              warnUserOfSlippage || warnUserOfPriceImpact
                ? "primary-warning"
                : undefined
            }
            onClick={() => {
              if (isDeposit && userDisconnectedEthWallet)
                ethWalletClient.enable();
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
