import { WalletStatus } from "@cosmos-kit/core";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDebounce, useUnmount } from "react-use";

import { displayToast, ToastType } from "~/components/alert";
import { Button } from "~/components/buttons";
import { Transfer } from "~/components/complex/transfer";
import { EventName } from "~/config";
import {
  useAmountConfig,
  useAmplitudeAnalytics,
  useBackgroundRefresh,
  useConnectWalletModalRedirect,
  useFakeFeeConfig,
  useLocalStorageState,
  useTranslation,
} from "~/hooks";
import { useTxEventToasts } from "~/integrations";
import { AxelarChainIds_SourceChainMap } from "~/integrations/axelar";
import {
  EthClientChainIds_SourceChainMap,
  type SourceChainKey,
} from "~/integrations/bridge-info";
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

/** Modal that lets user transfer via non-IBC bridges. */
export const BridgeTransferV2Modal: FunctionComponent<
  ModalBaseProps & {
    isWithdraw: boolean;
    balance: IBCBalance;
    /** Selected network key. */
    sourceChainKey: SourceChainKey;
    walletClient: ObservableWallet;
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

  const erc20Balance = useErc20Balance(
    ethWalletClient,
    isDeposit ? sourceChainConfig?.erc20ContractAddress : undefined
  );
  const nativeBalance = useNativeBalance(
    ethWalletClient,
    isDeposit ? assetToBridge.balance.currency : undefined
  );
  const {
    amount: depositAmount,
    gasCost: _gasCost,
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
    DecUtils.getTenExponentNInPrecisionRange(
      assetToBridge.balance.currency.coinDecimals
    )
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
    address: osmoIcnsName === "" ? osmosisAddress : osmoIcnsName,
    networkName: chainStore.osmosis.chainName,
    iconUrl: "/tokens/osmo.svg",
    source: "account" as const,
    asset: {
      denom: assetToBridge.balance.currency.coinDenom,
      minimalDenom:
        assetToBridge.balance.currency.originCurrency?.coinMinimalDenom ??
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
      minimalDenom:
        useNativeToken && isDeposit
          ? sourceChainConfig?.nativeWrapEquivalent?.tokenMinDenom! // deposit uses native/gas token denom
          : assetToBridge.balance.currency.originCurrency?.coinMinimalDenom ??
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

  const bridgeQuotes =
    queriesExternalStore.queryBridgeQuotes.getQuotes(quoteParams);
  const bridgeTransactionQuery =
    queriesExternalStore.queryBridgeTransaction.getTransactionRequest({
      ...quoteParams,
      providerId: bridgeQuotes.selectedQuote?.provider.id,
    });

  useBackgroundRefresh(
    useMemo(
      () => [bridgeQuotes, bridgeTransactionQuery],
      [bridgeQuotes, bridgeTransactionQuery]
    ),
    {
      active: bridgeQuotes.selectedQuote?.transferFee ? 30 * 1000 : undefined, // 30 seconds
    }
  );

  useEffect(() => {
    bridgeQuotes.setAmount(
      inputAmount.gt(new Dec(0)) ? inputAmount.truncate().toString() : ""
    );
  }, [bridgeQuotes, inputAmount]);

  /**
   * If there is no transaction request data, fetch it.
   */
  useEffect(() => {
    if (
      bridgeQuotes?.selectedQuote?.provider &&
      !bridgeQuotes.selectedQuote.transactionRequest
    ) {
      bridgeTransactionQuery.setAmount(
        inputAmount.gt(new Dec(0)) ? inputAmount.truncate().toString() : ""
      );
    }
  }, [
    bridgeQuotes.selectedQuote?.provider,
    bridgeQuotes.selectedQuote?.transactionRequest,
    bridgeTransactionQuery,
    inputAmount,
  ]);

  useUnmount(() => {
    bridgeQuotes.setSelectBridgeProvider(null);
    bridgeQuotes.setAmount("");
  });

  const [lastDepositAccountEvmAddress, setLastDepositAccountEvmAddress] =
    useLocalStorageState<string | null>(
      isWithdraw
        ? ""
        : `axelar-last-deposit-addr-${assetToBridge.balance.currency.coinMinimalDenom}`,
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
          new CoinPretty(assetToBridge.balance.currency, inputAmount)
            .trim(true)
            .toString(),
          isWithdraw,
          osmosisAccount?.address ?? "" // use osmosis account for account keys (vs any EVM account)
        );
      }
    },
    [
      nonIbcBridgeHistoryStore,
      assetToBridge.balance.currency,
      inputAmountRaw,
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
    quote: NonNullable<(typeof bridgeQuotes)["selectedQuote"]>
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

        bridgeQuotes.fetch();

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
    quote: NonNullable<(typeof bridgeQuotes)["selectedQuote"]>
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
                tokenName: assetToBridge.balance.currency.coinDenom,
                tokenAmount: Number(inputAmountRaw),
                bridge: quote.provider.id,
              },
            ]);
          } else {
            logEvent([
              EventName.Assets.withdrawAssetCompleted,
              {
                tokenName: assetToBridge.balance.currency.coinDenom,
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
      bridgeQuotes.selectedQuote?.transactionRequest ??
      bridgeTransactionQuery.transactionRequest;
    const selectedQuote = bridgeQuotes.selectedQuote;

    if (!transactionRequest || !selectedQuote) return;

    logEvent([
      isWithdraw
        ? EventName.Assets.withdrawAssetStarted
        : EventName.Assets.depositAssetStarted,
      {
        tokenName: assetToBridge.balance.currency.coinDenom,
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
            tokenName: assetToBridge.balance.currency.coinDenom,
            tokenAmount: Number(inputAmountRaw),
            bridge: selectedQuote.provider.id,
          },
        ]);
      } else {
        logEvent([
          EventName.Assets.withdrawAssetCompleted,
          {
            tokenName: assetToBridge.balance.currency.coinDenom,
            tokenAmount: Number(inputAmountRaw),
            bridge: selectedQuote.provider.id,
          },
        ]);
      }
    } catch (e) {}
  };

  const isInsufficientFee =
    inputAmountRaw !== "" &&
    bridgeQuotes?.transferFee !== undefined &&
    new CoinPretty(assetToBridge.balance.currency, inputAmount)
      .toDec()
      .lt(bridgeQuotes?.transferFee.toDec());

  const isInsufficientBal =
    inputAmountRaw !== "" &&
    availableBalance &&
    new CoinPretty(assetToBridge.balance.currency, inputAmount)
      .toDec()
      .gt(availableBalance.toDec());

  const { errors } =
    (bridgeQuotes.error?.data as {
      errors: { error: ErrorTypes; message: string }[];
    }) || {};
  const hasNoQuotes = errors?.[0]?.error === ErrorTypes.NoQuotesError;

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
  } else if (bridgeQuotes.error) {
    buttonErrorMessage = t("assets.transfer.errors.unexpectedError");
  } else if (bridgeTransactionQuery.error) {
    buttonErrorMessage = t("assets.transfer.errors.transactionError");
  } else if (isInsufficientFee) {
    buttonErrorMessage = t("assets.transfer.errors.insufficientFee");
  } else if (isInsufficientBal) {
    buttonErrorMessage = t("assets.transfer.errors.insufficientBal");
  }

  /** User can interact with any of the controls on the modal. */
  const isDepositReady =
    isDeposit &&
    !userDisconnectedEthWallet &&
    isCorrectChainSelected &&
    !bridgeQuotes.isFetching &&
    !isEthTxPending;
  const isWithdrawReady = isWithdraw && osmosisAccount?.txTypeInProgress === "";
  const userCanInteract = isDepositReady || isWithdrawReady;

  let buttonText;
  if (buttonErrorMessage) {
    buttonText = buttonErrorMessage;
  } else if (bridgeQuotes.isFetching || bridgeTransactionQuery.isFetching) {
    buttonText = `${t("assets.transfer.loading")}...`;
  } else if (isApprovingToken) {
    buttonText = t("assets.transfer.approving");
  } else if (isSendTxPending) {
    buttonText = "Sending...";
  } else if (
    bridgeQuotes.selectedQuote?.transactionRequest?.type === "evm" &&
    bridgeQuotes.selectedQuote?.transactionRequest.approvalTransactionRequest &&
    !isEthTxPending
  ) {
    buttonText = t("assets.transfer.givePermission");
  } else if (isWithdraw) {
    buttonText = t("assets.transfer.titleWithdraw", {
      coinDenom: assetToBridge.balance.currency.coinDenom,
    });
  } else {
    buttonText = t("assets.transfer.titleDeposit", {
      coinDenom: assetToBridge.balance.currency.coinDenom,
    });
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
          isWithdraw ? osmosisPath : counterpartyPath,
          isWithdraw ? counterpartyPath : osmosisPath,
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
        warningMessage={
          warnOfDifferentDepositAddress
            ? t("assets.transfer.warnDepositAddressDifferent", {
                address: ethWalletClient.displayInfo.displayName,
              })
            : undefined
        }
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
          !bridgeQuotes.error ? bridgeQuotes.transferFee ?? "-" : "-"
        }
        transferFeeFiat={
          !bridgeQuotes.error ? bridgeQuotes?.transferFeeFiat : undefined
        }
        gasCost={
          !bridgeQuotes.error
            ? bridgeQuotes.response
              ? bridgeQuotes?.gasCost
              : "-"
            : "-"
        }
        gasCostFiat={
          !bridgeQuotes.error ? bridgeQuotes?.gasCostFiat : undefined
        }
        waitTime={
          !bridgeQuotes.error
            ? bridgeQuotes.estimatedTime?.humanize() ?? "-"
            : "-"
        }
        disabled={(isDeposit && !!isEthTxPending) || userDisconnectedEthWallet}
        bridgeProviders={bridgeQuotes?.allBridgeProviders?.map(
          ({ id, logoUrl }) => ({
            id: id,
            logo: logoUrl,
            name: id,
          })
        )}
        selectedBridgeProvidersId={
          !bridgeQuotes.error
            ? bridgeQuotes?.selectedQuote?.provider.id
            : undefined
        }
        onSelectBridgeProvider={({ id }) => {
          bridgeQuotes.setSelectBridgeProvider(id);
        }}
        isLoadingDetails={bridgeQuotes.isFetching}
      />
      <div className="mt-6 flex w-full items-center justify-center md:mt-4">
        {walletConnected ? (
          <Button
            className={classNames(
              "transition-opacity duration-300 hover:opacity-75",
              { "opacity-30": bridgeQuotes.isFetching }
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
              bridgeQuotes.isFetching ||
              bridgeTransactionQuery.isFetching ||
              isApprovingToken ||
              Boolean(bridgeQuotes.error) ||
              Boolean(bridgeTransactionQuery.error)
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
      </div>
    </ModalBase>
  );
});
